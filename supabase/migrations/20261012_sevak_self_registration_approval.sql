-- Sevak self-registration and mandatory approval.
-- Existing profiles are retained and treated as approved legacy records.
-- Attendance and role-assignment rows are not modified.

DO $preflight$
BEGIN
    IF to_regclass('public.sevak_profiles') IS NULL
       OR to_regclass('public.sevak_departments') IS NULL
       OR to_regclass('public.sevak_attendance') IS NULL
       OR to_regclass('public.sevak_role_assignments') IS NULL THEN
        RAISE EXCEPTION 'Apply the existing Sevak attendance and management migrations before this migration.';
    END IF;
    IF to_regprocedure('public.has_sevak_admin_role()') IS NULL THEN
        RAISE EXCEPTION 'Apply the existing Sevak admin-role function migration before this migration.';
    END IF;
    IF to_regprocedure('public.can_manage_sevak_department(uuid)') IS NULL THEN
        RAISE EXCEPTION 'Apply the existing Sevak department-scope function migration before this migration.';
    END IF;
END;
$preflight$;

ALTER TABLE public.sevak_profiles
    ADD COLUMN IF NOT EXISTS auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS approval_status TEXT NOT NULL DEFAULT 'approved',
    ADD COLUMN IF NOT EXISTS rejection_reason TEXT,
    ADD COLUMN IF NOT EXISTS approved_by UUID,
    ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

-- Current profiles predate self-registration and remain eligible as legacy.
UPDATE public.sevak_profiles
SET approval_status = 'approved',
    rejection_reason = NULL
WHERE approval_status IS NULL;

ALTER TABLE public.sevak_profiles
    ALTER COLUMN approval_status SET DEFAULT 'pending';

CREATE UNIQUE INDEX IF NOT EXISTS sevak_profiles_auth_user_id_uidx
    ON public.sevak_profiles (auth_user_id)
    WHERE auth_user_id IS NOT NULL;

DO $constraints$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.sevak_profiles'::regclass
          AND conname = 'sevak_profiles_approval_status_check'
    ) THEN
        ALTER TABLE public.sevak_profiles
            ADD CONSTRAINT sevak_profiles_approval_status_check
            CHECK (approval_status IN ('pending', 'approved', 'rejected'));
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conrelid = 'public.sevak_profiles'::regclass
          AND conname = 'sevak_profiles_rejection_reason_check'
    ) THEN
        ALTER TABLE public.sevak_profiles
            ADD CONSTRAINT sevak_profiles_rejection_reason_check
            CHECK (
                (approval_status = 'rejected' AND NULLIF(btrim(rejection_reason), '') IS NOT NULL)
                OR (approval_status <> 'rejected' AND rejection_reason IS NULL)
            );
    END IF;
END;
$constraints$;

CREATE OR REPLACE FUNCTION public.prepare_sevak_self_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, auth, pg_temp
AS $function$
DECLARE
    acting_user UUID := auth.uid();
    trusted_admin BOOLEAN := COALESCE(public.has_sevak_admin_role(), false);
    normalized_mobile TEXT;
