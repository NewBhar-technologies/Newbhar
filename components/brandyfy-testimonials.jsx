"use client";

import { Star, Quote } from "lucide-react";

const REVIEWS = [
  {
    name: "Arun Sharma",
    role: "Founder & CEO",
    company: "Verve Retail Solutions",
    service: "E-Commerce Web Platform",
    quote: "Newbhar completely transformed our digital architecture. The new checkout flow is ultra-fast, handles high-volume flash sales without a hiccup, and increased our conversion rate by 34%.",
    rating: 5,
  },
  {
    name: "Priyanka Roy",
    role: "Head of Product",
    company: "CleanCity Foundation",
    service: "Civic Web Application",
    quote: "Working with Newbhar felt like having a senior in-house engineering squad. They nailed our user flows, built a fault-tolerant volunteer portal, and launched ahead of schedule.",
    rating: 5,
  },
  {
    name: "Rohan Das",
    role: "CTO",
    company: "OmniHealth Technologies",
    service: "AI Data Platform & APIs",
    quote: "Their machine learning and data engineering capabilities are top tier. They structured our automated pipeline and delivered sub-second API responses across complex medical telemetry.",
    rating: 5,
  },
  {
    name: "Vikram Malhotra",
    role: "Managing Director",
    company: "LogiTrack Global",
    service: "Cloud Systems & Mobile",
    quote: "Transparent pricing, zero bloat, and pure engineering horsepower. Whenever we needed to adjust requirements, their team adapted instantly without bureaucracy.",
    rating: 5,
  },
];

export default function BrandyfyTestimonials() {
  return (
    <section className="py-24 md:py-32 bg-[#08080a] relative overflow-hidden border-t border-white/[0.08]">
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            Client Feedback
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Don&rsquo;t take our word for it. <br className="hidden sm:inline" />
            Hear from our clients.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-zinc-400 leading-relaxed">
            From modern web applications to mission-critical software, see why founders and product teams trust Newbhar Technologies.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.name}
              className="relative flex flex-col justify-between p-8 md:p-10 rounded-3xl bg-[#12131b]/70 border border-white/[0.08] hover:border-[#98f90d]/40 transition-all duration-400 backdrop-blur-md"
            >
              <div>
                {/* Stars and Service Badge */}
                <div className="flex items-center justify-between gap-4 mb-6">
                  <div className="flex gap-1 text-[#98f90d]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} size={18} fill="#98f90d" />
                    ))}
                  </div>
                  <span className="text-xs font-mono text-zinc-400 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.06]">
                    {rev.service}
                  </span>
                </div>

                {/* Quote */}
                <p className="text-base md:text-lg text-zinc-200 leading-relaxed font-normal">
                  &ldquo;{rev.quote}&rdquo;
                </p>
              </div>

              {/* Author */}
              <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/30 text-[#98f90d] font-bold text-base flex items-center justify-center font-mono">
                  {rev.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-white text-base leading-tight">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {rev.role} · <span className="text-[#98f90d]">{rev.company}</span>
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
