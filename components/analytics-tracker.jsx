"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { useCookieConsent } from "@/components/cookie-consent";
import {
  initializeAnalytics,
  stopAnalytics,
  trackAnonymousPageView,
  trackAnonymousEvent,
} from "@/lib/analytics-client";

export default function AnalyticsTracker() {
  const pathname = usePathname();
  const { hasAccepted, isLoaded } = useCookieConsent();
  const clickListenerAttached = useRef(false);

  // 1. Manage analytics lifecycle based on user consent and page changes
  useEffect(() => {
    // Wait until consent is determined on client
    if (!isLoaded) return;

    // Strict rule: do not track admin routes
    if (pathname.startsWith("/admin")) {
      return;
    }

    if (hasAccepted) {
      // User has explicitly accepted: initialize and track anonymous page view
      initializeAnalytics();
      trackAnonymousPageView(pathname);
    } else {
      // User has rejected, undecided, or revoked: immediately stop and purge
      stopAnalytics();
    }
  }, [pathname, hasAccepted, isLoaded]);

  // 2. Global CTA click listener - active ONLY when consent is granted
  useEffect(() => {
    if (!isLoaded || !hasAccepted || clickListenerAttached.current) return;
    clickListenerAttached.current = true;

    function handleClick(e) {
      try {
        // Double-check consent before tracking any click
        if (typeof window === "undefined" || window.location.pathname.startsWith("/admin")) return;

        const target = e.target.closest("a, button");
        if (!target) return;

        const href = target.getAttribute("href") || "";
        const text = (target.textContent || "").trim();

        let eventName = null;
        if (
          text.includes("Let's talk") ||
          text.includes("Start Your Software Project") ||
          text.includes("Start a Project")
        ) {
          eventName = "lets_talk_click";
        } else if (text.includes("See our work") || href.includes("/projects")) {
          eventName = "see_our_work_click";
        }

        if (eventName) {
          trackAnonymousEvent(eventName, {
            targetText: text.slice(0, 100),
            targetHref: href.slice(0, 200),
          });
        }
      } catch {}
    }

    document.addEventListener("click", handleClick, { capture: true });
    return () => {
      document.removeEventListener("click", handleClick, { capture: true });
      clickListenerAttached.current = false;
    };
  }, [hasAccepted, isLoaded]);

  return null;
}
