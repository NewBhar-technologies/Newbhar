"use client";

import { useState, useEffect } from "react";
import { Settings, Save, CheckCircle2, ShieldCheck, Mail, Database, Compass, Globe, Lock, Cpu, Server, KeyRound, Radio } from "lucide-react";

export default function SystemSettingsPage() {
  const [settings, setSettings] = useState({
    general: {
      siteName: "Newbhar Technologies",
      supportEmail: "info@newbhar.com",
      timezone: "Asia/Kolkata",
      dateFormat: "YYYY-MM-DD",
      maintenanceMode: false,
    },
    security: {
      maxLoginAttempts: 5,
      lockoutDurationMinutes: 15,
      sessionExpiryHours: 24,
      enforceStrongPasswords: true,
    },
    integrations: {
      resend: { configured: false, status: "Not Configured" },
      supabase: { configured: true, status: "Connected (PostgreSQL)" },
      calendly: { configured: true, status: "Connected" },
    },
  });

  const [loading, setLoading] = useState(true);
  const [savedMessage, setSavedMessage] = useState("");

  const fetchSettings = () => {
    setLoading(true);
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSavedMessage("");
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          general: settings.general,
          security: settings.security,
        }),
      });
      if (res.ok) {
        setSavedMessage("System configuration updated and synced with database.");
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
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Global Parameters</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            System & Infrastructure
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Core administrative configurations, security policies, and external service links.
          </p>
        </div>

        <button
          type="submit"
          form="settings-form"
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Save size={15} />
          <span>Save Configuration</span>
        </button>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* External Integrations Health Status */}
      <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <Radio size={16} className="text-[#98f90d]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Connected Infrastructure & Vendors
            </h2>
          </div>
          <span className="text-[11px] font-mono text-neutral-400">Live Health Check</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Supabase Database */}
          <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02] space-y-2 hover:border-[#98f90d]/30 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Database size={15} className="text-[#98f90d]" />
                <span>Supabase PostgreSQL</span>
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 font-mono">
              {settings.integrations?.supabase?.status || "Connected (sqiqeluadrikacujcopj)"}
            </p>
          </div>

          {/* Resend Email */}
          <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02] space-y-2 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Mail size={15} className="text-cyan-400" />
                <span>Resend Email API</span>
              </span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase border ${
                  settings.integrations?.resend?.configured
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                    : "border-amber-500/30 bg-amber-500/10 text-amber-400"
                }`}
              >
                {settings.integrations?.resend?.configured ? "Connected" : "Standby"}
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {settings.integrations?.resend?.status || "Ready for API Key"}
            </p>
          </div>

          {/* Calendly Booking */}
          <div className="rounded-2xl border border-white/10 p-4 bg-white/[0.02] space-y-2 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white flex items-center gap-2">
                <Compass size={15} className="text-violet-400" />
                <span>Calendly Scheduler</span>
              </span>
              <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                Active
              </span>
            </div>
            <p className="text-[11px] text-neutral-400">
              {settings.integrations?.calendly?.status || "Live Embed Ready"}
            </p>
          </div>
        </div>
      </div>

      {/* Main Settings Form */}
      <form id="settings-form" onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-5 text-xs">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Globe size={16} className="text-[#98f90d]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              General Identity & Region
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-300">Company / Brand Name</label>
            <input
              type="text"
              value={settings.general?.siteName || "Newbhar Technologies"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, siteName: e.target.value },
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-300">Inquiry Notification Recipient Email</label>
            <input
              type="email"
              value={settings.general?.supportEmail || "info@newbhar.com"}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  general: { ...settings.general, supportEmail: e.target.value },
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block font-semibold text-neutral-300">Timezone</label>
              <select
                value={settings.general?.timezone || "Asia/Kolkata"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, timezone: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                <option value="America/New_York">America/New_York (EST)</option>
                <option value="Europe/London">Europe/London (GMT)</option>
                <option value="UTC">UTC Universal</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block font-semibold text-neutral-300">Date Format</label>
              <select
                value={settings.general?.dateFormat || "YYYY-MM-DD"}
                onChange={(e) =>
                  setSettings({
                    ...settings,
                    general: { ...settings.general, dateFormat: e.target.value },
                  })
                }
                className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Policy Settings */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl space-y-5 text-xs">
          <div className="flex items-center gap-2.5 border-b border-white/10 pb-3">
            <Lock size={16} className="text-[#98f90d]" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Security & Rate-Limiting Policy
            </h2>
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-300">
              Maximum Failed Login Attempts before Lockout
            </label>
            <input
              type="number"
              min={3}
              max={10}
              value={settings.security?.maxLoginAttempts || 5}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, maxLoginAttempts: Number(e.target.value) },
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-300">
              Account Lockout Duration (Minutes)
            </label>
            <input
              type="number"
              min={5}
              max={60}
              value={settings.security?.lockoutDurationMinutes || 15}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, lockoutDurationMinutes: Number(e.target.value) },
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block font-semibold text-neutral-300">
              Admin Session Inactivity Expiry (Hours)
            </label>
            <input
              type="number"
              min={1}
              max={72}
              value={settings.security?.sessionExpiryHours || 24}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  security: { ...settings.security, sessionExpiryHours: Number(e.target.value) },
                })
              }
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[#98f90d]/20 bg-[#98f90d]/5 p-3.5 text-[#98f90d] text-[11px] leading-relaxed flex items-center gap-2">
            <ShieldCheck size={16} className="shrink-0" />
            <span>All administrative tokens are signed server-side with JWT and stored in HTTP-only, secure, SameSite cookies.</span>
          </div>
        </div>
      </form>
    </div>
  );
}
