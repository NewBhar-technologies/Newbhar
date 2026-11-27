/**
 * Environment configuration helper with safe fallbacks and secret protection.
 * Server-only secrets are never exported or leaked to client bundles.
 */

// Safe public site URL
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || "https://newbhar.com";

// Public Supabase configuration
export const NEXT_PUBLIC_SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "";

export const NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "";

// Official company emails
export const COMPANY_EMAILS = {
  info: "info@newbhar.com",
  contact: "contact@newbhar.com",
  support: "support@newbhar.com",
};

// Server-side notification recipient for all incoming website forms
export function getNotificationRecipientEmail() {
  return (
    process.env.NOTIFICATION_RECIPIENT_EMAIL ||
    process.env.INFO_RECIPIENT_EMAIL ||
    COMPANY_EMAILS.info ||
    "info@newbhar.com"
  );
}

// Server-side inquiry recipient (Contact & Project inquiries)
export function getContactRecipientEmail() {
  return (
    process.env.CONTACT_RECIPIENT_EMAIL ||
    process.env.NEXT_PUBLIC_CONTACT_EMAIL ||
    COMPANY_EMAILS.contact
  );
}

// Server-side general business inquiries recipient
export function getInfoRecipientEmail() {
  return (
    process.env.INFO_RECIPIENT_EMAIL ||
    process.env.NEXT_PUBLIC_INFO_EMAIL ||
    COMPANY_EMAILS.info
  );
}

// Server-side support inquiries recipient
export function getSupportRecipientEmail() {
  return (
    process.env.SUPPORT_RECIPIENT_EMAIL ||
    process.env.NEXT_PUBLIC_SUPPORT_EMAIL ||
    COMPANY_EMAILS.support
  );
}

// Outgoing email sender (From address)
export function getEmailFromAddress(purpose = "contact") {
  if (process.env.EMAIL_FROM) {
    return process.env.EMAIL_FROM;
  }
  if (purpose === "support") {
    return "Newbhar Technologies Support <support@newbhar.com>";
  }
  if (purpose === "info") {
    return "Newbhar Technologies <info@newbhar.com>";
  }
  return "Newbhar Technologies <contact@newbhar.com>";
}

// SMTP configuration helper (retrieved safely from environment)
export function getSmtpConfig() {
  const host = process.env.SMTP_HOST || "";
  const port = parseInt(process.env.SMTP_PORT || "587", 10);
  const user = process.env.SMTP_USER || "";
  const pass = process.env.SMTP_PASS || "";
  const secure = process.env.SMTP_SECURE === "true" || port === 465;

  return {
    host,
    port,
    user,
    pass,
    secure,
    configured: Boolean(host && user && pass),
  };
}

// Server-side Resend API key
export function getResendApiKey() {
  return process.env.RESEND_API_KEY || "";
}

// Server-side Admin Session JWT Secret
export function getAdminJwtSecret() {
  const secret = process.env.ADMIN_JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "FATAL SECURITY CONFIGURATION ERROR: ADMIN_JWT_SECRET must be explicitly configured in production environment variables."
      );
    }
    return "newbhar_dev_jwt_secret_token_local_development_only";
  }
  return secret;
}

// Server-side Supabase Service Role Key
export function getSupabaseServiceRoleKey() {
  return process.env.SUPABASE_SERVICE_ROLE_KEY || "";
}

// Initial Admin Credentials (used only during first-time database seed / init)
export function getInitialAdminCredentials() {
  return {
    email: process.env.INITIAL_ADMIN_EMAIL || "admin@newbhar.com",
    password: process.env.INITIAL_ADMIN_PASSWORD || "",
  };
}
