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

// Server-side inquiry recipient
export function getContactRecipientEmail() {
  return process.env.CONTACT_RECIPIENT_EMAIL || "inquiries@newbhar.com";
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
      console.warn(
        "WARNING: ADMIN_JWT_SECRET is not configured in environment variables. Falling back to default secret. For security, please add ADMIN_JWT_SECRET to your hosting environment variables."
      );
    }
    return "newbhar_enterprise_super_secure_jwt_secret_token_2026_xyz";
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
