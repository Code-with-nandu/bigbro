-- Forward-only repair for self-registration inserts that reach the table
-- without a Sevak ID. The column default is a final fallback if an older
-- remote schema is missing the expected BEFORE INSERT trigger; the trigger
-- still remains authoritative for every authenticated non-admin insert.
DO $preflight$
BEGIN
    IF to_regclass('public.sevak_profiles') IS NULL
       OR to_regprocedure('public.has_sevak_admin_role()') IS NULL
       OR to_regprocedure('public.prepare_sevak_self_registration()') IS NULL
       OR NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'sevak_profiles'
              AND column_name = 'sevak_id'
              AND data_type = 'text'
       ) THEN
        RAISE EXCEPTION 'Apply the Sevak management and self-registration migrations before this migration.';
    END IF;
END;
$preflight$;

-- Defaults apply only when callers omit sevak_id, so explicit administrator
-- IDs and all existing profile data are preserved.
ALTER TABLE public.sevak_profiles
    ALTER COLUMN sevak_id SET DEFAULT
        ('SELF-' || upper(replace(gen_random_uuid()::TEXT, '-', '')));

CREATE OR REPLACE FUNCTION public.assign_self_sevak_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, auth, pg_temp
AS $function$
BEGIN
    IF auth.uid() IS NOT NULL
       AND NOT COALESCE(public.has_sevak_admin_role(), false) THEN
        NEW.sevak_id := 'SELF-' || upper(replace(gen_random_uuid()::TEXT, '-', ''));
    END IF;
    RETURN NEW;
END;
$function$;

REVOKE ALL ON FUNCTION public.assign_self_sevak_id() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS assign_self_sevak_id_trigger ON public.sevak_profiles;
CREATE TRIGGER assign_self_sevak_id_trigger
    BEFORE INSERT ON public.sevak_profiles
    FOR EACH ROW EXECUTE FUNCTION public.assign_self_sevak_id();
