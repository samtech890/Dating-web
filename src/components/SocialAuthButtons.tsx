"use client";

import { useEffect } from "react";
import type { Provider } from "@supabase/supabase-js";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type SocialAuthButtonsProps = {
  loading: boolean;
  onLoadingChange: (loading: boolean) => void;
  onError: (message: string) => void;
  showGoogle?: boolean;
};

const providers = [
  { id: "x", label: "X", scopes: "users.read" },
  { id: "github", label: "GitHub", scopes: "read:user" },
  { id: "google", label: "Google" },
] as const;

export default function SocialAuthButtons({
  loading,
  onLoadingChange,
  onError,
  showGoogle = false,
}: SocialAuthButtonsProps) {
  useEffect(() => {
    const authError = new URLSearchParams(window.location.search).get("authError");
    if (authError) {
      onError(authError);
    }
  }, [onError]);

  const handleSignIn = async (provider: (typeof providers)[number]) => {
    onError("");
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      onError("Authentication is not configured. Please contact support.");
      return;
    }

    onLoadingChange(true);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        // The installed SDK supports the `x` Auth endpoint at runtime but omits it from Provider.
        provider: provider.id as Provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          ...(provider.id === "x" || provider.id === "github"
            ? { scopes: provider.scopes }
            : {}),
        },
      });

      if (error) {
        onError(error.message);
        onLoadingChange(false);
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : "Unable to start sign-in. Please try again.");
      onLoadingChange(false);
    }
  };

  return (
    <div className="space-y-3">
      {providers.filter((provider) => provider.id !== "google" || showGoogle).map((provider) => (
        <button
          key={provider.id}
          type="button"
          onClick={() => handleSignIn(provider)}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border transition-all duration-200 hover:border-purple-400 hover:bg-white/[0.03] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            background: "var(--surface)",
            borderColor: "rgba(233,224,255,.12)",
            color: "var(--text)",
          }}
        >
          {provider.id === "x" && (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3l-5-7.1L5.7 22H2.5l7.3-8.4L2 2h6.5l4.6 6.5L18.9 2Zm-1.1 18h1.7L7.5 3.9H5.7L17.8 20Z" />
            </svg>
          )}
          {provider.id === "github" && (
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 .9a11.1 11.1 0 0 0-3.51 21.63c.56.1.76-.24.76-.54v-2.1c-3.1.68-3.76-1.32-3.76-1.32-.51-1.3-1.25-1.65-1.25-1.65-1.02-.7.08-.69.08-.69 1.13.08 1.73 1.16 1.73 1.16 1 .1.79 2.46 3.6 1.75.1-.73.4-1.22.72-1.5-2.48-.28-5.09-1.25-5.09-5.55 0-1.23.44-2.24 1.16-3.03-.12-.28-.5-1.44.11-2.99 0 0 .95-.3 3.06 1.16a10.6 10.6 0 0 1 5.57 0c2.12-1.44 3.06-1.16 3.06-1.16.61 1.55.23 2.71.11 2.99.72.79 1.16 1.8 1.16 3.03 0 4.31-2.62 5.26-5.11 5.54.4.35.76 1.03.76 2.08v3.08c0 .3.2.65.77.54A11.1 11.1 0 0 0 12 .9Z" />
            </svg>
          )}
          {provider.id === "google" && (
            <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
            </svg>
          )}
          <span className="font-medium">
            {loading ? "Connecting..." : `Continue with ${provider.label}`}
          </span>
        </button>
      ))}
    </div>
  );
}
