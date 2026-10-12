-- Ensure authenticated self-registration inserts receive the database-owned
-- SELF-<uppercase UUID> Sevak ID before NOT NULL and unique constraints run.
-- Administrator-created profiles keep the Sevak ID supplied by the Admin form.
DO $preflight$
BEGIN
    IF to_regclass('public.sevak_profiles') IS NULL
       OR to_regprocedure('public.has_sevak_admin_role()') IS NULL
       OR to_regprocedure('public.prepare_sevak_self_registration()') IS NULL THEN
        RAISE EXCEPTION 'Apply the Sevak management and self-registration migrations before this migration.';
    END IF;
END;
$preflight$;

CREATE OR REPLACE FUNCTION public.assign_self_sevak_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = pg_catalog, public, auth, pg_temp
AS $function$
BEGIN
    IF auth.uid() IS NOT NULL
       AND NOT COALESCE(public.has_sevak_admin_role(), false) THEN
        -- UUID generation is independent of table counts and safe for
        -- concurrent inserts; the existing UNIQUE constraint remains final.
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
