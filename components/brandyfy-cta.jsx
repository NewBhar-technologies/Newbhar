"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles, Mail, Calendar } from "lucide-react";
import Button from "@/components/ui/button";
import { MEETING_EMAIL_URL } from "@/lib/meeting";
import { SITE } from "@/lib/site";

export default function BrandyfyCTA() {
  return (
    <section className="py-20 md:py-28 bg-[#08080a] relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="relative rounded-[2.5rem] bg-gradient-to-br from-[#12131b] via-[#0f1017] to-[#0a1106] border border-[#98f90d]/30 p-8 sm:p-14 lg:p-20 overflow-hidden shadow-[0_0_60px_rgba(152,249,13,0.12),0_30px_70px_rgba(0,0,0,0.8)]">
          {/* Ambient Glows */}
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#98f90d]/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#98f90d]/10 rounded-full blur-[100px] pointer-events-none" />

          <div className="relative z-10 max-w-4xl">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/30 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase mb-6">
              <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
              Start Your Journey
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.05]">
              Have a project in mind? <br />
              <span className="text-[#98f90d]">Let&rsquo;s make it happen.</span>
            </h2>

            <p className="mt-6 text-base sm:text-xl text-zinc-300 max-w-2xl leading-relaxed">
              Tell us what you&rsquo;re planning. We&rsquo;ll review your requirements, suggest the right architecture, and deliver an actionable execution roadmap within 48 hours.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button href="/start-project" variant="accent" size="default">
                Start a Project
              </Button>
              <Button href={MEETING_EMAIL_URL} variant="secondary" size="default">
                Schedule a Call
              </Button>
            </div>

            <div className="mt-12 pt-8 border-t border-white/[0.08] flex flex-wrap items-center gap-6 sm:gap-10 text-xs sm:text-sm text-zinc-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#98f90d]" />
                <span>NDA &amp; IP Protected</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#98f90d]" />
                <span>Fast 48h Response</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#98f90d]" />
                <span>Transparent Milestones</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
