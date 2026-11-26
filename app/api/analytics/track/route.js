import { NextResponse } from "next/server";
import { trackEvent } from "@/lib/analytics";

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));

    // Privacy protection: Do not track admin routes or admin sessions
    const path = typeof body.path === "string" ? body.path : "/";
    if (path.startsWith("/admin")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    // Privacy-first: strictly sanitize metadata to prevent any accidental PII leak
    const sanitizedMetadata = {};
    if (body.metadata && typeof body.metadata === "object") {
      // Disallow any keys that might contain personal identifiers
      const forbiddenKeys = ["email", "name", "phone", "address", "user_id", "userId", "password", "input", "form"];
      for (const [key, val] of Object.entries(body.metadata)) {
        const lowerKey = key.toLowerCase();
        const isForbidden = forbiddenKeys.some((f) => lowerKey.includes(f));
        if (!isForbidden && typeof val === "string") {
          sanitizedMetadata[key] = val.slice(0, 150);
        }
      }
    }

    const userAgent = req.headers.get("user-agent") || "";

    // Strictly privacy compliant: NO IP address is extracted or passed to the database
    const result = await trackEvent({
      eventName: body.eventName || "page_view",
      path,
      visitorId: body.visitorId,
      sessionId: body.sessionId,
      referrer: body.referrer || req.headers.get("referer") || "",
      userAgent,
      ip: null, // Zero IP address storage
      metadata: sanitizedMetadata,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error("Analytics track error:", err);
    return NextResponse.json({ success: false, error: "Tracking error" }, { status: 500 });
  }
}
