"use client";

import { useState, useEffect } from "react";
import { Briefcase, Plus, Edit3, Trash2, Eye, EyeOff, ArrowUpRight } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

export default function PortfolioCMSPage() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    tag: "Software",
    summary: "",
    challenge: "",
    solution: "",
    resultsText: "",
    stackText: "",
    featured: true,
  });

  const fetchPortfolio = () => {
    setLoading(true);
    fetch("/api/admin/cms?section=portfolio")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setPortfolio(data.portfolio || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const openEdit = (item) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      slug: item.slug,
      tag: item.tag || "Software",
      summary: item.summary || "",
      challenge: item.challenge || "",
      solution: item.solution || "",
      resultsText: (item.results || []).join("\n"),
      stackText: (item.stack || []).join(", "),
      featured: Boolean(item.featured),
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (item) => {
    const updated = portfolio.map((p) =>
      p.id === item.id ? { ...p, visibility: !p.visibility } : p
    );
    setPortfolio(updated);
    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "portfolio", data: updated, publish: true }),
      });
      fetchPortfolio();
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const results = form.resultsText.split("\n").map((r) => r.trim()).filter(Boolean);
    const stack = form.stackText.split(",").map((s) => s.trim()).filter(Boolean);

    if (editingItem) {
      const updated = portfolio.map((p) =>
        p.id === editingItem.id
          ? {
              ...p,
              title: form.title,
              slug: form.slug,
              tag: form.tag,
              summary: form.summary,
              challenge: form.challenge,
              solution: form.solution,
              results,
              stack,
              featured: form.featured,
            }
          : p
      );
      try {
        await fetch("/api/admin/cms", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "portfolio", data: updated, publish: true }),
        });
        setShowModal(false);
        setEditingItem(null);
        fetchPortfolio();
      } catch {}
    } else {
      try {
        await fetch("/api/admin/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "portfolio",
            item: {
              title: form.title,
              slug: form.slug,
              tag: form.tag,
              summary: form.summary,
              challenge: form.challenge,
              solution: form.solution,
              results,
              stack,
              featured: form.featured,
            },
          }),
        });
        setShowModal(false);
        fetchPortfolio();
      } catch {}
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/cms?section=portfolio&id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchPortfolio();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Case Study Showcase</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Portfolio & Case Studies
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Enterprise software stories, architecture challenges, quantified ROI, and full tech stacks.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setForm({
              title: "",
              slug: "",
              tag: "Software",
              summary: "",
              challenge: "",
              solution: "",
              resultsText: "",
              stackText: "Next.js, Node.js, AWS",
              featured: true,
            });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Case Study</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Fetching case studies from database...</span>
            </div>
          </div>
        ) : portfolio.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No case studies found. Click &quot;Add Case Study&quot; to configure one.
          </div>
        ) : (
          portfolio.map((p) => (
            <div
              key={p.id || p.slug}
              className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between ${
                p.visibility !== false
                  ? "bg-[#0f111a]/90 border-white/10 hover:border-[#98f90d]/30"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="rounded-lg border border-[#98f90d]/30 bg-[#98f90d]/10 px-2.5 py-1 text-[10px] font-bold text-[#98f90d]">
                    {p.tag}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title={p.visibility !== false ? "Hide project" : "Show project"}
                    >
                      {p.visibility !== false ? <Eye size={14} className="text-[#98f90d]" /> : <EyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(p)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(p.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{p.title}</h3>
                <p className="text-xs text-neutral-300 mt-2 leading-relaxed">{p.summary}</p>

                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {(p.stack || []).map((tech, i) => (
                    <span key={i} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-mono text-[11px] text-neutral-400">/projects/{p.slug}</span>
                <a
                  href={`/projects/${p.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#98f90d] hover:text-[#86dc0b] transition-colors"
                >
                  <span>View Story</span>
                  <ArrowUpRight size={13} />
                </a>
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
          title={editingItem ? `Edit Case Study: ${editingItem.title}` : "Create Portfolio Case Study"}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Project Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Real-Time Telemetry Portal"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">URL Slug *</label>
                <input
                  type="text"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  placeholder="real-time-telemetry-portal"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Category Tag</label>
                <input
                  type="text"
                  value={form.tag}
                  onChange={(e) => setForm({ ...form, tag: e.target.value })}
                  placeholder="Software, Mobile, AI..."
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Tech Stack (comma separated)</label>
                <input
                  type="text"
                  value={form.stackText}
                  onChange={(e) => setForm({ ...form, stackText: e.target.value })}
                  placeholder="React, Next.js, Node.js, AWS"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Project Summary</label>
              <textarea
                rows={2}
                value={form.summary}
                onChange={(e) => setForm({ ...form, summary: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">The Challenge</label>
                <textarea
                  rows={3}
                  value={form.challenge}
                  onChange={(e) => setForm({ ...form, challenge: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">The Solution</label>
                <textarea
                  rows={3}
                  value={form.solution}
                  onChange={(e) => setForm({ ...form, solution: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Results & Metrics (One per line)</label>
              <textarea
                rows={3}
                value={form.resultsText}
                onChange={(e) => setForm({ ...form, resultsText: e.target.value })}
                placeholder="40% faster inventory reconciliation&#10;Zero data loss"
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
        title="Delete Case Study"
        message="Are you sure you want to remove this case study from the portfolio?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
