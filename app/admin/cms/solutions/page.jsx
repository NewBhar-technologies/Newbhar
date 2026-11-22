"use client";

import { useState, useEffect } from "react";
import { Sparkles, Plus, Edit3, Trash2, Eye, ArrowUpRight } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

export default function SolutionsCMSPage() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSolution, setEditingSolution] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    text: "",
  });

  const fetchSolutions = () => {
    setLoading(true);
    fetch("/api/admin/cms?section=solutions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setSolutions(data.solutions || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchSolutions();
  }, []);

  const openEdit = (sol) => {
    setEditingSolution(sol);
    setForm({ title: sol.title, text: sol.text });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (editingSolution) {
      const updated = solutions.map((s) =>
        s.id === editingSolution.id ? { ...s, title: form.title, text: form.text } : s
      );
      try {
        await fetch("/api/admin/cms", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "solutions", data: updated, publish: true }),
        });
        setShowModal(false);
        setEditingSolution(null);
        fetchSolutions();
      } catch {}
    } else {
      try {
        await fetch("/api/admin/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "solutions",
            item: { title: form.title, text: form.text },
          }),
        });
        setShowModal(false);
        fetchSolutions();
      } catch {}
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/cms?section=solutions&id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchSolutions();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Business Architecture</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Business Solutions CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage enterprise solution categories, operational automations, and ERP modules.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingSolution(null);
            setForm({ title: "", text: "" });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Solution</span>
        </button>
      </div>

      {/* Solutions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Fetching solution blueprints...</span>
            </div>
          </div>
        ) : solutions.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No solutions configured yet.
          </div>
        ) : (
          solutions.map((sol, idx) => (
            <div
              key={sol.id || idx}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="font-mono text-xs font-bold text-[#98f90d]">0{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(sol)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit solution"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(sol.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete solution"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{sol.title}</h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{sol.text}</p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingSolution ? "Edit Solution" : "Create Solution"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Solution Title *</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. ERP & Internal Operations Tools"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Description *</label>
              <textarea
                rows={4}
                required
                value={form.text}
                onChange={(e) => setForm({ ...form, text: e.target.value })}
                placeholder="Brief summary of how this solution delivers operational ROI..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
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
                Save &amp; Publish
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Solution"
        message="Are you sure you want to remove this solution card from public showcase?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
