"use client";

import { useEffect, useState } from "react";

const CLIENTS_ROW_1 = [
  "Bloom Capital",
  "LogiTrack Global",
  "GigHub Enterprise",
  "OmniHealth AI",
  "LuxeStay Villas",
  "Zenith Logistics",
  "CleanCity Foundation",
  "Verve Commerce",
];

const TECH_ROW_2 = [
  { name: "Next.js", icon: "/tech-logos/nextjs.svg" },
  { name: "React", icon: "/tech-logos/react.svg" },
  { name: "TypeScript", icon: "/tech-logos/typescript.svg" },
  { name: "Node.js", icon: "/tech-logos/nodejs.svg" },
  { name: "Python", icon: "/tech-logos/python.svg" },
  { name: "AWS Cloud", icon: "/tech-logos/aws.svg" },
  { name: "Docker", icon: "/tech-logos/docker.svg" },
  { name: "PostgreSQL", icon: "/tech-logos/postgresql.svg" },
  { name: "MongoDB", icon: "/tech-logos/mongodb.svg" },
  { name: "Tailwind CSS", icon: "/tech-logos/tailwindcss.svg" },
  { name: "OpenAI", icon: "/tech-logos/openai.svg" },
];

export default function BrandyfyMarquee() {
  return (
    <section className="relative overflow-hidden py-16 bg-[#060608] border-y border-white/[0.07]">
      {/* Background radial glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_center,rgba(152,249,13,0.04),transparent_70%)]" />

      <div className="max-w-7xl mx-auto px-6 mb-10 text-center">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[#98f90d]">
          Trusted by Leading Brands & High-Growth Startups
        </p>
        <h3 className="mt-2 text-xl md:text-2xl font-bold tracking-tight text-white">
          Working with ambitious businesses across borders.
        </h3>
      </div>

      {/* Row 1: Brand names ticker (Left to Right) */}
      <div className="flex overflow-hidden select-none py-3 relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12 pr-12">
          {CLIENTS_ROW_1.concat(CLIENTS_ROW_1).map((client, idx) => (
            <div
              key={`c1-${idx}`}
              className="flex items-center gap-4 text-zinc-400 hover:text-white font-medium text-lg md:text-xl transition-colors cursor-default whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
              <span className="font-semibold tracking-tight">{client}</span>
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex shrink-0 animate-[marquee_30s_linear_infinite] items-center gap-12 pr-12"
        >
          {CLIENTS_ROW_1.concat(CLIENTS_ROW_1).map((client, idx) => (
            <div
              key={`c2-${idx}`}
              className="flex items-center gap-4 text-zinc-400 hover:text-white font-medium text-lg md:text-xl transition-colors cursor-default whitespace-nowrap"
            >
              <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
              <span className="font-semibold tracking-tight">{client}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Row 2: Tech stack logos (Right to Left) */}
      <div className="flex overflow-hidden select-none py-4 mt-2 relative [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex shrink-0 animate-[marquee-reverse_32s_linear_infinite] items-center gap-10 pr-10">
          {TECH_ROW_2.concat(TECH_ROW_2).map((tech, idx) => (
            <div
              key={`t1-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-[#98f90d]/50 transition-all text-zinc-300 hover:text-white whitespace-nowrap"
            >
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-5 h-5 object-contain filter invert opacity-80"
              />
              <span className="text-sm font-semibold tracking-wide">{tech.name}</span>
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          className="flex shrink-0 animate-[marquee-reverse_32s_linear_infinite] items-center gap-10 pr-10"
        >
          {TECH_ROW_2.concat(TECH_ROW_2).map((tech, idx) => (
            <div
              key={`t2-${idx}`}
              className="flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/[0.04] border border-white/[0.08] hover:border-[#98f90d]/50 transition-all text-zinc-300 hover:text-white whitespace-nowrap"
            >
              <img
                src={tech.icon}
                alt={tech.name}
                className="w-5 h-5 object-contain filter invert opacity-80"
              />
              <span className="text-sm font-semibold tracking-wide">{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
