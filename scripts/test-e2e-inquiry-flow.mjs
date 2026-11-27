/**
 * NEWBHAR TECHNOLOGIES — E2E CUSTOMER & ADMIN INQUIRY FLOW TEST
 *
 * Verifies all criteria from Section 11 of the specification:
 * 1. Admin receives the original dark-themed notification unchanged.
 * 2. Customer receives the new premium light-themed email.
 * 3. Customer name and service category populate correctly.
 * 4. Reference ID is correct in both emails and response.
 * 5. No literal newline characters appear (\n or \n\n).
 * 6. Responsive layout styles for Gmail desktop and mobile.
 * 7. Both emails are dispatched independently.
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { POST as contactPostHandler } from "../app/api/contact/route.js";
import { ContactRepository } from "../lib/repositories/contact.repository.js";
import { SettingsRepository } from "../lib/repositories/settings.repository.js";

// Mock DB operations to isolate network/logic verification
ContactRepository.create = async (data) => ({
  id: "contact_e2e_" + Date.now(),
  ...data,
  notes: [],
  createdAt: new Date().toISOString(),
});
ContactRepository.addNote = async (id, text, author) => ({ id, text, author });
SettingsRepository.logEmail = async (data) => ({ id: "log_" + Date.now(), ...data });
SettingsRepository.listAutomations = async () => [];

const capturedDispatches = [];
globalThis.fetch = async (url, options = {}) => {
  const urlStr = String(url);
  if (urlStr.includes("api.resend.com/emails")) {
    const payload = options.body ? JSON.parse(options.body) : {};
    capturedDispatches.push({
      url: urlStr,
      headers: options.headers,
      payload,
    });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "resend_msg_" + Math.random().toString(36).substring(7) }),
    };
  }
  return { ok: true, status: 200, json: async () => ({}) };
};

function createMockRequest({ ip = "127.0.0.1", body = {} } = {}) {
  const bodyString = JSON.stringify(body);
  const headerMap = new Map([
    ["content-type", "application/json"],
    ["content-length", String(Buffer.byteLength(bodyString))],
    ["x-forwarded-for", ip],
    ["user-agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"],
  ]);

  return {
    headers: {
      get: (k) => headerMap.get(k.toLowerCase()) || null,
    },
    text: async () => bodyString,
    json: async () => JSON.parse(bodyString),
  };
}

async function runE2ETest() {
  console.log("=================================================================");
  console.log("NEWBHAR TECHNOLOGIES — E2E EMAIL INQUIRY VERIFICATION");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, name, details = "") {
    if (condition) {
      console.log(`  [PASS] ${name}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${name} ${details}`);
      failed++;
    }
  }

  capturedDispatches.length = 0;

  const testPayload = {
    name: "Vikramaditya Singhania",
    email: "vikram@singhaniagroup.in",
    companyName: "Singhania Industrial Holdings",
    service: "Enterprise AI & Cloud Infrastructure",
    budget: "$50,000+",
    timeline: "3 - 6 months",
    subject: "Custom LLM Orchestration Platform",
    message: "We need an end-to-end digital transformation platform.\\n\\nKey focus areas:\\n- Fine-tuned domain LLMs\\n- Real-time telemetry dashboard\\n- Enterprise RBAC & Azure AD integration",
    sourcePage: "/start-project",
    formType: "project_inquiry",
  };

  const req = createMockRequest({
    ip: "49.36.120.88",
    body: testPayload,
  });

  const res = await contactPostHandler(req);
  const data = await res.json();

  console.log("API Response Status:", res.status);
  console.log("Reference ID:", data.referenceId);
  console.log("Total Dispatches:", capturedDispatches.length);

  assert(res.status === 200, "API returned HTTP 200 OK");
  assert(data.success === true, "API response reports success: true");
  assert(data.referenceId && data.referenceId.startsWith("NB-"), `Valid reference ID returned: ${data.referenceId}`);
  assert(capturedDispatches.length === 2, "Both Admin and Customer emails were dispatched independently");

  const adminDispatch = capturedDispatches.find((d) => d.payload?.to?.[0] === "newbhartechnologies@gmail.com");
  const customerDispatch = capturedDispatches.find((d) => d.payload?.to?.[0] === "vikram@singhaniagroup.in");

  assert(adminDispatch !== undefined, "Admin notification delivered strictly to newbhartechnologies@gmail.com");
  assert(customerDispatch !== undefined, "Customer confirmation delivered strictly to vikram@singhaniagroup.in");

  // Verify Admin Email (Dark Theme Unchanged)
  console.log("\n--- Checking Admin Notification (Dark Theme) ---");
  const adminHtml = adminDispatch.payload.html;
  const adminText = adminDispatch.payload.text;
  assert(adminHtml.includes("#08080a"), "Admin email uses dark background #08080a");
  assert(adminHtml.includes("#0f111a"), "Admin email uses dark container #0f111a");
  assert(adminHtml.includes("#98f90d"), "Admin email uses neon green #98f90d");
  assert(adminHtml.includes(data.referenceId), "Admin email displays matching reference ID");
  assert(adminHtml.includes("Vikramaditya Singhania"), "Admin email displays customer name");
  assert(adminHtml.includes("Enterprise AI &amp; Cloud Infrastructure") || adminHtml.includes("Enterprise AI & Cloud Infrastructure"), "Admin email displays service");
  assert(adminHtml.includes("Audit &amp; Dispatch Metadata:"), "Admin email contains audit metadata");

  // Verify Customer Email (Premium Light Theme)
  console.log("\n--- Checking Customer Confirmation (Light Theme) ---");
  const custHtml = customerDispatch.payload.html;
  const custText = customerDispatch.payload.text;

  assert(custHtml.includes("#F4F7F5"), "Customer email uses main background #F4F7F5");
  assert(custHtml.includes("#FFFFFF"), "Customer email uses white surface #FFFFFF");
  assert(custHtml.includes("#111827"), "Customer email uses primary text #111827");
  assert(custHtml.includes("#059669"), "Customer email uses emerald accent #059669");
  assert(custHtml.includes("#ECFDF5"), "Customer email uses light emerald bg #ECFDF5");
  assert(!custHtml.includes("#08080a"), "Customer email does NOT use dark background #08080a");
  assert(!custHtml.includes("#98f90d"), "Customer email does NOT use neon green #98f90d");

  // Sections
  assert(custHtml.includes("newbhar-mark.png"), "Header includes existing logo asset");
  assert(custHtml.includes("Newbhar") && custHtml.includes("TECHNOLOGIES"), "Header includes company name");
  assert(custHtml.includes("PROJECT INQUIRY CONFIRMATION"), "Hero has small label PROJECT INQUIRY CONFIRMATION");
  assert(custHtml.includes("Thank You for Reaching Out!"), "Hero has main heading Thank You for Reaching Out!");
  assert(custHtml.includes("Hello Vikramaditya Singhania,"), "Hero includes personalized greeting");
  assert(custHtml.includes("Thank you for your interest in Newbhar Technologies. We have successfully received your project inquiry"), "Hero includes received confirmation");
  assert(custHtml.includes("Your Inquiry Has Been Received"), "Card has heading Your Inquiry Has Been Received");
  assert(custHtml.includes(data.referenceId), "Card displays accurate Reference ID");
  assert(custHtml.includes("Enterprise AI &amp; Cloud Infrastructure") || custHtml.includes("Enterprise AI & Cloud Infrastructure"), "Card displays Service Category");
  assert(custHtml.includes("Requirement Review"), "Includes step 01 Requirement Review");
  assert(custHtml.includes("Technical Evaluation"), "Includes step 02 Technical Evaluation");
  assert(custHtml.includes("Personal Consultation"), "Includes step 03 Personal Consultation");
  assert(custHtml.includes("Let&#039;s Build Something Exceptional.") || custHtml.includes("Let's Build Something Exceptional."), "Includes CTA heading");
  assert(custHtml.includes("EXPLORE NEWBHAR"), "Includes EXPLORE NEWBHAR button");
  assert(custHtml.includes("https://newbhar.com"), "Button links to https://newbhar.com");
  assert(custHtml.includes("Have More Details to Share?"), "Includes support heading");
  assert(custHtml.includes("contact@newbhar.com"), "Support link goes to contact@newbhar.com");
  assert(custHtml.includes("Engineering Digital Excellence."), "Footer includes tagline");
  assert(custHtml.includes("All rights reserved."), "Footer includes copyright");

  // Literal newline test
  console.log("\n--- Checking Literal Newline Elimination ---");
  assert(!custHtml.includes("\\n"), "No literal \\n strings in Customer HTML");
  assert(!custText.includes("\\n"), "No literal \\n strings in Customer Plain Text");

  // Responsive & Table layout
  console.log("\n--- Checking Responsive Table Layout ---");
  assert(custHtml.includes("@media screen and (max-width: 600px)"), "Includes 600px mobile breakpoint styles");
  assert(custHtml.includes("mso-table-lspace"), "Includes Outlook MSO table compatibility styles");
  assert(custHtml.includes("role=\"presentation\""), "Uses accessible presentation tables");

  console.log("\n=================================================================");
  console.log(`E2E TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runE2ETest().catch((err) => {
  console.error("E2E Test failed:", err);
  process.exit(1);
});
