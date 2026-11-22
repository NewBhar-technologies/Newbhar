"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Shield, Lock, Mail, ArrowRight, AlertCircle, Sparkles } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setError(data.error || "Authentication failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      // Successful login
      router.push("/admin/dashboard");
      router.refresh();
    } catch {
      setError("Unable to connect to authentication service.");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 py-12 text-white relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#98f90d]/[0.04] rounded-full blur-[140px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Brand Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-[#98f90d] text-[#050505] font-black text-2xl shadow-[0_0_25px_rgba(152,249,13,0.35)] mb-4">
            N
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">
            Newbhar Technologies <span className="text-[#98f90d]">Control Plane</span>
          </h1>
          <p className="mt-1.5 text-xs text-gray-400 font-mono tracking-wider uppercase">
            Enterprise Operations &amp; CMS Portal
          </p>
        </div>

        {/* Login Box */}
        <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-8 shadow-2xl backdrop-blur-2xl">
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-2xl border border-red-500/30 bg-red-950/30 p-4 text-xs text-red-300">
              <AlertCircle size={18} className="shrink-0 text-red-400 mt-0.5" />
              <div>
                <p className="font-semibold text-red-200">Access Denied</p>
                <p className="mt-0.5 text-red-300/90">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400 mb-2">
                Administrator Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Mail size={16} />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@newbhar.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-[11px] font-mono font-bold tracking-widest uppercase text-gray-400">
                  Password
                </label>
                <Link
                  href="/admin/forgot-password"
                  className="text-xs text-[#98f90d] hover:underline transition font-medium"
                >
                  Forgot?
                </Link>
              </div>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-500">
                  <Lock size={16} />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] py-3 pl-10 pr-4 text-sm text-white placeholder-gray-600 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-[#98f90d] py-3.5 px-4 text-xs font-black tracking-wider uppercase text-[#050505] transition-all hover:bg-[#86e00b] shadow-[0_0_20px_rgba(152,249,13,0.3)] disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Control Plane</span>
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/[0.08] flex items-center justify-between text-[11px] text-gray-500 font-mono">
            <span>Supabase RLS Protected</span>
            <Link href="/" className="hover:text-white transition">
              ← Back to Site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
