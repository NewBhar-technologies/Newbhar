"use client";

import { useState, useEffect } from "react";
import { CalendarCheck, Plus, Clock, Video, CheckCircle2, XCircle, Edit3, Trash2, Link as LinkIcon, Compass, ArrowUpRight } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

const STATUS_COLORS = {
  confirmed: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400",
  requested: "border-amber-500/30 bg-amber-500/10 text-amber-400",
  rescheduled: "border-violet-500/30 bg-violet-500/10 text-violet-400",
  completed: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  cancelled: "border-neutral-500/30 bg-neutral-500/10 text-neutral-400",
};

export default function MeetingsManagementPage() {
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    clientName: "",
    clientEmail: "",
    date: new Date().toISOString().split("T")[0],
    time: "14:00",
    durationMinutes: 30,
    meetingLink: "https://calendly.com/team-newbhar/30min",
    notes: "",
  });

  const fetchMeetings = () => {
    setLoading(true);
    fetch(`/api/admin/meetings?status=${statusFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setMeetings(data.meetings || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchMeetings();
  }, [statusFilter]);

  const handleScheduleMeeting = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowScheduleModal(false);
        setForm({
          title: "",
          clientName: "",
          clientEmail: "",
          date: new Date().toISOString().split("T")[0],
          time: "14:00",
          durationMinutes: 30,
          meetingLink: "https://calendly.com/team-newbhar/30min",
          notes: "",
        });
        fetchMeetings();
      }
    } catch {}
  };

  const handleUpdateStatus = async (meetingId, newStatus) => {
    try {
      const res = await fetch("/api/admin/meetings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: meetingId, status: newStatus }),
      });
      if (res.ok) fetchMeetings();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/meetings?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchMeetings();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Consultation Pipelines</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Bookings & Consultations
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Technical discovery calls, architecture reviews, and client advisory appointments.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowScheduleModal(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Schedule Session</span>
        </button>
      </div>

      {/* Calendly Integration Notice Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 text-xs text-neutral-300 shadow-xl backdrop-blur-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#98f90d]/10 text-[#98f90d] border border-[#98f90d]/20 shrink-0">
            <Compass size={18} />
          </div>
          <div>
            <span className="font-bold text-white">Calendly Scheduler Integrated:</span>{" "}
            <span className="text-neutral-400">Public booking link is enabled across your hero, pricing, and contact pages.</span>
          </div>
        </div>
        <a
          href="https://calendly.com/team-newbhar/30min"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-[#98f90d] hover:bg-white/10 transition-all shrink-0"
        >
          <span>Open Booking Page</span>
          <ArrowUpRight size={14} />
        </a>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", "confirmed", "requested", "rescheduled", "completed", "cancelled"].map((st) => (
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

      {/* Meetings Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Session Title</th>
                <th className="py-3.5 px-4 font-semibold">Client / Inquirer</th>
                <th className="py-3.5 px-4 font-semibold">Date & Time</th>
                <th className="py-3.5 px-4 font-semibold">Meeting Link</th>
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
                      <span>Fetching appointments from database...</span>
                    </div>
                  </td>
                </tr>
              ) : meetings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    No scheduled meetings matching current filter.
                  </td>
                </tr>
              ) : (
                meetings.map((m) => (
                  <tr key={m.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 font-bold text-white">{m.title}</td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{m.clientName}</div>
                      <div className="text-[11px] text-neutral-400 font-mono">{m.clientEmail}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">
                      <div className="flex items-center gap-1.5 font-bold text-white">
                        <Clock size={13} className="text-[#98f90d]" />
                        <span>{m.date} at {m.time}</span>
                      </div>
                      <span className="text-[10px] text-neutral-500">{m.durationMinutes} mins</span>
                    </td>
                    <td className="py-3.5 px-4">
                      {m.meetingLink ? (
                        <a
                          href={m.meetingLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 font-mono text-[11px] transition-colors"
                        >
                          <Video size={13} />
                          <span>Join Room</span>
                          <ArrowUpRight size={12} />
                        </a>
                      ) : (
                        <span className="text-neutral-500">Direct Call</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={m.status}
                        onChange={(e) => handleUpdateStatus(m.id, e.target.value)}
                        className={`rounded-xl border px-3 py-1 text-[11px] font-semibold capitalize focus:outline-none bg-black/40 ${STATUS_COLORS[m.status] || "border-white/10 text-neutral-300"}`}
                      >
                        <option value="confirmed" className="bg-[#0f111a] text-white">Confirmed</option>
                        <option value="requested" className="bg-[#0f111a] text-white">Requested</option>
                        <option value="rescheduled" className="bg-[#0f111a] text-white">Rescheduled</option>
                        <option value="completed" className="bg-[#0f111a] text-white">Completed</option>
                        <option value="cancelled" className="bg-[#0f111a] text-white">Cancelled</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setDeleteTargetId(m.id)}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-rose-500/10 hover:text-rose-400 transition"
                        title="Remove booking"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Schedule Meeting Modal */}
      {showScheduleModal && (
        <Modal
          isOpen={showScheduleModal}
          onClose={() => setShowScheduleModal(false)}
          title="Schedule New Client Meeting"
        >
          <form onSubmit={handleScheduleMeeting} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Meeting Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Discovery & Technical Architecture Review"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Client Name *</label>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="e.g. David Vance"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Client Email</label>
                <input
                  type="email"
                  value={form.clientEmail}
                  onChange={(e) => setForm({ ...form, clientEmail: e.target.value })}
                  placeholder="client@company.com"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Date *</label>
                <input
                  type="date"
                  required
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Time *</label>
                <input
                  type="time"
                  required
                  value={form.time}
                  onChange={(e) => setForm({ ...form, time: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Duration (Mins)</label>
                <input
                  type="number"
                  value={form.durationMinutes}
                  onChange={(e) => setForm({ ...form, durationMinutes: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Meeting Link (Meet / Zoom / Calendly)</label>
              <input
                type="text"
                value={form.meetingLink}
                onChange={(e) => setForm({ ...form, meetingLink: e.target.value })}
                placeholder="https://meet.google.com/xyz or calendly url"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Agenda / Meeting Notes</label>
              <textarea
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
                placeholder="Key goals, architecture requirements..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowScheduleModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#98f90d] px-5 py-2 text-xs font-bold text-black hover:bg-[#86dc0b] transition-all"
              >
                Schedule Session
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete / Cancel Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Remove Meeting"
        message="Are you sure you want to remove this meeting record from the ledger?"
        confirmText="Remove"
        isDanger={true}
      />
    </div>
  );
}
