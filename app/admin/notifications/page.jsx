"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, Trash2, ArrowRight, ShieldAlert, Mail, UserCheck, Calendar, Zap, AlertTriangle } from "lucide-react";

const CATEGORY_ICONS = {
  inquiry: Mail,
  lead: UserCheck,
  meeting: Calendar,
  email: Mail,
  automation: Zap,
  security: ShieldAlert,
  project: Bell,
};

export default function NotificationCenterPage() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchNotifications = () => {
    setLoading(true);
    fetch("/api/admin/notifications")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setNotifications(data.notifications || []);
          setUnreadCount(data.unreadCount || 0);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAllRead: true }),
      });
      fetchNotifications();
    } catch {}
  };

  const handleMarkSingleRead = async (id) => {
    try {
      await fetch("/api/admin/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchNotifications();
    } catch {}
  };

  const handleDeleteAll = async () => {
    try {
      await fetch("/api/admin/notifications?id=all", { method: "DELETE" });
      fetchNotifications();
    } catch {}
  };

  const filtered = filter === "all" ? notifications : notifications.filter((n) => n.category === filter);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="flex h-2 w-2 rounded-full bg-[#98f90d] shadow-[0_0_8px_#98f90d]" />
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#98f90d]">System Alerts</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Notification Center
          </h1>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time event notifications, inquiry triggers, automated workflows, and security alerts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={handleMarkAllRead}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-neutral-300 hover:text-white hover:border-[#98f90d]/50 hover:bg-white/10 transition-all"
            >
              <CheckCheck size={14} className="text-[#98f90d]" />
              <span>Mark All as Read</span>
            </button>
          )}

          {notifications.length > 0 && (
            <button
              type="button"
              onClick={handleDeleteAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3.5 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 size={13} />
              <span>Clear All</span>
            </button>
          )}
        </div>
      </div>

      {/* Notifications List */}
      <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#0f111a]/90 shadow-2xl backdrop-blur-xl divide-y divide-white/5 max-w-4xl">
        {loading ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#98f90d] animate-ping" />
              <span>Scanning notification queue...</span>
            </div>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">No notifications to display.</div>
        ) : (
          filtered.map((n) => {
            const Icon = CATEGORY_ICONS[n.category] || Bell;
            return (
              <div
                key={n.id}
                className={`p-4 flex items-start gap-4 transition-colors hover:bg-white/[0.03] ${
                  !n.read ? "bg-[#98f90d]/[0.03]" : ""
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border ${
                    !n.read
                      ? "bg-[#98f90d]/15 border-[#98f90d]/30 text-[#98f90d]"
                      : "bg-white/5 border-white/10 text-neutral-500"
                  }`}
                >
                  <Icon size={17} />
                </div>

                <div className="flex-1 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-white text-sm">{n.title}</h3>
                    <span className="font-mono text-[10px] text-neutral-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-neutral-300 mt-1 leading-relaxed">{n.message}</p>

                  <div className="mt-3 flex items-center gap-3">
                    {n.link && (
                      <Link
                        href={n.link}
                        onClick={() => handleMarkSingleRead(n.id)}
                        className="inline-flex items-center gap-1 font-bold text-[#98f90d] hover:text-[#86dc0b] text-[11px] transition-colors"
                      >
                        <span>View Resource</span>
                        <ArrowRight size={11} />
                      </Link>
                    )}
                    {!n.read && (
                      <button
                        type="button"
                        onClick={() => handleMarkSingleRead(n.id)}
                        className="text-[11px] font-semibold text-neutral-400 hover:text-white transition"
                      >
                        Mark Read
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
