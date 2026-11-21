"use client";

import { useState, useEffect } from "react";
import { BarChart3, TrendingUp, Compass, Globe, Smartphone, Monitor, Eye, MousePointerClick, RefreshCw, Users2, Sparkles } from "lucide-react";
import { DailyTrafficChart, DeviceDonut } from "@/components/admin/charts";

export default function AnalyticsPage() {
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = () => {
    setLoading(true);
    fetch(`/api/admin/analytics?range=${range}`)
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
    fetchAnalytics();
  }, [range]);

  const kpis = data?.kpis || {};

  return (
    <div className="space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#98f90d] uppercase">
              Supabase Telemetry: analytics_events
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Traffic &amp; Conversion Analytics
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Verified visitor activity, session trends, conversion funnels, and button telemetry.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-2xl bg-white/[0.04] p-1 border border-white/10 backdrop-blur-md text-xs font-semibold">
            {[
              { id: "today", label: "Today" },
              { id: "7d", label: "7D" },
              { id: "30d", label: "30D" },
              { id: "90d", label: "90D" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setRange(t.id)}
                className={`rounded-xl px-3 py-1.5 transition-all text-xs ${
                  range === t.id
                    ? "bg-[#98f90d] text-[#050505] font-bold shadow-[0_0_15px_rgba(152,249,13,0.3)]"
                    : "text-gray-400 hover:text-white hover:bg-white/[0.06]"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={fetchAnalytics}
            className="rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 text-gray-400 hover:text-white hover:bg-white/[0.08] transition shadow-sm"
          >
            <RefreshCw size={15} className={loading ? "animate-spin text-[#98f90d]" : ""} />
          </button>
        </div>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-xl backdrop-blur-xl group hover:border-[#98f90d]/30 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Total Sessions</span>
            <Eye size={18} className="text-[#98f90d]" />
          </div>
          <div className="mt-3 text-3xl font-black text-white font-display">
            {kpis.totalPageViews || 0}
          </div>
          <div className="mt-1 text-xs text-gray-400 font-mono">
            Across <span className="text-[#98f90d] font-bold">{kpis.uniqueVisitors || 0}</span> unique devices
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-xl backdrop-blur-xl group hover:border-cyan-400/30 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Inquiries Received</span>
            <Users2 size={18} className="text-cyan-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-white font-display">
            {kpis.totalInquiries || 0}
          </div>
          <div className="mt-1 text-xs text-cyan-400 font-mono">
            Contact form inquiries
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-xl backdrop-blur-xl group hover:border-amber-400/30 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Meeting CTA Clicks</span>
            <Compass size={18} className="text-amber-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-white font-display">
            {kpis.meetingClicks || 0}
          </div>
          <div className="mt-1 text-xs text-amber-400 font-mono">
            Discovery call triggers
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-xl backdrop-blur-xl group hover:border-emerald-400/30 transition-all">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono tracking-wider uppercase">Conversion Rate</span>
            <TrendingUp size={18} className="text-emerald-400" />
          </div>
          <div className="mt-3 text-3xl font-black text-white font-display">
            {kpis.conversionRate || "0%"}
          </div>
          <div className="mt-1 text-xs text-emerald-400 font-mono">
            Visitor to inquiry conversion
          </div>
        </div>
      </div>

      {/* Main Traffic Chart */}
      <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-base font-bold text-white tracking-tight mb-0.5">Traffic Velocity Timeline</h2>
        <p className="text-xs text-gray-400 mb-5">Daily pageviews vs unique visitor trajectory</p>
        <DailyTrafficChart data={data?.dailyTimeline || []} />
      </div>

      {/* Grid: Popular Pages & Technology / Source Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Most Popular Pages */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
          <h2 className="text-base font-bold text-white tracking-tight mb-0.5">Most Visited Pages</h2>
          <p className="text-xs text-gray-400 mb-5">Top URL paths by verified client views</p>
          <div className="divide-y divide-white/[0.06]">
            {!data?.popularPages || data.popularPages.length === 0 ? (
              <p className="py-8 text-center text-xs font-mono text-gray-500">No page views recorded yet.</p>
            ) : (
              data.popularPages.map((p, idx) => (
                <div key={p.path} className="py-3 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 truncate">
                    <span className="flex h-5 w-5 items-center justify-center rounded-md bg-white/[0.06] text-[10px] font-mono text-gray-400">
                      {idx + 1}
                    </span>
                    <span className="font-mono text-white truncate">{p.path}</span>
                  </div>
                  <span className="font-mono font-bold text-[#98f90d] bg-[#98f90d]/10 border border-[#98f90d]/25 px-2.5 py-0.5 rounded-full text-[11px]">
                    {p.views} views
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Device Environment */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white tracking-tight mb-0.5">Device Breakdown</h2>
            <p className="text-xs text-gray-400 mb-5">Operating platform &amp; viewport breakdown</p>
            <DeviceDonut devices={data?.devices || {}} />
          </div>

          <div className="mt-6 border-t border-white/[0.08] pt-4">
            <h3 className="text-xs font-bold text-white mb-3">Top Traffic Channels</h3>
            <div className="space-y-3">
              {(data?.trafficSources || []).slice(0, 4).map((s) => (
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
    </div>
  );
}
