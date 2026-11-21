"use client";

import { useState, useEffect } from "react";
import { Mail, Search, Download, Trash2, Edit3, MessageSquare, Plus, ArrowRight, UserCheck, Calendar, Sparkles } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

const STATUS_COLORS = {
  new: "bg-[#98f90d]/10 text-[#98f90d] border-[#98f90d]/30 font-bold shadow-[0_0_8px_rgba(152,249,13,0.15)]",
  contacted: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
  qualified: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  meeting_scheduled: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  proposal_sent: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  converted: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 font-bold",
  lost: "bg-gray-500/10 text-gray-400 border-gray-500/20",
  archived: "bg-gray-800/20 text-gray-500 border-white/5",
};

export default function ContactsManagementPage() {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedContact, setSelectedContact] = useState(null);
  const [noteInput, setNoteInput] = useState("");
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const fetchContacts = () => {
    setLoading(true);
    const query = new URLSearchParams({ search, status: statusFilter });
    fetch(`/api/admin/contacts?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setContacts(data.contacts || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchContacts();
  }, [search, statusFilter]);

  const handleUpdateStatus = async (contactId, newStatus) => {
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: contactId, status: newStatus }),
      });
      if (res.ok) {
        fetchContacts();
        if (selectedContact?.id === contactId) {
          setSelectedContact({ ...selectedContact, status: newStatus });
        }
      }
    } catch {}
  };

  const handleAddNote = async () => {
    if (!noteInput.trim() || !selectedContact) return;
    try {
      const res = await fetch("/api/admin/contacts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedContact.id, noteText: noteInput }),
      });
      const data = await res.json();
      if (data.success) {
        setNoteInput("");
        setSelectedContact(data.contact);
        fetchContacts();
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/contacts?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      if (selectedContact?.id === deleteTargetId) setSelectedContact(null);
      fetchContacts();
    } catch {}
  };

  return (
    <div className="space-y-6 text-white">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono font-bold tracking-widest text-[#98f90d] uppercase">
              Supabase Live Table: contacts
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Inquiry &amp; Client Leads
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Real incoming inquiries from the Newbhar Technologies website contact form.
          </p>
        </div>

        <a
          href={`/api/admin/contacts?format=csv&search=${encodeURIComponent(search)}&status=${statusFilter}`}
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-bold text-gray-300 hover:bg-white/[0.08] hover:text-white transition shadow-sm"
        >
          <Download size={14} className="text-[#98f90d]" />
          <span>Export CSV</span>
        </a>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-3 rounded-3xl border border-white/10 bg-[#0f111a]/90 p-4 shadow-xl backdrop-blur-xl">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={16} className="absolute inset-y-0 left-3.5 my-auto text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search inquiries by client name, email, company, service..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:bg-white/[0.05] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-2xl border border-white/10 bg-[#0c0e15] py-2.5 px-4 text-xs text-gray-300 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d]"
        >
          <option value="all">All Statuses</option>
          <option value="new">New</option>
          <option value="contacted">Contacted</option>
          <option value="qualified">Qualified</option>
          <option value="meeting_scheduled">Meeting Scheduled</option>
          <option value="proposal_sent">Proposal Sent</option>
          <option value="converted">Converted</option>
          <option value="lost">Lost</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Contacts Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/[0.08] bg-white/[0.02] font-mono font-bold text-gray-400 uppercase text-[11px]">
              <tr>
                <th className="py-3.5 px-5">Client / Inquirer</th>
                <th className="py-3.5 px-4">Service</th>
                <th className="py-3.5 px-4">Message Snippet</th>
                <th className="py-3.5 px-4">Submitted</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.06] font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500 font-mono">
                    Loading inquiries from Supabase...
                  </td>
                </tr>
              ) : contacts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500 font-mono">
                    No contact inquiries found.
                  </td>
                </tr>
              ) : (
                contacts.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-5">
                      <div className="font-bold text-white text-sm">{c.name}</div>
                      <div className="text-[11px] text-gray-400 font-mono">
                        <a href={`mailto:${c.email}`} className="hover:text-[#98f90d] transition">
                          {c.email}
                        </a>
                      </div>
                      {c.companyName && (
                        <span className="text-[10px] text-gray-500 font-medium">({c.companyName})</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 font-medium">{c.service}</td>
                    <td className="py-3.5 px-4 text-gray-400 max-w-[240px] truncate" title={c.message}>
                      {c.message}
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={c.status}
                        onChange={(e) => handleUpdateStatus(c.id, e.target.value)}
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-mono font-bold focus:outline-none ${
                          STATUS_COLORS[c.status] || "bg-white/5 text-gray-400 border-white/10"
                        }`}
                      >
                        <option value="new" className="bg-[#0c0e15] text-[#98f90d]">New</option>
                        <option value="contacted" className="bg-[#0c0e15] text-cyan-400">Contacted</option>
                        <option value="qualified" className="bg-[#0c0e15] text-purple-400">Qualified</option>
                        <option value="meeting_scheduled" className="bg-[#0c0e15] text-amber-400">Meeting Scheduled</option>
                        <option value="proposal_sent" className="bg-[#0c0e15] text-indigo-400">Proposal Sent</option>
                        <option value="converted" className="bg-[#0c0e15] text-emerald-400">Converted</option>
                        <option value="lost" className="bg-[#0c0e15] text-gray-400">Lost</option>
                        <option value="archived" className="bg-[#0c0e15] text-gray-500">Archived</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedContact(c)}
                          className="rounded-xl bg-white/[0.04] border border-white/10 px-3 py-1.5 text-[11px] font-bold text-gray-300 hover:bg-[#98f90d] hover:text-[#050505] hover:border-[#98f90d] transition-all"
                        >
                          View Dossier
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(c.id)}
                          className="rounded-xl p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                          title="Delete inquiry"
                        >
                          <Trash2 size={15} />
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

      {/* Inquiry Detail Modal */}
      {selectedContact && (
        <Modal
          isOpen={Boolean(selectedContact)}
          onClose={() => setSelectedContact(null)}
          title={`Inquiry Dossier: ${selectedContact.name}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-5 text-xs text-gray-300">
            <div className="grid grid-cols-2 gap-3 rounded-2xl bg-white/[0.03] p-4 border border-white/[0.08]">
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Email Address</span>
                <p className="font-semibold text-white mt-0.5">
                  <a href={`mailto:${selectedContact.email}`} className="text-[#98f90d] hover:underline font-mono">
                    {selectedContact.email}
                  </a>
                </p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Source Page</span>
                <p className="font-semibold text-white mt-0.5 font-mono">{selectedContact.sourcePage || "/contact"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Company Name</span>
                <p className="font-semibold text-white mt-0.5">{selectedContact.companyName || "Not specified"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Requested Service</span>
                <p className="font-semibold text-[#98f90d] mt-0.5">{selectedContact.service || "General Inquiry"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Budget Range</span>
                <p className="font-semibold text-white mt-0.5">{selectedContact.budget || "Flexible / Not provided"}</p>
              </div>
              <div>
                <span className="text-gray-500 font-mono uppercase text-[10px]">Project Timeline</span>
                <p className="font-semibold text-white mt-0.5">{selectedContact.timeline || "Not specified"}</p>
              </div>
            </div>

            <div>
              <span className="text-gray-500 font-mono uppercase text-[10px]">Inquiry Message Body</span>
              <div className="mt-1.5 rounded-2xl bg-black/40 p-4 border border-white/[0.08] text-gray-200 whitespace-pre-wrap leading-relaxed text-xs">
                {selectedContact.message}
              </div>
            </div>

            {/* Internal Notes Section */}
            <div>
              <span className="text-gray-500 font-mono uppercase text-[10px]">Internal Team Notes</span>
              <div className="mt-2 space-y-2 max-h-36 overflow-y-auto">
                {(!selectedContact.notes || selectedContact.notes.length === 0) ? (
                  <p className="text-gray-500 text-[11px] italic">No team notes logged yet.</p>
                ) : (
                  selectedContact.notes.map((n, idx) => (
                    <div key={idx} className="rounded-xl bg-white/[0.03] p-2.5 border border-white/[0.06] text-[11px]">
                      <div className="flex justify-between text-gray-500 text-[10px] font-mono mb-1">
                        <span>{n.author || "Admin"}</span>
                        <span>{new Date(n.timestamp || Date.now()).toLocaleDateString()}</span>
                      </div>
                      <p className="text-gray-200">{n.text}</p>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  type="text"
                  value={noteInput}
                  onChange={(e) => setNoteInput(e.target.value)}
                  placeholder="Add an internal note about this client..."
                  className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAddNote();
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddNote}
                  className="rounded-xl bg-[#98f90d] px-4 py-2 text-xs font-bold text-[#050505] hover:bg-[#86e00b] transition"
                >
                  Save Note
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Contact Inquiry"
        message="Are you sure you want to delete this contact submission? This action will permanently remove it from Supabase."
        confirmText="Delete Record"
        isDanger={true}
      />
    </div>
  );
}
