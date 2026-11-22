"use client";

import { useState, useEffect } from "react";
import { Users2, Search, Download, Filter, Globe, Monitor, Smartphone, Clock, Eye, Layers } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export default function VisitorsManagementPage() {
  const [visitors, setVisitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deviceFilter, setDeviceFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [selectedVisitor, setSelectedVisitor] = useState(null);

  const fetchVisitors = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      device: deviceFilter,
      source: sourceFilter,
    });

    fetch(`/api/admin/visitors?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setVisitors(data.visitors || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchVisitors();
  }, [search, deviceFilter, sourceFilter]);

  const handleExportCsv = () => {
    const query = new URLSearchParams({
      search,
      device: deviceFilter,
      source: sourceFilter,
      format: "csv",
    });
    window.location.href = `/api/admin/visitors?${query.toString()}`;
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#98f90d] uppercase">
              Supabase Live Table: visitors
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Live Website Visitors
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Privacy-compliant session telemetry, device signatures, and referral attribution.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/[0.08] hover:text-white transition shadow-sm"
        >
          <Download size={14} className="text-[#98f90d]" />
          <span>Export Visitors CSV</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by visitor IP hash, landing page, referral source..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
          />
        </div>

        <select
          value={deviceFilter}
          onChange={(e) => setDeviceFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-[#0c0e15] py-2.5 px-4 text-xs text-gray-300 focus:border-[#98f90d] focus:outline-none"
        >
          <option value="all">All Devices</option>
          <option value="Desktop">Desktop</option>
          <option value="Mobile">Mobile</option>
          <option value="Tablet">Tablet</option>
        </select>

        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-[#0c0e15] py-2.5 px-4 text-xs text-gray-300 focus:border-[#98f90d] focus:outline-none"
        >
          <option value="all">All Sources</option>
          <option value="Direct">Direct</option>
          <option value="Google">Google Search</option>
          <option value="LinkedIn">LinkedIn</option>
          <option value="Twitter">Twitter / X</option>
          <option value="GitHub">GitHub</option>
        </select>
      </div>

      {/* Visitors Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono font-bold text-gray-400 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Visitor ID / Session</th>
                <th className="py-3.5 px-4">Device &amp; OS</th>
                <th className="py-3.5 px-4">Landing Page</th>
                <th className="py-3.5 px-4">Referral Source</th>
                <th className="py-3.5 px-4">Views</th>
                <th className="py-3.5 px-4">Last Seen</th>
                <th className="py-3.5 px-5 text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500 font-mono">
                    Loading telemetry from Supabase...
                  </td>
                </tr>
              ) : visitors.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500 font-mono">
                    No visitor records found.
                  </td>
                </tr>
              ) : (
                visitors.map((v) => (
                  <tr key={v.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-mono text-xs text-white font-bold">{v.id.slice(0, 12)}...</div>
                      <div className="text-[10px] text-gray-500 font-mono">{v.ipHash || "Anonymous"}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 font-medium text-gray-300">
                        {v.device === "Mobile" ? <Smartphone size={14} className="text-cyan-400" /> : <Monitor size={14} className="text-[#98f90d]" />}
                        <span>{v.device}</span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">{v.browser || "Unknown"}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-gray-300">{v.landingPage || "/"}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block rounded-md bg-white/[0.06] px-2 py-0.5 font-mono text-[11px] text-gray-300">
                        {v.referrer || "Direct"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#98f90d]">{v.pageviewsCount || 1}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(v.lastSeen || v.createdAt).toLocaleTimeString()}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedVisitor(v)}
                        className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:bg-[#98f90d] hover:text-[#050505] transition-all"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Visitor Detail Modal */}
      {selectedVisitor && (
        <Modal
          isOpen={Boolean(selectedVisitor)}
          onClose={() => setSelectedVisitor(null)}
          title={`Session Dossier: ${selectedVisitor.id.slice(0, 16)}`}
        >
          <div className="space-y-4 text-xs text-gray-300">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Device Category</span>
                <p className="font-bold text-white mt-0.5">{selectedVisitor.device}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Browser / Engine</span>
                <p className="font-bold text-white mt-0.5">{selectedVisitor.browser || "Standard Webkit"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Entry Landing Page</span>
                <p className="font-mono text-[#98f90d] mt-0.5">{selectedVisitor.landingPage || "/"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Total Page Views</span>
                <p className="font-bold text-white mt-0.5 font-mono">{selectedVisitor.pageviewsCount || 1} pages</p>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-mono uppercase text-[10px]">User-Agent Signature</span>
              <p className="mt-1 rounded-xl bg-black/40 p-3 border border-white/[0.06] font-mono text-[11px] text-gray-400 break-all">
                {selectedVisitor.userAgent || "Mozilla/5.0 WebKit/537.36"}
              </p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
