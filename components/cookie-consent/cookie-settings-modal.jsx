"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { X, ShieldCheck, Check, Info, Lock } from "lucide-react";
import { useCookieConsent } from "./cookie-consent-context";
import { CONSENT_STATES } from "@/lib/cookie-consent";

export default function CookieSettingsModal() {
  const {
    isSettingsOpen,
    closeSettings,
    consent,
    updatePreferences,
    acceptAll,
    rejectAll,
    revokeConsent,
  } = useCookieConsent();

  // Local state for the analytics toggle inside the modal
  const [analyticsEnabled, setAnalyticsEnabled] = useState(false);

  useEffect(() => {
    if (isSettingsOpen) {
      setAnalyticsEnabled(
        consent.status === CONSENT_STATES.ACCEPTED && consent.categories?.analytics === true
      );
    }
  }, [isSettingsOpen, consent]);

  // Handle escape key to close
  useEffect(() => {
    if (!isSettingsOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        closeSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  const isCurrentlyAccepted =
    consent.status === CONSENT_STATES.ACCEPTED && consent.categories?.analytics === true;
  const isCurrentlyRejected = consent.status === CONSENT_STATES.REJECTED;

  const handleSave = () => {
    updatePreferences({ analytics: analyticsEnabled });
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cookie-settings-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closeSettings();
      }}
    >
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#0a0c14]/98 border border-white/[0.1] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_30px_rgba(152,249,13,0.06)] p-6 md:p-7 text-foreground">
        {/* Emerald accent glow */}
        <div className="absolute top-0 left-8 right-8 h-[1px] bg-gradient-to-r from-transparent via-[#98f90d]/50 to-transparent" />

        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d]">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <div>
              <h2 id="cookie-settings-title" className="text-lg font-bold text-white tracking-tight">
                Cookie &amp; Privacy Preferences
              </h2>
              <p className="text-xs text-zinc-400 mt-0.5">
                Privacy-first control for Newbhar Technologies (newbhar.com)
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSettings}
            className="p-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] text-zinc-400 hover:text-white transition-colors focus-visible:outline-2 focus-visible:outline-[#98f90d]"
            aria-label="Close cookie settings"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {/* Status Banner */}
        <div className="mt-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-between text-xs">
          <span className="text-zinc-400">Current preference:</span>
          {isCurrentlyAccepted ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-[#98f90d] font-semibold bg-[#98f90d]/10 px-2.5 py-0.5 rounded-full border border-[#98f90d]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#98f90d] animate-pulse" />
              Analytics Allowed
            </span>
          ) : isCurrentlyRejected ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-zinc-300 font-semibold bg-white/[0.05] px-2.5 py-0.5 rounded-full border border-white/[0.1]">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              All Optional Cookies Rejected
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-amber-400 font-semibold bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
              Not Decided (Analytics Disabled)
            </span>
          )}
        </div>

        {/* Categories */}
        <div className="mt-5 space-y-4">
          {/* Strictly Necessary */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Lock className="w-4 h-4 text-zinc-400" aria-hidden="true" />
                <h3 className="text-sm font-semibold text-white">Strictly Necessary Cookies &amp; Storage</h3>
              </div>
              <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d] font-medium">
                Always Active
              </span>
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Essential for security, cryptographic CSRF mitigation, administrative session authentication, and persisting your cookie preferences. These items do not track browsing behavior.
            </p>
            <div className="mt-2.5 pt-2 border-t border-white/[0.04] text-[11px] text-zinc-500 font-mono space-y-1">
              <div><code>newbhar_cookie_consent</code> (LocalStorage) &mdash; Persists your privacy choice</div>
              <div><code>newbhar_admin_session</code> (HTTP Cookie) &mdash; Authenticated staff portal access only</div>
            </div>
          </div>

          {/* Analytics & Performance */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-colors">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Analytics &amp; Performance Cookies</h3>
                <span className="text-[11px] font-mono text-zinc-500">Optional &middot; Disabled by Default</span>
              </div>

              {/* Accessible Custom Toggle */}
              <label className="relative inline-flex items-center cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={analyticsEnabled}
                  onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                  aria-label="Toggle analytics cookies"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#98f90d] peer-checked:after:bg-[#050505] transition-colors" />
              </label>
            </div>
            <p className="mt-2 text-xs text-zinc-400 leading-relaxed">
              Allows anonymous, aggregated metrics on page views and navigation flows to help us improve site performance.
            </p>

            <div className="mt-2.5 pt-2 border-t border-white/[0.04] text-[11px] text-zinc-500 font-mono space-y-1">
              <div><code>newbhar_visitor_id</code> &amp; <code>newbhar_session_id</code> &mdash; Anonymous randomized tokens</div>
              <div><code>_ga</code>, <code>_gid</code> &mdash; Google Analytics 4 (IP anonymized, opt-in only)</div>
            </div>

            <div className="mt-3 pt-3 border-t border-white/[0.04] grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] text-zinc-400 font-mono">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#98f90d]" />
                <span>Zero personal data or PII</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#98f90d]" />
                <span>No IP address storage</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#98f90d]" />
                <span>No session recordings</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#98f90d]" />
                <span>No cross-site tracking</span>
              </div>
            </div>
          </div>
        </div>

        {/* Database Disclaimer & Privacy Policy Link */}
        <div className="mt-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] flex items-start gap-2.5 text-xs text-zinc-400">
          <Info className="w-4 h-4 text-[#98f90d] shrink-0 mt-0.5" aria-hidden="true" />
          <p>
            Your preferences are saved directly in your browser&apos;s local storage and are never recorded in our database. You can revisit or revoke these preferences at any time. For full details on data handling, read our{" "}
            <Link
              href="/privacy-policy"
              onClick={closeSettings}
              className="text-[#98f90d] underline underline-offset-2 hover:text-white transition-colors"
            >
              Privacy Policy
            </Link>.
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {isCurrentlyAccepted ? (
            <button
              type="button"
              onClick={revokeConsent}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all focus-visible:outline-2 focus-visible:outline-rose-400 min-h-[40px]"
            >
              Revoke All Consent
            </button>
          ) : (
            <button
              type="button"
              onClick={rejectAll}
              className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-300 hover:text-white bg-white/[0.05] hover:bg-white/[0.1] border border-white/[0.08] transition-all focus-visible:outline-2 focus-visible:outline-[#98f90d] min-h-[40px]"
            >
              Reject All
            </button>
          )}

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.08] hover:bg-white/[0.14] text-white border border-white/[0.12] transition-all focus-visible:outline-2 focus-visible:outline-[#98f90d] min-h-[40px]"
            >
              Save Preferences
            </button>

            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#98f90d] hover:bg-[#86e00b] text-[#050505] shadow-[0_0_15px_rgba(152,249,13,0.3)] transition-all focus-visible:outline-2 focus-visible:outline-white min-h-[40px]"
            >
              Accept All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
