import { NextResponse } from "next/server";
import { SettingsRepository } from "@/lib/repositories/settings.repository";

/**
 * Resend Webhook Event Handler
 * Receives delivery status events: email.sent, email.delivered, email.bounced, email.complained
 */
export async function POST(req) {
  try {
    const rawBody = await req.text();
    let event;

    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ success: false, message: "Invalid JSON" }, { status: 400 });
    }

    const { type, data } = event;
    const emailId = data?.email_id;
    const recipient = data?.to?.[0];

    console.log(`[Resend Webhook] Event: ${type} for ${recipient || "N/A"} (ID: ${emailId || "N/A"})`);

    if (type === "email.delivered") {
      try {
        await SettingsRepository.logEmail({
          recipientEmail: recipient || "newbhartechnologies@gmail.com",
          senderEmail: "Newbhar Technologies <contact@newbhar.com>",
          subject: `[Delivered Event] ${emailId || "unknown"}`,
          category: "Webhook:Delivery",
          status: "sent",
          providerResponse: `Delivered confirmed by Resend webhook at ${new Date().toISOString()}`,
        });
      } catch (err) {
        console.warn("[Resend Webhook] Logging warning:", err.message);
      }
    } else if (type === "email.bounced" || type === "email.complained") {
      try {
        await SettingsRepository.logEmail({
          recipientEmail: recipient || "newbhartechnologies@gmail.com",
          senderEmail: "Newbhar Technologies <contact@newbhar.com>",
          subject: `[${type}] ${emailId || "unknown"}`,
          category: `Webhook:${type}`,
          status: "failed",
          providerResponse: `Delivery failure event (${type}): ${JSON.stringify(data)}`,
        });
      } catch (err) {
        console.warn("[Resend Webhook] Failure logging warning:", err.message);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[Resend Webhook] Unexpected error:", err);
    return NextResponse.json({ success: false, message: "Webhook processing error" }, { status: 500 });
  }
}
