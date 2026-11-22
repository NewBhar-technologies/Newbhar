"use client";

import { Check, X, Sparkles } from "lucide-react";

const COMPARISONS = [
  {
    name: "Newbhar Technologies",
    highlight: true,
    tagline: "High-velocity senior engineering team",
    speed: "Rapid delivery (2-4 week sprints)",
    flexibility: "Full elasticity, scale up or down anytime",
    quality: "Senior full-stack architects with rigorous QA",
    scalability: "Cloud-native, microservices-ready code",
    cost: "Predictable, transparent fixed sprint pricing",
    pros: [
      "Direct engineer communication (no account manager middlemen)",
      "100% intellectual property & code ownership",
      "Modern tech stack: Next.js, React, Node, Python, AWS",
      "Comprehensive post-launch warranty & SLA",
    ],
  },
  {
    name: "In-House Team",
    highlight: false,
    tagline: "Permanent full-time headcount",
    speed: "Slow (2-4 months hiring + ramp-up)",
    flexibility: "Rigid (fixed payroll, severance friction)",
    quality: "Varies heavily based on individual hires",
    scalability: "Difficult to scale across niche technologies",
    cost: "High (Salaries + benefits + recruiting + equity)",
    pros: [
      "100% dedicated focus on internal company vision",
      "Physical in-office presence if required",
    ],
  },
  {
    name: "Traditional Agencies",
    highlight: false,
    tagline: "Large corporate agency retainers",
    speed: "Bureaucratic (layered approvals & slow iterations)",
    flexibility: "Locked into rigid 6-12 month contracts",
    quality: "Pitched by seniors, handed to juniors",
    scalability: "High markups for scope expansions",
    cost: "Very expensive (bloated overhead & markups)",
    pros: [
      "Broad service catalog under one vendor",
      "Established brand recognition",
    ],
  },
  {
    name: "Freelancers",
    highlight: false,
    tagline: "Individual gig contractors",
    speed: "Unpredictable (multiple clients / competing priorities)",
    flexibility: "Zero team backup if contractor disappears",
    quality: "Inconsistent documentation & variable standards",
    scalability: "Single point of failure, no collective bandwidth",
    cost: "Cheaper upfront, expensive when code breaks",
    pros: [
      "Lowest initial hourly commitment",
      "Good for tiny one-off script tasks",
    ],
  },
  {
    name: "Self-Service / No-Code",
    highlight: false,
    tagline: "Template builders & DIY builders",
    speed: "Instant setup, weeks fighting limitations",
    flexibility: "Strictly limited to platform capabilities",
    quality: "Generic, bloated DOM, poor SEO performance",
    scalability: "Hard ceiling; requires complete rewrite later",
    cost: "Monthly subscription fees that escalate with usage",
    pros: [
      "Fast for simple non-technical brochure prototypes",
      "No coding required for simple forms",
    ],
  },
];

export default function BrandyfyComparison() {
  return (
    <section className="py-24 md:py-32 bg-[#060608] relative overflow-hidden border-t border-white/[0.08]">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-[#98f90d]/[0.03] rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            Smart Model Comparison
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Newbhar&rsquo;s Alternative? <br className="hidden sm:inline" />
            <span className="text-[#98f90d]">Think One More Time!</span>
          </h2>
          <p className="mt-5 text-lg md:text-xl text-zinc-400 leading-relaxed max-w-2xl mx-auto">
            Strategy-driven digital growth with focused execution, premium engineering, and flexible support — without the overhead of building everything in-house.
          </p>
        </div>

        {/* Comparison Cards / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1: Newbhar (Highlighted Column) */}
          <div className="lg:col-span-1 relative rounded-3xl bg-gradient-to-b from-[#131718] via-[#10121a] to-[#090b0e] border-2 border-[#98f90d] p-8 shadow-[0_0_40px_rgba(152,249,13,0.18)] flex flex-col justify-between">
            <div className="absolute -top-3.5 left-8 px-4 py-1 rounded-full bg-[#98f90d] text-black text-xs font-extrabold tracking-wider uppercase flex items-center gap-1.5 shadow-md">
              <Sparkles size={13} /> Recommended Choice
            </div>

            <div>
              <div className="mt-2 mb-6">
                <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  <span>Newbhar</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#98f90d]/20 text-[#98f90d] border border-[#98f90d]/30 font-mono">
                    PARTNER
                  </span>
                </h3>
                <p className="text-xs text-[#98f90d] font-mono mt-1 font-semibold">
                  {COMPARISONS[0].tagline}
                </p>
              </div>

              <div className="space-y-4 py-4 border-y border-white/[0.08] text-sm">
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-mono">Speed to Market</span>
                  <p className="text-white font-medium mt-0.5">{COMPARISONS[0].speed}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-mono">Engineering Quality</span>
                  <p className="text-white font-medium mt-0.5">{COMPARISONS[0].quality}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-mono">Flexibility &amp; Scale</span>
                  <p className="text-white font-medium mt-0.5">{COMPARISONS[0].flexibility}</p>
                </div>
                <div>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider block font-mono">Cost Predictability</span>
                  <p className="text-white font-medium mt-0.5">{COMPARISONS[0].cost}</p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {COMPARISONS[0].pros.map((p) => (
                  <div key={p} className="flex items-start gap-2.5 text-xs text-zinc-200">
                    <Check size={15} className="text-[#98f90d] shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/[0.08]">
              <a
                href="/start-project"
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-full bg-[#98f90d] hover:bg-[#86e00b] text-black font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(152,249,13,0.35)] transition-all"
              >
                <span>Build with Newbhar</span>
              </a>
            </div>
          </div>

          {/* Other models in clean cards */}
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {COMPARISONS.slice(1).map((comp) => (
              <div
                key={comp.name}
                className="rounded-3xl bg-[#12131b]/60 border border-white/[0.08] p-7 flex flex-col justify-between hover:border-white/[0.18] transition-all backdrop-blur-md"
              >
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {comp.name}
                  </h3>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    {comp.tagline}
                  </p>

                  <div className="space-y-3.5 py-4 my-4 border-y border-white/[0.06] text-xs">
                    <div>
                      <span className="text-zinc-500 uppercase font-mono block">Speed</span>
                      <p className="text-zinc-300 font-medium mt-0.5">{comp.speed}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 uppercase font-mono block">Quality</span>
                      <p className="text-zinc-300 font-medium mt-0.5">{comp.quality}</p>
                    </div>
                    <div>
                      <span className="text-zinc-500 uppercase font-mono block">Cost Impact</span>
                      <p className="text-zinc-300 font-medium mt-0.5">{comp.cost}</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {comp.pros.map((item) => (
                      <div key={item} className="flex items-start gap-2 text-xs text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-600 shrink-0 mt-1.5" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
