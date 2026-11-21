"use client";

import { useState, useEffect } from "react";
import { Mail, Send, RotateCcw, AlertTriangle, CheckCircle2, Clock, XCircle, Search, Plus, FileCode, ArrowUpRight } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export default function EmailsManagementPage() {
  const [emails, setEmails] = useState([]);
  const [provider, setProvider] = useState({ configured: false, status: "" });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [templates, setTemplates] = useState([]);
  const [retryingId, setRetryingId] = useState(null);

  const [composeForm, setComposeForm] = useState({
    to: "",
    subject: "",
    category: "Follow-up Emails",
    body: "",
  });

  const fetchEmails = () => {
    setLoading(true);
    fetch(`/api/admin/emails?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEmails(data.emails || []);
          if (data.provider) setProvider(data.provider);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchEmails();
    fetch("/api/admin/templates")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplates(data.templates || []);
      })
      .catch(() => {});
  }, [statusFilter]);

  const handleApplyTemplate = (templateId) => {
    const tpl = templates.find((t) => t.id === templateId);
    if (!tpl) return;
    setComposeForm({
      ...composeForm,
      subject: tpl.subject,
      body: tpl.content,
      category: tpl.category || composeForm.category,
    });
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(composeForm),
      });
      const data = await res.json();
      if (data.success) {
        setShowComposeModal(false);
        setComposeForm({ to: "", subject: "", category: "Follow-up Emails", body: "" });
        fetchEmails();
      }
    } catch {}
  };

  const handleRetry = async (emailId) => {
    setRetryingId(emailId);
    try {
      await fetch("/api/admin/emails", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "retry", emailId }),
      });
      fetchEmails();
    } catch {}
    setRetryingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Outbound Channels</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Transactional Email Logs
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Corporate message dispatch, template auto-responders, and deliverability telemetry.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowComposeModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Send size={14} />
          <span>Compose Email</span>
        </button>
      </div>

      {/* Provider Status Banner */}
      <div
        className={`rounded-3xl border p-4 text-xs flex items-center justify-between shadow-2xl backdrop-blur-xl ${
          provider.configured
            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
            : "border-amber-500/30 bg-amber-500/10 text-amber-300"
        }`}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/40 border border-white/10 shrink-0">
            {provider.configured ? (
              <CheckCircle2 size={18} className="text-[#98f90d]" />
            ) : (
              <AlertTriangle size={18} className="text-amber-400" />
            )}
          </div>
          <div>
            <div className="font-bold text-white">Transactional Provider (Resend): {provider.status}</div>
            <div className="text-[11px] text-neutral-300 mt-0.5">
              {provider.configured
                ? "Live verified API integration active for outgoing enterprise communications."
                : "Outgoing emails require a valid RESEND_API_KEY in your deployment environment."}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "sent", "failed", "draft"].map((st) => (
          <button
            key={st}
            type="button"
            onClick={() => setStatusFilter(st)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all border ${
              statusFilter === st
                ? "border-[#98f90d] bg-[#98f90d]/15 text-[#98f90d]"
                : "border-white/10 bg-[#0f111a]/90 text-neutral-400 hover:text-white hover:border-white/20"
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Emails Log Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Recipient</th>
                <th className="py-3.5 px-4 font-semibold">Subject & Category</th>
                <th className="py-3.5 px-4 font-semibold">Delivery Status</th>
                <th className="py-3.5 px-4 font-semibold">Provider Response</th>
                <th className="py-3.5 px-4 font-semibold">Sent At</th>
                <th className="py-3.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
                      <span>Reading outbound dispatch logs...</span>
                    </div>
                  </td>
                </tr>
              ) : emails.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No email delivery logs recorded in this period.
                  </td>
                </tr>
              ) : (
                emails.map((e) => (
                  <tr key={e.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-white">{e.to}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white">{e.subject}</div>
                      <span className="text-[10px] text-neutral-400">{e.category}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          e.status === "sent"
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : e.status === "failed"
                            ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
                            : "border-neutral-500/30 bg-neutral-500/10 text-neutral-300"
                        }`}
                      >
                        {e.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px] max-w-[220px] truncate" title={e.providerResponse}>
                      {e.providerResponse || "No error"}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-400 font-mono text-[11px]">
                      {e.sentAt ? new Date(e.sentAt).toLocaleString() : "Not sent"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {e.status === "failed" && (
                        <button
                          type="button"
                          onClick={() => handleRetry(e.id)}
                          disabled={retryingId === e.id}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/20 transition"
                        >
                          <RotateCcw size={12} className={retryingId === e.id ? "animate-spin" : ""} />
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Compose Modal */}
      {showComposeModal && (
        <Modal
          isOpen={showComposeModal}
          onClose={() => setShowComposeModal(false)}
          title="Compose Corporate Email"
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSendEmail} className="space-y-4 text-xs">
            {templates.length > 0 && (
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Load From Existing Template</label>
                <select
                  onChange={(e) => handleApplyTemplate(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  <option value="" className="bg-[#0f111a]">Select a pre-configured template...</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0f111a]">{t.name} ({t.category})</option>
                  ))}
                </select>
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Recipient Email *</label>
              <input
                type="email"
                required
                value={composeForm.to}
                onChange={(e) => setComposeForm({ ...composeForm, to: e.target.value })}
                placeholder="client@company.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Subject Line *</label>
              <input
                type="text"
                required
                value={composeForm.subject}
                onChange={(e) => setComposeForm({ ...composeForm, subject: e.target.value })}
                placeholder="e.g. Following up on your software modernization inquiry"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Message Body *</label>
              <textarea
                rows={7}
                required
                value={composeForm.body}
                onChange={(e) => setComposeForm({ ...composeForm, body: e.target.value })}
                placeholder="Dear client, ..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowComposeModal(false)}
                className="rounded-xl px-4 py-2 font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#98f90d] px-5 py-2 font-bold text-black hover:bg-[#86dc0b] transition-all"
              >
                <Send size={13} />
                <span>Dispatch Email</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
