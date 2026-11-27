"use client";

import React from "react";
import Link from "next/link";
import { ShieldCheck, SlidersHorizontal, Check, X } from "lucide-react";
import { useCookieConsent } from "./cookie-consent-context";

export default function CookieBanner() {
  const { isLoaded, isUndecided, acceptAll, rejectAll, openSettings } = useCookieConsent();

  // Do not render on SSR or if user already decided
  if (!isLoaded || !isUndecided) {
    return null;
  }

  return (
    <aside
      role="region"
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:max-w-xl z-50 pointer-events-none transition-all duration-300 ease-out"
    >
      <div className="pointer-events-auto rounded-2xl bg-[#0a0c14]/95 backdrop-blur-xl border border-white/[0.08] shadow-[0_20px_50px_rgba(0,0,0,0.65),0_0_25px_rgba(152,249,13,0.08)] p-5 md:p-6 text-foreground animate-in fade-in slide-in-from-bottom-5 duration-300">
        {/* Subtle decorative emerald top highlight */}
        <div className="absolute top-0 left-6 right-6 h-[1px] bg-gradient-to-r from-transparent via-[#98f90d]/40 to-transparent" />

        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d] shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" aria-hidden="true" />
          </div>

          <div className="space-y-1.5 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold text-white tracking-tight">
                We Respect Your Privacy
              </h2>
              <span className="text-[11px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/[0.05] border border-white/[0.08] text-zinc-400">
                DPDP &amp; GDPR
              </span>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed">
              We use necessary cookies to ensure secure operations. Optional analytics cookies are disabled by default. You can accept or reject optional cookies at any time. Learn more in our{" "}
              <Link
                href="/privacy-policy"
                className="text-[#98f90d] underline underline-offset-2 hover:text-white transition-colors"
              >
                Privacy Policy
              </Link>.
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 pt-4 border-t border-white/[0.06] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={openSettings}
            className="inline-flex items-center justify-center gap-1.5 text-xs font-mono tracking-wide text-zinc-400 hover:text-[#98f90d] transition-colors py-2 px-1 focus-visible:outline-2 focus-visible:outline-[#98f90d] rounded-lg order-last sm:order-first"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Cookie Settings</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={rejectAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-medium bg-white/[0.05] hover:bg-white/[0.1] text-zinc-300 hover:text-white border border-white/[0.1] transition-all focus-visible:outline-2 focus-visible:outline-[#98f90d] min-h-[40px]"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reject All</span>
            </button>

            <button
              type="button"
              onClick={acceptAll}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#98f90d] hover:bg-[#86e00b] text-[#050505] shadow-[0_0_15px_rgba(152,249,13,0.3)] transition-all focus-visible:outline-2 focus-visible:outline-white min-h-[40px]"
            >
              <Check className="w-3.5 h-3.5 stroke-[2.5]" aria-hidden="true" />
              <span>Accept All</span>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
