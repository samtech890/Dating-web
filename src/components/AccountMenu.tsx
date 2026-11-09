"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Profile = {
  display_name: string;
  avatar_url: string | null;
};

export default function AccountMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData);
    }
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    setIsOpen(false);
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="w-10 h-10 rounded-full animate-pulse" style={{ background: "rgba(233,224,255,.12)" }} />
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 hover:bg-white/5"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center" style={{ background: "rgba(165,124,244,0.2)" }}>
          {profile?.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
          ) : (
            <svg viewBox="0 0 36 36" fill="none" className="w-5 h-5" style={{ color: "#be9af7" }}>
              <path d="M18 29.2 6.3 18.1a7 7 0 0 1 9.9-9.9L18 10l1.8-1.8a7 7 0 0 1 9.9 9.9L18 29.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
              <path d="M11.4 18h4l2-3.8 2.5 7.2 1.8-3.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </div>
        <span className="text-sm font-medium hidden sm:block" style={{ color: "var(--text)" }}>
          {profile?.display_name || "Account"}
        </span>
        <svg className={`w-4 h-4 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ color: "var(--muted)" }}>
          <path d="M5 7.5l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border shadow-xl z-20" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
            <div className="p-3 border-b" style={{ borderColor: "rgba(233,224,255,.12)" }}>
              <p className="text-sm font-medium" style={{ color: "var(--text)" }}>
                {profile?.display_name || "Account"}
              </p>
            </div>
            
            <div className="p-1">
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
                style={{ color: "var(--text)" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ color: "var(--muted)" }}>
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                My Profile
              </Link>
              
              <Link
                href="/profile"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
                style={{ color: "var(--text)" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ color: "var(--muted)" }}>
                  <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Edit Profile
              </Link>
              
              <Link
                href="/settings"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/5"
                style={{ color: "var(--text)" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ color: "var(--muted)" }}>
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Settings
              </Link>
              
              <div className="my-1 border-t" style={{ borderColor: "rgba(233,224,255,.12)" }} />
              
              <button
                onClick={handleSignOut}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-all duration-200 hover:bg-white/5 text-left"
                style={{ color: "#ef4444" }}
              >
                <svg className="w-4 h-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
