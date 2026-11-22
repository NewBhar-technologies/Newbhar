"use client";

import { useState, useEffect } from "react";
import { HardDrive, Plus, Download, RotateCcw, CheckCircle2, AlertTriangle, ShieldCheck, Clock } from "lucide-react";
import { ConfirmDialog } from "@/components/admin/modal";

export default function BackupManagementPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [restoreTargetId, setRestoreTargetId] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const [message, setMessage] = useState("");

  const fetchBackups = () => {
    setLoading(true);
    fetch("/api/admin/backups")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setBackups(data.backups || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchBackups();
  }, []);

  const handleCreateBackup = async () => {
    setCreating(true);
    setMessage("");
    try {
      const res = await fetch("/api/admin/backups", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setMessage(`Snapshot ${data.backup?.filename} captured and saved.`);
        fetchBackups();
      } else {
        alert(data.error || "Backup failed.");
      }
    } catch {
      alert("Failed to communicate with backup engine.");
    }
    setCreating(false);
  };

  const handleRestore = async () => {
    if (!restoreTargetId) return;
    setRestoring(true);
    try {
      const res = await fetch("/api/admin/backups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "restore", backupId: restoreTargetId }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Database successfully restored from snapshot!");
        setRestoreTargetId(null);
        fetchBackups();
      } else {
        alert(data.error || "Restore failed.");
      }
    } catch {
      alert("Failed to communicate with restore service.");
    }
    setRestoring(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Disaster Recovery</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Database Snapshots & Backups
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Full-system data snapshots, point-in-time state restores, and offline JSON archive exports.
          </p>
        </div>

        <button
          type="button"
          onClick={handleCreateBackup}
          disabled={creating}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-5 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)] disabled:opacity-50"
        >
          <Plus size={15} className={creating ? "animate-spin" : ""} />
          <span>{creating ? "Taking Snapshot..." : "Create Full Backup"}</span>
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{message}</span>
        </div>
      )}

      {/* Info Card */}
      <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d] shrink-0">
            <HardDrive size={20} />
          </div>
          <div>
            <h3 className="font-bold text-white">Full-Schema Persistence Snapshot</h3>
            <p className="text-neutral-400 text-[11px] mt-0.5">
              Snapshots capture all CMS pages, contacts, CRM leads, projects, meetings, analytics events, and security audit logs.
            </p>
          </div>
        </div>
      </div>

      {/* Backups Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Snapshot Filename</th>
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">File Size</th>
                <th className="py-3.5 px-4 font-semibold">Captured Records</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
                      <span>Scanning backup snapshots...</span>
                    </div>
                  </td>
                </tr>
              ) : backups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No snapshots created yet. Click &ldquo;Create Full Backup&rdquo; to generate one.
                  </td>
                </tr>
              ) : (
                backups.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{b.filename}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {new Date(b.timestamp).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      {(b.size / 1024).toFixed(1)} KB
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 text-[11px]">
                      {b.recordCounts ? (
                        <span>
                          {b.recordCounts.contacts || 0} contacts · {b.recordCounts.leads || 0} leads · {b.recordCounts.projects || 0} projects
                        </span>
                      ) : (
                        "Full database"
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={`/api/admin/backups?download=${b.id}`}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition"
                          title="Download snapshot JSON"
                        >
                          <Download size={13} className="text-[#98f90d]" />
                          <span>Download</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => setRestoreTargetId(b.id)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition"
                        >
                          <RotateCcw size={13} />
                          <span>Restore</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Restore Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(restoreTargetId)}
        onClose={() => setRestoreTargetId(null)}
        onConfirm={handleRestore}
        title="Restore Database from Snapshot"
        message="Warning: Restoring will overwrite the active database records with this snapshot state. Are you sure you want to proceed?"
        confirmText="Confirm Restore"
        isDanger={true}
        isLoading={restoring}
      />
    </div>
  );
}
