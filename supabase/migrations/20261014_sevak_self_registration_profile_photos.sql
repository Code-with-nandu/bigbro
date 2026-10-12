-- Allow an authenticated Sevak to upload and manage only their own optional
-- private profile photo. Requires the already-applied 20261012 and 20261013.
DO $preflight$
BEGIN
    IF to_regclass('public.sevak_profiles') IS NULL
       OR to_regclass('storage.objects') IS NULL
       OR to_regclass('storage.buckets') IS NULL
       OR to_regprocedure('public.prepare_sevak_self_registration()') IS NULL
       OR to_regprocedure('public.has_sevak_admin_role()') IS NULL THEN
        RAISE EXCEPTION 'Apply the Sevak management and self-registration migrations before the profile-photo migration.';
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
          AND column_name = 'auth_user_id' AND data_type = 'uuid'
    ) OR NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
          AND column_name = 'profile_picture' AND data_type = 'text'
    ) OR NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public' AND table_name = 'sevak_profiles'
          AND column_name = 'approval_status' AND data_type = 'text'
    ) THEN
        RAISE EXCEPTION 'The expected Sevak self-registration columns are missing or have incompatible types.';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM storage.buckets
        WHERE id = 'sevak-profiles' AND public = false
          AND allowed_mime_types @> ARRAY['image/jpeg', 'image/png', 'image/webp']::text[]
    ) THEN
        RAISE EXCEPTION 'The existing private sevak-profiles bucket or its JPEG/PNG/WebP MIME configuration is missing.';
    END IF;
END;
$preflight$;

-- RLS still decides which owner/admin row can be changed; grant only the one
-- additional profile column this feature needs to write.
GRANT UPDATE (profile_picture) ON TABLE public.sevak_profiles TO authenticated;

-- Keep the existing private bucket and administrator policies. The owner
-- policies below are additive and scoped by auth_user_id plus the profile's
-- Sevak ID folder. Owner uploads are limited to 2 MiB and three image types.
DROP POLICY IF EXISTS "Sevaks read their own profile photos" ON storage.objects;
CREATE POLICY "Sevaks read their own profile photos"
    ON storage.objects FOR SELECT TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.auth_user_id = auth.uid()
              AND profile.sevak_id = (storage.foldername(name))[1]
        )
    );

DROP POLICY IF EXISTS "Sevaks upload their own profile photos" ON storage.objects;
CREATE POLICY "Sevaks upload their own profile photos"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.auth_user_id = auth.uid()
              AND profile.sevak_id = (storage.foldername(name))[1]
        )
        AND name ~ '^[^/]+/profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp)$'
        AND metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp')
        AND metadata->>'size' ~ '^[1-9][0-9]*$'
        AND (metadata->>'size')::bigint <= 2097152
        AND (
            (name ~ '[.]jpg$' AND metadata->>'mimetype' = 'image/jpeg')
            OR (name ~ '[.]png$' AND metadata->>'mimetype' = 'image/png')
            OR (name ~ '[.]webp$' AND metadata->>'mimetype' = 'image/webp')
        )
    );

DROP POLICY IF EXISTS "Sevaks delete their own profile photos" ON storage.objects;
CREATE POLICY "Sevaks delete their own profile photos"
    ON storage.objects FOR DELETE TO authenticated
    USING (
        bucket_id = 'sevak-profiles'
        AND EXISTS (
            SELECT 1 FROM public.sevak_profiles AS profile
            WHERE profile.auth_user_id = auth.uid()
              AND profile.sevak_id = (storage.foldername(name))[1]
        )
    );

-- Preserve the existing trigger protections. A non-admin owner may update
-- profile_picture only to NULL or to a real, bounded image object in their
-- own Sevak folder. All administrator behavior remains as before.
CREATE OR REPLACE FUNCTION public.prepare_sevak_self_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, auth, storage, pg_temp
AS $function$
DECLARE
    acting_user UUID := auth.uid();
    trusted_admin BOOLEAN := COALESCE(public.has_sevak_admin_role(), false);
    normalized_mobile TEXT;
    photo_extension TEXT;
BEGIN
    IF acting_user IS NULL THEN
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

        IF NEW.profile_picture IS DISTINCT FROM OLD.profile_picture
           AND NEW.profile_picture IS NOT NULL THEN
            IF split_part(NEW.profile_picture, '/', 1) IS DISTINCT FROM OLD.sevak_id
               OR cardinality(string_to_array(NEW.profile_picture, '/')) <> 2 THEN
                RAISE EXCEPTION 'A profile photo must be stored in the owner''s Sevak folder.'
                    USING ERRCODE = '42501';
            END IF;
            photo_extension := lower(split_part(NEW.profile_picture, '.', -1));
            IF photo_extension NOT IN ('jpg', 'png', 'webp')
               OR split_part(NEW.profile_picture, '/', 2) !~ '^profile-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}[.](jpg|png|webp)$' THEN
                RAISE EXCEPTION 'The profile photo path is invalid.' USING ERRCODE = '22023';
            END IF;
            IF NOT EXISTS (
                SELECT 1 FROM storage.objects AS photo
                WHERE photo.bucket_id = 'sevak-profiles'
                  AND photo.name = NEW.profile_picture
                  AND photo.metadata->>'mimetype' IN ('image/jpeg', 'image/png', 'image/webp')
                  AND photo.metadata->>'size' ~ '^[1-9][0-9]*$'
                  AND (photo.metadata->>'size')::bigint <= 2097152
                  AND (
                      (photo_extension = 'jpg' AND photo.metadata->>'mimetype' = 'image/jpeg')
                      OR (photo_extension = 'png' AND photo.metadata->>'mimetype' = 'image/png')
                      OR (photo_extension = 'webp' AND photo.metadata->>'mimetype' = 'image/webp')
                  )
            ) THEN
                RAISE EXCEPTION 'Upload a valid JPEG, PNG, or WebP photo of at most 2 MB before saving its path.'
                    USING ERRCODE = '22023';
            END IF;
        END IF;

        NEW.created_at := OLD.created_at;
    END IF;

    NEW.name := btrim(NEW.name);
    normalized_mobile := regexp_replace(btrim(NEW.mobile), '[[:space:]().-]', '', 'g');
    IF normalized_mobile !~ '^[+]?[1-9][0-9]{6,14}$' THEN
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
