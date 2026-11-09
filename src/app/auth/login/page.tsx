"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialAuthButtons from "@/components/SocialAuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (!supabase) {
      setError("Authentication is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Signing you in...");
    setTimeout(() => {
      router.push("/profile");
      router.refresh();
    }, 500);
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
            Welcome back
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Sign in to continue your journey
          </p>
        </div>

        <div className="space-y-4">
          <SocialAuthButtons
            loading={loading}
            onLoadingChange={setLoading}
            onError={setError}
            showGoogle
          />
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: "rgba(233,224,255,.12)" }} />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-transparent" style={{ background: "var(--bg)", color: "var(--muted)" }}>
                or continue with email
              </span>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                Password
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

            <div className="flex items-center justify-between">
              <Link
                href="/auth/forgot-password"
                className="text-sm hover:underline"
                style={{ color: "var(--purple)" }}
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
              style={{ background: "#a27bed", color: "#100d16" }}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
            Don't have an account?{" "}
            <Link href="/auth/register" className="font-medium hover:underline" style={{ color: "var(--purple)" }}>
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
