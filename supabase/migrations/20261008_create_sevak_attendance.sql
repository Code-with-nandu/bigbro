-- Sevak attendance schema and private profile image storage.
-- Department remains free text so departments can be added without a schema change.
-- Initial department values: ICT, Kitchen, Healthcare, Reception, Cleaning,
-- Security, Garden, Transport, Other.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS public.sevak_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sevak_id TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    mobile TEXT NOT NULL,
    profile_picture TEXT NULL,
    department TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

COMMENT ON COLUMN public.sevak_profiles.profile_picture IS
    'Supabase Storage object path in the sevak-profiles bucket; never image bytes or a public URL.';

CREATE TABLE IF NOT EXISTS public.sevak_attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sevak_id UUID NOT NULL REFERENCES public.sevak_profiles(id) ON DELETE CASCADE,
    attendance_date DATE NOT NULL,
    attendance_type TEXT NOT NULL,
    department TEXT NULL,
    status TEXT NOT NULL,
    check_in_time TIMESTAMPTZ NULL,
    check_out_time TIMESTAMPTZ NULL,
    remarks TEXT NULL,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT sevak_attendance_type_check
        CHECK (attendance_type IN ('MORNING_SADHANA', 'SEVA', 'SATSANG')),
    CONSTRAINT sevak_attendance_department_check
        CHECK (
            (attendance_type = 'SEVA' AND department IS NOT NULL AND btrim(department) <> '')
            OR (attendance_type <> 'SEVA' AND department IS NULL)
        )
);

-- Coalescing department gives non-SEVA sessions one unique department value,
-- while allowing one SEVA record per department, date, and Sevak.
CREATE UNIQUE INDEX IF NOT EXISTS sevak_attendance_no_duplicate_idx
    ON public.sevak_attendance (
        sevak_id,
        attendance_date,
        attendance_type,
        (COALESCE(department, ''))
    );

CREATE INDEX IF NOT EXISTS sevak_attendance_date_idx
    ON public.sevak_attendance (attendance_date);

-- Use a feature-scoped trigger function to avoid depending on unrelated schema.
CREATE OR REPLACE FUNCTION public.set_sevak_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS set_sevak_profiles_updated_at ON public.sevak_profiles;
CREATE TRIGGER set_sevak_profiles_updated_at
    BEFORE UPDATE ON public.sevak_profiles
    FOR EACH ROW EXECUTE FUNCTION public.set_sevak_updated_at();

DROP TRIGGER IF EXISTS set_sevak_attendance_updated_at ON public.sevak_attendance;
CREATE TRIGGER set_sevak_attendance_updated_at
    BEFORE UPDATE ON public.sevak_attendance
    FOR EACH ROW EXECUTE FUNCTION public.set_sevak_updated_at();

ALTER TABLE public.sevak_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sevak_attendance ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users manage sevak profiles" ON public.sevak_profiles;
CREATE POLICY "Authenticated users manage sevak profiles"
    ON public.sevak_profiles
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Authenticated users manage sevak attendance" ON public.sevak_attendance;
CREATE POLICY "Authenticated users manage sevak attendance"
    ON public.sevak_attendance
    FOR ALL
    TO authenticated
    USING (auth.uid() IS NOT NULL)
    WITH CHECK (auth.uid() IS NOT NULL);

-- Private bucket: authenticated reads/writes only. A file's first path segment
-- must match an existing profile's sevak_id (for example: SEVAK-001/profile.jpg).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'sevak-profiles',
    'sevak-profiles',
    false,
    5242880,
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    public = false,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Authenticated users read sevak profile images" ON storage.objects;
CREATE POLICY "Authenticated users read sevak profile images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1
            FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Authenticated users upload sevak profile images" ON storage.objects;
CREATE POLICY "Authenticated users upload sevak profile images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1
            FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Authenticated users update sevak profile images" ON storage.objects;
CREATE POLICY "Authenticated users update sevak profile images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1
            FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    )
    WITH CHECK (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1
            FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Authenticated users delete sevak profile images" ON storage.objects;
CREATE POLICY "Authenticated users delete sevak profile images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1
            FROM public.sevak_profiles AS profile
            WHERE profile.sevak_id = (storage.foldername(name))[1]
        )
    );
