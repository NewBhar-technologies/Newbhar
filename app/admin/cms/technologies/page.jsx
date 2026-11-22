"use client";

import { useState, useEffect } from "react";
import { Cpu, Plus, Edit3, Trash2, CheckCircle2, Save } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export default function TechnologiesCMSPage() {
  const [techGroups, setTechGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingGroup, setEditingGroup] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [form, setForm] = useState({
    group: "",
    itemsText: "",
  });

  const fetchTech = () => {
    setLoading(true);
    fetch("/api/admin/cms?section=technologies")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTechGroups(data.technologies || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTech();
  }, []);

  const openEdit = (group) => {
    setEditingGroup(group);
    setForm({
      group: group.group,
      itemsText: (group.items || []).join(", "),
    });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const items = form.itemsText.split(",").map((i) => i.trim()).filter(Boolean);

    let updated;
    if (editingGroup) {
      updated = techGroups.map((g) =>
        g.id === editingGroup.id ? { ...g, group: form.group, items } : g
      );
    } else {
      updated = [
        ...techGroups,
        {
          id: `tech_${Date.now()}`,
          group: form.group,
          items,
          visibility: true,
          displayOrder: techGroups.length + 1,
        },
      ];
    }

    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "technologies", data: updated, publish: true }),
      });
      setShowModal(false);
      setSavedMessage("Technology stack updated successfully!");
      setTimeout(() => setSavedMessage(""), 4000);
      fetchTech();
    } catch {}
  };

  const handleDelete = async (groupId) => {
    const updated = techGroups.filter((g) => g.id !== groupId);
    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "technologies", data: updated, publish: true }),
      });
      fetchTech();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Engineering Toolchain</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Technology Stack & Tooling
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage frontend, backend, artificial intelligence, and cloud stacks displayed on /technologies.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingGroup(null);
            setForm({ group: "", itemsText: "" });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Tech Category</span>
        </button>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Fetching technology framework catalog...</span>
            </div>
          </div>
        ) : techGroups.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No tech categories defined.
          </div>
        ) : (
          techGroups.map((g) => (
            <div
              key={g.id || g.group}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3 border-b border-white/10 pb-3">
                  <h3 className="font-bold text-base text-white flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d]">
                      <Cpu size={15} />
                    </div>
                    <span>{g.group}</span>
                  </h3>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => openEdit(g)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit group"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(g.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete group"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                  {(g.items || []).map((item, idx) => (
                    <span
                      key={idx}
                      className="rounded-xl border border-white/10 bg-black/40 px-3 py-1 font-mono text-xs font-semibold text-neutral-200"
                    >
                      {item}
                    </span>
                  ))}
                </div>
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
          title={editingGroup ? `Edit Category: ${editingGroup.group}` : "Add Technology Category"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Category Title *</label>
              <input
                type="text"
                required
                value={form.group}
                onChange={(e) => setForm({ ...form, group: e.target.value })}
                placeholder="e.g. AI & Machine Learning"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Technologies (Comma separated) *</label>
              <textarea
                rows={4}
                required
                value={form.itemsText}
                onChange={(e) => setForm({ ...form, itemsText: e.target.value })}
                placeholder="React, Next.js, TypeScript, Tailwind CSS, PyTorch"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
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
                Save Category
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
