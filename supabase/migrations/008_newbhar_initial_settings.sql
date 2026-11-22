-- ==============================================================================
-- NEWBHAR TECHNOLOGIES — 008_newbhar_initial_settings.sql
-- Idempotent Default Seed Data (CMS Defaults, System Settings, Templates, SEO)
-- Strictly NO BytecGlobal references and strictly NO fake business data.
-- ==============================================================================

-- 1. Default CMS Sections
INSERT INTO cms_sections (id, data, visibility)
VALUES
  ('homepage', '{
    "categoryText": "Software · AI · Cloud · Data",
    "mainHeading": "Your digital transformation",
    "highlightedHeading": "partner.",
    "description": "We turn spreadsheets, paper forms and manual follow-ups into custom software, web platforms, mobile apps and AI tools, built around how your business really works.",
    "primaryButtonText": "Let''s talk",
    "primaryButtonUrl": "/start-project",
    "secondaryButtonText": "See our work",
    "secondaryButtonUrl": "/projects",
    "tags": ["100% custom-built", "Web, mobile, AI & cloud under one roof"],
    "visibility": true
  }'::jsonb, true),
  ('heroAnimation', '{
    "enabled": true,
    "particleCount": 160,
    "particleSize": 3,
    "animationSpeed": 1,
    "visibility": true,
    "behavior": "interactive-orbit"
  }'::jsonb, true),
  ('about', '{
    "heading": "Engineering Digital Excellence for Forward-Thinking Enterprises",
    "subheading": "Custom solutions crafted around how your business really operates.",
    "content": "Newbhar Technologies is a premier technology partner specializing in enterprise custom software, cloud architecture, and artificial intelligence solutions. We replace manual friction with seamless, reliable software.",
    "visibility": true
  }'::jsonb, true),
  ('branding', '{
    "name": "Newbhar Technologies",
    "tagline": "Your digital transformation partner.",
    "primaryColor": "#f5c518",
    "accentInk": "#806000",
    "darkBackground": "#29251b",
    "logoText": "Newbhar Technologies",
    "contactEmail": "newbhartechnologies@gmail.com",
    "location": "India",
    "visibility": true
  }'::jsonb, true)
ON CONFLICT (id) DO UPDATE SET
  data = EXCLUDED.data,
  visibility = EXCLUDED.visibility,
  updated_at = NOW();

-- 2. Default CMS Footer
INSERT INTO cms_footer (id, brand_description, contact_email, meeting_url, meeting_label, admin_login_link, copyright_text, company_links, social_links, visibility)
VALUES (
  'main',
  'Software, AI and cloud engineering for forward-thinking enterprises.',
  'newbhartechnologies@gmail.com',
  '/contact',
  'Schedule a Consultation',
  '{"label": "Admin Login", "url": "/admin/login", "enabled": true, "displayOrder": 2, "showLockIcon": true}'::jsonb,
  '© 2026 Newbhar Technologies. All rights reserved.',
  '[
    {"label": "About", "href": "/about", "enabled": true},
    {"label": "How we work", "href": "/how-we-work", "enabled": true},
    {"label": "Projects", "href": "/projects", "enabled": true},
    {"label": "Technologies", "href": "/technologies", "enabled": true},
    {"label": "Contact", "href": "/contact", "enabled": true}
  ]'::jsonb,
  '[
    {"platform": "LinkedIn", "url": "https://linkedin.com", "enabled": true},
    {"platform": "GitHub", "url": "https://github.com", "enabled": true}
  ]'::jsonb,
  true
)
ON CONFLICT (id) DO UPDATE SET
  brand_description = EXCLUDED.brand_description,
  contact_email = EXCLUDED.contact_email,
  copyright_text = EXCLUDED.copyright_text,
  updated_at = NOW();

-- 3. Default Transactional Email Templates
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
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subject = EXCLUDED.subject,
  content = EXCLUDED.content,
  placeholders = EXCLUDED.placeholders,
  updated_at = NOW();

