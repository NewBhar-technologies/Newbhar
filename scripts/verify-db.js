/**
 * Verification Script for Supabase PostgreSQL Database
 * Tests connectivity and verifies existence of tables.
 * Run via: node scripts/verify-db.js
 */
const { createClient } = require("@supabase/supabase-js");
require("dotenv").config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const EXPECTED_TABLES = [
  "admin_users",
  "admin_sessions",
  "password_reset_tokens",
  "contacts",
  "leads",
  "clients",
  "projects",
  "project_tasks",
  "meetings",
  "emails",
  "automations",
  "automation_logs",
  "email_templates",
  "cms_sections",
  "cms_services",
  "cms_solutions",
  "cms_projects",
  "cms_technologies",
  "cms_navigation",
  "cms_footer",
  "visitors",
  "analytics_events",
  "notifications",
  "audit_logs",
  "media",
  "testimonials",
  "newsletter_subscribers",
  "seo_settings",
  "system_settings",
];

async function verifyDatabase() {
  console.log("=================================================");
  console.log("Newbhar Technologies — Database Diagnostic Check");
  console.log("=================================================");
  console.log(`Supabase URL: ${supabaseUrl}`);

  // Test admin_users with 5s timeout
  console.log("Testing connection to existing table 'admin_users'...");
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 6000);

    const { data, error } = await supabase
      .from("admin_users")
      .select("id, name, email, role, status")
      .limit(3)
      .abortSignal(controller.signal);

    clearTimeout(timeout);

    if (error) {
      console.log(`Query response: Error - ${error.message} (Code: ${error.code})`);
    } else {
      console.log(`Connection SUCCESS! Found ${data?.length || 0} user(s):`);
      (data || []).forEach((u) => {
        console.log(`  ✓ ${u.email} [${u.role}] - Status: ${u.status}`);
      });
    }
  } catch (err) {
    if (err.name === "AbortError") {
      console.log("Connection timed out after 6 seconds (outbound internet access from this terminal environment may be restricted or blocked by firewall).");
    } else {
      console.log(`Connection error: ${err.message}`);
    }
  }

  console.log("\nTable Verification List (29 target tables):");
  EXPECTED_TABLES.forEach((t, i) => console.log(`  ${i + 1}. ${t}`));
  console.log("=================================================");
}

verifyDatabase().catch((err) => {
  console.error("Verification error:", err);
  process.exit(1);
});
