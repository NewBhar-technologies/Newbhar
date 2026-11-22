# Newbhar Technologies — Supabase PostgreSQL Schema Specification

This document provides the authoritative schema specification for Newbhar Technologies on Supabase PostgreSQL.

---

## 1. Table Architecture Overview

The database contains **29 relational tables** grouped into logical subsystems:

1. **Authentication & Access Control (3 tables)**: `admin_users`, `admin_sessions`, `password_reset_tokens`
2. **CRM & Lead Management (3 tables)**: `contacts`, `leads`, `clients`
3. **Project Management (2 tables)**: `projects`, `project_tasks`
4. **Meeting & Calendar (1 table)**: `meetings`
5. **Email & Automation (4 tables)**: `emails`, `automations`, `automation_logs`, `email_templates`
6. **Website & Content Management (8 tables)**: `cms_sections`, `cms_services`, `cms_solutions`, `cms_projects`, `cms_technologies`, `cms_navigation`, `cms_footer`, `testimonials`
7. **Traffic Analytics & Tracking (2 tables)**: `visitors`, `analytics_events`
8. **Administration & Security (3 tables)**: `notifications`, `audit_logs`, `media`
9. **Configuration & Marketing (3 tables)**: `newsletter_subscribers`, `seo_settings`, `system_settings`

---

## 2. Table Schemas & Definitions

