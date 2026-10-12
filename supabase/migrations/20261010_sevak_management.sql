-- Sevak management: departments, trusted role assignments, and scoped RLS.
-- Review and run manually after verifying the live schema. Existing text
-- department fields and historical SEVA department values are retained.

CREATE TABLE IF NOT EXISTS public.sevak_departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL CHECK (btrim(name) <> ''),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS sevak_departments_name_ci_uidx
    ON public.sevak_departments (lower(btrim(name)));

-- Import every current profile department and every historical SEVA department.
INSERT INTO public.sevak_departments (name)
SELECT DISTINCT ON (lower(btrim(source.name))) btrim(source.name)
FROM (
    SELECT department AS name FROM public.sevak_profiles WHERE department IS NOT NULL AND btrim(department) <> ''
    UNION ALL
    SELECT department AS name FROM public.sevak_attendance
    WHERE attendance_type = 'SEVA' AND department IS NOT NULL AND btrim(department) <> ''
) AS source
ORDER BY lower(btrim(source.name)), btrim(source.name)
ON CONFLICT DO NOTHING;

INSERT INTO public.sevak_departments (name)
SELECT seed.name
FROM (VALUES
    ('ICT'), ('Kitchen'), ('Healthcare'), ('Reception'), ('Cleaning'),
    ('Security'), ('Garden'), ('Transport'), ('Other'), ('Unassigned')
) AS seed(name)
ON CONFLICT DO NOTHING;

ALTER TABLE public.sevak_profiles
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.sevak_departments(id);

UPDATE public.sevak_profiles AS profile
SET department_id = department_row.id
FROM public.sevak_departments AS department_row
WHERE profile.department_id IS NULL
  AND lower(btrim(profile.department)) = lower(btrim(department_row.name));

UPDATE public.sevak_profiles AS profile
SET department_id = department_row.id
FROM public.sevak_departments AS department_row
WHERE profile.department_id IS NULL
  AND lower(department_row.name) = 'unassigned';

ALTER TABLE public.sevak_profiles
    ALTER COLUMN department_id SET NOT NULL;

ALTER TABLE public.sevak_attendance
    ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES public.sevak_departments(id);

-- Historical SEVA uses its recorded department. Other legacy sessions did not
-- store a department, so the current profile assignment is the best available
-- scope snapshot; their original attendance fields are left untouched.
UPDATE public.sevak_attendance AS attendance
SET department_id = department_row.id
FROM public.sevak_departments AS department_row
WHERE attendance.department_id IS NULL
  AND attendance.attendance_type = 'SEVA'
  AND lower(btrim(attendance.department)) = lower(btrim(department_row.name));

UPDATE public.sevak_attendance AS attendance
SET department_id = profile.department_id
FROM public.sevak_profiles AS profile
WHERE attendance.department_id IS NULL
  AND attendance.attendance_type <> 'SEVA'
  AND attendance.sevak_id = profile.id;

CREATE TABLE IF NOT EXISTS public.sevak_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('admin', 'group_leader')),
    department_id UUID NULL REFERENCES public.sevak_departments(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT sevak_role_department_scope_check CHECK (
        (role = 'admin' AND department_id IS NULL)
        OR (role = 'group_leader' AND department_id IS NOT NULL)
    )
);

CREATE UNIQUE INDEX IF NOT EXISTS sevak_role_assignments_unique_uidx
    ON public.sevak_role_assignments (user_id, role, COALESCE(department_id, '00000000-0000-0000-0000-000000000000'::uuid));

CREATE OR REPLACE FUNCTION public.has_sevak_admin_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.sevak_role_assignments
        WHERE user_id = auth.uid() AND role = 'admin' AND department_id IS NULL
    );
$$;

