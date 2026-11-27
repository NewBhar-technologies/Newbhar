"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users2,
  Inbox,
  KanbanSquare,
  Building2,
  FolderKanban,
  CalendarCheck,
  Star,
  Mail,
  Zap,
  FileCode,
  Bell,
  MessageSquare,
  Newspaper,
  LayoutTemplate,
  Info,
  Layers,
  Sparkles,
  Briefcase,
  Cpu,
  Navigation,
  Footprints,
  Search,
  Image as ImageIcon,
  UserCog,
  ShieldCheck,
  HardDrive,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LogOut,
  ExternalLink,
  ChevronDown,
  Activity,
  CheckCircle2,
} from "lucide-react";

const SIDEBAR_SECTIONS = [
  {
    title: "OVERVIEW",
    items: [
      { label: "Executive Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
      { label: "Traffic Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Live Visitors", href: "/admin/visitors", icon: Users2 },
    ],
  },
  {
    title: "PIPELINES & CRM",
    items: [
      { label: "Contact Inquiries", href: "/admin/contacts", icon: Inbox },
      { label: "Leads & Pipeline", href: "/admin/leads", icon: KanbanSquare },
      { label: "CRM & Clients", href: "/admin/clients", icon: Building2 },
      { label: "Client Projects", href: "/admin/projects", icon: FolderKanban },
      { label: "Discovery Meetings", href: "/admin/meetings", icon: CalendarCheck },
      { label: "Client Reviews", href: "/admin/reviews", icon: Star },
    ],
  },
  {
    title: "COMMUNICATIONS",
    items: [
      { label: "Outbox & Emails", href: "/admin/emails", icon: Mail },
      { label: "Automated Workflows", href: "/admin/automations", icon: Zap },
      { label: "Email Templates", href: "/admin/templates", icon: FileCode },
      { label: "Notifications", href: "/admin/notifications", icon: Bell },
      { label: "Newsletter List", href: "/admin/newsletter", icon: Newspaper },
    ],
  },
  {
    title: "CONTENT & BRANDING",
    items: [
      { label: "Hero & Home Sections", href: "/admin/cms/homepage", icon: LayoutTemplate },
      { label: "About Us Content", href: "/admin/cms/about", icon: Info },
      { label: "Services Offerings", href: "/admin/cms/services", icon: Layers },
      { label: "Enterprise Solutions", href: "/admin/cms/solutions", icon: Sparkles },
      { label: "Portfolio Showcase", href: "/admin/cms/portfolio", icon: Briefcase },
      { label: "Tech Stack Matrix", href: "/admin/cms/technologies", icon: Cpu },
      { label: "Navigation Menus", href: "/admin/cms/navigation", icon: Navigation },
      { label: "Footer & Legal Links", href: "/admin/cms/footer", icon: Footprints },
      { label: "Search Engine SEO", href: "/admin/seo", icon: Search },
      { label: "Digital Media Assets", href: "/admin/media", icon: ImageIcon },
    ],
  },
  {
    title: "GOVERNANCE & SYSTEM",
    items: [
      { label: "Admin User Access", href: "/admin/users", icon: UserCog },
      { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ShieldCheck },
      { label: "System Backups", href: "/admin/backups", icon: HardDrive },
      { label: "Platform Settings", href: "/admin/settings", icon: Settings },
    ],
  },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Verify authentication on mount
  useEffect(() => {
    async function verifyAuth() {
      try {
        const res = await fetch("/api/admin/auth/me");
        if (res.ok) {
          const data = await res.json();
          if (data.authenticated && data.user) {
            setAdminUser(data.user);
            setLoading(false);
            return;
          }
        }
        // Redirect to login if unauthenticated
        router.push("/admin/login");
      } catch {
        router.push("/admin/login");
      }
    }
    verifyAuth();
  }, [router]);

  // Fetch unread notifications
  useEffect(() => {
    if (!adminUser) return;
    async function fetchNotifs() {
      try {
        const res = await fetch("/api/admin/notifications?limit=5");
        if (res.ok) {
          const data = await res.json();
          if (data.success) {
            setNotifications(data.notifications || []);
          }
        }
      } catch {
        // silent fallback
      }
    }
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 45000);
    return () => clearInterval(interval);
  }, [adminUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      router.push("/admin/login");
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Build breadcrumb segments
  const pathSegments = pathname.split("/").filter(Boolean);
  const breadcrumbs = pathSegments.map((segment, index) => {
    const href = "/" + pathSegments.slice(0, index + 1).join("/");
    const label = segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
    return { href, label };
  });

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#08080a] text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-[#98f90d]/10 border border-[#98f90d]/30 text-[#98f90d]">
            <Activity className="h-7 w-7 animate-pulse text-[#98f90d]" />
            <div className="absolute inset-0 rounded-2xl animate-ping bg-[#98f90d]/10 pointer-events-none" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-white">Newbhar Technologies</p>
            <p className="text-xs font-mono text-[#98f90d] tracking-wider uppercase mt-1">
              Connecting Control Plane...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#08080a] text-white font-sans antialiased selection:bg-[#98f90d]/30 selection:text-white">
      {/* -------------------- SIDEBAR (DESKTOP) -------------------- */}
      <aside
        className={`hidden md:flex flex-col fixed inset-y-0 left-0 z-30 bg-[#0c0e15] border-r border-white/[0.08] transition-all duration-300 ease-in-out shadow-2xl ${
          collapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between px-4 border-b border-white/[0.08] bg-[#0c0e15]/90">
          <Link href="/admin/dashboard" className="flex items-center gap-3 overflow-hidden group">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-black/60 border border-white/10 p-1 shadow-[0_0_15px_rgba(0,255,170,0.25)] transition-transform group-hover:scale-105">
              <img src="/newbhar-technologies-logo.png" alt="Newbhar Technologies" className="h-full w-full object-contain" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-extrabold tracking-tight text-white text-sm">Newbhar Tech</span>
                <span className="text-[10px] font-mono tracking-widest text-[#98f90d] uppercase -mt-0.5 font-bold">
                  Control Plane
                </span>
              </div>
            )}
          </Link>
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={17} /> : <ChevronLeft size={17} />}
          </button>
        </div>

        {/* Sidebar Nav Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
          {SIDEBAR_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-1">
              {!collapsed && (
                <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`flex items-center gap-3 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? "bg-[#98f90d] text-[#050505] font-bold shadow-[0_0_20px_rgba(152,249,13,0.3)]"
                        : "text-gray-400 hover:bg-white/[0.06] hover:text-white"
                    } ${collapsed ? "justify-center px-0 py-2.5" : ""}`}
                  >
                    <Icon size={17} className={`shrink-0 ${isActive ? "text-[#050505]" : "text-gray-400"}`} />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* User Footer in Sidebar */}
        <div className="p-3 border-t border-white/[0.08] bg-[#0c0e15]/80">
          <div
            className={`flex items-center gap-3 rounded-xl p-2 bg-white/[0.04] border border-white/[0.06] ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#98f90d] text-[#050505] font-black text-xs uppercase shadow-sm">
              {adminUser?.name ? adminUser.name.charAt(0) : "A"}
            </div>
            {!collapsed && (
              <div className="flex-1 truncate">
                <div className="truncate text-xs font-bold text-white">{adminUser?.name}</div>
                <div className="text-[10px] font-mono text-[#98f90d] uppercase">{adminUser?.role}</div>
              </div>
            )}
            {!collapsed && (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            )}
          </div>
        </div>
      </aside>

      {/* -------------------- MOBILE DRAWER OVERLAY -------------------- */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="relative flex w-80 flex-col bg-[#0c0e15] border-r border-white/10 z-10 shadow-2xl">
            <div className="flex h-16 items-center justify-between px-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-black/60 border border-white/10 p-1 shadow-[0_0_12px_rgba(0,255,170,0.25)]">
                  <img src="/newbhar-technologies-logo.png" alt="Newbhar Technologies" className="h-full w-full object-contain" />
                </div>
                <span className="font-extrabold tracking-tight text-white text-base">Newbhar Admin</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
              {SIDEBAR_SECTIONS.map((section) => (
                <div key={section.title} className="space-y-1">
                  <div className="px-3 pb-1 text-[10px] font-mono font-bold tracking-widest text-gray-500 uppercase">
                    {section.title}
                  </div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                          isActive
                            ? "bg-[#98f90d] text-[#050505] font-bold shadow-sm"
                            : "text-gray-300 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        <Icon size={18} className={isActive ? "text-[#050505]" : "text-gray-400"} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="flex w-full items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
              >
                <LogOut size={16} />
                <span>Sign Out ({adminUser?.email})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* -------------------- MAIN CONTENT WRAPPER -------------------- */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* TOP NAVIGATION BAR */}
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between px-4 md:px-8 border-b border-white/[0.08] bg-[#0c0e15]/85 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden rounded-lg p-2 text-gray-400 hover:bg-white/10 hover:text-white"
              aria-label="Open mobile menu"
            >
              <Menu size={20} />
            </button>

            {/* Breadcrumb Navigation */}
            <nav className="flex items-center gap-2 text-xs font-medium text-gray-400">
              {breadcrumbs.map((b, i) => (
                <div key={b.href} className="flex items-center gap-2">
                  {i > 0 && <span className="text-gray-600">/</span>}
                  <Link
                    href={b.href}
                    className={`hover:text-white transition ${
                      i === breadcrumbs.length - 1 ? "font-bold text-white" : ""
                    }`}
                  >
                    {b.label}
                  </Link>
                </div>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Database Status Indicator */}
            <div className="hidden lg:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 text-[#98f90d] text-[11px] font-mono font-semibold">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#98f90d] opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#98f90d]" />
              </span>
              <span>Supabase Connected</span>
            </div>

            {/* View Live Public Website */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 text-xs font-semibold text-gray-300 hover:bg-white/[0.08] hover:text-white transition shadow-sm"
              title="Open public website in new tab"
            >
              <span>View Site</span>
              <ExternalLink size={13} className="text-[#98f90d]" />
            </a>

            {/* Notification Center Trigger */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowNotificationsDropdown(!showNotificationsDropdown);
                  setShowProfileDropdown(false);
                }}
                className="relative rounded-full p-2 text-gray-400 hover:bg-white/[0.08] hover:text-white transition"
                aria-label="Notifications"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#98f90d] text-[10px] font-black text-[#050505] shadow-[0_0_8px_#98f90d] animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotificationsDropdown && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-[#12141e] p-4 shadow-2xl border border-white/10 z-50 backdrop-blur-xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
                    <span className="font-bold text-xs text-white">Notifications ({unreadCount})</span>
                    <Link
                      href="/admin/notifications"
                      onClick={() => setShowNotificationsDropdown(false)}
                      className="text-xs text-[#98f90d] hover:underline font-medium"
                    >
                      View all
                    </Link>
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-white/[0.06]">
                    {notifications.length === 0 ? (
                      <p className="py-4 text-center text-xs text-gray-500">No new notifications</p>
                    ) : (
                      notifications.slice(0, 5).map((n) => (
                        <Link
                          key={n.id}
                          href={n.link || "/admin/notifications"}
                          onClick={() => setShowNotificationsDropdown(false)}
                          className={`block p-2 text-xs rounded-xl hover:bg-white/[0.04] transition ${
                            !n.read ? "bg-[#98f90d]/5 font-medium" : "text-gray-400"
                          }`}
                        >
                          <div className="font-bold text-white">{n.title}</div>
                          <div className="text-gray-400 line-clamp-2 mt-0.5">{n.message}</div>
                        </Link>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowProfileDropdown(!showProfileDropdown);
                  setShowNotificationsDropdown(false);
                }}
                className="flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] p-1 pr-3 hover:bg-white/[0.08] transition shadow-sm"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#98f90d] font-black text-xs text-[#050505]">
                  {adminUser?.name ? adminUser.name.charAt(0) : "A"}
                </div>
                <span className="hidden sm:inline text-xs font-semibold text-white">{adminUser?.name}</span>
                <ChevronDown size={14} className="text-gray-400" />
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#12141e] p-2 shadow-2xl border border-white/10 z-50 backdrop-blur-xl">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-bold text-white truncate">{adminUser?.name}</p>
                    <p className="text-[11px] text-gray-400 truncate">{adminUser?.email}</p>
                    <span className="mt-1.5 inline-block rounded-full bg-[#98f90d]/10 border border-[#98f90d]/25 px-2 py-0.5 text-[10px] font-mono font-bold text-[#98f90d]">
                      {adminUser?.role}
                    </span>
                  </div>
                  <Link
                    href="/admin/settings"
                    onClick={() => setShowProfileDropdown(false)}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-gray-300 hover:bg-white/[0.06] hover:text-white transition"
                  >
                    <Settings size={15} />
                    <span>System Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10 transition"
                  >
                    <LogOut size={15} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* MAIN BODY AREA */}
        <main className="flex-1 p-4 md:p-8 max-w-7xl w-full mx-auto">{children}</main>
      </div>
    </div>
  );
}
