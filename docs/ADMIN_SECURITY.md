# Newbhar Technologies — Admin Security & Hardening Architecture

This document outlines the security controls, authentication architecture, role-based access controls (RBAC), and hardening policies implemented across the Newbhar Technologies platform.

---

## 1. Authentication Architecture

The admin platform utilizes a high-assurance, server-side authentication system tailored for Next.js App Router and Supabase PostgreSQL.

### Key Authentication Features:
1. **Password Hashing:**
   - User passwords are encrypted using `bcryptjs` with a cost factor (salt rounds) of 10–12.
   - Raw passwords are never persisted in the database, logged in application traces, or exposed over API responses.
2. **Session Token Management:**
   - Signed JSON Web Tokens (JWT) generated using `jose` with `HS256`.
   - Token payload contains only non-sensitive identity metadata (`userId`, `email`, `name`, `role`).
   - Session tokens are stored in browser cookies with the following attributes:
     - `HttpOnly: true` (prevents JavaScript access and XSS theft)
     - `SameSite: lax` (mitigates Cross-Site Request Forgery / CSRF)
     - `Secure: true` in production (enforced over TLS/HTTPS)
     - `Path: /`
     - `Max-Age: 86400` (24-hour expiration)
3. **Session Verification & Lockout Defense:**
   - Every protected request extracts and validates the JWT against the server secret (`ADMIN_JWT_SECRET`).
   - The user record is checked in PostgreSQL to verify `status === 'active'`.
   - Account lockout is automatically enforced after **5 consecutive failed login attempts**, locking the account for **15 minutes**.

---

## 2. Server-Side Role-Based Access Control (RBAC)

Access permissions are enforced on the server within `lib/auth/guard.js` via the `withAdminAuth(req, moduleName, handler)` wrapper. 

> [!IMPORTANT]
> UI element visibility in the frontend sidebar is purely ergonomic. The server rejects any unauthorized API request with HTTP 403 Forbidden and writes an immutable entry into `audit_logs`.

### Role Definitions & Module Permissions:

| Role | Access Scope |
|---|---|
| **`SUPER_ADMIN`** | Unrestricted access (`*`). Exclusively permitted to create/delete administrators, modify user roles, change system settings, and manage database backups. |
| **`ADMIN`** | Full access to business operations, CRM, leads, projects, meetings, reviews, CMS, email, automations, templates, notifications, visitors, analytics, audit logs, and settings viewing. |
| **`MANAGER`** | Operational access to CRM, leads, clients, meetings, projects, reviews, notifications, and overview dashboard. |
| **`EDITOR`** | Content management access to CMS sections, services, solutions, projects, technologies, SEO, media library, reviews, notifications, and overview dashboard. |

---

## 3. Database Security & Row Level Security (RLS)

1. **Service Role Separation:**
   - `SUPABASE_SERVICE_ROLE_KEY` is strictly confined to server-side code (`lib/supabase/admin.js`).
   - The Service Role client is never imported or executed in client components.
2. **Default Deny Strategy:**
   - RLS is enabled on all 29 tables.
   - Sensitive operational tables (`admin_users`, `admin_sessions`, `contacts`, `leads`, `clients`, `projects`, `meetings`, `audit_logs`, etc.) have **zero public policies**, meaning all public/unauthenticated requests receive a deny error.
3. **Public Granular Access:**
   - Only published CMS rows (`visibility = true`) are selectable by the public anon role.
   - Newsletter submissions permit public INSERT only when the email contains a valid address structure.

---

## 4. Threat Mitigations & Network Hardening

1. **SQL Injection Defense:**
   - All queries use parameterized Supabase PostgreSQL client calls. No raw SQL concatenation is performed.
2. **Cross-Site Scripting (XSS):**
   - React automatically escapes text in JSX.
   - Strict Content Security Policy (CSP) headers are configured in `next.config.mjs` with `object-src 'none'` and `base-uri 'self'`.
3. **Clickjacking Defense:**
   - `X-Frame-Options: DENY` and CSP `frame-ancestors 'none'` prevent embedding in malicious iframes.
4. **Denial of Service & Abuse Limiting:**
   - Contact form endpoint (`/api/contact`) enforces:
     - 32 KB maximum payload size check
     - In-memory sliding-window IP rate limiting (max 5 requests per 10 minutes)
     - 60-second duplicate submission deduplication
     - Hidden honeypot field (`website`) to discard automated bots silently
5. **CRLF & Header Injection Defense:**
   - All form inputs pass through Zod validators that reject carriage return and newline control characters (`\r`, `\n`).
