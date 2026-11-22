"use client";

import { useState, useEffect } from "react";
import { Layers, Plus, Edit3, Trash2, Eye, EyeOff, CheckCircle2, ArrowUpRight } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

export default function ServicesCMSPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingService, setEditingService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [savedMessage, setSavedMessage] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    tagline: "",
    short: "",
    pointsText: "",
    techText: "",
  });

  const fetchServices = () => {
    setLoading(true);
    fetch("/api/admin/cms?section=services")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setServices(data.services || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const openEdit = (s) => {
    setEditingService(s);
    setForm({
      title: s.title,
      slug: s.slug,
      tagline: s.tagline || "",
      short: s.short || "",
      pointsText: (s.points || []).join("\n"),
      techText: (s.tech || []).join("\n"),
    });
    setShowModal(true);
  };

  const handleToggleVisibility = async (service) => {
    const updated = services.map((s) =>
      s.id === service.id ? { ...s, visibility: !s.visibility } : s
    );
    setServices(updated);
    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "services", data: updated, publish: true }),
      });
      fetchServices();
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const points = form.pointsText.split("\n").map((p) => p.trim()).filter(Boolean);
    const tech = form.techText.split("\n").map((t) => t.trim()).filter(Boolean);

    if (editingService) {
      const updated = services.map((s) =>
        s.id === editingService.id
          ? { ...s, title: form.title, slug: form.slug, tagline: form.tagline, short: form.short, points, tech }
          : s
      );
      try {
        await fetch("/api/admin/cms", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ section: "services", data: updated, publish: true }),
        });
        setShowModal(false);
        setEditingService(null);
        fetchServices();
      } catch {}
    } else {
      try {
        await fetch("/api/admin/cms", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            section: "services",
            item: { title: form.title, slug: form.slug, tagline: form.tagline, short: form.short, points, tech },
          }),
        });
        setShowModal(false);
        fetchServices();
      } catch {}
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/cms?section=services&id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchServices();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Service Taxonomy</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Engineering Services Directory
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage public service lines, deliverables, capabilities, and dedicated landing page routes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingService(null);
            setForm({ title: "", slug: "", tagline: "", short: "", pointsText: "", techText: "" });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Service</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Fetching services catalog from database...</span>
            </div>
          </div>
        ) : services.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No services configured in CMS.
          </div>
        ) : (
          services.map((s, idx) => (
            <div
              key={s.id || s.slug}
              className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between ${
                s.visibility !== false
                  ? "bg-[#0f111a]/90 border-white/10 hover:border-[#98f90d]/30"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-start justify-between mb-2">
                  <span className="font-mono text-xs font-bold text-[#98f90d]">0{idx + 1}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleToggleVisibility(s)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title={s.visibility !== false ? "Hide service" : "Show service"}
                    >
                      {s.visibility !== false ? <Eye size={14} className="text-[#98f90d]" /> : <EyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(s)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit service details"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(s.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete service"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{s.title}</h3>
                <p className="text-xs text-[#98f90d] font-medium mt-0.5">{s.tagline}</p>
                <p className="text-xs text-neutral-300 line-clamp-3 mt-2 leading-relaxed">{s.short}</p>

                {/* Key Points snippet */}
                <div className="mt-3.5 space-y-1.5">
                  {(s.points || []).slice(0, 2).map((pt, i) => (
                    <div key={i} className="text-[11px] text-neutral-400 truncate flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#98f90d] shrink-0" />
                      <span className="truncate">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-3">
                <span className="font-mono text-[11px] text-neutral-400">/services/{s.slug}</span>
                <a
                  href={`/services/${s.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#98f90d] hover:text-[#86dc0b] transition-colors"
                >
                  <span>View Landing Page</span>
                  <ArrowUpRight size={13} />
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Edit / Create Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingService ? `Edit Service: ${editingService.title}` : "Create Service"}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Service Title *</label>
                <input
                  type="text"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Custom AI Platforms"
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
                  placeholder="custom-ai-platforms"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Tagline</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="High-impact marketing subheadline"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Short Description</label>
              <textarea
                rows={3}
                value={form.short}
                onChange={(e) => setForm({ ...form, short: e.target.value })}
                placeholder="Overview text displayed on cards and search..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Core Deliverables & Points (One per line)</label>
              <textarea
                rows={4}
                value={form.pointsText}
                onChange={(e) => setForm({ ...form, pointsText: e.target.value })}
                placeholder="Custom software: enterprise platforms&#10;API development: REST & cloud services"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Tech Stack (One per line)</label>
              <textarea
                rows={3}
                value={form.techText}
                onChange={(e) => setForm({ ...form, techText: e.target.value })}
                placeholder="Frontend: React, Next.js&#10;Backend: Node.js, Python"
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
                Save &amp; Publish
              </button>
            </div>
          </form>
        </Modal>
      )}

      <ConfirmDialog
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleDelete}
        title="Delete Service"
        message="Are you sure you want to remove this service from the public directory?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
