import { NextResponse } from "next/server";
import { NewsletterFormSchema } from "@/lib/validation";
import { checkRateLimit, isDuplicateSubmission } from "@/lib/rate-limiter";
import { SettingsRepository } from "@/lib/repositories/settings.repository";
import { sendFormNotificationEmail, generateReferenceId, SUBMISSION_STATUS } from "@/lib/email-service";

const MAX_BODY_SIZE_BYTES = 8 * 1024; // 8KB max payload

function getClientIp(req) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0].trim();
    if (firstIp) return firstIp;
  }
  const realIp = req.headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "127.0.0.1";
}

export async function POST(req) {
  try {
    const contentType = req.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      return NextResponse.json({ success: false, message: "Invalid request content type." }, { status: 415 });
    }

    const rawBody = await req.text();
    if (rawBody.length > MAX_BODY_SIZE_BYTES) {
      return NextResponse.json({ success: false, message: "Payload exceeds limit." }, { status: 413 });
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Malformed JSON payload." }, { status: 400 });
    }

    // Rate limiting per IP
    const clientIp = getClientIp(req);
    const rateLimit = checkRateLimit(clientIp);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          message: `Too many submissions. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
        },
        { status: 429 }
      );
    }

    // Validation
    const validationResult = NewsletterFormSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid email address.";
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const { email, website, sourcePage } = validationResult.data;

    // Honeypot check
    if (website && website.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Thank you for subscribing to Newbhar Technologies updates." },
        { status: 200 }
      );
    }

    // Deduplication check
    if (isDuplicateSubmission(clientIp, email, "", "newsletter")) {
      return NextResponse.json(
        { success: false, message: "You have recently submitted a subscription request." },
        { status: 429 }
      );
    }

    const referenceId = generateReferenceId("NB-NL");
    let subscriber = null;

    // Save subscriber into Supabase database (Status: inquiry_saved)
    try {
      subscriber = await SettingsRepository.addNewsletterSubscriber(email);
    } catch (dbErr) {
      console.warn("[Newsletter API] Supabase subscriber save warning:", dbErr.message);
    }

    // Send centralized notification email to newbhartechnologies@gmail.com
    let notificationResult = {
      success: false,
      delivered: false,
      emailStatus: SUBMISSION_STATUS.EMAIL_PENDING,
    };

    try {
      notificationResult = await sendFormNotificationEmail({
        formType: "newsletter",
        data: {
          name: "Newsletter Subscriber",
          email,
          message: `New subscriber opted in from ${sourcePage || "website"}.`,
        },
        sourcePage: sourcePage || "/newsletter",
        clientIp,
        referenceId,
      });
    } catch (emailErr) {
      console.error("[Newsletter API] Notification dispatch error:", emailErr.message);
      notificationResult.emailStatus = SUBMISSION_STATUS.EMAIL_FAILED;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Thank you for subscribing to Newbhar Technologies updates!",
        referenceId,
        submissionStatus: subscriber ? SUBMISSION_STATUS.INQUIRY_SAVED : "received",
        emailStatus: notificationResult.emailStatus,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Newsletter API] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while processing your subscription." },
      { status: 500 }
    );
  }
}
