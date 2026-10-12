-- Restore the zero-argument Sevak admin role RPC expected by
-- src/components/SevakAttendancePage.tsx. Role membership remains controlled
-- by the private, database-backed sevak_role_assignments table.
--
-- Apply after 20261010_sevak_management.sql. This migration neither assigns
-- any user a role nor changes Sevak or attendance rows.

DO $migration$
BEGIN
    IF to_regclass('public.sevak_role_assignments') IS NULL THEN
        RAISE EXCEPTION
            'Cannot restore has_sevak_admin_role(): public.sevak_role_assignments is missing. Apply the Sevak management migration first.';
    END IF;
END;
$migration$;

CREATE OR REPLACE FUNCTION public.has_sevak_admin_role()
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = pg_catalog, public, pg_temp
AS $function$
    SELECT EXISTS (
        SELECT 1
        FROM public.sevak_role_assignments AS assignment
        WHERE assignment.user_id = auth.uid()
          AND assignment.role = 'admin'
          AND assignment.department_id IS NULL
    );
$function$;

-- Keep execution available to signed-in clients for RPC/RLS evaluation only.
REVOKE ALL ON FUNCTION public.has_sevak_admin_role() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.has_sevak_admin_role() FROM anon;
GRANT EXECUTE ON FUNCTION public.has_sevak_admin_role() TO authenticated;
