import { NextResponse } from "next/server";
import { checkRateLimit, isDuplicateSubmission } from "@/lib/rate-limiter";
import { MeetingRepository } from "@/lib/repositories/meeting.repository";
import { sendFormNotificationEmail, generateReferenceId, SUBMISSION_STATUS } from "@/lib/email-service";
import { z } from "zod";

const noCrlf = (val) => !/[\r\n\u0085\u2028\u2029]/.test(val) && !/%0[ad]/i.test(val);

const MeetingRequestSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters.").max(100).refine(noCrlf),
  email: z.string().trim().email("Please provide a valid email address.").max(100).refine(noCrlf),
  phone: z.string().trim().max(30).refine(noCrlf).optional().or(z.literal("")),
  company: z.string().trim().max(100).refine(noCrlf).optional().or(z.literal("")),
  meetingDate: z.string().trim().min(4, "Please provide a preferred meeting date.").max(50).refine(noCrlf),
  meetingTime: z.string().trim().min(2, "Please provide a preferred meeting time.").max(50).refine(noCrlf),
  timezone: z.string().trim().max(50).refine(noCrlf).optional().or(z.literal("")),
  service: z.string().trim().max(100).refine(noCrlf).optional().or(z.literal("")),
  message: z.string().trim().max(3000).optional().or(z.literal("")),
  website: z.string().max(100).optional().or(z.literal("")), // Honeypot
  sourcePage: z.string().max(100).optional().or(z.literal("")),
});

const MAX_BODY_SIZE_BYTES = 16 * 1024;

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
      return NextResponse.json({ success: false, message: "Payload exceeds allowed limit." }, { status: 413 });
    }

    let parsedJson;
    try {
      parsedJson = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Malformed JSON payload." }, { status: 400 });
    }

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

    const validationResult = MeetingRequestSchema.safeParse(parsedJson);
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]?.message || "Invalid input data.";
      return NextResponse.json({ success: false, message: firstError }, { status: 400 });
    }

    const data = validationResult.data;

    // Honeypot check
    if (data.website && data.website.trim().length > 0) {
      return NextResponse.json(
        { success: true, message: "Thank you! Your meeting request has been received." },
        { status: 200 }
      );
    }

    // Duplicate check
    if (isDuplicateSubmission(clientIp, data.email, `${data.meetingDate} ${data.meetingTime}`, "meeting")) {
      return NextResponse.json(
        { success: false, message: "A duplicate meeting request was recently received. Please wait a moment." },
        { status: 429 }
      );
    }

    const referenceId = generateReferenceId("NB-MTG");
    const sourcePage = data.sourcePage || "/meetings";

    // Save into Supabase meetings table (Status: inquiry_saved)
    let meeting = null;
    try {
      meeting = await MeetingRepository.create({
        clientName: data.name,
        clientEmail: data.email,
        title: `Discovery Discussion - ${data.name}`,
        meetingDate: data.meetingDate,
        meetingTime: data.meetingTime,
        durationMinutes: 30,
        status: "requested",
        notes: `Service: ${data.service || "N/A"}. Message: ${data.message || "N/A"}. Timezone: ${data.timezone || "IST"}. Ref: ${referenceId}`,
        source: "website",
      });
    } catch (dbErr) {
      console.warn("[Meeting Request API] Database save warning:", dbErr.message);
    }

    // Send centralized notification email directly to newbhartechnologies@gmail.com
    let notificationResult = {
      success: false,
      delivered: false,
      emailStatus: SUBMISSION_STATUS.EMAIL_PENDING,
    };

    try {
      notificationResult = await sendFormNotificationEmail({
        formType: "meeting",
        data: {
          ...data,
          meetingDate: data.meetingDate,
          meetingTime: data.meetingTime,
          timezone: data.timezone,
          message: data.message || `Meeting requested for ${data.meetingDate} at ${data.meetingTime} (${data.timezone || "IST"}).`,
        },
        sourcePage,
        clientIp,
        referenceId,
      });
    } catch (emailErr) {
      console.error("[Meeting Request API] Notification dispatch error:", emailErr.message);
      notificationResult.emailStatus = SUBMISSION_STATUS.EMAIL_FAILED;
    }

    return NextResponse.json(
      {
        success: true,
        message: "Your meeting request has been received. Our team will review availability and confirm with you shortly.",
        referenceId,
        submissionStatus: meeting ? SUBMISSION_STATUS.INQUIRY_SAVED : "received",
        emailStatus: notificationResult.emailStatus,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("[Meeting Request API] Unexpected error:", err);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while processing your meeting request." },
      { status: 500 }
    );
  }
}
