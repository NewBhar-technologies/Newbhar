"use client";

import { useState, useEffect } from "react";
import { ShieldCheck, Download, Search, Filter, AlertTriangle, CheckCircle2, XCircle, Clock, User, Terminal } from "lucide-react";

export default function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moduleFilter, setModuleFilter] = useState("all");
  const [resultFilter, setResultFilter] = useState("all");

  const fetchLogs = () => {
    setLoading(true);
    const query = new URLSearchParams({
      search,
      module: moduleFilter,
      result: resultFilter,
    });

    fetch(`/api/admin/audit-logs?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [search, moduleFilter, resultFilter]);

  const handleExportCsv = () => {
    const query = new URLSearchParams({
      search,
      module: moduleFilter,
      result: resultFilter,
      format: "csv",
    });
    window.location.href = `/api/admin/audit-logs?${query.toString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Immutable Ledger</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Security & Audit Trail
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Tamper-evident log stream capturing administrative mutations, authorization events, and system changes.
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
        >
          <Download size={14} className="text-[#98f90d]" />
          <span>Export Audit CSV</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute inset-y-0 left-3.5 my-auto text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search action, admin email, IP, or payload..."
            className="w-full rounded-xl border border-white/10 bg-black/40 py-2 pl-10 pr-3 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
          />
        </div>

        <select
          value={moduleFilter}
          onChange={(e) => setModuleFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 py-2 px-3 text-xs text-neutral-300 focus:border-[#98f90d] focus:outline-none"
        >
          <option value="all">All Modules</option>
          <option value="AUTH">Authentication (AUTH)</option>
          <option value="CMS">Content (CMS)</option>
          <option value="CONTACTS">Contacts</option>
          <option value="LEADS">Leads</option>
          <option value="USERS">Users</option>
          <option value="BACKUPS">Backups</option>
          <option value="SETTINGS">Settings</option>
        </select>

        <select
          value={resultFilter}
          onChange={(e) => setResultFilter(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/40 py-2 px-3 text-xs text-neutral-300 focus:border-[#98f90d] focus:outline-none"
        >
          <option value="all">All Outcomes</option>
          <option value="success">Success</option>
          <option value="failure">Failure / Locked</option>
          <option value="warning">Warning</option>
        </select>
      </div>

      {/* Logs Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Module</th>
                <th className="py-3.5 px-4 font-semibold">Admin Subject</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
                <th className="py-3.5 px-4 font-semibold">Result</th>
                <th className="py-3.5 px-4 font-semibold">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
                      <span>Reading audit streams from Supabase...</span>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-400">
                    No matching audit logs recorded in telemetry.
                  </td>
                </tr>
              ) : (
                logs.map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-400 whitespace-nowrap">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white font-mono text-[11px] flex items-center gap-2">
                      <Terminal size={13} className="text-[#98f90d]" />
                      <span>{l.action}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 font-mono text-[10px] text-neutral-300">
                        {l.module}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">{l.adminEmail}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">{l.ip}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          l.result === "success"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : l.result === "warning"
                            ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
                            : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                        }`}
                      >
                        {l.result}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-300 max-w-xs truncate" title={l.details}>
                      {l.details}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
