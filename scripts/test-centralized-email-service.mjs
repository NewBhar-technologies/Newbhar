/**
 * Verification test suite for Newbhar Technologies Centralized Email Notification System
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import {
  generateReferenceId,
  detectFormType,
  escapeHtml,
  sanitizeHeader,
  formatSubmissionTimestamp,
  buildNotificationEmailHtml,
  buildNotificationEmailText,
  FORM_TYPES,
  sendFormNotificationEmail,
} from "../lib/email-service.js";
import { getNotificationRecipientEmail } from "../lib/env.js";
import { checkRateLimit, isDuplicateSubmission } from "../lib/rate-limiter.js";
import { ContactFormSchema, NewsletterFormSchema } from "../lib/validation.js";

async function runTests() {
  console.log("=================================================================");
  console.log("NEWBHAR TECHNOLOGIES — EMAIL NOTIFICATION SYSTEM VERIFICATION");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName}`);
      failed++;
    }
  }

  // 1. Reference ID Generation
  console.log("--- 1. Testing Reference ID Generator ---");
  const ref1 = generateReferenceId("NB");
  const ref2 = generateReferenceId("NB");
  assert(ref1.startsWith("NB-") && ref1.length >= 17, `Valid format: ${ref1}`);
  assert(ref1 !== ref2, "Unique reference IDs generated");

  // 2. Form Type Detection
  console.log("\n--- 2. Testing Form Type Detection ---");
  const contactType = detectFormType({ message: "Hello, I have a question." }, "/contact");
  assert(contactType.id === "contact", "Detects Contact Us");

  const projectType = detectFormType({ budget: "$15k - $50k", timeline: "1 - 3 months", message: "Build SaaS" }, "/start-project");
  assert(projectType.id === "project_inquiry", "Detects Project Inquiry");

  const quoteType = detectFormType({ formType: "quote", budget: "<$5k", message: "Need a price estimate" }, "/start-project");
  assert(quoteType.id === "quote", "Detects Get a Quote");

  const careerType = detectFormType({ position: "Senior Fullstack Engineer", portfolioUrl: "https://github.com/developer", message: "Application for engineering role" }, "/careers");
  assert(careerType.id === "career", "Detects Career Application");

  const newsletterType = detectFormType({ email: "subscriber@company.com" }, "/newsletter");
  assert(newsletterType.id === "newsletter", "Detects Newsletter Subscription");

  const meetingType = detectFormType({ meetingDate: "2026-12-01", meetingTime: "14:00", message: "30-min discovery" }, "/meetings");
  assert(meetingType.id === "meeting", "Detects Meeting Request");

  // 3. Security: HTML Escaping
  console.log("\n--- 3. Testing HTML Injection & XSS Protection ---");
  const dangerousHtml = `<script>alert("xss")</script><img src="x" onerror="alert(1)"> & ' "`;
  const safeHtml = escapeHtml(dangerousHtml);
  assert(!safeHtml.includes("<script>"), "Escapes <script> tag");
  assert(safeHtml.includes("&lt;script&gt;"), "Converts < to &lt;");
  assert(safeHtml.includes("&amp;"), "Converts & to &amp;");
  assert(safeHtml.includes("&quot;"), "Converts \" to &quot;");

  // 4. Security: Email Header Injection
  console.log("\n--- 4. Testing Email Header Injection (CRLF) Protection ---");
  const maliciousHeader = "Jane Doe\r\nBcc: evil@hacker.com\nSubject: Injected\r\n%0d%0aCc: victim@test.com";
  const safeHeader = sanitizeHeader(maliciousHeader);
  assert(!safeHeader.includes("\r"), "Strips carriage return");
  assert(!safeHeader.includes("\n"), "Strips newline");
  assert(!safeHeader.includes("%0d"), "Strips URL encoded %0d");
  assert(!safeHeader.includes("%0a"), "Strips URL encoded %0a");
  assert(safeHeader.includes("Jane Doe"), "Retains legitimate header text");

  // 5. Security: Fixed Notification Recipient
  console.log("\n--- 5. Testing Enforced Notification Recipient ---");
  const enforcedRecipient = getNotificationRecipientEmail();
  assert(enforcedRecipient.includes("info@newbhar.com"), `Enforced recipient is info@newbhar.com (got: ${enforcedRecipient})`);

  // 6. Security: Schema Validation
  console.log("\n--- 6. Testing Schema Validation ---");
  const validContact = ContactFormSchema.safeParse({
    name: "Subhajit Roy",
    email: "subhajit@example.com",
    service: "Custom Software",
    message: "We need an enterprise ERP system built with React and Node.js.",
  });
  assert(validContact.success, "Valid contact schema passes");

  const invalidEmail = ContactFormSchema.safeParse({
    name: "Subhajit Roy",
    email: "not-an-email",
    message: "Valid length message here for testing.",
  });
  assert(!invalidEmail.success, "Invalid email address is rejected");

  const crlfInName = ContactFormSchema.safeParse({
    name: "Subhajit\r\nInjection",
    email: "subhajit@example.com",
    message: "Valid length message here for testing.",
  });
  assert(!crlfInName.success, "CRLF newline in name field is rejected by schema");

  const validNewsletter = NewsletterFormSchema.safeParse({
    email: "reader@company.com",
  });
  assert(validNewsletter.success, "Valid newsletter schema passes");

  // 7. Security: Anti-Spam Rate Limiting & Deduplication
  console.log("\n--- 7. Testing Rate Limiting & Deduplication ---");
  const testIp = "192.168.100.99";
  const isDup1 = isDuplicateSubmission(testIp, "client@test.com", "Test inquiry message", "contact");
  assert(!isDup1, "First submission is not a duplicate");

  const isDup2 = isDuplicateSubmission(testIp, "client@test.com", "Test inquiry message", "contact");
  assert(isDup2, "Immediate duplicate submission is detected and blocked");

  // 8. Template Generation & Mobile Responsiveness
  console.log("\n--- 8. Testing Branded HTML Email Template Generation ---");
  const sampleRef = "NB-20261127-DEMO1";
  const htmlOutput = buildNotificationEmailHtml({
    formType: FORM_TYPES.PROJECT_INQUIRY,
    data: {
      name: "Alex Vance",
      email: "alex@techcorp.io",
      phone: "+1 555 019 2831",
      company: "TechCorp Global",
      service: "AI / Automation Solution",
      budget: "$50k+",
      timeline: "3 - 6 months",
      message: "Looking to deploy a custom LLM orchestration pipeline for document classification.",
    },
    referenceId: sampleRef,
    clientIp: "203.0.113.195",
    sourcePage: "/start-project",
  });

  assert(htmlOutput.includes("Newbhar"), "HTML contains Newbhar branding");
  assert(htmlOutput.includes("TECHNOLOGIES"), "HTML contains TECHNOLOGIES wordmark");
  assert(htmlOutput.includes(sampleRef), "HTML displays Reference ID");
  assert(htmlOutput.includes("PROJECT INQUIRY"), "HTML displays form type badge");
  assert(htmlOutput.includes("Alex Vance"), "HTML contains customer name");
  assert(htmlOutput.includes("alex@techcorp.io"), "HTML contains customer email");
  assert(htmlOutput.includes("TechCorp Global"), "HTML contains customer company");
  assert(htmlOutput.includes("$50k+"), "HTML contains budget specification");
  assert(htmlOutput.includes("3 - 6 months"), "HTML contains timeline specification");
  assert(htmlOutput.includes("info@newbhar.com"), "HTML confirms target recipient info@newbhar.com");
  assert(htmlOutput.includes("@media screen and (max-width: 600px)"), "HTML contains mobile-responsive styles");

  const textOutput = buildNotificationEmailText({
    formType: FORM_TYPES.PROJECT_INQUIRY,
    data: {
      name: "Alex Vance",
      email: "alex@techcorp.io",
      service: "AI / Automation Solution",
      message: "Looking to deploy a custom LLM pipeline.",
    },
    referenceId: sampleRef,
    clientIp: "203.0.113.195",
    sourcePage: "/start-project",
  });
  assert(textOutput.includes("NEWBHAR TECHNOLOGIES"), "Plain text contains branding header");
  assert(textOutput.includes(sampleRef), "Plain text contains reference ID");

  // 9. Centralized Email Dispatch Service (Resend Integration & Fallback Handling)
  console.log("\n--- 9. Testing Centralized Email Notification Service ---");
  const dispatchResult = await sendFormNotificationEmail({
    formType: "project_inquiry",
    data: {
      name: "Audit Test User",
      email: "audit-test@newbhar.com",
      company: "Newbhar QA Systems",
      service: "Web Development",
      budget: "$15k - $50k",
      timeline: "1 - 3 months",
      message: "Automated verification test of the centralized notification system.",
    },
    sourcePage: "/start-project",
    clientIp: "127.0.0.1",
    referenceId: sampleRef,
  });

  assert(typeof dispatchResult === "object", "Service returns structured result object");
  assert(dispatchResult.referenceId === sampleRef, "Service preserves or assigns reference ID");
  assert(dispatchResult.formType === "project_inquiry", "Service correctly identified form type");
  assert(typeof dispatchResult.delivered === "boolean", "Service provides delivery boolean status");
  assert(typeof dispatchResult.providerResponse === "string", `Service reports provider response: ${dispatchResult.providerResponse}`);

  console.log("\n=================================================================");
  console.log(`TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
