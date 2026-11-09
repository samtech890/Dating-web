"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialAuthButtons from "@/components/SocialAuthButtons";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleRegister = async (e: React.FormEvent) => {
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

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    setMessage("Check your email for the confirmation link to complete your registration.");
    setLoading(false);
  };

  const handleGoogleRegister = async () => {
    setError("");
    setLoading(true);

    if (!supabase) {
      setError("Authentication is not configured. Please contact support.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
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
            Create your account
          </h1>
          <p className="mt-2 text-sm" style={{ color: "var(--muted)" }}>
            Start your journey to meaningful connections
          </p>
        </div>

        <div className="space-y-4">
          <SocialAuthButtons
            loading={loading}
            onLoadingChange={setLoading}
            onError={setError}
          />
          <button
            onClick={handleGoogleRegister}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-lg border transition-all duration-200 hover:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="font-medium">Continue with Google</span>
          </button>

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

          <form onSubmit={handleRegister} className="space-y-4">
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
                minLength={6}
              />
              <p className="mt-1 text-xs" style={{ color: "var(--muted)" }}>
                Must be at least 6 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                Confirm password
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
              {loading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="text-center text-sm" style={{ color: "var(--muted)" }}>
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium hover:underline" style={{ color: "var(--purple)" }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
