import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { ContactRepository } from "../lib/repositories/contact.repository.js";
import { MeetingRepository } from "../lib/repositories/meeting.repository.js";
import { SettingsRepository } from "../lib/repositories/settings.repository.js";
import { POST as contactPostHandler } from "../app/api/contact/route.js";
import { POST as newsletterPostHandler } from "../app/api/newsletter/route.js";
import { POST as meetingPostHandler } from "../app/api/meetings/request/route.js";
import { SUBMISSION_STATUS } from "../lib/email-service.js";

// Mock repositories to avoid external DB latency during unit testing
ContactRepository.create = async (data) => ({
  id: "contact_mock_" + Math.random().toString(36).substring(7),
  ...data,
  notes: [],
  createdAt: new Date().toISOString(),
});

ContactRepository.addNote = async (id, text, author) => ({
  id,
  note: { text, author },
});

MeetingRepository.create = async (data) => ({
  id: "meeting_mock_" + Math.random().toString(36).substring(7),
  ...data,
  createdAt: new Date().toISOString(),
});

SettingsRepository.addNewsletterSubscriber = async (email) => ({
  id: "sub_mock_" + Math.random().toString(36).substring(7),
  email,
  subscribedAt: new Date().toISOString(),
});

SettingsRepository.logEmail = async (data) => ({
  id: "email_mock_" + Math.random().toString(36).substring(7),
  ...data,
  sentAt: new Date().toISOString(),
});

SettingsRepository.listAutomations = async () => [];

// Capture all Resend API dispatches
const resendDispatches = [];
globalThis.fetch = async (url, options = {}) => {
  const urlStr = String(url);
  if (urlStr.includes("api.resend.com/emails")) {
    const payload = options.body ? JSON.parse(options.body) : {};
    resendDispatches.push({
      url: urlStr,
      headers: options.headers,
      payload,
    });
    return {
      ok: true,
      status: 200,
      json: async () => ({ id: "msg_resend_mock_" + Date.now() }),
    };
  }

  // Fallback mock for any other internal fetch
  return {
    ok: true,
    status: 200,
    json: async () => ({ success: true }),
  };
};

function createMockRequest({ body, headers = {}, ip = "127.0.0.1" }) {
  const bodyString = typeof body === "string" ? body : JSON.stringify(body);
  const headerMap = new Map(
    Object.entries({
      "content-type": "application/json",
      "content-length": String(Buffer.byteLength(bodyString)),
      "x-forwarded-for": ip,
      ...headers,
    })
  );

  return {
    headers: {
      get: (k) => headerMap.get(k.toLowerCase()) || null,
    },
    text: async () => bodyString,
    json: async () => JSON.parse(bodyString),
  };
}

