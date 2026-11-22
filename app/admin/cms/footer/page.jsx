"use client";

import { useState, useEffect } from "react";
import { Footprints, Lock, CheckCircle2, Save, Eye, ArrowUpRight } from "lucide-react";

export default function FooterCMSPage() {
  const [footer, setFooter] = useState({
    brandDescription: "Software, AI and cloud engineering for ambitious businesses.",
    contactEmail: "newbhartechnologies@gmail.com",
    meetingUrl: "",
    meetingLabel: "Book a Meeting",
    copyrightText: `© ${new Date().getFullYear()} Newbhar Technologies. All rights reserved.`,
    adminLoginLink: {
      label: "Admin Login",
      url: "/admin/login",
      enabled: true,
      showLockIcon: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  useEffect(() => {
    fetch("/api/admin/cms?section=footer")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.footer) {
          setFooter((prev) => ({
            ...prev,
            ...data.footer,
            adminLoginLink: {
              ...prev.adminLoginLink,
              ...(data.footer.adminLoginLink || {}),
            },
          }));
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
        body: JSON.stringify({ section: "footer", data: footer, publish }),
      });
      setSavedMessage(publish ? "Footer changes published live to website!" : "Draft footer saved.");
      setTimeout(() => setSavedMessage(""), 4000);
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Global Footer</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Footer Management & Access Links
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Configure the 4-column corporate footer, branding copy, meeting button, and public Admin Login entry point.
          </p>
        </div>

        <div className="flex items-center gap-2">
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
            Publish Footer Live
          </button>
        </div>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Footer Settings */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
          <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-white/10 pb-3">
            General Footer & Contact Details
          </h2>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Brand Description Blurb</label>
            <textarea
              rows={3}
              value={footer.brandDescription}
              onChange={(e) => setFooter({ ...footer, brandDescription: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Corporate Contact Email</label>
              <input
                type="email"
                value={footer.contactEmail}
                onChange={(e) => setFooter({ ...footer, contactEmail: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Meeting Booking URL</label>
              <input
                type="text"
                value={footer.meetingUrl}
                onChange={(e) => setFooter({ ...footer, meetingUrl: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white focus:border-[#98f90d] focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-neutral-300">Copyright Statement</label>
            <input
              type="text"
              value={footer.copyrightText}
              onChange={(e) => setFooter({ ...footer, copyrightText: e.target.value })}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
            />
          </div>
        </div>

        {/* Admin Login Link Settings */}
        <div className="space-y-6">
          <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Lock size={16} className="text-[#98f90d]" />
                <span>Footer Admin Login Link</span>
              </h2>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={footer.adminLoginLink?.enabled !== false}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      adminLoginLink: { ...footer.adminLoginLink, enabled: e.target.checked },
                    })
                  }
                  className="rounded text-[#98f90d] focus:ring-[#98f90d]"
                />
                <span className="font-bold text-neutral-300">Show in Footer</span>
              </label>
            </div>

            <p className="text-neutral-400 leading-relaxed text-[11px]">
              This link appears directly in the GET IN TOUCH column of the footer, allowing administrative access without needing manual URL navigation.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Link Display Label</label>
                <input
                  type="text"
                  value={footer.adminLoginLink?.label || "Admin Login"}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      adminLoginLink: { ...footer.adminLoginLink, label: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Navigation Route</label>
                <input
                  type="text"
                  value={footer.adminLoginLink?.url || "/admin/login"}
                  onChange={(e) =>
                    setFooter({
                      ...footer,
                      adminLoginLink: { ...footer.adminLoginLink, url: e.target.value },
                    })
                  }
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2 text-xs font-mono text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={footer.adminLoginLink?.showLockIcon !== false}
                onChange={(e) =>
                  setFooter({
                    ...footer,
                    adminLoginLink: { ...footer.adminLoginLink, showLockIcon: e.target.checked },
                  })
                }
                className="rounded text-[#98f90d] focus:ring-[#98f90d]"
              />
              <span className="text-neutral-400">Display subtle padlock icon next to link</span>
            </label>

            {/* Visual Preview in Dark Footer Theme */}
            <div className="rounded-2xl bg-black/50 p-4 text-white text-xs space-y-2.5 mt-4 border border-white/10">
              <span className="text-[10px] font-mono text-neutral-500 uppercase tracking-widest block">Live Visual Preview</span>
              <div className="text-[11px] text-neutral-400 font-mono uppercase tracking-wider font-semibold">GET IN TOUCH</div>
              <div className="text-xs text-neutral-300">{footer.contactEmail}</div>
              <div className="inline-block rounded-xl bg-[#98f90d] text-black font-bold px-4 py-1.5 text-xs">
                {footer.meetingLabel || "Book a Meeting"}
              </div>
              {footer.adminLoginLink?.enabled !== false && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 text-[13px] text-neutral-400 hover:text-[#98f90d] cursor-pointer">
                    {footer.adminLoginLink?.showLockIcon !== false && <Lock size={12} />}
                    <span>{footer.adminLoginLink?.label || "Admin Login"}</span>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
