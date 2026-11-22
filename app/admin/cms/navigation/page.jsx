"use client";

import { useState, useEffect } from "react";
import { Navigation, Plus, Edit3, Trash2, CheckCircle2, ArrowUp, ArrowDown, Eye, EyeOff } from "lucide-react";
import { Modal } from "@/components/admin/modal";

export default function NavigationCMSPage() {
  const [navItems, setNavItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");

  const [form, setForm] = useState({
    label: "",
    href: "",
    dropdown: false,
  });

  const fetchNav = () => {
    setLoading(true);
    fetch("/api/admin/cms?section=navigation")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setNavItems(data.navigation || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNav();
  }, []);

  const handleToggle = async (item) => {
    const updated = navItems.map((n) =>
      n.id === item.id ? { ...n, visibility: !n.visibility } : n
    );
    setNavItems(updated);
    saveNavigation(updated);
  };

  const handleMove = async (index, direction) => {
    if ((direction === -1 && index === 0) || (direction === 1 && index === navItems.length - 1)) return;
    const updated = [...navItems];
    const targetIdx = index + direction;
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    setNavItems(updated);
    saveNavigation(updated);
  };

  const saveNavigation = async (items) => {
    try {
      await fetch("/api/admin/cms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ section: "navigation", data: items, publish: true }),
      });
      setSavedMessage("Navigation order saved and published live!");
      setTimeout(() => setSavedMessage(""), 3500);
      fetchNav();
    } catch {}
  };

  const handleSaveItem = async (e) => {
    e.preventDefault();
    let updated;
    if (editingItem) {
      updated = navItems.map((n) =>
        n.id === editingItem.id ? { ...n, label: form.label, href: form.href, dropdown: form.dropdown } : n
      );
    } else {
      updated = [
        ...navItems,
        {
          id: `nav_${Date.now()}`,
          label: form.label,
          href: form.href,
          dropdown: form.dropdown,
          visibility: true,
          displayOrder: navItems.length + 1,
        },
      ];
    }
    setShowModal(false);
    saveNavigation(updated);
  };

  const handleDelete = (id) => {
    const updated = navItems.filter((n) => n.id !== id);
    saveNavigation(updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Global Header</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Header Navigation Bar CMS
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Manage links, dropdown menus, reorder hierarchy, and visibility for the corporate header.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingItem(null);
            setForm({ label: "", href: "", dropdown: false });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Add Nav Item</span>
        </button>
      </div>

      {savedMessage && (
        <div className="flex items-center gap-2 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs font-bold text-emerald-400 backdrop-blur-xl">
          <CheckCircle2 size={16} className="text-[#98f90d]" />
          <span>{savedMessage}</span>
        </div>
      )}

      {/* Nav List Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 w-16 text-center font-semibold">Order</th>
                <th className="py-3.5 px-4 font-semibold">Menu Label</th>
                <th className="py-3.5 px-4 font-semibold">Target URL</th>
                <th className="py-3.5 px-4 font-semibold">Dropdown Type</th>
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
                      <span>Reading navigation hierarchy...</span>
                    </div>
                  </td>
                </tr>
              ) : (
                navItems.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4 text-center font-mono font-bold text-neutral-400">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleMove(idx, -1)}
                          disabled={idx === 0}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 transition"
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleMove(idx, 1)}
                          disabled={idx === navItems.length - 1}
                          className="p-1 text-neutral-400 hover:text-white disabled:opacity-20 transition"
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-white">{item.label}</td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">{item.href}</td>
                    <td className="py-3.5 px-4">
                      {item.dropdown ? (
                        <span className="rounded-lg border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-bold text-purple-300">
                          Services Mega Menu
                        </span>
                      ) : (
                        <span className="text-neutral-500">Direct Route</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <button
                        type="button"
                        onClick={() => handleToggle(item)}
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                          item.visibility !== false
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                            : "border-neutral-500/30 bg-neutral-500/10 text-neutral-400"
                        }`}
                      >
                        {item.visibility !== false ? "Visible" : "Hidden"}
                      </button>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingItem(item);
                            setForm({ label: item.label, href: item.href, dropdown: Boolean(item.dropdown) });
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 size={14} />
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

      {/* Add / Edit Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingItem ? "Edit Navigation Item" : "Add Navigation Item"}
        >
          <form onSubmit={handleSaveItem} className="space-y-4 text-xs">
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Menu Label *</label>
              <input
                type="text"
                required
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. Services"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Target URL *</label>
              <input
                type="text"
                required
                value={form.href}
                onChange={(e) => setForm({ ...form, href: e.target.value })}
                placeholder="/services or https://..."
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs font-mono text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={form.dropdown}
                onChange={(e) => setForm({ ...form, dropdown: e.target.checked })}
                className="rounded text-[#98f90d] focus:ring-[#98f90d]"
              />
              <span className="font-semibold text-neutral-300">Has Services Mega Menu Dropdown</span>
            </label>
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
                Save Nav Item
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