async function runApiTests() {
  console.log("=================================================================");
  console.log("NEWBHAR TECHNOLOGIES — API ROUTES VERIFICATION TEST SUITE");
  console.log("DESTINATION TARGET: newbhartechnologies@gmail.com");
  console.log("=================================================================\n");

  let passed = 0;
  let failed = 0;

  function assert(condition, testName, extraInfo = "") {
    if (condition) {
      console.log(`  [PASS] ${testName}`);
      passed++;
    } else {
      console.error(`  [FAIL] ${testName} ${extraInfo}`);
      failed++;
    }
  }

  const TARGET_EMAIL = "newbhartechnologies@gmail.com";

  // TEST 1: Contact Us Form Submission
  console.log("--- 1. Testing Contact Us Form via /api/contact ---");
  resendDispatches.length = 0;
  const contactReq = createMockRequest({
    ip: "10.0.1.1",
    body: {
      name: "Rohan Sharma",
      email: "rohan@enterprise.in",
      companyName: "Enterprise Logistics",
      service: "Custom Software",
      message: "We need an integrated ERP and warehouse dispatch tracking system.",
      sourcePage: "/contact",
      formType: "contact",
    },
  });
  const contactRes = await contactPostHandler(contactReq);
  const contactData = await contactRes.json();
  assert(contactRes.status === 200, `Returns HTTP 200 (got ${contactRes.status})`);
  assert(contactData.success === true, "Response reports success: true");
  assert(contactData.submissionStatus === SUBMISSION_STATUS.INQUIRY_SAVED, "Submission status is inquiry_saved");
  assert(contactData.emailStatus === SUBMISSION_STATUS.EMAIL_SENT, "Email status is email_sent");
  assert(contactData.referenceId && contactData.referenceId.startsWith("NB-"), `Generates valid referenceId: ${contactData.referenceId}`);
  assert(resendDispatches.length === 2, "Both admin notification and customer confirmation emails were triggered");
  const adminContactEmail = resendDispatches.find((d) => d.payload?.to?.[0] === TARGET_EMAIL);
  const custContactEmail = resendDispatches.find((d) => d.payload?.to?.[0] === "rohan@enterprise.in");
  assert(adminContactEmail !== undefined, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(adminContactEmail?.payload?.from?.includes("contact@newbhar.com"), "Sender is contact@newbhar.com");
  assert(adminContactEmail?.payload?.reply_to === "rohan@enterprise.in", "Reply-To set to rohan@enterprise.in");
  assert(adminContactEmail?.payload?.subject?.includes("[Contact Us]"), "Subject identified as [Contact Us]");
  assert(adminContactEmail?.payload?.html?.includes("#08080a"), "Admin email preserves dark theme (#08080a)");
  assert(custContactEmail !== undefined, "Customer confirmation email sent to rohan@enterprise.in");
  assert(custContactEmail?.payload?.html?.includes("#F4F7F5"), "Customer email uses premium light theme (#F4F7F5)");
  assert(custContactEmail?.payload?.html?.includes("Rohan Sharma"), "Customer email contains customer name");

  // TEST 2: Project Brief / Inquiry Submission (Start Project)
  console.log("\n--- 2. Testing Project Brief via /api/contact ---");
  resendDispatches.length = 0;
  const projectReq = createMockRequest({
    ip: "10.0.1.2",
    body: {
      name: "Elena Rostova",
      email: "elena@fintechglobal.com",
      companyName: "Fintech Global",
      service: "AI & ML Development",
      budget: "$50k+",
      timeline: "3 - 6 months",
      message: "We want to develop an automated risk-scoring algorithmic model for credit assessments with high accuracy.",
      sourcePage: "/start-project",
      formType: "project_brief",
    },
  });
  const projectRes = await contactPostHandler(projectReq);
  const projectData = await projectRes.json();
  assert(projectRes.status === 200, `Returns HTTP 200 (got ${projectRes.status})`);
  assert(projectData.success === true, "Response reports success: true");
  assert(projectData.submissionStatus === SUBMISSION_STATUS.INQUIRY_SAVED, "Submission status is inquiry_saved");
  assert(projectData.emailStatus === SUBMISSION_STATUS.EMAIL_SENT, "Email status is email_sent");
  assert(resendDispatches.length === 2, "Both admin notification and customer confirmation triggered");
  const adminProjectEmail = resendDispatches.find((d) => d.payload?.to?.[0] === TARGET_EMAIL);
  const custProjectEmail = resendDispatches.find((d) => d.payload?.to?.[0] === "elena@fintechglobal.com");
  assert(adminProjectEmail !== undefined, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(adminProjectEmail?.payload?.subject?.includes("[Project Brief]"), "Subject identified as [Project Brief]");
  assert(adminProjectEmail?.payload?.html?.includes("$50k+"), "Admin email includes budget details");
  assert(custProjectEmail !== undefined, "Customer confirmation email delivered to elena@fintechglobal.com");
  assert(custProjectEmail?.payload?.html?.includes("Elena Rostova"), "Customer email includes Elena Rostova");

  // TEST 3: Get a Quote Form Submission
  console.log("\n--- 3. Testing Get a Quote Form via /api/contact ---");
  resendDispatches.length = 0;
  const quoteReq = createMockRequest({
    ip: "10.0.1.3",
    body: {
      name: "Marcus Brody",
      email: "marcus@retailflow.org",
      companyName: "RetailFlow",
      service: "Web Development",
      budget: "$15k - $50k",
      timeline: "1 - 3 months",
      subject: "Get a Quote for E-commerce Platform",
      message: "Please provide a detailed price quotation and architecture breakdown for our new store.",
      formType: "quote",
    },
  });
  const quoteRes = await contactPostHandler(quoteReq);
  const quoteData = await quoteRes.json();
  assert(quoteRes.status === 200, `Returns HTTP 200 (got ${quoteRes.status})`);
  assert(quoteData.success === true, "Response reports success: true");
  const adminQuoteEmail = resendDispatches.find((d) => d.payload?.to?.[0] === TARGET_EMAIL);
  const custQuoteEmail = resendDispatches.find((d) => d.payload?.to?.[0] === "marcus@retailflow.org");
  assert(adminQuoteEmail !== undefined, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(adminQuoteEmail?.payload?.subject?.includes("[Get a Quote]"), "Subject identified as [Get a Quote]");
  assert(custQuoteEmail !== undefined, "Customer confirmation sent to marcus@retailflow.org");

  // TEST 4: Career Application Form Submission
  console.log("\n--- 4. Testing Career Application via /api/contact ---");
  resendDispatches.length = 0;
  const careerReq = createMockRequest({
    ip: "10.0.1.4",
    body: {
      name: "Priya Nair",
      email: "priya.nair@developer.io",
      phone: "+91 98765 43210",
      position: "Senior Next.js & Cloud Architect",
      service: "Career Inquiry",
      portfolioUrl: "https://priyanair.dev",
      message: "I have 7 years of fullstack cloud engineering experience and would love to join Newbhar.",
      formType: "career",
    },
  });
  const careerRes = await contactPostHandler(careerReq);
  const careerData = await careerRes.json();
  assert(careerRes.status === 200, `Returns HTTP 200 (got ${careerRes.status})`);
  assert(careerData.success === true, "Response reports success: true");
  const adminCareerEmail = resendDispatches.find((d) => d.payload?.to?.[0] === TARGET_EMAIL);
  assert(adminCareerEmail !== undefined, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(adminCareerEmail?.payload?.subject?.includes("[Career Application]"), "Subject identified as [Career Application]");
  assert(adminCareerEmail?.payload?.html?.includes("Senior Next.js &amp; Cloud Architect"), "Email includes position details");
  assert(adminCareerEmail?.payload?.html?.includes("+91 98765 43210"), "Email includes phone number");

  // TEST 5: Newsletter Subscription Submission
  console.log("\n--- 5. Testing Newsletter Subscription via /api/newsletter ---");
  resendDispatches.length = 0;
  const newsletterReq = createMockRequest({
    ip: "10.0.1.5",
    body: {
      email: "subscriber@enterprise.com",
      sourcePage: "/insights",
    },
  });
  const newsletterRes = await newsletterPostHandler(newsletterReq);
  const newsletterData = await newsletterRes.json();
  assert(newsletterRes.status === 200, `Returns HTTP 200 (got ${newsletterRes.status})`);
  assert(newsletterData.success === true, "Response reports success: true");
  assert(newsletterData.submissionStatus === SUBMISSION_STATUS.INQUIRY_SAVED, "Submission status is inquiry_saved");
  assert(newsletterData.emailStatus === SUBMISSION_STATUS.EMAIL_SENT, "Email status is email_sent");
  assert(resendDispatches[0]?.payload?.to?.[0] === TARGET_EMAIL, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(resendDispatches[0]?.payload?.subject?.includes("[Newsletter Subscription]"), "Subject identified as [Newsletter Subscription]");

  // TEST 6: Meeting Request Form Submission
  console.log("\n--- 6. Testing Meeting Request via /api/meetings/request ---");
  resendDispatches.length = 0;
  const meetingReq = createMockRequest({
    ip: "10.0.1.6",
    body: {
      name: "David Kim",
      email: "david@kimventures.com",
      company: "Kim Ventures",
      meetingDate: "2026-12-05",
      meetingTime: "15:30",
      timezone: "IST",
      service: "Technical Project Guidance",
      message: "Would like to discuss product roadmap and architecture feasibility for our Q1 launch.",
    },
  });
  const meetingRes = await meetingPostHandler(meetingReq);
  const meetingData = await meetingRes.json();
  assert(meetingRes.status === 200, `Returns HTTP 200 (got ${meetingRes.status})`);
  assert(meetingData.success === true, "Response reports success: true");
  assert(meetingData.submissionStatus === SUBMISSION_STATUS.INQUIRY_SAVED, "Submission status is inquiry_saved");
  assert(meetingData.emailStatus === SUBMISSION_STATUS.EMAIL_SENT, "Email status is email_sent");
  assert(resendDispatches[0]?.payload?.to?.[0] === TARGET_EMAIL, `Notification sent strictly to ${TARGET_EMAIL}`);
  assert(resendDispatches[0]?.payload?.subject?.includes("[Meeting Request]"), "Subject identified as [Meeting Request]");
  assert(resendDispatches[0]?.payload?.html?.includes("2026-12-05"), "Email includes meeting date");

  // TEST 7: Bot / Honeypot Defense
  console.log("\n--- 7. Testing Anti-Bot Honeypot Protection ---");
  resendDispatches.length = 0;
  const botReq = createMockRequest({
    ip: "10.0.1.7",
    body: {
      name: "Spam Bot 3000",
      email: "spambot@spamsite.xyz",
      website: "http://buy-cheapest-pills.com", // Filled honeypot
      message: "Check out this spam link immediately for cheap deals.",
    },
  });
  const botRes = await contactPostHandler(botReq);
  const botData = await botRes.json();
  assert(botRes.status === 200, "Honeypot returns 200 to trick bot");
  assert(botData.success === true, "Honeypot response looks successful to bot");
  assert(resendDispatches.length === 0, "No email was sent for bot honeypot submission");

  // TEST 8: Duplicate Submission Defense
  console.log("\n--- 8. Testing Duplicate Submission Protection ---");
  const dupIp = "10.0.1.8";
  const originalReq = createMockRequest({
    ip: dupIp,
    body: {
      name: "Alice Walker",
      email: "alice@walker.com",
      message: "Unique request message to test immediate deduplication window.",
    },
  });
  const res1 = await contactPostHandler(originalReq);
  assert(res1.status === 200, "First submission allowed (HTTP 200)");

  // Resend identical payload immediately from same IP
  const repeatReq = createMockRequest({
    ip: dupIp,
    body: {
      name: "Alice Walker",
      email: "alice@walker.com",
      message: "Unique request message to test immediate deduplication window.",
    },
  });
  const res2 = await contactPostHandler(repeatReq);
  const data2 = await res2.json();
  assert(res2.status === 429, `Duplicate submission blocked with HTTP 429 (got ${res2.status})`);
  assert(data2.message && data2.message.includes("Duplicate submission detected"), `Duplicate message returned: ${data2.message}`);

  // TEST 9: Validation Error Defense
  console.log("\n--- 9. Testing Validation Error Defense ---");
  const badReq = createMockRequest({
    ip: "10.0.1.9",
    body: {
      name: "A", // too short (min 2)
      email: "bad-email", // invalid email
      message: "hi", // too short (min 10)
    },
  });
  const badRes = await contactPostHandler(badReq);
  const badData = await badRes.json();
  assert(badRes.status === 400, `Returns HTTP 400 for invalid data (got ${badRes.status})`);
  assert(badData.success === false, "Reports success: false");

  console.log("\n=================================================================");
  console.log(`API TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=================================================================\n");

  if (failed > 0) process.exit(1);
}

runApiTests().catch((err) => {
  console.error("API test execution failed:", err);
  process.exit(1);
});
