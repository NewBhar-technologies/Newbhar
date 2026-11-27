import Link from "next/link";
import { LayoutTemplate, Info, Layers, Sparkles, Briefcase, Cpu, Navigation, Footprints, ArrowRight } from "lucide-react";

const CMS_CARDS = [
  {
    title: "Homepage Hero & Animation",
    description: "Manage hero headline, action buttons, category tags, and the interactive 3D particle sphere.",
    href: "/admin/cms/homepage",
    icon: LayoutTemplate,
  },
  {
    title: "About Us Section",
    description: "Company history, engineering ethos, value proposition, and public narrative.",
    href: "/admin/cms/about",
    icon: Info,
  },
  {
    title: "Services Catalog",
    description: "All 8 corporate services: Software, Web, Mobile, AI/ML, Data Science, Cloud, Guidance, and SEO.",
    href: "/admin/cms/services",
    icon: Layers,
  },
  {
    title: "Business Solutions",
    description: "ERP systems, online portals, mobile platforms, dashboards, and cloud migrations.",
    href: "/admin/cms/solutions",
    icon: Sparkles,
  },
  {
    title: "Portfolio & Case Studies",
    description: "Real enterprise software stories, architectures, challenges, and measurable ROI.",
    href: "/admin/cms/portfolio",
    icon: Briefcase,
  },
  {
    title: "Technology Stack",
    description: "Frontend, backend, database, AI, and DevOps technology badges and toolsets.",
    href: "/admin/cms/technologies",
    icon: Cpu,
  },
  {
    title: "Header Navigation",
    description: "Menu hierarchy, mega dropdown toggles, display ordering, and action links.",
    href: "/admin/cms/navigation",
    icon: Navigation,
  },
  {
    title: "Footer & Admin Access",
    description: "4-column dark footer, corporate blurb, copyright, and the public Admin Login link toggle.",
    href: "/admin/cms/footer",
    icon: Footprints,
  },
];

export default function CMSOverviewPage() {
  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Dynamic Page Engine</span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-white font-display">
          Website Content Management (CMS)
        </h1>
        <p className="text-xs text-neutral-400 mt-0.5">
          Real-time database-backed control over all public Newbhar Technologies sections, services, case studies, and brand copy.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {CMS_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <Link
              key={card.href}
              href={card.href}
              className="group rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d] group-hover:scale-105 group-hover:bg-[#98f90d] group-hover:text-black transition-all">
                  <Icon size={18} />
                </div>
                <h3 className="font-bold text-sm text-white mt-3.5 group-hover:text-[#98f90d] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-neutral-400 mt-1.5 leading-relaxed">{card.description}</p>
              </div>

              <div className="mt-5 flex items-center justify-between text-[11px] font-bold text-[#98f90d] border-t border-white/10 pt-3">
                <span>Manage Section</span>
                <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
