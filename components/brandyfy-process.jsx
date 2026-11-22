"use client";

import { CheckCircle2, ArrowRight } from "lucide-react";

const STAGES = [
  {
    step: "01",
    title: "Discovery",
    subtitle: "Research & Domain Analysis",
    description: "We dive deep into your business model, customer workflows, and technical constraints to establish a clear roadmap before writing code.",
    checklist: ["Stakeholder alignment", "Technical feasibility", "Architecture blueprint"],
  },
  {
    step: "02",
    title: "Flows",
    subtitle: "User Journeys & Logic",
    description: "Mapping out intuitive user interactions, edge cases, permission tiers, and data flows to prevent costly pivots later.",
    checklist: ["User journey mapping", "Information architecture", "Edge-case stress testing"],
  },
  {
    step: "03",
    title: "Wireframes",
    subtitle: "Structure & Schema Design",
    description: "Designing low-fidelity structural blueprints and normalized database schemas to solidify the application backbone.",
    checklist: ["Structural layouts", "Database schema design", "API contract definition"],
  },
  {
    step: "04",
    title: "Mockups",
    subtitle: "Pixel-Perfect UI Design",
    description: "Translating wireframes into polished, accessible, high-contrast dark/light visual interfaces with unified token design systems.",
    checklist: ["Custom typography & tokens", "WCAG 2.1 AA accessibility", "Micro-interactions"],
  },
  {
    step: "05",
    title: "Prototyping & Build",
    subtitle: "Full-Stack Agile Engineering",
    description: "Writing maintainable, type-safe Next.js/React and Node.js code with clean modular abstractions and automated test suites.",
    checklist: ["Type-safe TypeScript", "High-performance APIs", "Bi-weekly sprint releases"],
  },
  {
    step: "06",
    title: "Testing & Launch",
    subtitle: "QA & Cloud Deployment",
    description: "Comprehensive end-to-end testing, security penetration reviews, Core Web Vitals optimization, and smooth AWS cloud rollout.",
    checklist: ["Automated testing & CI/CD", "Performance optimization", "Zero-downtime deployment"],
  },
];

export default function BrandyfyProcess() {
  return (
    <section id="process" className="py-24 md:py-32 bg-[#08080a] relative overflow-hidden border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            From Idea To Execution
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            A battle-tested 6-step engineering methodology.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-zinc-400 leading-relaxed">
            Eliminating guesswork with rigorous technical discovery, precision interface craft, and disciplined agile delivery.
          </p>
        </div>

        {/* 6 Step Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {STAGES.map((s) => (
            <div
              key={s.step}
              className="group relative flex flex-col justify-between p-8 rounded-3xl bg-[#12131b]/70 border border-white/[0.08] hover:border-[#98f90d]/40 transition-all duration-400 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_25px_rgba(152,249,13,0.1)]"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <span className="w-12 h-12 rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] font-mono text-xl font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                  <span className="font-mono text-xs text-zinc-500 uppercase tracking-widest">
                    Phase {s.step}
                  </span>
                </div>

                <h3 className="text-2xl font-bold text-white tracking-tight group-hover:text-[#98f90d] transition-colors">
                  {s.title}
                </h3>
                <p className="text-xs font-mono text-[#98f90d] uppercase tracking-wider mt-1 mb-4">
                  {s.subtitle}
                </p>

                <p className="text-sm md:text-base text-zinc-400 leading-relaxed">
                  {s.description}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/[0.06] space-y-2">
                {s.checklist.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 text-xs text-zinc-300">
                    <CheckCircle2 size={14} className="text-[#98f90d] shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
