"use client";

import { useState, useEffect } from "react";
import { Info, CheckCircle2, Save, Eye, ArrowUpRight } from "lucide-react";

export default function AboutCMSPage() {
  const [about, setAbout] = useState({
    heading: "Engineering Digital Excellence for Forward-Thinking Enterprises",
    subheading: "Custom solutions crafted around how your business really operates.",
    content: "Newbhar Technologies is a premier technology partner specializing in enterprise custom software, cloud architecture, and artificial intelligence solutions. We replace manual friction with seamless, reliable software.",
    visibility: true,
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/cms?section=about")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.about) {
          setAbout((prev) => ({ ...prev, ...data.about }));
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
        body: JSON.stringify({ section: "about", data: about, publish }),
      });
      setSavedMessage(publish ? "About section published live!" : "Draft saved successfully.");
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
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Narrative Layer</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            About & Ethos CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage company philosophy, mission narratives, and the public /about page copy.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
          >
            <Eye size={13} className="text-[#98f90d]" />
            <span>View Public /about</span>
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

      <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs max-w-3xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Corporate Identity & Narrative</h2>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={about.visibility !== false}
              onChange={(e) => setAbout({ ...about, visibility: e.target.checked })}
              className="rounded text-[#98f90d] focus:ring-[#98f90d]"
            />
            <span className="font-semibold text-neutral-300">Section Enabled</span>
          </label>
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-neutral-300">Main Heading</label>
          <input
            type="text"
            value={about.heading}
            onChange={(e) => setAbout({ ...about, heading: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-neutral-300">Subheading / Value Promise</label>
          <input
            type="text"
            value={about.subheading}
            onChange={(e) => setAbout({ ...about, subheading: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="block font-semibold text-neutral-300">About Company Story & Ethos</label>
          <textarea
            rows={6}
            value={about.content}
            onChange={(e) => setAbout({ ...about, content: e.target.value })}
            className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>
      </div>
    </div>
  );
}
