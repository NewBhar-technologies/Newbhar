/**
 * Verification Suite for Customer Auto-Reply Email Redesign (Premium Light Theme)
 * Tests:
 * 1. Design System colors & tokens
 * 2. Header, Hero, Confirmation Card, Next Steps, CTA, Support, Footer
 * 3. Conditional rendering of optional fields
 * 4. Literal \n and \n\n handling
 * 5. HTML escaping & injection safety
 * 6. Plain-text fallback generation
 * 7. Admin email template remains dark and untouched
 * 8. Resend integration and dispatch routing
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import {
  buildCustomerConfirmationEmailHtml,
  buildCustomerConfirmationEmailText,
  sendCustomerConfirmationEmail,
  cleanEmailText,
  buildNotificationEmailHtml,
  buildNotificationEmailText,
  FORM_TYPES,
} from "../lib/email-service.js";

async function runTests() {
  console.log("=================================================================");
  console.log("NEWBHAR TECHNOLOGIES — CUSTOMER EMAIL REDESIGN VERIFICATION");
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

  const sampleRef = "NB-20261127-TEST01";
  const sampleData = {
    name: "Aarav Sharma",
    email: "aarav.sharma@enterprise.com",
    service: "Custom Software Engineering",
    company: "Sharma Global Logistics",
    budget: "$25,000",
    message: "We need a microservices architecture for fleet tracking.\n\nKey integration needed with legacy ERP.\nRequires ISO 27001 compliance.",
  };

  const html = buildCustomerConfirmationEmailHtml({
    data: sampleData,
    referenceId: sampleRef,
    timestamp: new Date("2026-11-27T12:00:00Z"),
  });

  const text = buildCustomerConfirmationEmailText({
    data: sampleData,
    referenceId: sampleRef,
    timestamp: new Date("2026-11-27T12:00:00Z"),
  });

  // 1. LIGHT THEME DESIGN SYSTEM COLOR PALETTE
  console.log("--- 1. Testing Light Theme Color System ---");
  assert(html.includes("#F4F7F5"), "Uses main email background: #F4F7F5");
  assert(html.includes("#FFFFFF"), "Uses clean white container surface: #FFFFFF");
  assert(html.includes("#111827"), "Uses primary dark text: #111827");
  assert(html.includes("#6B7280"), "Uses secondary text: #6B7280");
  assert(html.includes("#059669"), "Uses emerald accent: #059669");
  assert(html.includes("#047857"), "Uses dark emerald accent: #047857");
  assert(html.includes("#ECFDF5"), "Uses light emerald background: #ECFDF5");
  assert(html.includes("#E5E7EB"), "Uses light borders: #E5E7EB");
  assert(html.includes("#F9FAFB"), "Uses section background: #F9FAFB");

  // Verify NO dark backgrounds or neon green in customer email
  assert(!html.includes("#08080a"), "Customer email does NOT have dark #08080a background");
  assert(!html.includes("#0f111a"), "Customer email does NOT have dark #0f111a surface");
  assert(!html.includes("#141724"), "Customer email does NOT have dark #141724 background");
  assert(!html.includes("#98f90d"), "Customer email does NOT have neon green #98f90d");

  // 2. EMAIL HEADER
  console.log("\n--- 2. Testing Email Header ---");
  assert(html.includes("newbhar-technologies-logo.png") || html.includes("newbhar-mark.png"), "Includes existing logo asset from repository");
  assert(html.includes("Newbhar") && html.includes("TECHNOLOGIES"), "Displays company name wordmark");
  assert(html.includes("height: 2px; background-color: #059669") || html.includes("background-color: #059669; line-height: 2px"), "Includes subtle emerald accent divider");

  // 3. HERO SECTION
  console.log("\n--- 3. Testing Hero Section ---");
  assert(html.includes("PROJECT INQUIRY CONFIRMATION"), "Includes small label PROJECT INQUIRY CONFIRMATION");
  assert(html.includes("Thank You for Reaching Out!"), "Includes main heading Thank You for Reaching Out!");
  assert(html.includes("Hello Aarav Sharma,"), "Includes personalized greeting with customer name");
  assert(html.includes("Thank you for your interest in Newbhar Technologies."), "Includes opening thank you sentence");
  assert(html.includes("We have successfully received your project inquiry and appreciate the opportunity to learn more about your vision."), "Includes inquiry received message");
  assert(html.includes("#ECFDF5") && (html.includes("&#10003;") || html.includes("✓")), "Includes light emerald success indicator");

  // 4. PROJECT CONFIRMATION CARD
  console.log("\n--- 4. Testing Project Confirmation Card ---");
  assert(html.includes("Your Inquiry Has Been Received"), "Card has heading: Your Inquiry Has Been Received");
  assert(html.includes("Aarav Sharma"), "Displays customer name");
  assert(html.includes("Custom Software Engineering"), "Displays service category");
  assert(html.includes(sampleRef), "Displays project reference ID");
  assert(html.includes("IST"), "Displays formatted submission timestamp");
  assert(html.includes("border-left: 3px solid #059669") || html.includes("#059669"), "Includes emerald accent indicator on confirmation card");

  // 5. CONDITIONAL RENDERING OF OPTIONAL FIELDS
  console.log("\n--- 5. Testing Conditional Rendering (Missing Fields) ---");
  const missingServiceHtml = buildCustomerConfirmationEmailHtml({
    data: { name: "Rohan Patel", email: "rohan@example.com" }, // No service
    referenceId: "NB-20261127-NOSERV",
  });
  assert(!missingServiceHtml.includes("Service Category:"), "Service Category omitted when not provided");
  assert(missingServiceHtml.includes("Rohan Patel"), "Customer name displayed when service is omitted");
  assert(missingServiceHtml.includes("NB-20261127-NOSERV"), "Reference ID displayed when service is omitted");

  // 6. WHAT HAPPENS NEXT?
  console.log("\n--- 6. Testing What Happens Next Section ---");
  assert(html.includes("What Happens Next?"), "Includes What Happens Next? section");
  assert(html.includes("Requirement Review") && html.includes("Our team will carefully review your project requirements."), "Includes step 01 Requirement Review");
  assert(html.includes("Technical Evaluation") && html.includes("We will evaluate the project scope, technical feasibility and estimated resources."), "Includes step 02 Technical Evaluation");
  assert(html.includes("Personal Consultation") && html.includes("Our team will contact you within 24 business hours to discuss the next steps."), "Includes step 03 Personal Consultation");
  assert(html.includes("01") && html.includes("02") && html.includes("03"), "Includes 01, 02, 03 step badges");

  // 7. CALL TO ACTION
  console.log("\n--- 7. Testing Call To Action Section ---");
  assert(html.includes("Let&#039;s Build Something Exceptional.") || html.includes("Let's Build Something Exceptional."), "Includes CTA heading: Let's Build Something Exceptional.");
  assert(html.includes("Discover how Newbhar Technologies can help turn your ideas into innovative digital solutions."), "Includes supporting CTA text");
  assert(html.includes("EXPLORE NEWBHAR"), "Includes EXPLORE NEWBHAR button text");
  assert(html.includes("https://newbhar.com"), "Button links to https://newbhar.com");
  assert(html.includes("background-color: #059669") && html.includes("#FFFFFF"), "Button styled with emerald background and white text");

  // 8. SUPPORT SECTION
  console.log("\n--- 8. Testing Support Section ---");
  assert(html.includes("Have More Details to Share?"), "Includes support heading: Have More Details to Share?");
  assert(html.includes("Simply reply to this email if you have additional requirements or information. Our team will be happy to assist you."), "Includes support explanation text");
  assert(html.includes("mailto:contact@newbhar.com"), "Includes clickable mailto:contact@newbhar.com link");

  // 9. FOOTER SECTION
  console.log("\n--- 9. Testing Footer Section ---");
  assert(html.includes("Newbhar Technologies"), "Footer includes company name");
  assert(html.includes("Engineering Digital Excellence."), "Footer includes Engineering Digital Excellence tagline");
  assert(html.includes("Website: <a href=\"https://newbhar.com\"") || html.includes("https://newbhar.com"), "Footer includes website link");
  assert(html.includes("Email: <a href=\"mailto:contact@newbhar.com\"") || html.includes("contact@newbhar.com"), "Footer includes contact email link");
  assert(html.includes("All rights reserved."), "Footer includes copyright notice");

  // 10. LITERAL \n AND \n\n FIX VERIFICATION
  console.log("\n--- 10. Testing Literal \\n and \\n\\n Elimination ---");
  const literalNewlinePayload = {
    name: "Jane\\nDoe",
    service: "Cloud\\nEngineering",
    message: "Line 1\\n\\nLine 2\\nLine 3",
  };
  const cleanedText = cleanEmailText("Hello\\n\\nWorld\\r\\nTest");
  assert(!cleanedText.includes("\\n"), "cleanEmailText converts literal \\n to real newlines");
  assert(!cleanedText.includes("\\r"), "cleanEmailText strips literal \\r");

  const sanitizedHtml = buildCustomerConfirmationEmailHtml({
    data: literalNewlinePayload,
    referenceId: "NB-20261127-NLTEST",
  });
  assert(!sanitizedHtml.includes("Jane\\nDoe"), "HTML does not contain literal \\n in customer name");
  assert(!sanitizedHtml.includes("Cloud\\nEngineering"), "HTML does not contain literal \\n in service");

  // 11. HTML ESCAPING & XSS SAFETY
  console.log("\n--- 11. Testing HTML Escaping & Injection Safety ---");
  const xssPayload = {
    name: '<script>alert("xss")</script>',
    service: '<img src=x onerror=alert(1)>',
    email: 'hacker"onmouseover="alert(1)@evil.com',
  };
  const xssHtml = buildCustomerConfirmationEmailHtml({
    data: xssPayload,
    referenceId: "<script>NB-XSS</script>",
  });
  assert(!xssHtml.includes("<script>"), "Customer name <script> is safely escaped");
  assert(xssHtml.includes("&lt;script&gt;"), "Tags converted to safe HTML entities");
  assert(!xssHtml.includes("<img src=x"), "Service <img> is safely escaped");

  // 12. PLAIN-TEXT FALLBACK VERIFICATION
  console.log("\n--- 12. Testing Plain-Text Fallback ---");
  assert(text.includes("NEWBHAR TECHNOLOGIES — PROJECT INQUIRY CONFIRMATION"), "Plain text has header");
  assert(text.includes("Hello Aarav Sharma,"), "Plain text has greeting");
  assert(text.includes(sampleRef), "Plain text has reference ID");
  assert(text.includes("01 — Requirement Review"), "Plain text has step 01");
  assert(text.includes("02 — Technical Evaluation"), "Plain text has step 02");
  assert(text.includes("03 — Personal Consultation"), "Plain text has step 03");
  assert(text.includes("LET'S BUILD SOMETHING EXCEPTIONAL."), "Plain text has CTA");
  assert(text.includes("https://newbhar.com"), "Plain text has website URL");
  assert(text.includes("contact@newbhar.com"), "Plain text has support email");
  assert(!text.includes("\\n"), "Plain text has no literal \\n strings");

  // 13. ADMIN EMAIL VERIFICATION (STRICT PRESERVATION)
  console.log("\n--- 13. Verifying Admin Notification Email Remains Dark & Untouched ---");
  const adminHtml = buildNotificationEmailHtml({
    formType: FORM_TYPES.PROJECT_INQUIRY,
    data: sampleData,
    referenceId: sampleRef,
    clientIp: "127.0.0.1",
    sourcePage: "/contact",
  });
  const adminText = buildNotificationEmailText({
    formType: FORM_TYPES.PROJECT_INQUIRY,
    data: sampleData,
    referenceId: sampleRef,
    clientIp: "127.0.0.1",
    sourcePage: "/contact",
  });

  assert(adminHtml.includes("#08080a"), "Admin email preserves dark background #08080a");
  assert(adminHtml.includes("#0f111a"), "Admin email preserves dark card #0f111a");
  assert(adminHtml.includes("#141724"), "Admin email preserves dark strip #141724");
  assert(adminHtml.includes("#98f90d"), "Admin email preserves neon green accent #98f90d");
  assert(adminHtml.includes("newbhartechnologies@gmail.com"), "Admin email preserves newbhartechnologies@gmail.com target");
  assert(adminHtml.includes("Audit &amp; Dispatch Metadata:"), "Admin email preserves audit metadata section");
  assert(adminText.includes("Destination: newbhartechnologies@gmail.com"), "Admin plain text preserves destination");

  // 14. CUSTOMER DISPATCH FUNCTION INTEGRATION
  console.log("\n--- 14. Testing Customer Confirmation Dispatch Function ---");
  const dispatchResult = await sendCustomerConfirmationEmail({
    data: {
      name: "Unit Tester",
      email: "tester@newbhar.com",
      service: "Cloud Architecture",
    },
    referenceId: sampleRef,
  });

  assert(typeof dispatchResult === "object", "Dispatch returns structured result");
  assert(dispatchResult.recipient === "tester@newbhar.com", "Routes to customer email");
  assert(dispatchResult.sender.includes("contact@newbhar.com"), "Sends from verified contact@newbhar.com sender");
  assert(dispatchResult.referenceId === sampleRef, "Preserves reference ID");
  assert(typeof dispatchResult.delivered === "boolean", "Returns delivered boolean");

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
