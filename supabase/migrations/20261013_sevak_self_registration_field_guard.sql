-- Keep self-service edits from changing administrative Sevak identifiers or
-- department assignments. This is forward-only so it also repairs projects
-- where 20261012 has already been applied.
DO $preflight$
BEGIN
    IF to_regclass('public.sevak_profiles') IS NULL
       OR to_regclass('public.sevak_departments') IS NULL
       OR to_regclass('public.sevak_role_assignments') IS NULL
       OR to_regclass('auth.users') IS NULL
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
              AND column_name = 'auth_user_id' AND data_type = 'uuid'
       )
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
              AND column_name = 'approval_status' AND data_type = 'text'
       )
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
              AND column_name = 'rejection_reason' AND data_type = 'text'
       )
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
              AND column_name = 'approved_by' AND data_type = 'uuid'
       )
       OR NOT EXISTS (
            SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
              AND column_name = 'approved_at' AND data_type = 'timestamp with time zone'
       )
       OR to_regprocedure('public.prepare_sevak_self_registration()') IS NULL
       OR to_regprocedure('public.has_sevak_admin_role()') IS NULL THEN
        RAISE EXCEPTION 'Apply the Sevak management and self-registration migrations before this migration.';
    END IF;
END;
$preflight$;

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
        -- Sevak IDs are assigned by the database, never supplied by a client.
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
        -- Approval, photo, and role-scoping values stay server/admin controlled.
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
