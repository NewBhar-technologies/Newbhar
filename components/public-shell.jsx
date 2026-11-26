"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PageEffects from "@/components/page-effects";
import CursorTrail from "@/components/cursor-trail";
import AnalyticsTracker from "@/components/analytics-tracker";
import {
  CookieConsentProvider,
  CookieBanner,
  CookieSettingsModal,
} from "@/components/cookie-consent";

export default function PublicShell({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <CookieConsentProvider>
      <AnalyticsTracker />
      <PageEffects />
      <CursorTrail />
      <Navbar />
      <div>
        <main>{children}</main>
        <Footer />
      </div>
      <CookieBanner />
      <CookieSettingsModal />
    </CookieConsentProvider>
  );
}
