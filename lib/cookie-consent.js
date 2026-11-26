/**
 * PRIVACY-FIRST COOKIE CONSENT & STORAGE MANAGER
 * 
 * STRICT COMPLIANCE RULES:
 * - NO database storage (Supabase or any backend). Preferences live ONLY in browser localStorage.
 * - NO personal identification data (IP, names, emails, device IDs) stored or transmitted.
 * - NO analytics initialized or loaded prior to explicit user acceptance.
 * - Instant revocation: purges analytics cookies, storage IDs, and stops beacons.
 */

export const CONSENT_STORAGE_KEY = "newbhar_cookie_consent";
export const CONSENT_VERSION = "1.0";

export const CONSENT_STATES = {
  UNDECIDED: "undecided",
  ACCEPTED: "accepted",
  REJECTED: "rejected",
};

/**
 * Reads local consent state from browser localStorage.
 * Safe for SSR (returns UNDECIDED on server).
 */
export function getStoredConsent() {
  if (typeof window === "undefined") {
    return {
      status: CONSENT_STATES.UNDECIDED,
      version: CONSENT_VERSION,
      categories: { necessary: true, analytics: false },
      timestamp: null,
    };
  }

  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) {
      return {
        status: CONSENT_STATES.UNDECIDED,
        version: CONSENT_VERSION,
        categories: { necessary: true, analytics: false },
        timestamp: null,
      };
    }

    const parsed = JSON.parse(raw);
    const status =
      parsed.cookieConsent === "accepted" || parsed.status === "accepted"
        ? CONSENT_STATES.ACCEPTED
        : parsed.cookieConsent === "rejected" || parsed.status === "rejected"
        ? CONSENT_STATES.REJECTED
        : CONSENT_STATES.UNDECIDED;

    const analyticsAllowed = status === CONSENT_STATES.ACCEPTED && parsed.categories?.analytics !== false;

    return {
      status,
      version: parsed.consentVersion || parsed.version || CONSENT_VERSION,
      categories: {
        necessary: true,
        analytics: analyticsAllowed,
      },
      timestamp: parsed.timestamp || null,
    };
  } catch (err) {
    console.warn("Failed to read cookie consent from localStorage:", err);
    return {
      status: CONSENT_STATES.UNDECIDED,
      version: CONSENT_VERSION,
      categories: { necessary: true, analytics: false },
      timestamp: null,
    };
  }
}

/**
 * Saves consent preference exclusively to browser localStorage.
 * STRICTLY NEVER calls Supabase or any external API.
 */
export function persistConsent(status, categories = {}) {
  if (typeof window === "undefined") return;

  const payload = {
    cookieConsent: status,
    status,
    consentVersion: CONSENT_VERSION,
    timestamp: new Date().toISOString(),
    categories: {
      necessary: true,
      analytics: Boolean(categories.analytics),
    },
  };

  try {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload));
  } catch (err) {
    console.warn("Failed to persist cookie consent to localStorage:", err);
  }

  // Notify active listeners (e.g., analytics tracker)
  window.dispatchEvent(
    new CustomEvent("newbhar_consent_changed", {
      detail: payload,
    })
  );

  return payload;
}

/**
 * Checks if analytics cookies are explicitly permitted.
 */
export function hasAnalyticsConsent() {
  if (typeof window === "undefined") return false;
  const consent = getStoredConsent();
  return consent.status === CONSENT_STATES.ACCEPTED && consent.categories.analytics === true;
}

/**
 * Purges all analytics cookies, local IDs, and session tokens from the browser.
 * Run when the user rejects or revokes consent.
 */
export function purgeAnalyticsData() {
  if (typeof window === "undefined") return;

  try {
    // 1. Remove analytics visitor and session identifiers
    localStorage.removeItem("newbhar_visitor_id");
    sessionStorage.removeItem("newbhar_session_id");

    // 2. Remove Google Analytics and common tracking cookies
    const cookieNames = [
      "_ga",
      "_gid",
      "_gat",
      "_ga_",
      "newbhar_visitor_id",
      "newbhar_session_id",
      "newbhar_analytics",
    ];

    const host = window.location.hostname;
    const hostParts = host.split(".");
    const domains = [
      "", // Default / current domain
      host,
      `.${host}`,
    ];

    if (hostParts.length > 1) {
      const rootDomain = hostParts.slice(-2).join(".");
      domains.push(rootDomain, `.${rootDomain}`);
    }

    // Inspect existing cookies and expire analytics ones
    const currentCookies = document.cookie.split(";");
    for (const rawCookie of currentCookies) {
      const cookieName = rawCookie.split("=")[0].trim();
      const isAnalyticsCookie = cookieNames.some(
        (target) => cookieName === target || cookieName.startsWith(target)
      );

      if (isAnalyticsCookie) {
        for (const domain of domains) {
          const domainAttr = domain ? `; domain=${domain}` : "";
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/${domainAttr}; SameSite=Lax`;
          document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=; SameSite=Lax`;
        }
      }
    }

    // 3. Disable Google Analytics global flag if present
    const gaId = process.env.NEXT_PUBLIC_GA_ID;
    if (gaId) {
      window[`ga-disable-${gaId}`] = true;
    }

    // 4. Remove injected analytics script elements if any exist
    const analyticsScripts = document.querySelectorAll("script[data-analytics-script]");
    analyticsScripts.forEach((script) => script.remove());
  } catch (err) {
    console.warn("Error while purging analytics data:", err);
  }
}
