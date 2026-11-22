"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Users2, Shield, Mail, Clock, ArrowRight, UserCheck } from "lucide-react";

export default function TeamManagementPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setUsers(data.users || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">Internal Staff</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Staff & Engineering Roster
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Operational overview of active administrators, architects, and technical managers.
          </p>
        </div>

        <Link
          href="/admin/users"
          className="inline-flex items-center gap-2 rounded-xl bg-[#98f90d] px-4 py-2.5 text-xs font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)]"
        >
          <Shield size={14} />
          <span>Manage Permissions</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Scanning team roster...</span>
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="col-span-full rounded-3xl border border-white/10 bg-[#0f111a]/90 p-12 text-center text-xs text-neutral-400">
            No team members found.
          </div>
        ) : (
          users.map((u) => (
            <div
              key={u.id}
              className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-5 shadow-2xl backdrop-blur-xl hover:border-[#98f90d]/30 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3.5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/20 text-[#98f90d] font-bold text-base shadow-sm">
                    {u.name?.charAt(0) || "U"}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">{u.name}</h3>
                    <span className="font-mono text-[11px] text-neutral-400">{u.email}</span>
                  </div>
                </div>

                <div className="mt-4 border-t border-white/10 pt-3 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Role:</span>
                    <span className="font-mono font-bold text-[#98f90d]">{u.role}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Status:</span>
                    <span className={`font-semibold capitalize ${u.status === "active" ? "text-emerald-400" : "text-neutral-500"}`}>
                      {u.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-400">Last Active:</span>
                    <span className="font-mono text-[11px] text-neutral-400">
                      {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : "Never"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-5 border-t border-white/10 pt-3">
                <Link
                  href="/admin/users"
                  className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#98f90d] hover:text-[#86dc0b] transition-colors"
                >
                  <span>Edit Profile & Role</span>
                  <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