### 1. `admin_users`
Internal administrators, role-based access, and login security.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL, UNIQUE, lowercase)
- `password_hash` (TEXT, NOT NULL — bcrypt hash)
- `role` (TEXT, NOT NULL, DEFAULT `'ADMIN'` — `SUPER_ADMIN`, `ADMIN`, `EDITOR`, `MANAGER`)
- `status` (TEXT, NOT NULL, DEFAULT `'active'` — `active`, `inactive`, `locked`, `suspended`)
- `failed_attempts` (INTEGER, NOT NULL, DEFAULT 0)
- `lockout_until` (TIMESTAMPTZ)
- `last_login` (TIMESTAMPTZ)
- `password_changed_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 2. `admin_sessions`
Active admin sessions and device tokens.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, FK → `admin_users(id)` ON DELETE CASCADE)
- `token_hash` (TEXT, NOT NULL)
- `ip_address` (TEXT)
- `user_agent` (TEXT)
- `expires_at` (TIMESTAMPTZ, NOT NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 3. `password_reset_tokens`
One-time cryptographically hashed password reset tokens.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `user_id` (UUID, NOT NULL, FK → `admin_users(id)` ON DELETE CASCADE)
- `token_hash` (TEXT, NOT NULL)
- `expires_at` (TIMESTAMPTZ, NOT NULL)
- `used_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 4. `contacts`
Inbound inquiries submitted from website contact forms.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `company_name` (TEXT)
- `service` (TEXT)
- `subject` (TEXT)
- `message` (TEXT, NOT NULL)
- `budget` (TEXT)
- `timeline` (TEXT)
- `source_page` (TEXT, DEFAULT `'/contact'`)
- `status` (TEXT, NOT NULL, DEFAULT `'new'` — `new`, `contacted`, `qualified`, `meeting_scheduled`, `proposal_sent`, `converted`, `lost`, `archived`)
- `assigned_to` (UUID, FK → `admin_users(id)` ON DELETE SET NULL)
- `notes` (JSONB, DEFAULT `'[]'`)
- `client_ip` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 5. `leads`
Sales pipeline tracking from initial contact to conversion.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `contact_id` (UUID, FK → `contacts(id)` ON DELETE SET NULL)
- `name` (TEXT, NOT NULL)
- `email` (TEXT, NOT NULL)
- `company_name` (TEXT)
- `service` (TEXT)
- `stage` (TEXT, NOT NULL, DEFAULT `'new'` — `new`, `contacted`, `qualified`, `proposal_sent`, `won`, `lost`)
- `estimated_value` (NUMERIC, NOT NULL, DEFAULT 0)
- `source` (TEXT, DEFAULT `'Website Contact Form'`)
- `assigned_to` (UUID, FK → `admin_users(id)` ON DELETE SET NULL)
- `notes` (JSONB, DEFAULT `'[]'`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 6. `clients`
Enterprise client accounts and contact persons.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `contact_person` (TEXT)
- `email` (TEXT, NOT NULL)
- `industry` (TEXT)
- `status` (TEXT, NOT NULL, DEFAULT `'active'` — `active`, `inactive`, `churned`, `lead`)
- `total_value` (NUMERIC, NOT NULL, DEFAULT 0)
- `notes` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 7. `projects`
Client projects, milestones, progress, and budgets.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `client_id` (UUID, FK → `clients(id)` ON DELETE SET NULL)
- `client_name` (TEXT)
- `title` (TEXT, NOT NULL)
- `category` (TEXT)
- `description` (TEXT)
- `start_date` (DATE)
- `deadline` (DATE)
- `budget` (NUMERIC, NOT NULL, DEFAULT 0)
- `priority` (TEXT, NOT NULL, DEFAULT `'medium'` — `low`, `medium`, `high`, `urgent`)
- `status` (TEXT, NOT NULL, DEFAULT `'planning'` — `planning`, `pending`, `in_progress`, `on_hold`, `completed`, `cancelled`)
- `progress` (INTEGER, NOT NULL, DEFAULT 0, CHECK 0–100)
- `assigned_team` (JSONB, DEFAULT `'[]'`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 8. `project_tasks`
Discrete deliverables associated with projects.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `project_id` (UUID, NOT NULL, FK → `projects(id)` ON DELETE CASCADE)
- `title` (TEXT, NOT NULL)
- `completed` (BOOLEAN, NOT NULL, DEFAULT false)
- `due_date` (DATE)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 9. `meetings`
Scheduled client discovery calls and consultations.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `client_name` (TEXT, NOT NULL)
- `client_email` (TEXT, NOT NULL)
- `title` (TEXT, NOT NULL)
- `meeting_date` (DATE, NOT NULL)
- `meeting_time` (TEXT, NOT NULL)
- `duration_minutes` (INTEGER, NOT NULL, DEFAULT 30)
- `status` (TEXT, NOT NULL, DEFAULT `'requested'` — `requested`, `confirmed`, `rescheduled`, `completed`, `cancelled`)
- `meeting_link` (TEXT)
- `notes` (TEXT)
- `source` (TEXT, DEFAULT `'website'`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 10. `emails`
Outbound transactional email logs.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `recipient_email` (TEXT, NOT NULL)
- `sender_email` (TEXT, NOT NULL)
- `subject` (TEXT, NOT NULL)
- `category` (TEXT, DEFAULT `'General'`)
- `status` (TEXT, NOT NULL, DEFAULT `'sent'` — `draft`, `sent`, `failed`)
- `provider_response` (TEXT)
- `sent_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 11. `automations`
Event-driven workflow configuration rules.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `trigger_event` (TEXT, NOT NULL)
- `description` (TEXT)
- `enabled` (BOOLEAN, NOT NULL, DEFAULT true)
- `actions` (JSONB, NOT NULL, DEFAULT `'[]'`)
- `execution_count` (INTEGER, NOT NULL, DEFAULT 0)
- `last_run_at` (TIMESTAMPTZ)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 12. `automation_logs`
Execution history for background automations.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `automation_id` (UUID, FK → `automations(id)` ON DELETE CASCADE)
- `automation_name` (TEXT)
- `trigger_event` (TEXT, NOT NULL)
- `status` (TEXT, NOT NULL — `success`, `failure`, `skipped`)
- `details` (TEXT)
- `timestamp` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 13. `email_templates`
Transactional email templates with placeholders.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `name` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL)
- `subject` (TEXT, NOT NULL)
- `content` (TEXT, NOT NULL)
- `placeholders` (JSONB, DEFAULT `'[]'`)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 14. `cms_sections`
Structured homepage, about, and branding content.
- `id` (TEXT, Primary Key — e.g. `'homepage'`, `'heroAnimation'`, `'about'`, `'branding'`)
- `data` (JSONB, NOT NULL)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `published_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 15. `cms_services`
Services directory with technical capabilities, processes, and FAQs.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `title` (TEXT, NOT NULL)
- `tagline` (TEXT)
- `section_title` (TEXT)
- `section_intro` (TEXT)
- `short_desc` (TEXT)
- `points` (JSONB, DEFAULT `'[]'`)
- `tech` (JSONB, DEFAULT `'[]'`)
- `process` (JSONB, DEFAULT `'[]'`)
- `who_we_work_with` (JSONB, DEFAULT `'[]'`)
- `faqs` (JSONB, DEFAULT `'[]'`)
- `final_cta` (JSONB, DEFAULT `'{}'`)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 16. `cms_solutions`
Enterprise solutions overview cards.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `title` (TEXT, NOT NULL)
- `text` (TEXT, NOT NULL)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 17. `cms_projects`
Public portfolio case studies.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `slug` (TEXT, NOT NULL, UNIQUE)
- `title` (TEXT, NOT NULL)
- `tag` (TEXT)
- `summary` (TEXT)
- `challenge` (TEXT)
- `solution` (TEXT)
- `results` (JSONB, DEFAULT `'[]'`)
- `stack` (JSONB, DEFAULT `'[]'`)
- `featured` (BOOLEAN, NOT NULL, DEFAULT false)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 18. `cms_technologies`
Curated tech stack categories.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `group_name` (TEXT, NOT NULL)
- `items` (JSONB, NOT NULL, DEFAULT `'[]'`)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 19. `cms_navigation`
Header navigation links.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `label` (TEXT, NOT NULL)
- `href` (TEXT, NOT NULL)
- `has_dropdown` (BOOLEAN, NOT NULL, DEFAULT false)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 20. `cms_footer`
Global footer settings and company links.
- `id` (TEXT, Primary Key, DEFAULT `'main'`)
- `brand_description` (TEXT)
- `contact_email` (TEXT)
- `meeting_url` (TEXT)
- `meeting_label` (TEXT)
- `admin_login_link` (JSONB)
- `copyright_text` (TEXT)
- `company_links` (JSONB, DEFAULT `'[]'`)
- `social_links` (JSONB, DEFAULT `'[]'`)
- `visibility` (BOOLEAN, NOT NULL, DEFAULT true)
- `created_at`, `updated_at`, `published_at` (TIMESTAMPTZ, NOT NULL)

### 21. `visitors`
Aggregated visitor records.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `visitor_id` (TEXT, NOT NULL, UNIQUE)
- `first_visit` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `last_visit` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
- `total_visits` (INTEGER, NOT NULL, DEFAULT 1)
- `landing_page` (TEXT)
- `exit_page` (TEXT)
- `pages_visited` (JSONB, DEFAULT `'[]'`)
- `session_ids` (JSONB, DEFAULT `'[]'`)
- `ip_address` (TEXT)
- `created_at`, `updated_at` (TIMESTAMPTZ, NOT NULL)

### 22. `analytics_events`
Individual user journey tracking events.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `event_name` (TEXT, NOT NULL)
- `path` (TEXT, NOT NULL)
- `visitor_id` (TEXT)
- `session_id` (TEXT)
- `browser` (TEXT)
- `os` (TEXT)
- `device` (TEXT)
- `traffic_source` (TEXT)
- `metadata` (JSONB, DEFAULT `'{}'`)
- `timestamp` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 23. `notifications`
Internal admin alerts and notifications.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `title` (TEXT, NOT NULL)
- `message` (TEXT, NOT NULL)
- `category` (TEXT, NOT NULL, DEFAULT `'general'` — `general`, `security`, `inquiry`, `meeting`, `project`, `client`)
- `read` (BOOLEAN, NOT NULL, DEFAULT false)
- `link` (TEXT)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 24. `audit_logs`
Immutable compliance and security audit logs.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `admin_id` (TEXT)
- `admin_email` (TEXT)
- `action` (TEXT, NOT NULL)
- `module` (TEXT, NOT NULL)
- `record_id` (TEXT)
- `ip` (TEXT)
- `details` (TEXT)
- `result` (TEXT, NOT NULL — `success`, `failure`, `error`)
- `timestamp` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 25. `media`
Metadata index for assets stored in Supabase Storage.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `filename` (TEXT, NOT NULL)
- `original_name` (TEXT, NOT NULL)
- `mime_type` (TEXT, NOT NULL)
- `size_bytes` (BIGINT, NOT NULL)
- `storage_path` (TEXT, NOT NULL)
- `public_url` (TEXT, NOT NULL)
- `category` (TEXT, DEFAULT `'general'`)
- `alt_text` (TEXT)
- `uploaded_by` (UUID, FK → `admin_users(id)` ON DELETE SET NULL)
- `created_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 26. `testimonials`
Published and draft client reviews.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `client_name` (TEXT, NOT NULL)
- `company_name` (TEXT)
- `designation` (TEXT)
- `review_text` (TEXT, NOT NULL)
- `rating` (INTEGER, NOT NULL, DEFAULT 5, CHECK 1–5)
- `client_image` (TEXT)
- `featured` (BOOLEAN, NOT NULL, DEFAULT false)
- `status` (TEXT, NOT NULL, DEFAULT `'published'` — `draft`, `published`, `archived`)
- `display_order` (INTEGER, NOT NULL, DEFAULT 1)
- `created_at`, `updated_at` (TIMESTAMPTZ, NOT NULL)

### 27. `newsletter_subscribers`
Subscriber emails collected via footer/blog.
- `id` (UUID, Primary Key, `gen_random_uuid()`)
- `email` (TEXT, NOT NULL, UNIQUE)
- `status` (TEXT, NOT NULL, DEFAULT `'subscribed'` — `subscribed`, `unsubscribed`)
- `campaigns_received` (INTEGER, NOT NULL, DEFAULT 0)
- `subscribed_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 28. `seo_settings`
Global and page-level SEO configurations.
- `id` (TEXT, Primary Key — e.g. `'global'`, `'home'`, `'about'`)
- `is_global` (BOOLEAN, NOT NULL, DEFAULT false)
- `path` (TEXT, UNIQUE)
- `title` (TEXT)
- `description` (TEXT)
- `metadata` (JSONB, DEFAULT `'{}'`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)

### 29. `system_settings`
Global platform configuration.
- `id` (TEXT, Primary Key, DEFAULT `'default'`)
- `general` (JSONB, NOT NULL, DEFAULT `'{}'`)
- `security` (JSONB, NOT NULL, DEFAULT `'{}'`)
- `integrations` (JSONB, NOT NULL, DEFAULT `'{}'`)
- `updated_at` (TIMESTAMPTZ, NOT NULL, DEFAULT `NOW()`)
