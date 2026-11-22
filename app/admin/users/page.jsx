"use client";

import { useState, useEffect } from "react";
import { UserCog, Plus, Edit3, Trash2, Shield, Lock, CheckCircle2, AlertTriangle, Key, ShieldAlert } from "lucide-react";
import { Modal, ConfirmDialog } from "@/components/admin/modal";

const ROLE_BADGES = {
  SUPER_ADMIN: "border-rose-500/30 bg-rose-500/10 text-rose-400",
  ADMIN: "border-[#98f90d]/30 bg-[#98f90d]/10 text-[#98f90d]",
  EDITOR: "border-cyan-500/30 bg-cyan-500/10 text-cyan-400",
  MANAGER: "border-violet-500/30 bg-violet-500/10 text-violet-400",
};

export default function UsersManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "ADMIN",
  });

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    const method = editingUser ? "PATCH" : "POST";
    const body = editingUser ? { id: editingUser.id, ...form } : form;

    try {
      const res = await fetch("/api/admin/users", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setErrorMsg(data.error || "Action failed.");
        return;
      }

      setShowModal(false);
      setEditingUser(null);
      setForm({ name: "", email: "", password: "", role: "ADMIN" });
      fetchUsers();
    } catch {
      setErrorMsg("Failed to communicate with authentication server.");
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === "active" ? "inactive" : "active";
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, status: newStatus }),
      });
      fetchUsers();
    } catch {}
  };

  const handleResetLockout = async (user) => {
    try {
      await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, resetLockout: true }),
      });
      fetchUsers();
    } catch {}
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/admin/users?id=${deleteTargetId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to delete user.");
      }
      setDeleteTargetId(null);
      fetchUsers();
    } catch {}
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Access Control</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Admin Access & RBAC Roles
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Cryptographic token credentials, role boundaries, and privileged operator accounts.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setEditingUser(null);
            setErrorMsg("");
            setForm({ name: "", email: "", password: "", role: "ADMIN" });
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Plus size={15} />
          <span>Create Admin User</span>
        </button>
      </div>

      {/* Users Table */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-white/10 bg-white/[0.02] font-mono text-[11px] uppercase tracking-wider text-neutral-400">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Admin Subject</th>
                <th className="py-3.5 px-4 font-semibold">Email</th>
                <th className="py-3.5 px-4 font-semibold">Role Permission</th>
                <th className="py-3.5 px-4 font-semibold">Account State</th>
                <th className="py-3.5 px-4 font-semibold">Last Login</th>
                <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 font-sans">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <div className="inline-flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
                      <span>Verifying RBAC credentials...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">No admin accounts configured.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#98f90d]/10 border border-[#98f90d]/20 font-bold text-xs text-[#98f90d]">
                          {u.name?.charAt(0) || "A"}
                        </div>
                        <span className="font-bold text-white">{u.name}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-300">{u.email}</td>
                    <td className="py-3.5 px-4">
                      <span className={`rounded-lg px-2.5 py-1 text-[10px] font-mono font-bold uppercase border ${ROLE_BADGES[u.role] || "border-white/10 bg-white/5 text-neutral-300"}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isLocked ? (
                        <div className="flex items-center gap-1.5 text-rose-400 font-bold">
                          <AlertTriangle size={13} />
                          <span>Locked</span>
                          <button
                            type="button"
                            onClick={() => handleResetLockout(u)}
                            className="underline text-[10px] font-mono text-[#98f90d] hover:text-[#86dc0b] ml-1"
                          >
                            (Unlock)
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase border ${
                            u.status === "active"
                              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
                              : "border-neutral-500/30 bg-neutral-500/10 text-neutral-400"
                          }`}
                        >
                          {u.status}
                        </button>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-neutral-400 text-[11px]">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : "Never logged in"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingUser(u);
                            setErrorMsg("");
                            setForm({ name: u.name, email: u.email, password: "", role: u.role });
                            setShowModal(true);
                          }}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/5 transition"
                          title="Edit user"
                        >
                          <Edit3 size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTargetId(u.id)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition"
                          title="Delete user"
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

      {/* Modal */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title={editingUser ? `Edit Account: ${editingUser.name}` : "Create Admin Account"}
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            {errorMsg && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-rose-300 font-medium">
                {errorMsg}
              </div>
            )}

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Full Name *</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Samantha Wright"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Email Address *</label>
              <input
                type="email"
                required
                disabled={Boolean(editingUser)}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="admin@newbhar.com"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none disabled:opacity-50"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">
                {editingUser ? "Reset Password (leave blank to keep current)" : "Password *"}
              </label>
              <input
                type="password"
                required={!editingUser}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="block font-semibold text-neutral-300">Role & Privilege Tier *</label>
              <select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-black/40 p-2.5 text-xs text-white focus:border-[#98f90d] focus:outline-none"
              >
                <option value="SUPER_ADMIN" className="bg-[#0f111a]">SUPER_ADMIN (Full System & Security Access)</option>
                <option value="ADMIN" className="bg-[#0f111a]">ADMIN (Operations, CMS, CRM, Analytics)</option>
                <option value="EDITOR" className="bg-[#0f111a]">EDITOR (Website CMS, Media & SEO)</option>
                <option value="MANAGER" className="bg-[#0f111a]">MANAGER (Leads, Meetings & Client Projects)</option>
              </select>
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
                {editingUser ? "Update User" : "Create Account"}
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
        title="Revoke Admin Account"
        message="Are you sure you want to delete this administrator account? All session tokens will be immediately invalidated."
        confirmText="Revoke Account"
        isDanger={true}
      />
    </div>
  );
}