BEGIN
    IF acting_user IS NULL THEN
        -- Permit only the auth.users ON DELETE SET NULL action for profile
        -- ownership. No anonymous request can pass through table RLS.
        IF TG_OP = 'UPDATE'
           AND OLD.auth_user_id IS NOT NULL
           AND NEW.auth_user_id IS NULL
           AND NEW.approval_status IS NOT DISTINCT FROM OLD.approval_status
           AND NEW.status IS NOT DISTINCT FROM OLD.status
           AND NEW.id IS NOT DISTINCT FROM OLD.id
           AND NEW.sevak_id IS NOT DISTINCT FROM OLD.sevak_id
           AND NEW.profile_picture IS NOT DISTINCT FROM OLD.profile_picture
           AND NEW.rejection_reason IS NOT DISTINCT FROM OLD.rejection_reason
           AND NEW.approved_by IS NOT DISTINCT FROM OLD.approved_by
           AND NEW.approved_at IS NOT DISTINCT FROM OLD.approved_at
           AND NEW.created_at IS NOT DISTINCT FROM OLD.created_at
           AND NEW.department_id IS NOT DISTINCT FROM OLD.department_id
           AND NEW.department IS NOT DISTINCT FROM OLD.department
           AND NEW.name IS NOT DISTINCT FROM OLD.name
           AND NEW.mobile IS NOT DISTINCT FROM OLD.mobile THEN
            RETURN NEW;
        END IF;
        RAISE EXCEPTION 'Authentication is required to create or update a Sevak profile.'
            USING ERRCODE = '42501';
    END IF;

    IF trusted_admin THEN
        IF NEW.approval_status = 'rejected' THEN
            NEW.rejection_reason := NULLIF(btrim(NEW.rejection_reason), '');
            IF NEW.rejection_reason IS NULL THEN
                RAISE EXCEPTION 'A rejection reason is required.' USING ERRCODE = '23514';
            END IF;
            NEW.status := 'inactive';
            NEW.approved_by := NULL;
            NEW.approved_at := NULL;
        ELSIF NEW.approval_status = 'approved' THEN
            NEW.rejection_reason := NULL;
            IF TG_OP = 'INSERT' THEN
                NEW.approved_by := acting_user;
                NEW.approved_at := now();
            ELSIF OLD.approval_status IS DISTINCT FROM 'approved' THEN
                NEW.approved_by := acting_user;
                NEW.approved_at := now();
            ELSE
                NEW.approved_by := OLD.approved_by;
                NEW.approved_at := OLD.approved_at;
            END IF;
        ELSE
            NEW.approval_status := 'pending';
            NEW.rejection_reason := NULL;
            NEW.approved_by := NULL;
            NEW.approved_at := NULL;
            NEW.status := 'inactive';
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.auth_user_id IS NOT NULL AND NEW.auth_user_id <> acting_user THEN
            RAISE EXCEPTION 'A profile can only be associated with the signed-in account.'
                USING ERRCODE = '42501';
        END IF;
        NEW.auth_user_id := acting_user;
        NEW.id := gen_random_uuid();
        -- Sevak identifiers are assigned by the database, never supplied by a client.
        NEW.sevak_id := 'SELF-' || upper(replace(gen_random_uuid()::TEXT, '-', ''));
        NEW.profile_picture := NULL;
        NEW.created_at := now();
        NEW.updated_at := now();
    ELSE
        IF OLD.auth_user_id IS DISTINCT FROM acting_user
           OR NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id
           OR NEW.id IS DISTINCT FROM OLD.id THEN
            RAISE EXCEPTION 'A Sevak can only update their own profile fields.'
                USING ERRCODE = '42501';
        END IF;
        IF NEW.sevak_id IS DISTINCT FROM OLD.sevak_id
           OR NEW.department_id IS DISTINCT FROM OLD.department_id
           OR NEW.department IS DISTINCT FROM OLD.department THEN
            RAISE EXCEPTION 'Sevak ID and department assignment can only be changed by an administrator.'
                USING ERRCODE = '42501';
        END IF;
        NEW.created_at := OLD.created_at;
        -- Approval and photo values are server/admin controlled. Editing a
        -- rejected, pending, or approved profile always requires fresh review.
        NEW.profile_picture := OLD.profile_picture;
    END IF;

    NEW.name := btrim(NEW.name);
    normalized_mobile := regexp_replace(btrim(NEW.mobile), '[[:space:]().-]', '', 'g');
    IF normalized_mobile !~ '^\+?[1-9][0-9]{6,14}$' THEN
        RAISE EXCEPTION 'Enter a valid mobile number using 7 to 15 digits.'
            USING ERRCODE = '22023';
    END IF;
    NEW.mobile := normalized_mobile;

    IF NEW.name = '' OR NEW.department_id IS NULL OR NOT EXISTS (
        SELECT 1 FROM public.sevak_departments AS department
        WHERE department.id = NEW.department_id AND department.is_active
    ) THEN
        RAISE EXCEPTION 'Name and an active Sevak department are required.'
            USING ERRCODE = '22023';
    END IF;

    NEW.approval_status := 'pending';
    NEW.rejection_reason := NULL;
    NEW.approved_by := NULL;
    NEW.approved_at := NULL;
    NEW.status := 'inactive';
    RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.prepare_sevak_self_registration() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS prepare_sevak_self_registration_trigger ON public.sevak_profiles;
CREATE TRIGGER prepare_sevak_self_registration_trigger
    BEFORE INSERT OR UPDATE ON public.sevak_profiles
    FOR EACH ROW EXECUTE FUNCTION public.prepare_sevak_self_registration();

-- Add only the self-service read/write policies. Existing administrator and
-- department-leader policies and table-level SELECT grants remain unchanged.
DROP POLICY IF EXISTS "Sevaks read their own profile" ON public.sevak_profiles;
CREATE POLICY "Sevaks read their own profile"
    ON public.sevak_profiles FOR SELECT TO authenticated
    USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Sevaks create their own pending profile" ON public.sevak_profiles;
CREATE POLICY "Sevaks create their own pending profile"
    ON public.sevak_profiles FOR INSERT TO authenticated
    WITH CHECK (auth_user_id = auth.uid() AND approval_status = 'pending');

DROP POLICY IF EXISTS "Sevaks update their own profile for review" ON public.sevak_profiles;
CREATE POLICY "Sevaks update their own profile for review"
    ON public.sevak_profiles FOR UPDATE TO authenticated
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid() AND approval_status = 'pending');

CREATE OR REPLACE FUNCTION public.get_my_sevak_profile()
RETURNS TABLE (
    id UUID,
    sevak_id TEXT,
    name TEXT,
    mobile TEXT,
    profile_picture TEXT,
    department TEXT,
    department_id UUID,
    status TEXT,
    approval_status TEXT,
    rejection_reason TEXT
)
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, auth, pg_temp
AS $function$
    SELECT profile.id, profile.sevak_id, profile.name, profile.mobile,
           profile.profile_picture, profile.department, profile.department_id,
           profile.status, profile.approval_status, profile.rejection_reason
    FROM public.sevak_profiles AS profile
    WHERE profile.auth_user_id = auth.uid()
    LIMIT 1;
$function$;

REVOKE ALL ON FUNCTION public.get_my_sevak_profile() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_my_sevak_profile() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_my_sevak_profile() TO authenticated;

-- No self-service deletion. Existing admin policy remains the only deletion
-- path; legacy and attendance records are untouched by this migration.

COMMENT ON COLUMN public.sevak_profiles.auth_user_id IS
    'Owning Supabase Auth user for self-service profiles; NULL for legacy/admin-managed profiles.';
COMMENT ON COLUMN public.sevak_profiles.approval_status IS
    'Profile review state. Existing legacy profiles are approved; self-service submissions start pending.';
COMMENT ON COLUMN public.sevak_profiles.approved_by IS
    'Trusted administrator Auth UUID recorded at approval time; retained as an audit value without an Auth-user foreign key.';
