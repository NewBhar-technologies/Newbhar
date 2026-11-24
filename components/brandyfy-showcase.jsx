"use client";

import Link from "next/link";
import { ArrowUpRight, Sparkles } from "lucide-react";

const PROJECTS_DATA = [
  {
    title: "Shopping Platform",
    tagline: "Full-Stack E-Commerce & Checkout Suite",
    category: "Web Application",
    cover: "/client_work_images/shop.png",
    link: "/client-work/shopping-platform",
    description:
      "End-to-end e-commerce engine with real-time cart synchronization, secure Stripe integration, order workflows, and custom analytics dashboard.",
    metrics: "40% Faster Checkout · 99.9% Uptime",
    stack: ["React", "Tailwind CSS", "Node.js", "Express", "MongoDB"],
  },
  {
    title: "Analyz-AI",
    tagline: "Adaptive Data Science & Automated ML",
    category: "AI / ML Platform",
    cover: "/client_work_images/analyzai.png",
    link: "/client-work/analyz-ai",
    description:
      "Automated machine learning pipeline benchmarking 12+ algorithms, automated feature engineering, and confidence-scored predictions on uploaded datasets.",
    metrics: "88.5% Accuracy · 12+ ML Models",
    stack: ["Python", "Flask", "React", "Scikit-Learn", "XGBoost"],
  },
  {
    title: "CleanCity",
    tagline: "Civic Action & Sustainability Network",
    category: "Community Platform",
    cover: "/client_work_images/cleancity.png",
    link: "/client-work/cleancity",
    description:
      "Urban cleanliness initiative enabling neighborhood drives, volunteer dispatch, verified campaign tracking, and administrative analytics.",
    metrics: "50+ Drives Organized · 10k+ Users",
    stack: ["React", "TypeScript", "Node.js", "Tailwind CSS"],
  },
  {
    title: "CollabFlow",
    tagline: "Real-Time Project Management & Collaboration",
    category: "SaaS Platform",
    cover: "/client_work_images/collabflow.png",
    link: "/client-work/collabflow",
    description:
      "Full-stack project management platform inspired by Linear, Trello, Jira, and Slack to manage tasks, collaborate in real time, organize sprints, and track performance.",
    metrics: "Real-Time Kanban · Role-Based Access",
    stack: [
      "React 18",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Socket.IO",
      "Tailwind CSS",
    ],
  },
];

export default function BrandyfyShowcase() {
  return (
    <section
      id="creative-showcase"
      className="py-24 md:py-32 bg-[#060608] relative overflow-hidden border-t border-white/[0.08]"
    >
      <div className="max-w-7xl mx-auto px-6">
        {/* Header */}
        <div className="max-w-3xl mb-16 md:mb-20">
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-xs font-mono font-semibold tracking-widest uppercase">
            <span className="w-2 h-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            Our Creative Showcase
          </div>
          <h2 className="mt-4 text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.08]">
            We design beautifully. We build for performance.
          </h2>
          <p className="mt-5 text-lg md:text-xl text-zinc-400 leading-relaxed">
            We have become experts in engineering top-notch digital products. We
            care deeply about what we do, and every pixel reflects that
            dedication.
          </p>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-10">
          {PROJECTS_DATA.map((project) => (
            <Link
              key={project.title}
              href={project.link}
              className="group relative flex flex-col rounded-3xl bg-[#12131b]/80 border border-white/[0.08] hover:border-[#98f90d]/50 p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(152,249,13,0.15)] backdrop-blur-md"
            >
              {/* Image Preview Frame */}
              <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#090a0f] border border-white/[0.06] mb-6">
                <img
                  src={project.cover}
                  alt={project.title}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#98f90d] font-mono text-xs uppercase tracking-wider">
                  {project.category}
                </span>
                <span className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white group-hover:bg-[#98f90d] group-hover:text-black group-hover:border-[#98f90d] flex items-center justify-center transition-all duration-300 group-hover:rotate-45">
                  <ArrowUpRight size={18} />
                </span>
              </div>

              {/* Copy */}
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white group-hover:text-[#98f90d] transition-colors">
                      {project.title}
                    </h3>
                    <span className="text-xs font-mono text-zinc-400 font-medium">
                      {project.metrics}
                    </span>
                  </div>
                  <p className="mt-3 text-zinc-400 text-sm md:text-base leading-relaxed">
                    {project.description}
                  </p>
                </div>

                <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                  {project.stack.map((item) => (
                    <span
                      key={item}
                      className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/[0.04] text-zinc-400"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Link>
          ))}

          {/* "Your Project Here" Card */}
          <Link
            href="/start-project"
            className="group relative flex flex-col rounded-3xl bg-[#12131b]/80 border border-white/[0.08] hover:border-[#98f90d]/50 p-6 md:p-8 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_25px_50px_-15px_rgba(0,0,0,0.9),0_0_35px_rgba(152,249,13,0.15)] backdrop-blur-md"
          >
            {/* Preview Frame */}
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-[#090a0f] border border-white/[0.06] mb-6 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-14 h-14 rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/25 flex items-center justify-center text-[#98f90d] mb-3">
                <Sparkles size={28} />
              </div>
              <span className="px-3.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[#98f90d] font-mono text-xs uppercase tracking-wider">
                Next Success Story
              </span>
              <span className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white group-hover:bg-[#98f90d] group-hover:text-black group-hover:border-[#98f90d] flex items-center justify-center transition-all duration-300 group-hover:rotate-45">
                <ArrowUpRight size={18} />
              </span>
            </div>

            {/* Copy */}
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white group-hover:text-[#98f90d] transition-colors">
                    Your Project Here.
                  </h3>
                  <span className="text-xs font-mono text-[#98f90d] font-medium">
                    Available Now
                  </span>
                </div>
                <p className="mt-3 text-zinc-400 text-sm md:text-base leading-relaxed">
                  Have a product idea, complex software challenge, or web platform
                  you need built right? Partner with an agile, senior engineering
                  team ready to execute.
                </p>
              </div>

              <div className="mt-6 pt-5 border-t border-white/[0.06] flex flex-wrap gap-2">
                {["Custom Software", "Web & Mobile", "AI Engineering", "Cloud Architecture"].map((item) => (
                  <span
                    key={item}
                    className="px-2.5 py-0.5 rounded-full text-xs font-mono bg-white/[0.04] text-zinc-400"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
}
