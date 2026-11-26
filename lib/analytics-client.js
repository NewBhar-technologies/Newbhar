"use client";

import { hasAnalyticsConsent, purgeAnalyticsData } from "@/lib/cookie-consent";

let isAnalyticsInitialized = false;
let currentTrackingPath = null;

/**
 * Initializes external and internal analytics providers ONLY if explicit consent is granted.
 */
export function initializeAnalytics() {
  if (typeof window === "undefined") return;

  // STRICT RULE: No consent = no analytics initialization
  if (!hasAnalyticsConsent()) {
    return;
  }

  if (isAnalyticsInitialized) {
    return;
  }

  isAnalyticsInitialized = true;

  // Optional: Google Analytics 4 integration (consent-gated)
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  if (gaId) {
    try {
      window[`ga-disable-${gaId}`] = false;

      // Inject GA script if not already present
      if (!document.querySelector(`script[src*="googletagmanager.com/gtag/js?id=${gaId}"]`)) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
        script.setAttribute("data-analytics-script", "true");
        document.head.appendChild(script);

        window.dataLayer = window.dataLayer || [];
        function gtag() {
          window.dataLayer.push(arguments);
        }
        window.gtag = gtag;
        gtag("js", new Date());
        gtag("config", gaId, {
          anonymize_ip: true,
          restricted_data_processing: true,
          allow_google_signals: false,
          allow_ad_personalization_signals: false,
        });
      }
    } catch (e) {
      console.warn("Failed to initialize Google Analytics:", e);
    }
  }
}

/**
 * Halts analytics tracking immediately, purges cookies, and resets state.
 */
export function stopAnalytics() {
  isAnalyticsInitialized = false;
  currentTrackingPath = null;
  purgeAnalyticsData();
}

/**
 * Sends an anonymous page view beacon.
 * Only executes if consent is active and path is non-admin.
 */
export function trackAnonymousPageView(pathname) {
  if (typeof window === "undefined") return;
  if (!pathname || pathname.startsWith("/admin")) return;

  // Strict consent check
  if (!hasAnalyticsConsent()) return;

  // Prevent duplicate page view beacons for the same pathname
  if (currentTrackingPath === pathname) return;
  currentTrackingPath = pathname;

  try {
    // Ensure initialized
    initializeAnalytics();

    // Anonymous random IDs (generated only after consent)
    let visitorId = localStorage.getItem("newbhar_visitor_id");
    if (!visitorId) {
      visitorId = `vis_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem("newbhar_visitor_id", visitorId);
    }

    let sessionId = sessionStorage.getItem("newbhar_session_id");
    if (!sessionId) {
      sessionId = `ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      sessionStorage.setItem("newbhar_session_id", sessionId);
    }

    const payload = {
      eventName: "page_view",
      path: pathname,
      visitorId,
      sessionId,
      referrer: document.referrer || "",
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", JSON.stringify(payload));
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }

    // Also trigger GA pageview if available
    if (typeof window.gtag === "function" && process.env.NEXT_PUBLIC_GA_ID) {
      window.gtag("event", "page_view", {
        page_path: pathname,
      });
    }
  } catch (err) {
    // Fail silently on client
  }
}

/**
 * Sends an anonymous custom event (e.g., CTA click).
 * Strictly filtered to non-PII metadata only.
 */
export function trackAnonymousEvent(eventName, metadata = {}) {
  if (typeof window === "undefined") return;
  if (window.location.pathname.startsWith("/admin")) return;

  if (!hasAnalyticsConsent()) return;

  try {
    const visitorId = localStorage.getItem("newbhar_visitor_id");
    const sessionId = sessionStorage.getItem("newbhar_session_id");

    const payload = {
      eventName,
      path: window.location.pathname,
      visitorId,
      sessionId,
      metadata,
    };

    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/track", JSON.stringify(payload));
    } else {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      }).catch(() => {});
    }
  } catch (err) {
    // Fail silently
  }
}
