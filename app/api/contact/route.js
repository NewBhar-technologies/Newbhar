import { NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validation";
import { checkRateLimit, isDuplicateSubmission } from "@/lib/rate-limiter";
import { ContactRepository } from "@/lib/repositories/contact.repository";
import { triggerWorkflow } from "@/lib/automations";
import { sendFormNotificationEmail, generateReferenceId } from "@/lib/email-service";

const MAX_BODY_SIZE_BYTES = 32 * 1024; // 32KB max payload

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
		// 1. Content-Type verification
		const contentType = req.headers.get("content-type") || "";
		if (!contentType.includes("application/json")) {
			return NextResponse.json({ success: false, message: "Invalid request content type." }, { status: 415 });
		}

		// 2. Body size limit verification
		const contentLength = req.headers.get("content-length");
		if (contentLength && parseInt(contentLength, 10) > MAX_BODY_SIZE_BYTES) {
			return NextResponse.json({ success: false, message: "Request payload exceeds allowed limit." }, { status: 413 });
		}

		const rawBody = await req.text();
		if (rawBody.length > MAX_BODY_SIZE_BYTES) {
			return NextResponse.json({ success: false, message: "Request payload exceeds allowed limit." }, { status: 413 });
		}

		let parsedJson;
		try {
			parsedJson = JSON.parse(rawBody);
		} catch {
			return NextResponse.json({ success: false, message: "Malformed JSON payload." }, { status: 400 });
		}

		// 3. Rate limiting check (per IP)
		const clientIp = getClientIp(req);
		const rateLimit = checkRateLimit(clientIp);
		if (!rateLimit.allowed) {
			return NextResponse.json(
				{
					success: false,
					message: `Too many submissions. Please wait ${rateLimit.resetInSeconds} seconds before trying again.`,
				},
				{
					status: 429,
					headers: {
						"Retry-After": String(rateLimit.resetInSeconds),
					},
				},
			);
		}

		// 4. Schema validation with Zod
		const validationResult = ContactFormSchema.safeParse(parsedJson);
		if (!validationResult.success) {
			const firstError = validationResult.error.errors[0]?.message || "Invalid input data.";
			return NextResponse.json({ success: false, message: firstError }, { status: 400 });
		}

		const data = validationResult.data;

		// 5. Bot & Honeypot detection (silent success for bots to avoid tipping them off)
		if (data.website && data.website.trim().length > 0) {
			return NextResponse.json(
				{ success: true, message: "Thank you for reaching out. We will get back to you shortly." },
				{ status: 200 }
			);
		}

		// 6. Duplicate submission detection
		const dedupType = data.formType || (data.budget || data.timeline ? "project_inquiry" : "contact");
		if (isDuplicateSubmission(clientIp, data.email, data.message, dedupType)) {
			return NextResponse.json(
				{
					success: false,
					message: "Duplicate submission detected. Please wait a minute before submitting again.",
				},
				{ status: 429 },
			);
		}

		// 7. Generate a unique submission reference ID
		const referenceId = generateReferenceId("NB");
		const sourcePage =
			data.sourcePage ||
			parsedJson.sourcePage ||
			(data.budget || data.timeline ? "/start-project" : "/contact");

		const companyName = data.companyName || data.company || "";
		const subject = data.subject || `Inquiry: ${data.service || "Software & Cloud Services"} [${referenceId}]`;

		// 8. Save inquiry into Supabase PostgreSQL contacts table
		let newContact = null;
		let dbError = null;

		try {
			newContact = await ContactRepository.create({
				name: data.name,
				email: data.email,
				companyName,
				service: data.service || "General Inquiry",
				subject,
				message: data.message,
				budget: data.budget || "",
				timeline: data.timeline || "",
				sourcePage,
				clientIp,
			});
		} catch (err) {
			dbError = err;
			console.error("[Contact API] Supabase contact storage error:", err.message);
		}

		// 9. Execute automated internal workflows (CRM lead, in-app admin notifications)
		if (newContact) {
			try {
				await triggerWorkflow("contact_submit", {
					contactId: newContact.id,
					referenceId,
					name: data.name,
					email: data.email,
					companyName,
					service: data.service,
					subject,
					message: data.message,
					budget: data.budget,
					timeline: data.timeline,
					sourcePage,
				});
			} catch (workflowErr) {
				console.warn("[Contact API] Automated workflow warning:", workflowErr.message);
			}
		}

		// 10. Centralized Email Notification via Resend to info@newbhar.com
		let notificationResult = { success: false, delivered: false };
		try {
			notificationResult = await sendFormNotificationEmail({
				formType: data.formType,
				data: {
					...data,
					companyName,
					subject,
				},
				sourcePage,
				clientIp,
				referenceId,
			});
		} catch (emailErr) {
			console.error("[Contact API] Centralized notification dispatch error:", emailErr.message);
		}

		// 11. Error resilience: If database storage failed and email could not be delivered
		if (!newContact && !notificationResult.delivered && dbError) {
			const isDev = process.env.NODE_ENV !== "production";
			const isPermError = dbError.message && /permission denied/i.test(dbError.message);
			return NextResponse.json(
				{
					success: false,
					message: isDev
						? isPermError
							? "Database permissions need to be granted in Supabase. Please execute FIX_PERMISSIONS.sql in your Supabase SQL Editor."
							: "Database table 'contacts' is not yet migrated in Supabase. Please execute APPLY_ALL_MIGRATIONS.sql in your Supabase SQL Editor."
						: "We are currently experiencing a brief technical maintenance with our database. Please email us directly at info@newbhar.com and we will respond immediately.",
				},
				{ status: 503 },
			);
		}

		// 12. Return success response to visitor
		return NextResponse.json(
			{
				success: true,
				message: "Thank you for reaching out! We will review your inquiry and reply within one business day.",
				referenceId,
			},
			{ status: 200 },
		);
	} catch (err) {
		console.error("Contact API unexpected error:", err);
		return NextResponse.json(
			{ success: false, message: "An unexpected error occurred while processing your request." },
			{ status: 500 }
		);
	}
}