CREATE OR REPLACE FUNCTION public.can_manage_sevak_department(target_department_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
    SELECT public.has_sevak_admin_role()
        OR EXISTS (
            SELECT 1
            FROM public.sevak_role_assignments AS assignment
            JOIN public.sevak_departments AS department ON department.id = assignment.department_id
            WHERE assignment.user_id = auth.uid()
              AND assignment.role = 'group_leader'
              AND assignment.department_id = target_department_id
              AND department.is_active
        );
$$;

REVOKE ALL ON FUNCTION public.has_sevak_admin_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.can_manage_sevak_department(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_sevak_admin_role() TO authenticated;
GRANT EXECUTE ON FUNCTION public.can_manage_sevak_department(UUID) TO authenticated;

CREATE OR REPLACE FUNCTION public.sync_sevak_profile_department()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    SELECT name INTO NEW.department
    FROM public.sevak_departments
    WHERE id = NEW.department_id AND is_active;
    IF NEW.department IS NULL THEN
        RAISE EXCEPTION 'Unknown Sevak department';
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_sevak_profile_department_trigger ON public.sevak_profiles;
CREATE TRIGGER sync_sevak_profile_department_trigger
    BEFORE INSERT OR UPDATE OF department_id ON public.sevak_profiles
    FOR EACH ROW EXECUTE FUNCTION public.sync_sevak_profile_department();

CREATE OR REPLACE FUNCTION public.sync_sevak_department_rename()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.name IS DISTINCT FROM OLD.name THEN
        UPDATE public.sevak_profiles SET department = NEW.name WHERE department_id = NEW.id;
    END IF;
    NEW.updated_at := now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_sevak_department_rename_trigger ON public.sevak_departments;
CREATE TRIGGER sync_sevak_department_rename_trigger
    AFTER UPDATE OF name ON public.sevak_departments
    FOR EACH ROW EXECUTE FUNCTION public.sync_sevak_department_rename();

CREATE OR REPLACE FUNCTION public.set_sevak_attendance_department_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
BEGIN
    IF NEW.attendance_type = 'SEVA' THEN
        SELECT id INTO NEW.department_id
        FROM public.sevak_departments
        WHERE lower(btrim(name)) = lower(btrim(NEW.department))
          AND is_active;
        IF NEW.department_id IS NULL THEN
            RAISE EXCEPTION 'Unknown Seva department';
        END IF;
    ELSIF NEW.department_id IS NULL THEN
        SELECT department_id INTO NEW.department_id
        FROM public.sevak_profiles WHERE id = NEW.sevak_id;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_sevak_attendance_department_id_trigger ON public.sevak_attendance;
CREATE TRIGGER set_sevak_attendance_department_id_trigger
    BEFORE INSERT OR UPDATE OF attendance_type, department, sevak_id ON public.sevak_attendance
    FOR EACH ROW EXECUTE FUNCTION public.set_sevak_attendance_department_id();

ALTER TABLE public.sevak_departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sevak_role_assignments ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.sevak_departments TO authenticated;
GRANT SELECT ON public.sevak_role_assignments TO authenticated;

-- Replace the previous broad authenticated-only policies with trusted roles.
DROP POLICY IF EXISTS "Authenticated users manage sevak profiles" ON public.sevak_profiles;
DROP POLICY IF EXISTS "Sevak administrators manage profiles" ON public.sevak_profiles;
CREATE POLICY "Sevak administrators manage profiles"
    ON public.sevak_profiles FOR ALL TO authenticated
    USING (public.has_sevak_admin_role())
    WITH CHECK (public.has_sevak_admin_role());

CREATE POLICY "Sevak administrators and scoped leaders read profiles"
    ON public.sevak_profiles FOR SELECT TO authenticated
    USING (public.can_manage_sevak_department(department_id));

DROP POLICY IF EXISTS "Authenticated users manage sevak attendance" ON public.sevak_attendance;
DROP POLICY IF EXISTS "Sevak roles read scoped attendance" ON public.sevak_attendance;
DROP POLICY IF EXISTS "Sevak roles insert scoped attendance" ON public.sevak_attendance;
DROP POLICY IF EXISTS "Sevak roles update scoped attendance" ON public.sevak_attendance;
DROP POLICY IF EXISTS "Sevak administrators delete attendance" ON public.sevak_attendance;
CREATE POLICY "Sevak roles read scoped attendance"
    ON public.sevak_attendance FOR SELECT TO authenticated
    USING (public.can_manage_sevak_department(department_id));
CREATE POLICY "Sevak roles insert scoped attendance"
    ON public.sevak_attendance FOR INSERT TO authenticated
    WITH CHECK (
        public.has_sevak_admin_role()
        OR (
          public.can_manage_sevak_department(department_id)
          AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.id = sevak_attendance.sevak_id
              AND profile.department_id = sevak_attendance.department_id
              AND lower(profile.status) = 'active'
          )
        )
    );
CREATE POLICY "Sevak roles update scoped attendance"
    ON public.sevak_attendance FOR UPDATE TO authenticated
    USING (public.can_manage_sevak_department(department_id))
    WITH CHECK (public.can_manage_sevak_department(department_id));
CREATE POLICY "Sevak administrators delete attendance"
    ON public.sevak_attendance FOR DELETE TO authenticated
    USING (public.has_sevak_admin_role());

DROP POLICY IF EXISTS "Authenticated users read active Sevak departments" ON public.sevak_departments;
DROP POLICY IF EXISTS "Sevak administrators manage departments" ON public.sevak_departments;
CREATE POLICY "Authenticated users read active Sevak departments"
    ON public.sevak_departments FOR SELECT TO authenticated
    USING (is_active OR public.has_sevak_admin_role());
CREATE POLICY "Sevak administrators manage departments"
    ON public.sevak_departments FOR ALL TO authenticated
    USING (public.has_sevak_admin_role())
    WITH CHECK (public.has_sevak_admin_role());

DROP POLICY IF EXISTS "Users read their Sevak role assignments" ON public.sevak_role_assignments;
CREATE POLICY "Users read their Sevak role assignments"
    ON public.sevak_role_assignments FOR SELECT TO authenticated
    USING (user_id = auth.uid() OR public.has_sevak_admin_role());

-- Keep profile images private; only administrators may mutate them. Existing
-- read access is scoped to administrators and leaders of the profile's dept.
DROP POLICY IF EXISTS "Authenticated users read sevak profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users upload sevak profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users update sevak profile images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users delete sevak profile images" ON storage.objects;
DROP POLICY IF EXISTS "Sevak roles read scoped profile images" ON storage.objects;
DROP POLICY IF EXISTS "Sevak administrators upload profile images" ON storage.objects;
DROP POLICY IF EXISTS "Sevak administrators update profile images" ON storage.objects;
DROP POLICY IF EXISTS "Sevak administrators delete profile images" ON storage.objects;
CREATE POLICY "Sevak roles read scoped profile images"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
              AND public.can_manage_sevak_department(profile.department_id)
        )
    );
CREATE POLICY "Sevak administrators upload profile images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'sevak-profiles'
        AND public.has_sevak_admin_role()
        AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    );
CREATE POLICY "Sevak administrators update profile images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'sevak-profiles' AND public.has_sevak_admin_role())
    WITH CHECK (bucket_id = 'sevak-profiles' AND public.has_sevak_admin_role());
CREATE POLICY "Sevak administrators delete profile images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'sevak-profiles' AND public.has_sevak_admin_role());

-- Status history and Seva department text remain intact; the attendance type
-- SATSANG remains unchanged and is presented as Night Satsang by the UI.
