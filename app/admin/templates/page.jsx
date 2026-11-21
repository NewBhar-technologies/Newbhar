"use client";

import { useState, useEffect } from "react";
import { FileCode, Plus, Edit3, Trash2, Copy, Eye, CheckCircle2 } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";
import { renderTemplatePlaceholders } from "@/lib/template-utils";

const CATEGORIES = [
  "Inquiry Confirmation",
  "Meeting Confirmation",
  "Follow-up",
  "Notification",
  "Project Update",
];

const AVAILABLE_PLACEHOLDERS = [
  "{{customer_name}}",
  "{{customer_email}}",
  "{{company_name}}",
  "{{service_name}}",
  "{{meeting_date}}",
  "{{meeting_link}}",
  "{{project_name}}",
];

export default function TemplatesManagementPage() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [editingTemplate, setEditingTemplate] = useState(null);

  const [form, setForm] = useState({
    name: "",
    category: "Inquiry Confirmation",
    subject: "",
    content: "",
  });

  const fetchTemplates = () => {
    setLoading(true);
    fetch(`/api/admin/templates?category=${categoryFilter}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setTemplates(data.templates || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplates();
  }, [categoryFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    const method = editingTemplate ? "PATCH" : "POST";
    const body = editingTemplate ? { id: editingTemplate.id, ...form } : form;

    try {
      const res = await fetch("/api/admin/templates", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        setShowModal(false);
        setEditingTemplate(null);
        setForm({ name: "", category: "Inquiry Confirmation", subject: "", content: "" });
        fetchTemplates();
      }
    } catch {}
  };

  const handleDuplicate = async (tpl) => {
    try {
      await fetch("/api/admin/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: `${tpl.name} (Copy)`,
          category: tpl.category,
          subject: tpl.subject,
          content: tpl.content,
        }),
      });
      fetchTemplates();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await fetch(`/api/admin/templates?id=${deleteTargetId}`, { method: "DELETE" });
      setDeleteTargetId(null);
      fetchTemplates();
    } catch {}
  };

  const openEdit = (tpl) => {
    setEditingTemplate(tpl);
    setForm({
      name: tpl.name,
      category: tpl.category,
      subject: tpl.subject,
      content: tpl.content,
    });
    setShowModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Template Architecture</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Dynamic Message Templates
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Templated auto-responders, project update notifications, and personalized placeholder payloads.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingTemplate(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>New Template</span>
        </button>
      </div>

      {/* Categories Filter Bar */}
      <div className="flex flex-wrap items-center gap-2">
        {["all", ...CATEGORIES].map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategoryFilter(cat)}
            className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold capitalize transition-all border ${
              categoryFilter === cat
                ? "border-[#98f90d] bg-[#98f90d]/15 text-[#98f90d]"
                : "border-white/10 bg-[#0f111a]/90 text-neutral-400 hover:text-white hover:border-white/20"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Fetching template registries...</span>
            </div>
          </div>
        ) : templates.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No templates found in this category. Click &quot;New Template&quot; to configure one.
          </div>
        ) : (
          templates.map((tpl) => (
            <div
              key={tpl.id}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between mb-3">
                  <span className="rounded-lg border border-[#98f90d]/30 bg-[#98f90d]/10 px-2.5 py-1 text-[10px] font-bold text-[#98f90d]">
                    {tpl.category}
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setPreviewTemplate(tpl)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Preview rendered template"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDuplicate(tpl)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Duplicate template"
                    >
                      <Copy size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => openEdit(tpl)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                      title="Edit template"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTargetId(tpl.id)}
                      className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete template"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-bold text-base text-white">{tpl.name}</h3>
                <p className="text-xs font-semibold text-neutral-300 mt-1 line-clamp-1">Subject: {tpl.subject}</p>
                <p className="text-xs text-neutral-400 font-mono mt-2 line-clamp-3 bg-black/40 p-3 rounded-2xl border border-white/5">
                  {tpl.content}
                </p>
              </div>

              <div className="mt-4 flex flex-wrap gap-1.5 border-t border-white/10 pt-3">
                {(tpl.placeholders || []).map((ph) => (
                  <span key={ph} className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-neutral-300">
                    {`{{${ph}}}`}
                  </span>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Rendered Live Preview Modal */}
      {previewTemplate && (
        <Modal
          isOpen={Boolean(previewTemplate)}
          onClose={() => setPreviewTemplate(null)}
          title={`Simulated Render: ${previewTemplate.name}`}
          maxWidth="max-w-lg"
        >
          <div className="space-y-4 text-xs">
            <div className="rounded-2xl bg-black/40 p-3.5 border border-white/10">
              <span className="text-[10px] font-mono text-neutral-500 uppercase">Simulated Subject</span>
              <p className="font-bold text-white text-sm mt-0.5">
                {renderTemplatePlaceholders(previewTemplate.subject, {
                  customerName: "Alex Mercer",
                  companyName: "Horizon Dynamics",
                  serviceName: "Custom AI Platform",
                  meetingDate: "Nov 25, 2026 at 3:00 PM IST",
                })}
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4 font-mono text-neutral-200 leading-relaxed whitespace-pre-wrap">
              {renderTemplatePlaceholders(previewTemplate.content, {
                customerName: "Alex Mercer",
                companyName: "Horizon Dynamics",
                serviceName: "Custom AI Platform",
                meetingDate: "Nov 25, 2026 at 3:00 PM IST",
              })}
            </div>
          </div>
        </Modal>
      )}

      {/* Create / Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingTemplate ? "Edit Template" : "Create New Template"}
          maxWidth="max-w-xl"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Template Name *</label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. Inbound Fast Confirmation"
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="block font-semibold text-neutral-300">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c} className="bg-[#0f111a]">{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Email Subject *</label>
              <input
                type="text"
                required
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="e.g. Thanks for contacting Newbhar Technologies, {{customer_name}}"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block font-semibold text-neutral-300">Message Body *</label>
                <span className="text-[10px] text-neutral-500">Insert tag by typing</span>
              </div>
              <textarea
                rows={8}
                required
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                placeholder="Hi {{customer_name}}, ..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="rounded-2xl bg-black/40 p-3 border border-white/10">
              <span className="text-[10px] font-mono text-neutral-500 uppercase block mb-1.5">Available Dynamic Placeholders:</span>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_PLACEHOLDERS.map((ph) => (
                  <button
                    key={ph}
                    type="button"
                    onClick={() => setForm({ ...form, content: form.content + " " + ph })}
                    className="cursor-pointer rounded-lg bg-white/5 px-2 py-1 text-[10px] font-mono font-medium text-[#98f90d] border border-white/10 hover:border-[#98f90d] transition"
                  >
                    + {ph}
                  </button>
                ))}
              </div>
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
                {editingTemplate ? "Update Template" : "Save Template"}
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
        title="Delete Template"
        message="Are you sure you want to permanently delete this email template?"
        confirmText="Delete"
        isDanger={true}
      />
    </div>
  );
}
