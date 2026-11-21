-- ==============================================================================
-- NEWBHAR TECHNOLOGIES — APPLY_ALL_MIGRATIONS.sql
-- Consolidated Production Migration for Supabase PostgreSQL
-- 
-- SAFE & NON-DESTRUCTIVE:
-- - Uses CREATE TABLE IF NOT EXISTS
-- - Uses CREATE INDEX IF NOT EXISTS
-- - Preserves admin_users, admin_sessions, password_reset_tokens intact
-- - Preserves existing Super Admin (admin@newbhar.com)
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- PART 1: BUSINESS SCHEMA (005)
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. contacts
CREATE TABLE IF NOT EXISTS contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  service TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  budget TEXT,
  timeline TEXT,
  source_page TEXT DEFAULT '/contact',
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'meeting_scheduled', 'proposal_sent', 'converted', 'lost', 'archived')),
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notes JSONB DEFAULT '[]'::jsonb,
  client_ip TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contacts_updated_at') THEN
    CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 2. leads
CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company_name TEXT,
  service TEXT,
  stage TEXT NOT NULL DEFAULT 'new' CHECK (stage IN ('new', 'contacted', 'qualified', 'proposal_sent', 'won', 'lost')),
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'Website Contact Form',
  assigned_to UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leads_updated_at') THEN
    CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 3. clients
CREATE TABLE IF NOT EXISTS clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  industry TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'churned', 'lead')),
  total_value NUMERIC NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clients_updated_at') THEN
    CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 4. projects
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
  client_name TEXT,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  start_date DATE,
  deadline DATE,
  budget NUMERIC NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT NOT NULL DEFAULT 'planning' CHECK (status IN ('planning', 'pending', 'in_progress', 'on_hold', 'completed', 'cancelled')),
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  assigned_team JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at') THEN
    CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 5. project_tasks
CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  due_date DATE,
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_tasks_updated_at') THEN
    CREATE TRIGGER trg_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 6. meetings
CREATE TABLE IF NOT EXISTS meetings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  client_email TEXT NOT NULL,
  title TEXT NOT NULL,
  meeting_date DATE NOT NULL,
  meeting_time TEXT NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'requested' CHECK (status IN ('requested', 'confirmed', 'rescheduled', 'completed', 'cancelled')),
  meeting_link TEXT,
  notes TEXT,
  source TEXT DEFAULT 'website',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_meetings_updated_at') THEN
    CREATE TRIGGER trg_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 7. emails
CREATE TABLE IF NOT EXISTS emails (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipient_email TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  category TEXT DEFAULT 'General',
  status TEXT NOT NULL DEFAULT 'sent' CHECK (status IN ('draft', 'sent', 'failed')),
  provider_response TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. automations
CREATE TABLE IF NOT EXISTS automations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  trigger_event TEXT NOT NULL,
  description TEXT,
  enabled BOOLEAN NOT NULL DEFAULT true,
  actions JSONB NOT NULL DEFAULT '[]'::jsonb,
  execution_count INTEGER NOT NULL DEFAULT 0,
  last_run_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_automations_updated_at') THEN
    CREATE TRIGGER trg_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 9. automation_logs
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  automation_name TEXT,
  trigger_event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'skipped')),
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. email_templates
CREATE TABLE IF NOT EXISTS email_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  content TEXT NOT NULL,
  placeholders JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_email_templates_updated_at') THEN
    CREATE TRIGGER trg_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 11. cms_sections
