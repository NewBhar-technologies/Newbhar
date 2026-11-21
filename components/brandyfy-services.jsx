"use client";

import Link from "next/link";
import { ArrowUpRight, Globe, Code2, Smartphone, Brain, Cloud, Palette } from "lucide-react";

const SERVICES_DATA = [
  {
    number: "01",
    title: "Website Design & Development",
    slug: "web-development",
    icon: Globe,
    desc: "High-performance, search-optimized web applications and marketing sites designed to convert visitors into loyal customers.",
    tags: ["Next.js & React", "SEO Architecture", "E-Commerce", "CMS & Portals"],
  },
  {
    number: "02",
    title: "Custom Software Engineering",
    slug: "software-development",
    icon: Code2,
    desc: "Bespoke SaaS platforms, enterprise ERPs, and internal workflow tools built specifically around how your business operates.",
    tags: ["REST & GraphQL APIs", "Multi-Tenant SaaS", "Database Modeling", "Legacy Migration"],
  },
  {
    number: "03",
    title: "Mobile App Development",
    slug: "mobile-development",
    icon: Smartphone,
    desc: "Native-feel iOS and Android mobile applications engineered with offline synchronization, fluid gestures, and instant response.",
    tags: ["React Native & Flutter", "Cross-Platform", "App Store Release", "Push Notifications"],
  },
  {
    number: "04",
    title: "AI & Machine Learning Solutions",
    slug: "ai-machine-learning",
    icon: Brain,
    desc: "Automated business intelligence, predictive modeling, custom LLM agents, and automated data pipelines that reduce manual overhead.",
    tags: ["Custom LLMs & Agents", "Predictive Analytics", "Document Intelligence", "AutoML Pipelines"],
  },
  {
    number: "05",
    title: "Cloud Infrastructure & DevOps",
    slug: "cloud-devops",
    icon: Cloud,
    desc: "Reliable AWS cloud architectures, zero-downtime CI/CD automation, Docker containerization, and continuous security compliance.",
    tags: ["AWS Architecture", "CI/CD Automation", "Docker & Kubernetes", "Zero-Downtime"],
  },
  {
    number: "06",
    title: "UI/UX & Digital Brand Systems",
    slug: "ui-ux-design",
    icon: Palette,
    desc: "Pixel-perfect interface design, design tokens, accessible user journeys, and cohesive brand identities that inspire instant trust.",
    tags: ["Design Systems", "Figma Prototypes", "WCAG AA Compliance", "Interactive Motion"],
  },
];

export default function BrandyfyServices() {
  return (
    <section id="services" className="py-24 md:py-32 bg-[#08080a] relative overflow-hidden">
      {/* Background glow mesh */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#98f90d]/[0.03] rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        {/* Section Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            What We Do, and Do Well
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            Strategy, design &amp; engineering under one roof.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-zinc-400 leading-relaxed">
            From establishing your market authority to architecting mission-critical platforms, our engineering services bring speed, precision, and longevity to your business goals.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {SERVICES_DATA.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.slug}
                className="group relative flex flex-col justify-between p-8 rounded-3xl bg-[#12131b]/80 border border-white/[0.08] hover:border-[#98f90d]/50 hover:bg-[#151620] transition-all duration-500 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.8),0_0_30px_rgba(152,249,13,0.12)] backdrop-blur-md"
              >
                <div>
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-14 h-14 rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/20 flex items-center justify-center text-[#98f90d] group-hover:bg-[#98f90d] group-hover:text-black transition-all duration-300">
                      <Icon size={26} strokeWidth={1.8} />
                    </div>
                    <span className="font-mono text-sm font-semibold text-[#98f90d] tracking-wider">
                      {service.number}
                    </span>
                  </div>

                  <h3 className="text-2xl font-bold tracking-tight text-white group-hover:text-[#98f90d] transition-colors">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-zinc-400 text-sm md:text-base leading-relaxed">
                    {service.desc}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {service.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1 rounded-full text-xs font-medium bg-white/[0.04] border border-white/[0.08] text-zinc-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.08] flex items-center justify-between">
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-white group-hover:text-[#98f90d] transition-colors"
                  >
                    <span>Explore Service</span>
                    <span className="w-7 h-7 rounded-full bg-white/[0.06] group-hover:bg-[#98f90d] group-hover:text-black flex items-center justify-center transition-all duration-300">
                      <ArrowUpRight size={15} />
                    </span>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
