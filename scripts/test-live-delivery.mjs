import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sendFormNotificationEmail, FORM_TYPES } from "../lib/email-service.js";
import { getNotificationRecipientEmail, getEmailFromAddress } from "../lib/env.js";

async function runLiveTest() {
  console.log("=================================================================");
  console.log("NEWBHAR TECHNOLOGIES — LIVE EMAIL NOTIFICATION DISPATCH TEST");
  console.log("=================================================================\n");

  const recipient = getNotificationRecipientEmail();
  const sender = getEmailFromAddress("contact");

  console.log(`Target Recipient : ${recipient}`);
  console.log(`Sender Address   : ${sender}`);
  console.log(`API Key Configured: ${Boolean(process.env.RESEND_API_KEY)}\n`);

  if (recipient !== "newbhartechnologies@gmail.com") {
    console.error(`ERROR: Target recipient MUST BE newbhartechnologies@gmail.com, got: ${recipient}`);
    process.exit(1);
  }

  const result = await sendFormNotificationEmail({
    formType: "project_brief",
    data: {
      name: "Siddharth Sen",
      email: "siddharth.sen@clientcorp.in",
      phone: "+91 98301 23456",
      company: "ClientCorp Enterprises",
      service: "Custom Software & Cloud Architecture",
      budget: "$15k - $50k",
      timeline: "1 - 3 months",
      message: "We need an end-to-end digital transformation platform connecting legacy SAP instances to a modern Next.js customer portal.",
      requirements: "High-concurrency PostgreSQL, SSO with Microsoft Azure AD, automated CI/CD pipelines.",
    },
    sourcePage: "/start-project",
    clientIp: "49.37.150.210",
  });

  console.log("Dispatch Result:");
  console.log(JSON.stringify(result, null, 2));

  if (result.delivered && result.providerMessageId) {
    console.log("\n>>> LIVE DELIVERY SUCCESSFUL! <<<");
    console.log(`Resend Message ID: ${result.providerMessageId}`);
    console.log(`Check inbox at: ${recipient}`);
  } else {
    console.error("\n>>> LIVE DELIVERY FAILED <<<");
    console.error(`Error: ${result.error || result.providerResponse}`);
    process.exit(1);
  }
}

runLiveTest().catch((err) => {
  console.error("Live test error:", err);
  process.exit(1);
});
