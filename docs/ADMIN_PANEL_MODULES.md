# Newbhar Technologies — Admin Panel Modules & Features Specification

This document details the functional specifications, supported operations, and interface behaviors across all 18+ admin panel modules.

---

## 1. Overview & Core Modules

### 1. Dashboard (`/admin/dashboard`)
- **Key Metrics (KPIs):** Real-time visitor counts, unique visitors, page views, inbound inquiries, active leads, meetings scheduled, conversion rate.
- **Traffic Trends:** Interactive 30-day timeline chart displaying daily page views and unique visitor traffic.
- **Recent Activities:** Feeds of incoming inquiries, new leads, scheduled meetings, and active client projects.
- **Fault-Tolerant Loading:** Independent widget loading (`safeLoad`) ensures optional widget issues never break the primary dashboard overview.

### 2. Traffic Analytics (`/admin/analytics`)
- **Time Range Filtering:** Dynamic filtering across `Today`, `Yesterday`, `7 Days`, `30 Days`, and `90 Days`.
- **Traffic Breakdowns:**
  - Device distribution (Desktop, Mobile, Tablet)
  - Browser distribution (Chrome, Edge, Firefox, Safari, Opera)
  - Traffic source categorization (Direct, Organic Search, Social Media, Referral)
  - Top popular pages and route view counts

### 3. Visitors Tracking (`/admin/visitors`)
- **Visitor Logs:** Unique visitor identifiers, first/last visit timestamps, total sessions, landing page, and exit page.
- **Search & Inspection:** Filter by visitor ID, path, or date.
- **Privacy:** Strict absence of PII collection.

---

## 2. Business & CRM Modules

### 4. Contacts & Inquiries (`/admin/contacts`)
- **Features:** Comprehensive inbox for website submissions.
- **Actions:**
  - Status management (`new`, `contacted`, `qualified`, `meeting_scheduled`, `proposal_sent`, `converted`, `lost`, `archived`)
  - Team assignment to specific administrators
  - Internal threaded notes
  - CSV export for reporting and analysis
  - Delete with confirmation

### 5. Leads Pipeline (`/admin/leads`)
- **Pipeline Stages:** `new` → `contacted` → `qualified` → `proposal_sent` → `won` → `lost`.
- **Lead Operations:**
  - Create manual lead
  - Update estimated deal value and notes
  - One-click **"Convert to Client"** action: automatically creates a record in `clients` with lifetime value and updates lead stage to `won`.

### 6. CRM & Clients (`/admin/clients`)
- **Client Profiles:** Company name, contact person, business email, industry, status (`active`, `inactive`, `churned`, `lead`), total contract value, and notes.
- **Actions:** Add client, edit details, track linked projects, and search/filter.

### 7. Project Management (`/admin/projects`)
- **Tracking:** Project title, client linkage, category, priority (`low`, `medium`, `high`, `urgent`), status (`planning`, `pending`, `in_progress`, `on_hold`, `completed`, `cancelled`), progress (0–100%), start date, and deadline.
- **Task Management:** Nested checklist tasks (`project_tasks`) with completion checkboxes and due dates.

### 8. Meetings Management (`/admin/meetings`)
- **Schedule:** Discovery calls and client consultations.
- **Details:** Client name, email, meeting date, time, duration (default 30 min), meeting link, status (`requested`, `confirmed`, `rescheduled`, `completed`, `cancelled`), and private notes.

### 9. Reviews & Testimonials (`/admin/reviews`)
- **Management:** Add, edit, feature, and publish client testimonials.
- **Fields:** Client name, company, designation, review text, star rating (1–5), featured toggle, and status (`draft`, `published`, `archived`).

---

## 3. Communication & Automation Modules

### 10. Email Management (`/admin/emails`)
- **Outbox:** Log of transactional and automated emails sent by the system.
- **Status:** `sent`, `draft`, `failed`.
- **Actions:** Review provider responses, filter by status or recipient, and retry failed deliveries.

### 11. Automation Management (`/admin/automations`)
- **Event Rules:** Triggers for `contact_submit` and `meeting_booked`.
- **Actions:** Auto-create lead, dispatch in-app notifications, send templated confirmation emails.
- **Testing:** "Test Trigger" utility to simulate end-to-end workflow execution.

### 12. Template Management (`/admin/templates`)
- **Templates:** Manage transactional email templates.
- **Placeholders:** Supports dynamic syntax e.g. `{{customer_name}}`, `{{service_name}}`, `{{meeting_date}}`, `{{meeting_link}}`.

### 13. Notifications (`/admin/notifications`)
- **Alerts:** Real-time in-app alerts categorized by `inquiry`, `meeting`, `project`, `security`, and `general`.
- **Actions:** Mark as read, mark all read, clear notifications.

### 14. Newsletter (`/admin/newsletter`)
- **Subscribers:** Email list subscribed via the public site.
- **Actions:** Search subscribers, filter by status (`subscribed`, `unsubscribed`), remove entries, export.

---

## 4. Website & Content Management (CMS)

### 15. Homepage & Hero CMS (`/admin/cms/homepage`)
- Edit hero headings, value proposition tagline, category tags, CTA buttons and destinations, and particle sphere motion settings.

### 16. About CMS (`/admin/cms/about`)
- Update company mission, philosophy, engineering standards, and enterprise copy.

### 17. Services CMS (`/admin/cms/services`)
- Full control over services directory: slugs, titles, capability points, technology stacks, development processes, target audience, and FAQs.

### 18. Solutions CMS (`/admin/cms/solutions`)
- Configure industry solution cards and descriptions.

### 19. Portfolio & Projects CMS (`/admin/cms/portfolio`)
- Manage public case studies: slug, title, summary, challenge, solution, quantifiable results, and tech stack tags.

### 20. Technologies CMS (`/admin/cms/technologies`)
- Organize technology stack groups (Frontend, Backend, Cloud & DevOps, AI & Data).

### 21. Navigation & Footer CMS (`/admin/cms/navigation`, `/admin/cms/footer`)
- Manage navbar links and dropdowns.
- Configure global footer: company links, social links, contact email, meeting button, and copyright text.

### 22. SEO Settings (`/admin/seo`)
- Configure global meta tags, Open Graph properties, title templates, and page-specific SEO overrides.

### 23. Media Library (`/admin/media`)
- Upload assets (images, SVG, WebP, PDF) up to 10 MB.
- Generates public URLs and records metadata in PostgreSQL.

---

## 5. System Administration Modules

### 24. User Management (`/admin/users`)
- Super Admin control: create administrative accounts, assign roles (`SUPER_ADMIN`, `ADMIN`, `EDITOR`, `MANAGER`), activate/deactivate accounts, reset lockouts, and update passwords.

### 25. Team Management (`/admin/team`)
- Departmental visual directory of active staff members with role badges and contact emails.

### 26. Security & Audit Logs (`/admin/audit-logs`)
- Searchable audit trail recording admin logins, failures, updates, deletions, and permission changes with timestamp, admin email, IP address, and result status. CSV export supported.

### 27. Backup Management (`/admin/backups`)
- Super Admin utility to generate full JSON snapshots of application tables for offline archival and compliance.

### 28. System Settings (`/admin/settings`)
- Configure site name, support email, timezone, date formats, maintenance mode, security lockout thresholds, and integration statuses.
