"use client";

import { useState, useEffect } from "react";
import { LayoutTemplate, Sparkles, CheckCircle2, Save, Eye, ArrowUpRight } from "lucide-react";

export default function HomepageCMSPage() {
  const [homepage, setHomepage] = useState({
    categoryText: "Software · AI · Cloud · Data",
    mainHeading: "Creative Intelligence in Every",
    highlightedHeading: "Line of Code.",
    description: "No matter the industry you're in, or the asset you need, we can design and build it for you — custom software, high-conversion web platforms, mobile apps, and enterprise AI.",
    primaryButtonText: "Start a Project",
    primaryButtonUrl: "/start-project",
    secondaryButtonText: "Our Showcase",
    secondaryButtonUrl: "/projects",
    tags: ["100% custom-built", "Web, mobile, AI & cloud under one roof"],
  });

  const [heroAnimation, setHeroAnimation] = useState({
    enabled: true,
    particleCount: 160,
    particleSize: 3,
    animationSpeed: 1,
    behavior: "interactive-orbit",
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/cms?section=homepage")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.homepage) setHomepage((prev) => ({ ...prev, ...data.homepage }));
          if (data.heroAnimation) setHeroAnimation((prev) => ({ ...prev, ...data.heroAnimation }));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async (publish = false) => {
    setSavedMessage("");
    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "homepage", data: homepage, publish }),
      });
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "heroAnimation", data: heroAnimation, publish }),
      });
      setSavedMessage(publish ? "Published live to Newbhar Technologies homepage!" : "Draft changes saved successfully.");
      setTimeout(() => setSavedMessage(""), 4000);
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Hero Section</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Homepage Hero & Particle CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage the primary headline, call-to-action buttons, value propositions, and 3D interactive particle sphere.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
          >
            <Eye size={13} className="text-[#98f90d]" />
            <span>Preview Site</span>
          </a>
          <button
            type="button"
            onClick={() => handleSave(false)}
            className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition"
          >
            Save Draft
          </button>
          <button
            type="button"
            onClick={() => handleSave(true)}
            className="rounded-xl bg-[#98f90d] px-5 py-2 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
          >
            Publish Live
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Main Hero Copy Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            Hero Typography & Headlines
          </h2>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Category Eyebrow Tag</label>
            <input
              type="text"
              value={homepage.categoryText}
              onChange={(e) => setHomepage({ ...homepage, categoryText: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Main Heading (Primary Line)</label>
            <input
              type="text"
              value={homepage.mainHeading}
              onChange={(e) => setHomepage({ ...homepage, mainHeading: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Highlighted Accent Text (Lime)</label>
            <input
              type="text"
              value={homepage.highlightedHeading}
              onChange={(e) => setHomepage({ ...homepage, highlightedHeading: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-bold text-[#98f90d] placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Lead Narrative Description</label>
            <textarea
              rows={4}
              value={homepage.description}
              onChange={(e) => setHomepage({ ...homepage, description: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>
        </div>

        {/* Buttons & Feature Tags */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
              Call to Action Buttons
            </h2>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Primary Button Label</label>
                <input
                  type="text"
                  value={homepage.primaryButtonText}
                  onChange={(e) => setHomepage({ ...homepage, primaryButtonText: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Primary URL</label>
                <input
                  type="text"
                  value={homepage.primaryButtonUrl}
                  onChange={(e) => setHomepage({ ...homepage, primaryButtonUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Secondary Button Label</label>
                <input
                  type="text"
                  value={homepage.secondaryButtonText}
                  onChange={(e) => setHomepage({ ...homepage, secondaryButtonText: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Secondary URL</label>
                <input
                  type="text"
                  value={homepage.secondaryButtonUrl}
                  onChange={(e) => setHomepage({ ...homepage, secondaryButtonUrl: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* 3D Hero Particle Animation Settings */}
          <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-[#98f90d]" />
                <span>3D Particle Sphere Settings</span>
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={heroAnimation.enabled}
                  onChange={(e) => setHeroAnimation({ ...heroAnimation, enabled: e.target.checked })}
                  className="rounded text-[#98f90d] focus:ring-[#98f90d]"
                />
                <span className="font-semibold text-neutral-300">Animation Active</span>
              </label>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Particle Count</label>
                <input
                  type="number"
                  value={heroAnimation.particleCount}
                  onChange={(e) => setHeroAnimation({ ...heroAnimation, particleCount: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Particle Size</label>
                <input
                  type="number"
                  value={heroAnimation.particleSize}
                  onChange={(e) => setHeroAnimation({ ...heroAnimation, particleSize: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Speed Multiplier</label>
                <input
                  type="number"
                  step="0.1"
                  value={heroAnimation.animationSpeed}
                  onChange={(e) => setHeroAnimation({ ...heroAnimation, animationSpeed: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
