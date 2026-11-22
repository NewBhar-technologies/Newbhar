"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, ArrowRight, AlertCircle, CheckCircle2 } from "lucide-react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialToken = searchParams.get("token") || "";

  const [token, setToken] = useState(initialToken);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok || !data.success) {
        setError(data.error || "Password reset failed.");
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/admin/login");
      }, 2500);
    } catch {
      setError("Failed to connect to authentication server.");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl border border-white/10 bg-[#0f111a]/90 p-8 shadow-2xl backdrop-blur-xl">
      {error && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-300">
          <AlertCircle size={18} className="shrink-0 text-rose-400 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      {success ? (
        <div className="space-y-4 text-center py-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#98f90d]/10 text-[#98f90d] border border-[#98f90d]/30">
            <CheckCircle2 size={24} />
          </div>
          <h3 className="text-lg font-bold text-white">Password Updated</h3>
          <p className="text-xs text-neutral-400">
            Your administrator password has been updated securely. Redirecting to login...
          </p>
          <div className="pt-2">
            <Link
              href="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs text-[#98f90d] hover:underline font-bold"
            >
              <span>Click here if not redirected</span>
            </Link>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {!initialToken && (
            <div className="space-y-1.5">
              <label className="block text-[11px] font-mono font-medium tracking-wider uppercase text-neutral-400">
                Reset Token
              </label>
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste token from recovery email"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 px-4 text-sm text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-medium tracking-wider uppercase text-neutral-400">
              New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 8 characters"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-[11px] font-mono font-medium tracking-wider uppercase text-neutral-400">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-neutral-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
                className="w-full rounded-xl border border-white/10 bg-black/40 py-3 pl-10 pr-4 text-sm text-white placeholder-neutral-500 focus:border-[#98f90d] focus:outline-none focus:ring-1 focus:ring-[#98f90d] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#98f90d] py-3.5 px-6 font-bold text-black transition-all hover:bg-[#86dc0b] hover:shadow-[0_0_20px_rgba(152,249,13,0.3)] disabled:opacity-50 text-sm cursor-pointer shadow-md"
          >
            <span>{loading ? "Updating Credentials..." : "Set New Password"}</span>
            <ArrowRight size={16} />
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#08080a] px-4 py-12 text-white relative overflow-hidden">
      {/* Background glow effects */}
      <div className="pointer-events-none absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full bg-[#98f90d]/5 blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[#98f90d] text-black font-black text-xl shadow-[0_0_20px_rgba(152,249,13,0.3)] mb-4">
            N
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white font-display">Create New Password</h1>
          <p className="mt-1 text-xs text-neutral-400">
            Choose a strong password with at least 8 characters.
          </p>
        </div>

        <Suspense fallback={<div className="p-8 text-center text-neutral-400">Loading form...</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
