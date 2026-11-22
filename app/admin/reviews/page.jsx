"use client";

import { useState, useEffect } from "react";
import { Star, Plus, Edit3, Trash2, Eye, EyeOff, CheckCircle2, MessageSquareQuote } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

export default function ReviewsManagementPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    clientName: "",
    companyName: "",
    designation: "",
    reviewText: "",
    rating: 5,
    featured: true,
  });

  const fetchReviews = () => {
    setLoading(true);
    fetch("/api/admin/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setReviews(data.testimonials || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const openEdit = (r) => {
    setEditingReview(r);
    setForm({
      clientName: r.clientName,
      companyName: r.companyName || "",
      designation: r.designation || "",
      reviewText: r.reviewText,
      rating: r.rating || 5,
      featured: Boolean(r.featured),
    });
    setShowModal(true);
  };

  const handleTogglePublish = async (review) => {
    const newStatus = review.status === "published" ? "draft" : "published";
    try {
      await fetch("/api/admin/reviews", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: review.id, status: newStatus }),
      });
      fetchReviews();
    } catch {}
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingReview ? "PATCH" : "POST";
    const body = editingReview ? { id: editingReview.id, ...form } : form;

    try {
      const res = await fetch("/api/admin/reviews", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingReview(null);
        setForm({
          clientName: "",
          companyName: "",
          designation: "",
          reviewText: "",
          rating: 5,
          featured: true,
        });
        fetchReviews();
      }
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/reviews?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchReviews();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Social Proof</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Reviews & Testimonials
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Verified executive endorsements, client project satisfaction scores, and website quotes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingReview(null);
            setForm({ clientName: "", companyName: "", designation: "", reviewText: "", rating: 5, featured: true });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Testimonial</span>
        </button>
      </div>

      {/* Reviews Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Querying verified testimonials from database...</span>
            </div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No testimonials recorded yet. Click &quot;Add Testimonial&quot; to seed initial client quotes.
          </div>
        ) : (
          reviews.map((r) => (
            <div
              key={r.id}
              className={`rounded-3xl border p-5 shadow-2xl backdrop-blur-xl transition-all flex flex-col justify-between ${
                r.status === "published"
                  ? "bg-[#0f111a]/90 border-white/10 hover:border-[#98f90d]/30"
                  : "bg-white/[0.02] border-white/5 opacity-60"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < (r.rating || 5) ? "fill-[#98f90d] text-[#98f90d]" : "text-neutral-700"}
                      />
                    ))}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(r)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title={r.status === "published" ? "Unpublish" : "Publish"}
                    >
                      {r.status === "published" ? <Eye size={14} className="text-[#98f90d]" /> : <EyeOff size={14} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(r)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(r.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-neutral-300 italic leading-relaxed mt-2">
                  &ldquo;{r.reviewText}&rdquo;
                </p>
              </div>

              <div className="mt-4 border-t border-white/10 pt-3 flex items-center justify-between text-xs">
                <div>
                  <div className="font-bold text-white">{r.clientName}</div>
                  <div className="text-[11px] text-neutral-400 font-medium">
                    {r.designation} {r.companyName ? `· ${r.companyName}` : ""}
                  </div>
                </div>
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                    r.status === "published"
                      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                      : "border-neutral-500/30 bg-neutral-500/10 text-neutral-400"
                  }`}
                >
                  {r.status}
                </span>
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
          title={editingReview ? "Edit Client Testimonial" : "Add Client Testimonial"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Client Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.clientName}
                  onChange={(e) => setForm({ ...form, clientName: e.target.value })}
                  placeholder="e.g. David Sterling"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Company / Enterprise</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                  placeholder="e.g. Nexus Global Supply"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Designation / Role</label>
                <input
                  type="text"
                  value={form.designation}
                  onChange={(e) => setForm({ ...form, designation: e.target.value })}
                  placeholder="e.g. Chief Operating Officer"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Star Rating (1-5)</label>
                <select
                  value={form.rating}
                  onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  <option value={5} className="bg-[#0f111a]">5 Stars (Exceptional)</option>
                  <option value={4} className="bg-[#0f111a]">4 Stars</option>
                  <option value={3} className="bg-[#0f111a]">3 Stars</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Endorsement / Quote *</label>
              <textarea
                rows={4}
                required
                value={form.reviewText}
                onChange={(e) => setForm({ ...form, reviewText: e.target.value })}
                placeholder="Newbhar Technologies replaced our disjointed spreadsheets with a clean ERP..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs leading-relaxed text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="rounded-xl px-4 py-2 text-xs font-medium text-neutral-400 hover:text-white hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-[#98f90d] px-5 py-2 text-xs font-bold text-black hover:bg-[#86dc0b] transition-all"
              >
                Save Testimonial
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
        title="Delete Testimonial"
        message="Are you sure you want to remove this client review from public display?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