-- 4. Default System Settings
INSERT INTO system_settings (id, general, security, integrations)
VALUES (
  'default',
  '{
    "siteName": "Newbhar Technologies",
    "supportEmail": "newbhartechnologies@gmail.com",
    "timezone": "Asia/Kolkata",
    "dateFormat": "YYYY-MM-DD",
    "maintenanceMode": false
  }'::jsonb,
  '{
    "maxLoginAttempts": 5,
    "lockoutDurationMinutes": 15,
    "sessionExpiryHours": 24,
    "enforceStrongPasswords": true
  }'::jsonb,
  '{
    "resend": { "status": "Ready", "configured": false },
    "supabase": { "status": "Connected (Supabase PostgreSQL)", "configured": true }
  }'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
  general = EXCLUDED.general,
  security = EXCLUDED.security,
  updated_at = NOW();

-- 5. Default SEO Settings
INSERT INTO seo_settings (id, is_global, path, title, description, metadata)
VALUES
  ('global', true, NULL,
   'Newbhar Technologies | Custom Software, AI & Cloud Engineering',
   'Newbhar Technologies builds enterprise custom software, web platforms, mobile apps, and AI solutions tailored to operational business needs.',
   '{
     "siteName": "Newbhar Technologies",
     "titleTemplate": "%s | Newbhar Technologies - Engineering Digital Excellence",
     "canonicalBase": "https://newbhar.com",
     "keywords": "custom software, web development, cloud engineering, enterprise AI, digital transformation, Newbhar",
     "ogType": "website"
   }'::jsonb),
  ('home', false, '/',
   'Newbhar Technologies — Digital Transformation & Custom Software',
   'Partner with Newbhar Technologies for custom software, web platforms, mobile apps, and enterprise cloud solutions.',
   '{}'::jsonb),
  ('about', false, '/about',
   'About Us — Newbhar Technologies',
   'Learn about Newbhar Technologies'' engineering philosophy, standards, and mission to deliver exceptional digital platforms.',
   '{}'::jsonb),
  ('services', false, '/services',
   'Services — Newbhar Technologies Engineering Solutions',
   'Custom software engineering, cloud architecture, modern web applications, and artificial intelligence solutions.',
   '{}'::jsonb),
  ('solutions', false, '/solutions',
   'Enterprise Solutions — Newbhar Technologies',
   'Operational automation, legacy modernization, and scalable cloud infrastructure engineered for business growth.',
   '{}'::jsonb),
  ('projects', false, '/projects',
   'Client Work & Case Studies — Newbhar Technologies',
   'Explore real enterprise software, mobile apps, and automated dashboards engineered by Newbhar Technologies.',
   '{}'::jsonb),
  ('technologies', false, '/technologies',
   'Technology Stack — Newbhar Technologies',
   'Modern technology ecosystem: Next.js, React, Node.js, PostgreSQL, AWS, and Cloud Engineering.',
   '{}'::jsonb),
  ('contact', false, '/contact',
   'Contact Us — Newbhar Technologies',
   'Get in touch with Newbhar Technologies to discuss your next software, AI, or cloud engineering project.',
   '{}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  metadata = EXCLUDED.metadata,
  updated_at = NOW();

-- 6. Default Automation Rules
INSERT INTO automations (id, name, trigger_event, description, enabled, actions)
VALUES
  ('b1c2d3e4-0001-4000-8000-000000000001', 'Website Inquiry Ingestion', 'contact_submit',
   'Automatically ingests contact form submissions, records them, notifies admins, and sends inquiry confirmation.',
   true,
   '[
     {"type": "save_inquiry", "params": {}},
     {"type": "create_lead", "params": {}},
     {"type": "notify_admin", "params": {"channels": ["in_app"]}},
     {"type": "send_template_email", "params": {"templateId": "a1b2c3d4-0001-4000-8000-000000000001"}}
   ]'::jsonb),
  ('b1c2d3e4-0002-4000-8000-000000000002', 'Meeting Confirmation Workflow', 'meeting_booked',
   'Dispatches in-app notification and confirmation email when a client meeting is scheduled.',
   true,
   '[
     {"type": "notify_admin", "params": {"channels": ["in_app"]}},
     {"type": "send_template_email", "params": {"templateId": "a1b2c3d4-0002-4000-8000-000000000002"}}
   ]'::jsonb)
ON CONFLICT (id) DO NOTHING;
