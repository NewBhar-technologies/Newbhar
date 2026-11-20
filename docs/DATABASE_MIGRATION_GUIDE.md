# Newbhar Technologies — Database Migration Execution Guide

This document defines the strict, non-destructive migration execution protocol for Newbhar Technologies on Supabase PostgreSQL (`sqiqeluadrikacujcopj`).

---

## 1. Safety Mandate & Production Protections

> [!CAUTION]
> **PRESERVE EXISTING PRODUCTION DATA:**
> The tables `admin_users`, `admin_sessions`, and `password_reset_tokens` along with the Super Admin account (`admin@newbhar.com`) are already created and live in Supabase.
> 
> **STRICT SAFETY RULES:**
> 1. NEVER execute `DROP TABLE` on authentication tables.
> 2. NEVER execute `supabase db reset` or truncate tables in production.
> 3. NEVER delete or overwrite existing Super Admin credentials.
> 4. Use additive, idempotent DDL (`CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `ON CONFLICT DO UPDATE/DO NOTHING`).

---

## 2. Migration Files & Sequence

All new business tables, indexes, security policies, and initial settings are contained in versioned migration scripts:

| Order | Migration File | Scope & Impact | Safety Guarantees |
|---|---|---|---|
| **1** | `005_full_admin_business_schema.sql` | Creates 26 business, CRM, CMS, and analytics tables. Adds `updated_at` triggers. | Uses `CREATE TABLE IF NOT EXISTS` and `DO $$` trigger guards. Zero impact on auth tables. |
| **2** | `006_full_admin_indexes.sql` | Generates performance, filtering, and foreign key indexes. | Uses `CREATE INDEX IF NOT EXISTS`. Non-blocking. |
| **3** | `007_full_admin_rls_policies.sql` | Enforces Row Level Security across all 29 tables. Adds public read for published CMS and public insert for newsletter. | Uses `DROP POLICY IF EXISTS` before `CREATE POLICY`. All internal tables remain default DENY to public. |
| **4** | `008_newbhar_initial_settings.sql` | Seeds Newbhar-specific CMS defaults, email templates, footer, and system settings. | Uses `ON CONFLICT DO UPDATE` or `DO NOTHING`. Strictly NO fake records. |

---

## 3. How to Apply Migrations to Remote Supabase

### Method A: Supabase Dashboard SQL Editor (Recommended & Safest)

1. Navigate to your [Supabase Dashboard](https://supabase.com/dashboard/project/sqiqeluadrikacujcopj).
2. Click **SQL Editor** from the left navigation menu.
3. Click **New Query**.
4. Open `supabase/migrations/005_full_admin_business_schema.sql` in your local project, copy the full contents, paste into the SQL Editor, and click **Run**.
5. Repeat step 4 in sequence for:
   - `supabase/migrations/006_full_admin_indexes.sql`
   - `supabase/migrations/007_full_admin_rls_policies.sql`
   - `supabase/migrations/008_newbhar_initial_settings.sql`

### Method B: Migration Verification via Node Script

To verify that all 29 tables exist after applying the migrations, run:
```bash
node scripts/verify-db.js
```
*(See verification script below).*

---

## 4. Verification & Validation Queries

Execute the following SQL query in the Supabase SQL Editor to confirm table creation:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

**Expected Result (29 Tables):**
1. `admin_sessions`
2. `admin_users`
3. `analytics_events`
4. `automation_logs`
5. `automations`
6. `clients`
7. `cms_footer`
8. `cms_navigation`
9. `cms_projects`
10. `cms_sections`
11. `cms_services`
12. `cms_solutions`
13. `cms_technologies`
14. `contacts`
15. `email_templates`
16. `emails`
17. `leads`
18. `media`
19. `meetings`
20. `newsletter_subscribers`
21. `notifications`
22. `password_reset_tokens`
23. `project_tasks`
24. `projects`
25. `seo_settings`
26. `system_settings`
27. `testimonials`
28. `visitors`

### Verify RLS Status:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```
*(All tables should show `rowsecurity = true`)*.

### Verify Super Admin Unchanged:
```sql
SELECT id, name, email, role, status 
FROM admin_users 
WHERE email = 'admin@newbhar.com';
```

---

## 5. Rollback & Emergency Precautions

1. **Before Running Migrations:**
   - In the Supabase Dashboard, navigate to **Database** -> **Backups** to confirm that point-in-time recovery (PITR) or an automated daily snapshot is active.
2. **If an Individual Table Needs Reversion:**
   - Because all DDL uses isolated tables, any single table can be modified or dropped without affecting `admin_users`, `admin_sessions`, or other subsystems.
