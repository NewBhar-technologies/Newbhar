"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Eye,
  Mail,
  UserCheck,
  Calendar,
  MessageSquare,
  TrendingUp,
  ArrowUpRight,
  Clock,
  ShieldAlert,
  FolderKanban,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Zap,
} from "lucide-react";
import { DailyTrafficChart, DeviceDonut } from "@/components/admin/charts";

export default function AdminDashboardPage() {
  const [dateRange, setDateRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch(`/api/admin/dashboard?range=${dateRange}`)
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          setData(res.data);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, [dateRange]);

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 text-white">
      {/* Top Welcome & Date Filter Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-[#98f90d] uppercase">
              Operational Intelligence
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Executive Control Center
          </h1>
          <p className="text-xs text-gray-400 mt-1 max-w-xl">
            Live visitor analytics, conversion pipeline, and Supabase client telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Date Range Selector */}
          <div className="inline-flex rounded-2xl bg-white/[0.04] p-1 border border-white/10 backdrop-blur-md text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "yesterday", label: "Yesterday" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setDateRange(tab.id)}
                className={`rounded-xl px-3 py-1.5 transition-all text-xs ${
                  dateRange === tab.id
                    ? "bg-[#98f90d] text-[#050505] font-bold shadow-[0_0_15px_rgba(152,249,13,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchDashboardData}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition shadow-sm"
            title="Refresh metrics"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#98f90d]" : ""} />
          </button>
        </div>
      </div>

      {/* KPI STATISTICS CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {/* Visitors */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-[#98f90d]/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Visitors</span>
            <Users size={16} className="text-[#98f90d] transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.totalVisitors ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-400 font-mono">
            <span className="text-[#98f90d] font-bold">{kpis.uniqueVisitors ?? 0}</span> unique
          </div>
        </div>

        {/* Page Views */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-cyan-400/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Page Views</span>
            <Eye size={16} className="text-cyan-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.totalPageViews ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-400 font-mono">
            <span className="text-cyan-400 font-bold">{kpis.returningVisitors ?? 0}</span> returning
          </div>
        </div>

        {/* Contact Inquiries */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-[#98f90d]/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Inquiries</span>
            <Mail size={16} className="text-[#98f90d] transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.totalInquiries ?? 0}
          </div>
          <div className="mt-1 text-[11px]">
            <Link href="/admin/contacts" className="text-[#98f90d] hover:underline font-semibold font-mono">
              View inbox &rarr;
            </Link>
          </div>
        </div>

        {/* Active Leads */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-purple-400/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Active Leads</span>
            <UserCheck size={16} className="text-purple-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.activeLeads ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-400 font-mono">
            <span className="text-purple-400 font-bold">{kpis.newLeads ?? 0}</span> pipeline
          </div>
        </div>

        {/* Meetings */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-amber-400/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Meetings</span>
            <Calendar size={16} className="text-amber-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.meetingsScheduled ?? 0}
          </div>
          <div className="mt-1 text-[11px] text-gray-400 font-mono">
            <span className="text-amber-400 font-bold">{kpis.meetingClicks ?? 0}</span> CTA clicks
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl transition hover:border-emerald-400/40 group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Conversion</span>
            <TrendingUp size={16} className="text-emerald-400 transition-transform group-hover:scale-110" />
          </div>
          <div className="mt-3 text-2xl font-black text-white font-display">
            {kpis.conversionRate ?? "0%"}
          </div>
          <div className="mt-1 text-[11px] text-gray-400 font-mono">
            <span className="text-emerald-400 font-bold">{kpis.totalInquiries ?? 0}</span> total leads
          </div>
        </div>
      </div>

      {/* CHARTS ROW */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Daily Traffic Timeline */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl lg:col-span-2">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Traffic &amp; Engagement Activity</h2>
              <p className="text-xs text-gray-400 mt-0.5">Verified pageviews and visitor sessions across time</p>
            </div>
            <Link
              href="/admin/analytics"
              className="text-xs font-semibold text-[#98f90d] hover:underline flex items-center gap-1.5"
            >
              <span>Full Analytics</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
          <DailyTrafficChart data={data?.dailyTimeline || []} />
        </div>

        {/* Device Breakdown & Traffic Sources */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">Device Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5 mb-5">Visitor environment distribution</p>
            <DeviceDonut devices={data?.devices || {}} />
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-white">Acquisition Sources</span>
              <span className="text-[10px] font-mono text-gray-400">Share of Traffic</span>
            </div>
            <div className="space-y-3">
              {(data?.trafficSources || []).slice(0, 3).map((s) => (
                <div key={s.name} className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-300">{s.name}</span>
                    <span className="font-mono font-bold text-[#98f90d]">{s.percentage}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                    <div
                      style={{ width: `${s.percentage}%` }}
                      className="h-full rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* RECENT INQUIRIES & RECENT MEETINGS DUAL PANEL */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Inquiries */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Recent Inquiries</h2>
              <p className="text-xs text-gray-400">Direct form submissions from website</p>
            </div>
            <Link href="/admin/contacts" className="text-xs font-semibold text-[#98f90d] hover:underline">
              View All ({data?.recentInquiries?.length || 0})
            </Link>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {!data?.recentInquiries || data.recentInquiries.length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-gray-500">
                No contact inquiries recorded yet.
              </p>
            ) : (
              data.recentInquiries.slice(0, 4).map((c) => (
                <div key={c.id} className="py-3.5 flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{c.name}</div>
                    <div className="text-xs text-gray-400">
                      {c.companyName || c.email} · <span className="text-gray-300">{c.service}</span>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-1 italic">&ldquo;{c.message}&rdquo;</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold capitalize border ${
                      c.status === "new"
                        ? "bg-[#98f90d]/10 text-[#98f90d] border-[#98f90d]/30"
                        : c.status === "qualified"
                        ? "bg-purple-500/10 text-purple-400 border-purple-500/30"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Discovery Meetings</h2>
              <p className="text-xs text-gray-400">Consultation calendar &amp; pipeline calls</p>
            </div>
            <Link href="/admin/meetings" className="text-xs font-semibold text-[#98f90d] hover:underline">
              Manage Calendar
            </Link>
          </div>
          <div className="divide-y divide-white/[0.06]">
            {!data?.upcomingMeetings || data.upcomingMeetings.length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-gray-500">
                No upcoming meetings scheduled.
              </p>
            ) : (
              data.upcomingMeetings.slice(0, 4).map((m) => (
                <div key={m.id} className="py-3.5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="font-bold text-sm text-white">{m.title}</div>
                    <div className="text-xs text-gray-400">
                      Client: <span className="text-gray-300 font-medium">{m.clientName}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-mono font-bold text-[#98f90d] flex items-center gap-1.5 justify-end">
                      <Clock size={12} />
                      <span>{m.date} at {m.time}</span>
                    </div>
                    <span className="text-[10px] font-mono text-gray-500 capitalize">{m.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ACTIVE CLIENT PROJECTS & RECENT AUDIT LOGS */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Active Client Projects */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">Active Client Projects</h2>
              <p className="text-xs text-gray-400">Delivery milestones and sprint health</p>
            </div>
            <Link href="/admin/projects" className="text-xs font-semibold text-[#98f90d] hover:underline">
              All Projects &rarr;
            </Link>
          </div>
          <div className="space-y-4">
            {(data?.recentProjects || []).length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-gray-500">
                No active projects recorded. Create one in Client Projects.
              </p>
            ) : (
              (data?.recentProjects || []).map((p) => (
                <div key={p.id} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-white">{p.title}</span>
                    <span className="text-xs font-mono font-bold text-[#98f90d]">{p.progress}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/[0.06] overflow-hidden p-0.5">
                    <div
                      style={{ width: `${p.progress}%` }}
                      className="h-full rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]"
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-gray-400 font-mono">
                    <span>Client: {p.clientName}</span>
                    <span className="capitalize">{p.status?.replace(/_/g, " ")}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Security & Activity Logs */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-white tracking-tight">System Audit Trail</h2>
              <p className="text-xs text-gray-400">Administrative logs &amp; security events</p>
            </div>
            <Link href="/admin/audit-logs" className="text-xs font-semibold text-[#98f90d] hover:underline">
              Full Audit Trail
            </Link>
          </div>
          <div className="divide-y divide-white/[0.06] text-xs">
            {(data?.recentActivities || []).length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-gray-500">
                No security activities logged yet.
              </p>
            ) : (
              (data?.recentActivities || []).slice(0, 5).map((act) => (
                <div key={act.id} className="py-3 flex items-start justify-between">
                  <div>
                    <span className="font-bold text-white">{act.action}</span>
                    <p className="text-gray-400 text-[11px] mt-0.5">{act.details}</p>
                  </div>
                  <div className="text-right text-[10px] text-gray-500 whitespace-nowrap font-mono">
                    <div>{act.timestamp ? new Date(act.timestamp).toLocaleTimeString() : ""}</div>
                    <span className="text-[#98f90d] font-bold">{act.result}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
