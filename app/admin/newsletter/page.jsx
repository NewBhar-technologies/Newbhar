"use client";

import { useState, useEffect } from "react";
import { Newspaper, Plus, Trash2, Mail, CheckCircle2, UserX } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export default function NewsletterManagementPage() {
  const [subscribers, setSubscribers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");

  const fetchSubscribers = () => {
    setLoading(true);
    fetch("/api/admin/newsletter")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSubscribers(data.subscribers || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSubscribers();
  }, []);

  const handleAddSubscriber = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      const res = await fetch("/api/admin/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail }),
      });
      if (res.ok) {
        setShowModal(false);
        setNewEmail("");
        fetchSubscribers();
      }
    } catch {}
  };

  const handleRemove = async (id) => {
    try {
      await fetch(`/api/admin/newsletter?id=${id}`, { method: "DELETE" });
      fetchSubscribers();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Audience Retention</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Newsletter Subscribers
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Engineering digests, architecture updates, and marketing opt-in consent records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Subscriber</span>
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Subscriber Email</th>
                <th className="py-3.5 px-4 font-semibold">Subscribed Date</th>
                <th className="py-3.5 px-4 font-semibold">Campaigns Dispatched</th>
                <th className="py-3.5 px-4 font-semibold">Subscription State</th>
                <th className="py-3.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
                      <span>Reading subscriber roster...</span>
                    </div>
                  </td>
                </tr>
              ) : subscribers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-neutral-400">No subscribers registered yet.</td>
                </tr>
              ) : (
                subscribers.map((s) => (
                  <tr key={s.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-white">{s.email}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {new Date(s.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-neutral-300">{s.campaignsReceived || 0}</td>
                    <td className="py-3.5 px-4">
                      <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400 uppercase">
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleRemove(s.id)}
                        className="rounded-lg p-1.5 text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        title="Unsubscribe / Remove"
                      >
                        <UserX size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Add Verified Subscriber"
        >
          <form onSubmit={handleAddSubscriber} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Subscriber Email Address *</label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="subscriber@enterprise.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2 font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#98f90d] px-5 py-2 font-bold text-black hover:bg-[#86dc0b] transition-all"
              >
                Add Subscriber
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
