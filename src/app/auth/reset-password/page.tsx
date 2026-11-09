"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    if (!supabase) {
      setError("Authentication is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Password updated successfully. Redirecting to login...");
    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-xl font-semibold tracking-tight" style={{ color: "#be9af7" }}>
            <svg viewBox="0 0 36 36" fill="none" className="w-8 h-8" aria-hidden="true">
              <path d="M18 29.2 6.3 18.1a7 7 0 0 1 9.9-9.9L18 10l1.8-1.8a7 7 0 0 1 9.9 9.9L18 29.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
              <path d="M11.4 18h4l2-3.8 2.5 7.2 1.8-3.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>heart<span style={{ fontWeight: 400, color: "#d5c9e2" }}>link</span></span>
          </Link>
          <h1 className="mt-6 text-3xl font-semibold tracking-tight" style={{ color: "var(--text)" }}>
            Set new password
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Enter your new password below
          </p>
        </div>

        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              New password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
              placeholder="••••••••"
              minLength={6}
            />
            <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
              Must be at least 6 characters
            </p>
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
              placeholder="••••••••"
              minLength={6}
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
              {error}
            </div>
          )}

          {message && (
            <div className="p-3 rounded-lg text-sm" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            style={{ background: "#a27bed", color: "#100d16" }}
          >
            {loading ? "Updating password..." : "Update password"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm" style={{ color: "var(--muted)" }}>
          <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--purple)" }}>
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
