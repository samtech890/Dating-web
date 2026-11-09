"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    setLoading(true);

    if (!supabase) {
      setError("Authentication is not configured");
      setLoading(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    setUserEmail(user.email || "");
    setLoading(false);
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      return;
    }

    if (!supabase) return;

    const { error } = await supabase.rpc("delete_user_account");
    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Account deletion initiated. Check your email for confirmation.");
  };

  const tabs = [
    { id: "profile", label: "Profile" },
    { id: "account", label: "Account" },
    { id: "privacy", label: "Privacy" },
    { id: "notifications", label: "Notifications" },
    { id: "security", label: "Security" },
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center" style={{ color: "var(--muted)" }}>Loading settings...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg)" }}>
      <header className="sticky top-0 z-20 px-6 py-4 border-b" style={{ background: "rgba(11,10,16,.87)", borderColor: "rgba(255,255,255,.07)", backdropFilter: "blur(18px)" }}>
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight" style={{ color: "#be9af7" }}>
            <svg viewBox="0 0 36 36" fill="none" className="w-7 h-7" aria-hidden="true">
              <path d="M18 29.2 6.3 18.1a7 7 0 0 1 9.9-9.9L18 10l1.8-1.8a7 7 0 0 1 9.9 9.9L18 29.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
              <path d="M11.4 18h4l2-3.8 2.5 7.2 1.8-3.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>heart<span style={{ fontWeight: 400, color: "#d5c9e2" }}>link</span></span>
          </Link>
          <Link
            href="/profile"
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--muted)" }}
          >
            Back to profile
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ color: "var(--text)" }}>
            Account Settings
          </h1>
          <p style={{ color: "var(--muted)" }}>
            Manage your account preferences and privacy controls
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)" }}>
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg text-sm" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e", border: "1px solid rgba(34,197,94,0.2)" }}>
            {message}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? "font-medium"
                      : "hover:bg-white/5"
                  }`}
                  style={{
                    background: activeTab === tab.id ? "rgba(165,124,244,0.15)" : "transparent",
                    color: activeTab === tab.id ? "#d7baf6" : "var(--muted)",
                    border: activeTab === tab.id ? "1px solid rgba(165,124,244,0.3)" : "none",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="lg:col-span-3">
            {activeTab === "profile" && (
              <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>Profile Settings</h2>
                <div className="space-y-4">
                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:border-purple-400"
                    style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    <div>
                      <h3 className="font-medium">Edit Profile</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Update your display name, bio, and interests
                      </p>
                    </div>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:border-purple-400"
                    style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    <div>
                      <h3 className="font-medium">Manage Avatar</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Upload, change, or remove your profile photo
                      </p>
                    </div>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>

                  <Link
                    href="/profile"
                    className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:border-purple-400"
                    style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    <div>
                      <h3 className="font-medium">Profile Preview</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        See how your profile appears to others
                      </p>
                    </div>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>
                </div>
              </div>
            )}

            {activeTab === "account" && (
              <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>Account Settings</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                      Email address
                    </label>
                    <div className="px-4 py-3 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--muted)" }}>
                      {userEmail}
                    </div>
                    <p className="mt-2 text-xs" style={{ color: "var(--muted)" }}>
                      Email changes require verification. Contact support for assistance.
                    </p>
                  </div>

                  <Link
                    href="/auth/forgot-password"
                    className="flex items-center justify-between p-4 rounded-lg border transition-all duration-200 hover:border-purple-400"
                    style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    <div>
                      <h3 className="font-medium">Change Password</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Reset your password via email
                      </p>
                    </div>
                    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </Link>

                  <div className="pt-6 border-t" style={{ borderColor: "rgba(233,224,255,.12)" }}>
                    <button
                      onClick={handleSignOut}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px]"
                      style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                    >
                      Sign out
                    </button>
                  </div>

                  <div className="pt-6 border-t" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
                    <h3 className="font-medium mb-2" style={{ color: "#ef4444" }}>Danger Zone</h3>
                    <p className="text-sm mb-4" style={{ color: "var(--muted)" }}>
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                    <button
                      onClick={handleDeleteAccount}
                      className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px]"
                      style={{ background: "rgba(239,68,68,0.1)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                    >
                      Delete account
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "privacy" && (
              <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>Privacy Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Profile Visibility</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Control who can see your profile
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="text-sm font-medium hover:underline"
                      style={{ color: "var(--purple)" }}
                    >
                      Manage
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Discovery Visibility</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Control if you appear in discovery
                      </p>
                    </div>
                    <Link
                      href="/profile"
                      className="text-sm font-medium hover:underline"
                      style={{ color: "var(--purple)" }}
                    >
                      Manage
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Blocked Users</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Manage users you've blocked
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Account Data</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Request or download your data
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "notifications" && (
              <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>Notification Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Match Notifications</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Get notified when you have a new match
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Message Notifications</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Get notified when you receive messages
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Email Notifications</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Manage email notification preferences
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>In-App Notifications</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Control in-app notification display
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "security" && (
              <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
                <h2 className="text-xl font-semibold mb-4" style={{ color: "var(--text)" }}>Security Settings</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Password</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Last changed recently
                      </p>
                    </div>
                    <Link
                      href="/auth/forgot-password"
                      className="text-sm font-medium hover:underline"
                      style={{ color: "var(--purple)" }}
                    >
                      Change
                    </Link>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Connected Accounts</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        Manage linked accounts
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-lg border" style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)" }}>
                    <div>
                      <h3 className="font-medium" style={{ color: "var(--text)" }}>Active Sessions</h3>
                      <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                        View and manage active sessions
                      </p>
                    </div>
                    <span className="text-sm" style={{ color: "var(--muted)" }}>
                      Coming soon
                    </span>
                  </div>

                  <div className="p-4 rounded-lg border" style={{ background: "rgba(165,124,244,0.05)", borderColor: "rgba(165,124,244,0.2)" }}>
                    <h3 className="font-medium mb-2" style={{ color: "var(--text)" }}>Security Tips</h3>
                    <ul className="space-y-2 text-sm" style={{ color: "var(--muted)" }}>
                      <li>• Use a strong, unique password</li>
                      <li>• Enable two-factor authentication when available</li>
                      <li>• Don't share your password with anyone</li>
                      <li>• Sign out from shared devices</li>
                      <li>• Keep your email account secure</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
