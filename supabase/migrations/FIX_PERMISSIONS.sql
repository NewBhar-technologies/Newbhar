-- ==============================================================================
-- NEWBHAR TECHNOLOGIES — FIX_PERMISSIONS.sql
-- Run this in your Supabase SQL Editor (https://supabase.com/dashboard/project/_/sql)
--
-- Why is this needed?
-- When tables are created in Supabase PostgreSQL, the 'service_role' and 'anon' roles
-- require explicit GRANT permissions on schema public tables to query and insert data.
-- Without this, Supabase returns: "permission denied for table contacts".
-- ==============================================================================

-- 1. Grant Schema Usage
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- 2. Grant Full CRUD Permissions to service_role (Used by Next.js Server & Admin APIs)
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

-- 3. Grant Select and Web Submission Permissions to anon & authenticated
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.contacts TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.newsletter_subscribers TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.visitors TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.analytics_events TO anon, authenticated, service_role;

-- 4. Set Default Privileges for all future tables and sequences
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, service_role;
