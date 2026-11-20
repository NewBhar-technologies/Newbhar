-- ==============================================================================
-- NEWBHAR TECHNOLOGIES — 007_full_admin_rls_policies.sql
-- Mandatory Row Level Security (RLS) on Every Table in Supabase PostgreSQL
-- ==============================================================================

-- 1. Enable RLS on all tables (idempotent in PostgreSQL)
ALTER TABLE IF EXISTS admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS admin_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS password_reset_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS automations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS automation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_technologies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_navigation ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS cms_footer ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS media ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS system_settings ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 2. PUBLIC READ POLICIES (Published Website Content Only)
-- Only records explicitly marked with visibility = true (or status = 'published')
-- are publicly readable by unauthenticated visitors (anon).
-- ------------------------------------------------------------------------------

-- Public CMS Sections (published only)
DROP POLICY IF EXISTS "Public read published cms_sections" ON cms_sections;
CREATE POLICY "Public read published cms_sections"
ON cms_sections FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Services (published only)
DROP POLICY IF EXISTS "Public read published cms_services" ON cms_services;
CREATE POLICY "Public read published cms_services"
ON cms_services FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Solutions (published only)
DROP POLICY IF EXISTS "Public read published cms_solutions" ON cms_solutions;
CREATE POLICY "Public read published cms_solutions"
ON cms_solutions FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Projects (published only)
DROP POLICY IF EXISTS "Public read published cms_projects" ON cms_projects;
CREATE POLICY "Public read published cms_projects"
ON cms_projects FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Technologies (published only)
DROP POLICY IF EXISTS "Public read published cms_technologies" ON cms_technologies;
CREATE POLICY "Public read published cms_technologies"
ON cms_technologies FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Navigation (published only)
DROP POLICY IF EXISTS "Public read published cms_navigation" ON cms_navigation;
CREATE POLICY "Public read published cms_navigation"
ON cms_navigation FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public CMS Footer (published only)
DROP POLICY IF EXISTS "Public read published cms_footer" ON cms_footer;
CREATE POLICY "Public read published cms_footer"
ON cms_footer FOR SELECT
TO anon, authenticated
USING (visibility = true);

-- Public SEO Settings
DROP POLICY IF EXISTS "Public read seo_settings" ON seo_settings;
CREATE POLICY "Public read seo_settings"
ON seo_settings FOR SELECT
TO anon, authenticated
USING (true);

-- Public Testimonials (published only)
DROP POLICY IF EXISTS "Public read published testimonials" ON testimonials;
CREATE POLICY "Public read published testimonials"
ON testimonials FOR SELECT
TO anon, authenticated
USING (status = 'published');

-- Public Newsletter Subscriptions (Insert only with valid email structure)
DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public insert newsletter_subscribers"
ON newsletter_subscribers FOR INSERT
TO anon, authenticated
WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

-- ------------------------------------------------------------------------------
-- 3. SENSITIVE INTERNAL TABLES: DEFAULT STRICT DENY TO ANON / UNPRIVILEGED
-- ------------------------------------------------------------------------------
-- The following tables have NO public SELECT, INSERT, UPDATE, or DELETE policies:
-- - admin_users
-- - admin_sessions
-- - password_reset_tokens
-- - contacts
-- - leads
-- - clients
-- - projects
-- - project_tasks
-- - meetings
-- - emails
-- - automations
-- - automation_logs
-- - email_templates
-- - visitors
-- - analytics_events
-- - notifications
-- - audit_logs
-- - media
-- - system_settings
--
-- Under PostgreSQL Row Level Security with no permissive policies defined,
-- any query from the public 'anon' role is strictly DENIED (returns 0 rows or error).
-- Privileged server-side administrative operations execute via the Supabase Service Role
-- client, which bypasses RLS after server-side custom JWT and RBAC verification.
