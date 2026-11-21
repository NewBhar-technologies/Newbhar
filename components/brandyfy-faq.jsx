"use client";

import { useState } from "react";
import { Plus, Minus, ArrowUpRight, MessageSquare } from "lucide-react";
import Button from "@/components/ui/button";

const FAQS = [
  {
    q: "What services does Newbhar Technologies offer?",
    a: "We are a full-stack digital engineering agency. Our capabilities cover custom software engineering, high-performance web applications (Next.js & React), mobile apps (React Native & Flutter), AI/ML integration & automation, and scalable cloud infrastructure (AWS DevOps).",
  },
  {
    q: "How fast can you deliver a project?",
    a: "We work in structured 2-to-4 week agile sprints. An initial MVP or functional release is typically deployed within 3 to 6 weeks, followed by continuous iteration. We prioritize speed-to-market without compromising architecture or code quality.",
  },
  {
    q: "Who owns the code and intellectual property?",
    a: "You do. 100%. Upon milestone completion, full source code ownership, repository rights, database schemas, and intellectual property belong entirely to your business.",
  },
  {
    q: "How does your pricing and engagement model work?",
    a: "We believe in radical transparency. Depending on your scope, we offer fixed sprint packages or milestone-based agreements with zero hidden fees. You get clear deliverables, defined timelines, and dedicated senior engineers.",
  },
  {
    q: "Can you modernize or audit an existing codebase?",
    a: "Yes. Many of our clients come to us with existing legacy systems, slow apps, or incomplete codebases. We perform a comprehensive architecture and security audit, outline actionable improvements, and execute phased modernizations without business interruption.",
  },
  {
    q: "Do you offer post-launch support and SLAs?",
    a: "Yes. We offer flexible ongoing maintenance packages covering bug fixes, server monitoring, security updates, feature enhancements, and 99.9% uptime guarantees.",
  },
];

export default function BrandyfyFAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (idx) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 md:py-32 bg-[#060608] relative overflow-hidden border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Side: Header & Consultation Box */}
          <div className="lg:col-span-5">
            <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
              <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
              Questions? We&rsquo;ve Got Answers
            </div>

            <h2 className="mt-4 text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-[1.1]">
              Everything you need to know about working with us.
            </h2>

            <p className="mt-5 text-base md:text-lg text-zinc-400 leading-relaxed">
              From web platforms and custom software to AI pipelines, we make digital engineering clear, straightforward, and reliable.
            </p>

            {/* Quick Consultation Box */}
            <div className="mt-10 p-7 rounded-3xl bg-[#12131b]/80 border border-white/[0.08] backdrop-blur-md">
              <div className="flex items-center gap-3 text-[#98f90d] font-bold text-base mb-2">
                <MessageSquare size={18} />
                <span>Have a specific question?</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                Our senior engineering team is ready to review your project specs or answer any questions directly.
              </p>
              <Button href="/contact" variant="accent" size="sm">
                Book a Free Discovery Call
              </Button>
            </div>
          </div>

          {/* Right Side: Accordion */}
          <div className="lg:col-span-7 space-y-4">
            {FAQS.map((faq, idx) => {
              const isOpen = openIndex === idx;
              return (
                <div
                  key={faq.q}
                  className={`rounded-2xl border transition-all duration-300 ${
                    isOpen
                      ? "bg-[#12131b] border-[#98f90d]/40 shadow-[0_0_25px_rgba(152,249,13,0.06)]"
                      : "bg-[#0d0e14]/70 border-white/[0.08] hover:border-white/[0.18]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggle(idx)}
                    className="w-full flex items-center justify-between gap-4 p-6 text-left cursor-pointer focus:outline-none"
                    aria-expanded={isOpen}
                  >
                    <span className="text-base sm:text-lg font-bold text-white tracking-tight">
                      {faq.q}
                    </span>
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                        isOpen
                          ? "bg-[#98f90d] text-black"
                          : "bg-white/[0.06] text-white"
                      }`}
                    >
                      {isOpen ? <Minus size={16} /> : <Plus size={16} />}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-6 pb-6 pt-0 text-sm sm:text-base text-zinc-400 leading-relaxed border-t border-white/[0.05] mt-2 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
