"use client";

import { useState, useEffect } from "react";
import { Search, Globe, Save, CheckCircle2, Eye, ShieldCheck, FileText, Share2, Sparkles } from "lucide-react";

const PAGES = [
  { path: "/", label: "Homepage" },
  { path: "/about", label: "About Page" },
  { path: "/services", label: "Services Page" },
  { path: "/solutions", label: "Solutions Page" },
  { path: "/projects", label: "Projects & Portfolio" },
  { path: "/technologies", label: "Technologies Page" },
  { path: "/contact", label: "Contact Us Page" },
];

export default function SeoManagementPage() {
  const [selectedPath, setSelectedPath] = useState("/");
  const [seoData, setSeoData] = useState({ global: {}, pages: {} });
  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const [currentPageSeo, setCurrentPageSeo] = useState({
    title: "",
    description: "",
  });

  const [globalSettings, setGlobalSettings] = useState({
    siteName: "Newbhar Technologies",
    defaultTitle: "Newbhar Technologies | Custom Software, AI & Cloud Engineering",
    defaultDescription: "Newbhar Technologies builds enterprise custom software, web platforms, mobile apps, and AI solutions tailored to operational business needs.",
    canonicalBase: "https://newbhar.com",
    robots: "index, follow",
    ogImage: "/newbhar-banner.jpg",
  });

  useEffect(() => {
    fetch("/api/admin/seo")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.seo) {
          setSeoData(data.seo);
          if (data.seo.global) setGlobalSettings((prev) => ({ ...prev, ...data.seo.global }));
          if (data.seo.pages?.[selectedPath]) {
            setCurrentPageSeo(data.seo.pages[selectedPath]);
          }
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (seoData.pages?.[selectedPath]) {
      setCurrentPageSeo(seoData.pages[selectedPath]);
    } else {
      setCurrentPageSeo({
        title: `${PAGES.find((p) => p.path === selectedPath)?.label} | Newbhar Technologies`,
        description: globalSettings.defaultDescription,
      });
    }
  }, [selectedPath, seoData]);

  const handleSavePageSeo = async (e) => {
    e.preventDefault();
    setSavedMessage("");
    try {
      const res = await fetch("/api/admin/seo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pagePath: selectedPath,
          pageSeo: currentPageSeo,
          global: globalSettings,
        }),
      });
      if (res.ok) {
        setSavedMessage(`SEO settings saved for ${selectedPath}!`);
        setTimeout(() => setSavedMessage(""), 4000);
      }
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Indexation & Metadata</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            SEO & Social Card Engine
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Meta tags, Open Graph cards, Google crawler rules, dynamic XML sitemap, and robots.txt.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
          >
            <FileText size={13} className="text-[#98f90d]" />
            <span>sitemap.xml</span>
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
          >
            <FileText size={13} className="text-[#98f90d]" />
            <span>robots.txt</span>
          </a>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Page Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-3">
        {PAGES.map((page) => (
          <button
            key={page.path}
            type="button"
            onClick={() => setSelectedPath(page.path)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold transition-all border ${
              selectedPath === page.path
                ? "border-[#98f90d] bg-[#98f90d]/15 text-[#98f90d]"
                : "border-white/10 bg-[#0f111a]/90 text-neutral-400 hover:text-white hover:border-white/20"
            }`}
          >
            {page.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Page Meta Editor Form */}
        <form onSubmit={handleSavePageSeo} className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Target Metadata: {selectedPath}
            </h2>
            <span className="text-[11px] font-mono text-[#98f90d]">Live Sync</span>
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-neutral-300">Page Meta Title *</label>
              <span className={`font-mono text-[10px] ${currentPageSeo.title.length > 60 ? "text-amber-400" : "text-neutral-500"}`}>
                {currentPageSeo.title.length}/60 chars
              </span>
            </div>
            <input
              type="text"
              required
              value={currentPageSeo.title}
              onChange={(e) => setCurrentPageSeo({ ...currentPageSeo, title: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <label className="font-semibold text-neutral-300">Meta Description *</label>
              <span className={`font-mono text-[10px] ${currentPageSeo.description.length > 160 ? "text-amber-400" : "text-neutral-500"}`}>
                {currentPageSeo.description.length}/160 chars
              </span>
            </div>
            <textarea
              rows={4}
              required
              value={currentPageSeo.description}
              onChange={(e) => setCurrentPageSeo({ ...currentPageSeo, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Canonical Base URL</label>
              <input
                type="text"
                value={globalSettings.canonicalBase}
                onChange={(e) => setGlobalSettings({ ...globalSettings, canonicalBase: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Robots Directive</label>
              <select
                value={globalSettings.robots}
                onChange={(e) => setGlobalSettings({ ...globalSettings, robots: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                <option value="index, follow" className="bg-[#0f111a]">index, follow (Recommended)</option>
                <option value="noindex, follow" className="bg-[#0f111a]">noindex, follow</option>
                <option value="noindex, nofollow" className="bg-[#0f111a]">noindex, nofollow</option>
              </select>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10">
            <button
              type="submit"
              className="rounded-xl bg-[#98f90d] px-5 py-2.5 text-xs font-bold text-black hover:bg-[#86dc0b] transition-all"
            >
              Update SEO Configuration
            </button>
          </div>
        </form>

        {/* Live SERP & Social Preview */}
        <div className="space-y-6">
          {/* Google Search Result Preview */}
          <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Google Search Result Snippet
            </span>
            <div className="rounded-2xl border border-white/10 p-4 bg-black/40 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                <Globe size={13} className="text-[#98f90d]" />
                <span className="font-mono text-[11px] text-neutral-400">
                  {globalSettings.canonicalBase}{selectedPath === "/" ? "" : selectedPath}
                </span>
              </div>
              <h3 className="text-base text-[#98f90d] hover:underline cursor-pointer font-medium font-sans">
                {currentPageSeo.title || "Page Title"}
              </h3>
              <p className="text-xs text-neutral-300 line-clamp-2 leading-relaxed">
                {currentPageSeo.description || "Page meta description will appear here in search engine rankings..."}
              </p>
            </div>
          </div>

          {/* Open Graph Social Card Preview */}
          <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-3">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Open Graph (LinkedIn &amp; X) Card
            </span>
            <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40">
              <div className="h-28 bg-gradient-to-br from-[#0c0e15] to-[#151926] border-b border-white/10 flex items-center justify-center text-white relative">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 rounded-lg bg-[#98f90d] text-black font-black text-sm leading-8">
                    N
                  </div>
                  <div className="text-xs font-bold text-white mt-1">Newbhar Technologies</div>
                </div>
              </div>
              <div className="p-3.5 text-xs">
                <span className="font-mono text-[10px] text-neutral-500 uppercase">newbhar.com</span>
                <div className="font-bold text-white truncate mt-0.5">{currentPageSeo.title}</div>
                <div className="text-neutral-400 line-clamp-1 text-[11px] mt-0.5">{currentPageSeo.description}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
