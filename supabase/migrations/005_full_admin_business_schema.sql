-- ==============================================================================
-- NEWBHAR TECHNOLOGIES — 005_full_admin_business_schema.sql
-- Production Relational Business Schema for Supabase PostgreSQL
-- 
-- IMPORTANT:
-- This migration safely creates all remaining application and business tables
-- using CREATE TABLE IF NOT EXISTS.
-- It NEVER drops, alters, or touches existing authentication tables:
-- (admin_users, admin_sessions, password_reset_tokens)
-- and preserves all existing Super Admin credentials and sessions.
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Helper trigger function for automatic updated_at timestamping
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------------------------
-- 1. BUSINESS MANAGEMENT: contacts
-- Clean enterprise inquiries (Strictly NO phone numbers)
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_contacts_updated_at'
  ) THEN
    CREATE TRIGGER trg_contacts_updated_at
    BEFORE UPDATE ON contacts
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 2. BUSINESS MANAGEMENT: leads
-- Sales pipeline and deal tracking
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_leads_updated_at'
  ) THEN
    CREATE TRIGGER trg_leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 3. BUSINESS MANAGEMENT: clients
-- Customer profiles, lifetime value, and company profiles
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_clients_updated_at'
  ) THEN
    CREATE TRIGGER trg_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. BUSINESS MANAGEMENT: projects
-- Client deliverables, schedules, budgets, and priority tracking
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 5. BUSINESS MANAGEMENT: project_tasks
-- Task checklists within client projects
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_project_tasks_updated_at'
  ) THEN
    CREATE TRIGGER trg_project_tasks_updated_at
    BEFORE UPDATE ON project_tasks
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 6. BUSINESS MANAGEMENT: meetings
-- Discovery sessions, client consultations, and conference links
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_meetings_updated_at'
  ) THEN
    CREATE TRIGGER trg_meetings_updated_at
    BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 7. EMAIL & AUTOMATION: emails
-- Outbound email log with delivery status
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 8. EMAIL & AUTOMATION: automations
-- Event-driven workflow rules
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_automations_updated_at'
  ) THEN
    CREATE TRIGGER trg_automations_updated_at
    BEFORE UPDATE ON automations
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 9. EMAIL & AUTOMATION: automation_logs
-- Execution audit trail for background automations
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS automation_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id UUID REFERENCES automations(id) ON DELETE CASCADE,
  automation_name TEXT,
  trigger_event TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('success', 'failure', 'skipped')),
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 10. EMAIL & AUTOMATION: email_templates
-- Reusable transactional templates with placeholder substitutions
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_email_templates_updated_at'
  ) THEN
    CREATE TRIGGER trg_email_templates_updated_at
    BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 11. CMS: cms_sections
-- Key homepage, hero, about, and branding CMS sections
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_sections_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_sections_updated_at
    BEFORE UPDATE ON cms_sections
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 12. CMS: cms_services
-- Services portfolio with technical architecture and FAQs
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_services_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_services_updated_at
    BEFORE UPDATE ON cms_services
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 13. CMS: cms_solutions
-- Industry solution offerings
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_solutions_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_solutions_updated_at
    BEFORE UPDATE ON cms_solutions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 14. CMS: cms_projects
-- Public case studies and client projects portfolio
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_projects_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_projects_updated_at
    BEFORE UPDATE ON cms_projects
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 15. CMS: cms_technologies
-- Technology stack groupings
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_technologies_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_technologies_updated_at
    BEFORE UPDATE ON cms_technologies
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 16. CMS: cms_navigation
-- Main navigation bar links
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_navigation_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_navigation_updated_at
    BEFORE UPDATE ON cms_navigation
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 17. CMS: cms_footer
-- Global footer links, branding, and copyright
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_cms_footer_updated_at'
  ) THEN
    CREATE TRIGGER trg_cms_footer_updated_at
    BEFORE UPDATE ON cms_footer
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 18. ANALYTICS: visitors
-- Privacy-respecting aggregated visitor tracking
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_visitors_updated_at'
  ) THEN
    CREATE TRIGGER trg_visitors_updated_at
    BEFORE UPDATE ON visitors
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 19. ANALYTICS: analytics_events
-- User journey and beacon analytics
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 20. ADMINISTRATION: notifications
-- In-app admin notifications
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'security', 'inquiry', 'meeting', 'project', 'client')),
  read BOOLEAN NOT NULL DEFAULT false,
  link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 21. ADMINISTRATION: audit_logs
-- Immutable server-generated admin audit trail
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 22. MEDIA: media
-- Metadata registry for Supabase Storage uploads
-- ------------------------------------------------------------------------------
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

-- ------------------------------------------------------------------------------
-- 23. CMS: testimonials
-- Client reviews and ratings
-- ------------------------------------------------------------------------------
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
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_testimonials_updated_at'
  ) THEN
    CREATE TRIGGER trg_testimonials_updated_at
    BEFORE UPDATE ON testimonials
    FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 24. MARKETING: newsletter_subscribers
-- Opt-in email newsletter list
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'subscribed' CHECK (status IN ('subscribed', 'unsubscribed')),
  campaigns_received INTEGER NOT NULL DEFAULT 0,
  subscribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 25. CONFIGURATION: seo_settings
-- Route-specific and global meta tags & Open Graph configs
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS seo_settings (
  id TEXT PRIMARY KEY,
  is_global BOOLEAN NOT NULL DEFAULT false,
  path TEXT UNIQUE,
  title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 26. CONFIGURATION: system_settings
-- Global application configuration (security, integrations, general)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS system_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  general JSONB NOT NULL DEFAULT '{}'::jsonb,
  security JSONB NOT NULL DEFAULT '{}'::jsonb,
  integrations JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
