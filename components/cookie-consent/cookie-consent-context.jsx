"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  CONSENT_STATES,
  getStoredConsent,
  persistConsent,
  purgeAnalyticsData,
} from "@/lib/cookie-consent";

const CookieConsentContext = createContext(null);

export function CookieConsentProvider({ children }) {
  const [consent, setConsent] = useState({
    status: CONSENT_STATES.UNDECIDED,
    version: "1.0",
    categories: { necessary: true, analytics: false },
    timestamp: null,
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sync state on client mount avoiding SSR hydration mismatch
  useEffect(() => {
    const current = getStoredConsent();
    setConsent(current);
    setIsLoaded(true);

    const handleConsentChanged = (e) => {
      if (e?.detail) {
        setConsent({
          status: e.detail.status,
          version: e.detail.consentVersion,
          categories: e.detail.categories,
          timestamp: e.detail.timestamp,
        });
      }
    };

    window.addEventListener("newbhar_consent_changed", handleConsentChanged);
    return () => window.removeEventListener("newbhar_consent_changed", handleConsentChanged);
  }, []);

  const acceptAll = useCallback(() => {
    const updated = persistConsent(CONSENT_STATES.ACCEPTED, { analytics: true });
    setConsent(updated);
    setIsSettingsOpen(false);
  }, []);

  const rejectAll = useCallback(() => {
    purgeAnalyticsData();
    const updated = persistConsent(CONSENT_STATES.REJECTED, { analytics: false });
    setConsent(updated);
    setIsSettingsOpen(false);
  }, []);

  const updatePreferences = useCallback(({ analytics }) => {
    if (analytics) {
      const updated = persistConsent(CONSENT_STATES.ACCEPTED, { analytics: true });
      setConsent(updated);
    } else {
      purgeAnalyticsData();
      const updated = persistConsent(CONSENT_STATES.REJECTED, { analytics: false });
      setConsent(updated);
    }
    setIsSettingsOpen(false);
  }, []);

  const revokeConsent = useCallback(() => {
    purgeAnalyticsData();
    const updated = persistConsent(CONSENT_STATES.REJECTED, { analytics: false });
    setConsent(updated);
    setIsSettingsOpen(false);
  }, []);

  const openSettings = useCallback(() => {
    setIsSettingsOpen(true);
  }, []);

  const closeSettings = useCallback(() => {
    setIsSettingsOpen(false);
  }, []);

  const value = {
    consent,
    isLoaded,
    isSettingsOpen,
    openSettings,
    closeSettings,
    acceptAll,
    rejectAll,
    updatePreferences,
    revokeConsent,
    hasAccepted: consent.status === CONSENT_STATES.ACCEPTED && consent.categories.analytics === true,
    hasRejected: consent.status === CONSENT_STATES.REJECTED,
    isUndecided: consent.status === CONSENT_STATES.UNDECIDED,
  };

  return (
    <CookieConsentContext.Provider value={value}>
      {children}
    </CookieConsentContext.Provider>
  );
}

export function useCookieConsent() {
  const ctx = useContext(CookieConsentContext);
  if (!ctx) {
    throw new Error("useCookieConsent must be used within a CookieConsentProvider");
  }
  return ctx;
}
