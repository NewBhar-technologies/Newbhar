"use client";

import { useState, useEffect } from "react";
import { Zap, Plus, Play, CheckCircle2, XCircle, Clock, Trash2, ArrowRight, ToggleLeft, ToggleRight, Layers, ShieldCheck } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

const TRIGGERS = [
  { id: "contact_submit", label: "When a customer submits Contact Form" },
  { id: "new_lead", label: "When a new Lead is created" },
  { id: "meeting_booked", label: "When a Meeting is confirmed" },
  { id: "lead_followup", label: "When a Lead follow-up is due" },
  { id: "project_completed", label: "When a Project is marked Completed" },
];

export default function AutomationsManagementPage() {
  const [automations, setAutomations] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [testingTrigger, setTestingTrigger] = useState(null);

  const [form, setForm] = useState({
    name: "",
    trigger: "contact_submit",
    description: "",
  });

  const fetchAutomations = () => {
    setLoading(true);
    fetch("/api/admin/automations")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setAutomations(data.automations || []);
          setLogs(data.logs || []);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleToggle = async (id, currentEnabled) => {
    try {
      await fetch("/api/admin/automations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled: !currentEnabled }),
      });
      fetchAutomations();
    } catch {}
  };

  const handleTestTrigger = async (trigger) => {
    setTestingTrigger(trigger);
    try {
      const res = await fetch("/api/admin/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "test_trigger",
          trigger,
          testPayload: {
            name: "Automated Verification Test",
            email: "qa-test@newbhar.com",
            service: "Software Development",
            companyName: "Newbhar Technologies Lab",
          },
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert("Workflow test trigger executed successfully! Check execution audit trail.");
        fetchAutomations();
      }
    } catch {}
    setTestingTrigger(null);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/automations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowCreateModal(false);
        setForm({ name: "", trigger: "contact_submit", description: "" });
        fetchAutomations();
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/automations?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchAutomations();
    } catch {}
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Workflow Orchestration</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Automations & Event Triggers
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Event-driven triggers, automated lead creation, in-app admin alerts, and email notifications.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>New Workflow</span>
        </button>
      </div>

      {/* Active Workflows Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Scanning event listeners...</span>
            </div>
          </div>
        ) : automations.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No active workflows configured.
          </div>
        ) : (
          automations.map((aut) => (
            <div
              key={aut.id}
              className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between ${
                aut.enabled
                  ? "bg-[#0f111a]/90 border-white/10 hover:border-[#98f90d]/30"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d]">
                      <Zap size={17} />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{aut.name}</h3>
                      <span className="text-[10px] font-mono font-semibold text-[#98f90d] uppercase">
                        Trigger: {aut.trigger.replace(/_/g, " ")}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleToggle(aut.id, aut.enabled)}
                    className="text-neutral-400 hover:text-white transition"
                    title={aut.enabled ? "Disable workflow" : "Enable workflow"}
                  >
                    {aut.enabled ? (
                      <ToggleRight size={28} className="text-[#98f90d]" />
                    ) : (
                      <ToggleLeft size={28} className="text-neutral-600" />
                    )}
                  </button>
                </div>

                <p className="mt-3 text-xs text-neutral-300 leading-relaxed">{aut.description}</p>

                {/* Actions flow */}
                <div className="mt-4 rounded-2xl bg-black/40 p-3.5 border border-white/10">
                  <span className="text-[10px] font-mono font-bold text-neutral-500 uppercase mb-2 block">
                    Execution Pipeline
                  </span>
                  <div className="space-y-1.5">
                    {(aut.actions || []).map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-neutral-300">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#98f90d]" />
                        <span className="capitalize">{action.type.replace(/_/g, " ")}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3 text-xs">
                <span className="text-neutral-400 font-mono text-[11px]">
                  Fired {aut.executionCount || 0} times
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleTestTrigger(aut.trigger)}
                    disabled={testingTrigger === aut.trigger}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition"
                  >
                    <Play size={11} className={`text-[#98f90d] ${testingTrigger === aut.trigger ? "animate-spin" : ""}`} />
                    <span>Test Run</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(aut.id)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Execution Logs */}
      <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl">
        <h2 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Execution Audit Trail</h2>
        <p className="text-xs text-neutral-400 mb-4">Real-time workflow execution telemetry</p>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-2.5 px-3 font-semibold">Workflow</th>
                <th className="py-2.5 px-3 font-semibold">Trigger Event</th>
                <th className="py-2.5 px-3 font-semibold">Status</th>
                <th className="py-2.5 px-3 font-semibold">Details</th>
                <th className="py-2.5 px-3 font-semibold">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-neutral-400">No logs recorded yet.</td>
                </tr>
              ) : (
                logs.slice(0, 10).map((l) => (
                  <tr key={l.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-2.5 px-3 font-bold text-white">{l.automationName}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-400">{l.trigger}</td>
                    <td className="py-2.5 px-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                        l.status === "success"
                          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                          : "border-rose-500/30 bg-rose-500/10 text-rose-400"
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-neutral-300">{l.details}</td>
                    <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-400">
                      {new Date(l.timestamp).toLocaleTimeString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create Workflow Automation"
        >
          <form onSubmit={handleCreate} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Workflow Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Inbound Fast Auto-Lead"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Trigger Event *</label>
              <select
                value={form.trigger}
                onChange={(e) => setForm({ ...form, trigger: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                {TRIGGERS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0f111a]">{t.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Workflow Description</label>
              <textarea
                rows={3}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Describe intended actions, follow-ups, and notifications..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="rounded-xl px-4 py-2 font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#98f90d] px-5 py-2 font-bold text-black hover:bg-[#86dc0b] transition-all"
              >
                Save Automation
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Workflow"
        message="Are you sure you want to delete this automation?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