CREATE TABLE IF NOT EXISTS cms_sections (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_sections_updated_at') THEN
    CREATE TRIGGER trg_cms_sections_updated_at
    BEFORE UPDATE ON cms_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 12. cms_services
CREATE TABLE IF NOT EXISTS cms_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tagline TEXT,
  section_title TEXT,
  section_intro TEXT,
  short_desc TEXT,
  points JSONB DEFAULT '[]'::jsonb,
  tech JSONB DEFAULT '[]'::jsonb,
  process JSONB DEFAULT '[]'::jsonb,
  who_we_work_with JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  final_cta JSONB DEFAULT '{}'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_services_updated_at') THEN
    CREATE TRIGGER trg_cms_services_updated_at
    BEFORE UPDATE ON cms_services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 13. cms_solutions
CREATE TABLE IF NOT EXISTS cms_solutions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  text TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 1,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_solutions_updated_at') THEN
    CREATE TRIGGER trg_cms_solutions_updated_at
    BEFORE UPDATE ON cms_solutions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 14. cms_projects
CREATE TABLE IF NOT EXISTS cms_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  tag TEXT,
  summary TEXT,
  challenge TEXT,
  solution TEXT,
  results JSONB DEFAULT '[]'::jsonb,
  stack JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_projects_updated_at') THEN
    CREATE TRIGGER trg_cms_projects_updated_at
    BEFORE UPDATE ON cms_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 15. cms_technologies
CREATE TABLE IF NOT EXISTS cms_technologies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_name TEXT NOT NULL,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  display_order INTEGER NOT NULL DEFAULT 1,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_technologies_updated_at') THEN
    CREATE TRIGGER trg_cms_technologies_updated_at
    BEFORE UPDATE ON cms_technologies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 16. cms_navigation
CREATE TABLE IF NOT EXISTS cms_navigation (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  has_dropdown BOOLEAN NOT NULL DEFAULT false,
  display_order INTEGER NOT NULL DEFAULT 1,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_navigation_updated_at') THEN
    CREATE TRIGGER trg_cms_navigation_updated_at
    BEFORE UPDATE ON cms_navigation
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 17. cms_footer
CREATE TABLE IF NOT EXISTS cms_footer (
  id TEXT PRIMARY KEY DEFAULT 'main',
  brand_description TEXT,
  contact_email TEXT,
  meeting_url TEXT,
  meeting_label TEXT,
  admin_login_link JSONB,
  copyright_text TEXT,
  company_links JSONB DEFAULT '[]'::jsonb,
  social_links JSONB DEFAULT '[]'::jsonb,
  visibility BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  published_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_footer_updated_at') THEN
    CREATE TRIGGER trg_cms_footer_updated_at
    BEFORE UPDATE ON cms_footer
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 18. visitors
CREATE TABLE IF NOT EXISTS visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL UNIQUE,
  first_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_visit TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  total_visits INTEGER NOT NULL DEFAULT 1,
  landing_page TEXT,
  exit_page TEXT,
  pages_visited JSONB DEFAULT '[]'::jsonb,
  session_ids JSONB DEFAULT '[]'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_visitors_updated_at') THEN
    CREATE TRIGGER trg_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 19. analytics_events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  path TEXT NOT NULL,
  visitor_id TEXT,
  session_id TEXT,
  browser TEXT,
  os TEXT,
  device TEXT,
  traffic_source TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 20. notifications
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'security', 'inquiry', 'meeting', 'project', 'client')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 21. audit_logs
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id TEXT,
  admin_email TEXT,
  action TEXT NOT NULL,
  module TEXT NOT NULL,
  record_id TEXT,
  ip TEXT,
  details TEXT,
  result TEXT NOT NULL CHECK (result IN ('success', 'failure', 'error')),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 22. media
CREATE TABLE IF NOT EXISTS media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  filename TEXT NOT NULL,
  original_name TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  alt_text TEXT,
  uploaded_by UUID REFERENCES admin_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. testimonials
CREATE TABLE IF NOT EXISTS testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_name TEXT NOT NULL,
  company_name TEXT,
  designation TEXT,
  review_text TEXT NOT NULL,
  rating INTEGER NOT NULL DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
  client_image TEXT,
  featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_testimonials_updated_at') THEN
    CREATE TRIGGER trg_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- 24. newsletter_subscribers
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  campaigns_received INTEGER NOT NULL DEFAULT 0,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 25. seo_settings
CREATE TABLE IF NOT EXISTS seo_settings (
  id TEXT PRIMARY KEY,
  is_global BOOLEAN NOT NULL DEFAULT false,
  path TEXT UNIQUE,
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 26. system_settings
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  general JSONB NOT NULL DEFAULT '{}'::jsonb,
  security JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- PART 2: INDEXES (006)
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts (status);
CREATE INDEX IF NOT EXISTS idx_contacts_email ON contacts (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON contacts (assigned_to);

CREATE INDEX IF NOT EXISTS idx_leads_contact_id ON leads (contact_id);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads (stage);
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON leads (assigned_to);

CREATE INDEX IF NOT EXISTS idx_clients_status ON clients (status);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_clients_created_at ON clients (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects (client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_priority ON projects (priority);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_project_tasks_project_id ON project_tasks (project_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_order ON project_tasks (display_order);

CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings (status);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings (meeting_date, meeting_time);
CREATE INDEX IF NOT EXISTS idx_meetings_client_email ON meetings (LOWER(client_email));

CREATE INDEX IF NOT EXISTS idx_emails_recipient ON emails (LOWER(recipient_email));
CREATE INDEX IF NOT EXISTS idx_emails_status ON emails (status);
CREATE INDEX IF NOT EXISTS idx_emails_created_at ON emails (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_automations_trigger ON automations (trigger_event);
CREATE INDEX IF NOT EXISTS idx_automations_enabled ON automations (enabled);
CREATE INDEX IF NOT EXISTS idx_automation_logs_automation_id ON automation_logs (automation_id);
CREATE INDEX IF NOT EXISTS idx_automation_logs_timestamp ON automation_logs (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_cms_services_slug ON cms_services (slug);
CREATE INDEX IF NOT EXISTS idx_cms_services_order ON cms_services (display_order);
CREATE INDEX IF NOT EXISTS idx_cms_services_visibility ON cms_services (visibility);

CREATE INDEX IF NOT EXISTS idx_cms_solutions_order ON cms_solutions (display_order);
CREATE INDEX IF NOT EXISTS idx_cms_solutions_visibility ON cms_solutions (visibility);

CREATE INDEX IF NOT EXISTS idx_cms_projects_slug ON cms_projects (slug);
CREATE INDEX IF NOT EXISTS idx_cms_projects_order ON cms_projects (display_order);
CREATE INDEX IF NOT EXISTS idx_cms_projects_featured ON cms_projects (featured);
CREATE INDEX IF NOT EXISTS idx_cms_projects_visibility ON cms_projects (visibility);

CREATE INDEX IF NOT EXISTS idx_cms_technologies_order ON cms_technologies (display_order);
CREATE INDEX IF NOT EXISTS idx_cms_technologies_visibility ON cms_technologies (visibility);

CREATE INDEX IF NOT EXISTS idx_cms_navigation_order ON cms_navigation (display_order);
CREATE INDEX IF NOT EXISTS idx_cms_navigation_visibility ON cms_navigation (visibility);

CREATE INDEX IF NOT EXISTS idx_visitors_visitor_id ON visitors (visitor_id);
CREATE INDEX IF NOT EXISTS idx_visitors_last_visit ON visitors (last_visit DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events (event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events (path);
CREATE INDEX IF NOT EXISTS idx_analytics_events_visitor_id ON analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_timestamp ON analytics_events (timestamp DESC);

CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module ON audit_logs (module);
CREATE INDEX IF NOT EXISTS idx_audit_logs_admin_id ON audit_logs (admin_id);

CREATE INDEX IF NOT EXISTS idx_testimonials_status ON testimonials (status);
CREATE INDEX IF NOT EXISTS idx_testimonials_featured ON testimonials (featured);
CREATE INDEX IF NOT EXISTS idx_testimonials_order ON testimonials (display_order);

CREATE INDEX IF NOT EXISTS idx_newsletter_email ON newsletter_subscribers (LOWER(email));
CREATE INDEX IF NOT EXISTS idx_media_category ON media (category);
CREATE INDEX IF NOT EXISTS idx_media_created_at ON media (created_at DESC);

-- ------------------------------------------------------------------------------
-- PART 3: ROW LEVEL SECURITY POLICIES (007)
-- ------------------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Public read published cms_sections" ON cms_sections;
CREATE POLICY "Public read published cms_sections" ON cms_sections FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_services" ON cms_services;
CREATE POLICY "Public read published cms_services" ON cms_services FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_solutions" ON cms_solutions;
CREATE POLICY "Public read published cms_solutions" ON cms_solutions FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_projects" ON cms_projects;
CREATE POLICY "Public read published cms_projects" ON cms_projects FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_technologies" ON cms_technologies;
CREATE POLICY "Public read published cms_technologies" ON cms_technologies FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_navigation" ON cms_navigation;
CREATE POLICY "Public read published cms_navigation" ON cms_navigation FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read published cms_footer" ON cms_footer;
CREATE POLICY "Public read published cms_footer" ON cms_footer FOR SELECT TO anon, authenticated USING (visibility = true);

DROP POLICY IF EXISTS "Public read seo_settings" ON seo_settings;
CREATE POLICY "Public read seo_settings" ON seo_settings FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public read published testimonials" ON testimonials;
CREATE POLICY "Public read published testimonials" ON testimonials FOR SELECT TO anon, authenticated USING (status = 'published');

DROP POLICY IF EXISTS "Public insert newsletter_subscribers" ON newsletter_subscribers;
CREATE POLICY "Public insert newsletter_subscribers" ON newsletter_subscribers FOR INSERT TO anon, authenticated WITH CHECK (email IS NOT NULL AND position('@' in email) > 1);

-- ------------------------------------------------------------------------------
-- PART 4: DEFAULT SETTINGS & TEMPLATES (008)
-- ------------------------------------------------------------------------------
INSERT INTO cms_sections (id, data, visibility)
VALUES
  ('homepage', '{"categoryText": "Software · AI · Cloud · Data", "mainHeading": "Your digital transformation", "highlightedHeading": "partner.", "description": "We turn spreadsheets, paper forms and manual follow-ups into custom software, web platforms, mobile apps and AI tools, built around how your business really works.", "primaryButtonText": "Let''s talk", "primaryButtonUrl": "/start-project", "secondaryButtonText": "See our work", "secondaryButtonUrl": "/projects", "tags": ["100% custom-built", "Web, mobile, AI & cloud under one roof"], "visibility": true}'::jsonb, true),
  ('heroAnimation', '{"enabled": true, "particleCount": 160, "particleSize": 3, "animationSpeed": 1, "visibility": true, "behavior": "interactive-orbit"}'::jsonb, true),
  ('about', '{"heading": "Engineering Digital Excellence for Forward-Thinking Enterprises", "subheading": "Custom solutions crafted around how your business really operates.", "content": "Newbhar Technologies is a premier technology partner specializing in enterprise custom software, cloud architecture, and artificial intelligence solutions. We replace manual friction with seamless, reliable software.", "visibility": true}'::jsonb, true),
  ('branding', '{"name": "Newbhar Technologies", "tagline": "Your digital transformation partner.", "primaryColor": "#f5c518", "accentInk": "#806000", "darkBackground": "#29251b", "logoText": "Newbhar Technologies", "contactEmail": "info@newbhar.com", "location": "India", "visibility": true}'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET data = EXCLUDED.data, visibility = EXCLUDED.visibility, updated_at = NOW();

INSERT INTO cms_footer (id, brand_description, contact_email, meeting_url, meeting_label, admin_login_link, copyright_text, company_links, social_links, visibility)
VALUES (
  'main',
  'Software, AI and cloud engineering for forward-thinking enterprises.',
  'info@newbhar.com',
  '/contact',
  'Schedule a Consultation',
  '{"label": "Admin Login", "url": "/admin/login", "enabled": true, "displayOrder": 2, "showLockIcon": true}'::jsonb,
  '© 2026 Newbhar Technologies. All rights reserved.',
  '[{"label": "About", "href": "/about", "enabled": true}, {"label": "How we work", "href": "/how-we-work", "enabled": true}, {"label": "Projects", "href": "/projects", "enabled": true}, {"label": "Technologies", "href": "/technologies", "enabled": true}, {"label": "Contact", "href": "/contact", "enabled": true}]'::jsonb,
  '[{"platform": "LinkedIn", "url": "https://linkedin.com", "enabled": true}, {"platform": "GitHub", "url": "https://github.com", "enabled": true}]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET brand_description = EXCLUDED.brand_description, contact_email = EXCLUDED.contact_email, copyright_text = EXCLUDED.copyright_text, updated_at = NOW();

INSERT INTO email_templates (id, name, category, subject, content, placeholders)
VALUES
  ('a1b2c3d4-0001-4000-8000-000000000001', 'Inquiry Confirmation Email', 'Inquiry Confirmation',
   'Thank you for contacting Newbhar Technologies - We have received your inquiry',
   'Hello {{customer_name}},\n\nThank you for reaching out to Newbhar Technologies. We have received your project details regarding {{service_name}}.\n\nOur solutions engineering team is reviewing your requirements and will reach back out within 24 business hours.\n\nWarm regards,\nThe Newbhar Technologies Team\nhttps://newbhar.com',
   '["customer_name", "customer_email", "service_name", "company_name"]'::jsonb),
  ('a1b2c3d4-0002-4000-8000-000000000002', 'Meeting Confirmation Email', 'Meeting Confirmation',
   'Meeting Confirmed: Newbhar Technologies Discovery Call on {{meeting_date}}',
   'Hi {{customer_name}},\n\nYour discovery meeting with Newbhar Technologies has been confirmed for {{meeting_date}}.\n\nMeeting link: {{meeting_link}}\n\nWe look forward to speaking with you!\n\nBest,\nNewbhar Technologies Engineering Team',
   '["customer_name", "meeting_date", "meeting_link"]'::jsonb),
  ('a1b2c3d4-0003-4000-8000-000000000003', 'Lead Follow-up Email', 'Follow-up',
   'Following up on your digital transformation project',
   'Hi {{customer_name}},\n\nI wanted to follow up on your recent inquiry regarding {{service_name}} for {{company_name}}.\n\nDo you have 15 minutes this week for a quick consultation?\n\nBest regards,\nNewbhar Technologies Team',
   '["customer_name", "service_name", "company_name"]'::jsonb)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, subject = EXCLUDED.subject, content = EXCLUDED.content, placeholders = EXCLUDED.placeholders, updated_at = NOW();

INSERT INTO system_settings (id, general, security, integrations)
VALUES (
  'default',
  '{"siteName": "Newbhar Technologies", "supportEmail": "info@newbhar.com", "timezone": "Asia/Kolkata", "dateFormat": "YYYY-MM-DD", "maintenanceMode": false}'::jsonb,
  '{"maxLoginAttempts": 5, "lockoutDurationMinutes": 15, "sessionExpiryHours": 24, "enforceStrongPasswords": true}'::jsonb,
  '{"resend": {"status": "Ready", "configured": false}, "supabase": {"status": "Connected (Supabase PostgreSQL)", "configured": true}}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET general = EXCLUDED.general, security = EXCLUDED.security, updated_at = NOW();

INSERT INTO seo_settings (id, is_global, path, title, description, metadata)
VALUES
  ('global', true, NULL, 'Newbhar Technologies | Custom Software, AI & Cloud Engineering', 'Newbhar Technologies builds enterprise custom software, web platforms, mobile apps, and AI solutions tailored to operational business needs.', '{"siteName": "Newbhar Technologies", "titleTemplate": "%s | Newbhar Technologies - Engineering Digital Excellence", "canonicalBase": "https://newbhar.com", "keywords": "custom software, web development, cloud engineering, enterprise AI, digital transformation, Newbhar", "ogType": "website"}'::jsonb),
  ('home', false, '/', 'Newbhar Technologies — Digital Transformation & Custom Software', 'Partner with Newbhar Technologies for custom software, web platforms, mobile apps, and enterprise cloud solutions.', '{}'::jsonb),
  ('about', false, '/about', 'About Us — Newbhar Technologies', 'Learn about Newbhar Technologies'' engineering philosophy, standards, and mission to deliver exceptional digital platforms.', '{}'::jsonb),
  ('services', false, '/services', 'Services — Newbhar Technologies Engineering Solutions', 'Custom software engineering, cloud architecture, modern web applications, and artificial intelligence solutions.', '{}'::jsonb),
  ('solutions', false, '/solutions', 'Enterprise Solutions — Newbhar Technologies', 'Operational automation, legacy modernization, and scalable cloud infrastructure engineered for business growth.', '{}'::jsonb),
  ('projects', false, '/projects', 'Client Work & Case Studies — Newbhar Technologies', 'Explore real enterprise software, mobile apps, and automated dashboards engineered by Newbhar Technologies.', '{}'::jsonb),
  ('technologies', false, '/technologies', 'Technology Stack — Newbhar Technologies', 'Modern technology ecosystem: Next.js, React, Node.js, PostgreSQL, AWS, and Cloud Engineering.', '{}'::jsonb),
  ('contact', false, '/contact', 'Contact Us — Newbhar Technologies', 'Get in touch with Newbhar Technologies to discuss your next software, AI, or cloud engineering project.', '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, description = EXCLUDED.description, metadata = EXCLUDED.metadata, updated_at = NOW();

INSERT INTO automations (id, name, trigger_event, description, enabled, actions)
VALUES
  ('b1c2d3e4-0001-4000-8000-000000000001', 'Website Inquiry Ingestion', 'contact_submit', 'Automatically ingests contact form submissions, records them, notifies admins, and sends inquiry confirmation.', true, '[{"type": "save_inquiry", "params": {}}, {"type": "create_lead", "params": {}}, {"type": "notify_admin", "params": {"channels": ["in_app"]}}, {"type": "send_template_email", "params": {"templateId": "a1b2c3d4-0001-4000-8000-000000000001"}}]'::jsonb),
  ('b1c2d3e4-0002-4000-8000-000000000002', 'Meeting Confirmation Workflow', 'meeting_booked', 'Dispatches in-app notification and confirmation email when a client meeting is scheduled.', true, '[{"type": "notify_admin", "params": {"channels": ["in_app"]}}, {"type": "send_template_email", "params": {"templateId": "a1b2c3d4-0002-4000-8000-000000000002"}}]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- ------------------------------------------------------------------------------
-- PART 5: ROLE PERMISSIONS & GRANTS
-- Grants access to the Supabase service_role, anon, and authenticated roles.
-- ------------------------------------------------------------------------------
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, service_role;

GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT ON TABLE public.contacts TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.newsletter_subscribers TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.visitors TO anon, authenticated, service_role;
GRANT INSERT ON TABLE public.analytics_events TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO postgres, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON ROUTINES TO postgres, service_role;

