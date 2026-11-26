"use client";

import React from "react";
import { SlidersHorizontal } from "lucide-react";
import { useCookieConsent } from "./cookie-consent-context";

export default function CookieSettingsButton({
  className = "",
  showIcon = true,
  children = "Cookie Settings",
}) {
  const { openSettings } = useCookieConsent();

  return (
    <button
      type="button"
      onClick={openSettings}
      className={className || "inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-[#98f90d] transition-colors focus-visible:outline-2 focus-visible:outline-[#98f90d] rounded"}
      aria-label="Open cookie preferences"
    >
      {showIcon && <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />}
      <span>{children}</span>
    </button>
  );
}
