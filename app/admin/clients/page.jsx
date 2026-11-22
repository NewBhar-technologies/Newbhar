"use client";

import { useState, useEffect } from "react";
import { Building2, Plus, Search, Edit3, Trash2, FolderKanban, Mail, CheckCircle2, Sparkles } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

export default function ClientsManagementPage() {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingClient, setEditingClient] = useState(null);

  const [form, setForm] = useState({
    name: "",
    contactPerson: "",
    email: "",
    industry: "Enterprise Software",
    totalValue: 30000,
    status: "active",
    notes: "",
  });

  const fetchClients = () => {
    setLoading(true);
    fetch(`/api/admin/clients?search=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setClients(data.clients || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchClients();
  }, [search]);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingClient ? "PATCH" : "POST";
    const body = editingClient ? { id: editingClient.id, ...form } : form;

    try {
      const res = await fetch("/api/admin/clients", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingClient(null);
        setForm({
          name: "",
          contactPerson: "",
          email: "",
          industry: "Enterprise Software",
          totalValue: 30000,
          status: "active",
          notes: "",
        });
        fetchClients();
      }
    } catch {}
  };

  const handleEdit = (client) => {
    setEditingClient(client);
    setForm({
      name: client.name,
      contactPerson: client.contactPerson || "",
      email: client.email || "",
      industry: client.industry || "Enterprise Software",
      totalValue: client.totalValue || 0,
      status: client.status || "active",
      notes: client.notes || "",
    });
    setShowModal(true);
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/clients?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchClients();
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
              Supabase Live Table: clients
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-display">
            Corporate Client Directory
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Enterprise customer accounts, account values, active contracts, and points of contact.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingClient(null);
            setForm({
              name: "",
              contactPerson: "",
              email: "",
              industry: "Enterprise Software",
              totalValue: 30000,
              status: "active",
              notes: "",
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-full bg-[#98f90d] px-4 py-2.5 text-xs font-black tracking-wider uppercase text-[#050505] hover:bg-[#86e00b] transition shadow-[0_0_15px_rgba(152,249,13,0.3)]"
        >
          <Plus size={16} />
          <span>Add Client Dossier</span>
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
            placeholder="Search corporate accounts by organization, contact person, email..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-gray-500">
            Loading corporate accounts from Supabase...
          </div>
        ) : clients.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs font-mono text-gray-500">
            No corporate clients registered yet. Click &ldquo;Add Client Dossier&rdquo; to register an account.
          </div>
        ) : (
          clients.map((c) => (
            <div
              key={c.id}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-6 shadow-2xl backdrop-blur-xl flex flex-col justify-between hover:border-[#98f90d]/40 transition-all group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04] border border-white/10 text-white font-black text-sm">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-extrabold text-base text-white group-hover:text-[#98f90d] transition">
                        {c.name}
                      </h3>
                      <p className="text-[11px] text-gray-400 font-mono">{c.industry}</p>
                    </div>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-mono font-bold capitalize border ${
                      c.status === "active"
                        ? "bg-[#98f90d]/10 text-[#98f90d] border-[#98f90d]/30"
                        : "bg-white/5 text-gray-400 border-white/10"
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <div className="space-y-1.5 my-4 text-xs text-gray-300">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Key Contact:</span>
                    <span className="font-medium text-white">{c.contactPerson || "Lead Executive"}</span>
                  </div>
                  <div className="flex justify-between font-mono">
                    <span className="text-gray-500">Email:</span>
                    <a href={`mailto:${c.email}`} className="text-[#98f90d] hover:underline">
                      {c.email}
                    </a>
                  </div>
                </div>

                <div className="border-t border-white/[0.06] pt-3 flex justify-between items-center text-xs font-mono">
                  <span className="text-gray-500 text-[10px] uppercase">Account Value</span>
                  <span className="font-bold text-white text-sm">
                    ${(Number(c.totalValue) || 0).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-white/[0.06] pt-4 mt-4">
                <button
                  type="button"
                  onClick={() => handleEdit(c)}
                  className="rounded-xl bg-white/[0.04] border border-white/10 px-3.5 py-1.5 text-xs font-bold text-gray-300 hover:bg-[#98f90d] hover:text-[#050505] transition-all"
                >
                  Edit Dossier
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTargetId(c.id)}
                  className="rounded-xl p-1.5 text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"
                  title="Delete client account"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingClient ? `Edit Client: ${editingClient.name}` : "Register Corporate Client Account"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs text-gray-300">
            <div>
              <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                Company / Organization Name *
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Cleancity Logistics"
                className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Contact Person *
                </label>
                <input
                  type="text"
                  required
                  value={form.contactPerson}
                  onChange={(e) => setForm({ ...form, contactPerson: e.target.value })}
                  placeholder="e.g. Dr. Jennifer Vance"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Business Email *
                </label>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="jvance@cleancity.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white placeholder-gray-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Industry Focus
                </label>
                <input
                  type="text"
                  value={form.industry}
                  onChange={(e) => setForm({ ...form, industry: e.target.value })}
                  placeholder="e.g. Healthcare & Biotech"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                  Contract Value ($)
                </label>
                <input
                  type="number"
                  value={form.totalValue}
                  onChange={(e) => setForm({ ...form, totalValue: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono font-bold uppercase text-[11px] text-gray-400 mb-1.5">
                Client Status
              </label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-[#0c0e15] p-3 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="lead">Lead</option>
                <option value="paused">Paused</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-full border border-white/10 px-4 py-2 font-medium text-gray-400 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-full bg-[#98f90d] px-5 py-2 font-bold text-black hover:bg-[#86e00b] transition shadow-[0_0_15px_rgba(152,249,13,0.3)]"
              >
                {editingClient ? "Update Dossier" : "Register Client"}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Corporate Account"
        message="Are you sure you want to delete this client account? All linked client references will be unlinked."
        confirmText="Delete Account"
        isDanger={true}
      />
    </div>
  );
}
