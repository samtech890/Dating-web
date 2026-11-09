"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Profile = {
  id: string;
  display_name: string;
  age: number;
  bio: string;
  location_label: string;
  relationship_intention: string;
  avatar_url: string | null;
  is_discoverable: boolean;
};

type Interest = {
  interest: string;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    display_name: "",
    age: "",
    bio: "",
    location_label: "",
    relationship_intention: "not_specified",
    is_discoverable: false,
  });
  const [newInterest, setNewInterest] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const relationshipOptions = [
    { value: "long_term", label: "Long-term relationship" },
    { value: "life_partner", label: "Life partner" },
    { value: "open_to_explore", label: "Open to explore" },
    { value: "not_specified", label: "Not specified yet" },
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setLoading(true);
    setError("");

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

    const { data: profileData, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      if (profileError.code === "PGRST116") {
        setEditMode(true);
        const providerName = [
          user.user_metadata?.full_name,
          user.user_metadata?.name,
          user.user_metadata?.user_name,
          user.user_metadata?.preferred_username,
        ]
          .find((name): name is string => typeof name === "string" && name.trim().length > 0)
          ?.trim()
          .slice(0, 40);
        setFormData({
          ...formData,
          display_name: providerName || user.email?.split("@")[0]?.slice(0, 40) || "",
        });
        setLoading(false);
        return;
      }
      setError(profileError.message);
      setLoading(false);
      return;
    }

    setProfile(profileData);
    setFormData({
      display_name: profileData.display_name,
      age: profileData.age.toString(),
      bio: profileData.bio,
      location_label: profileData.location_label,
      relationship_intention: profileData.relationship_intention,
      is_discoverable: profileData.is_discoverable,
    });

    const { data: interestsData } = await supabase
      .from("profile_interests")
      .select("interest")
      .eq("user_id", user.id);

    setInterests(interestsData?.map((i: Interest) => i.interest) || []);
    setLoading(false);
  };

  const handleSave = async () => {
    setError("");
    setMessage("");
    setSaving(true);

    if (!supabase) {
      setError("Authentication is not configured");
      setSaving(false);
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/auth/login");
      return;
    }

    const ageNum = parseInt(formData.age);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 120) {
      setError("Age must be between 18 and 120");
      setSaving(false);
      return;
    }

    const profileData = {
      id: user.id,
      display_name: formData.display_name,
      age: ageNum,
      bio: formData.bio,
      location_label: formData.location_label,
      relationship_intention: formData.relationship_intention,
      is_discoverable: formData.is_discoverable,
    };

    const { error } = await supabase
      .from("profiles")
      .upsert(profileData, { onConflict: "id" })
      .select()
      .single();

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    setMessage("Profile saved successfully");
    setEditMode(false);
    loadProfile();
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        display_name: profile.display_name,
        age: profile.age.toString(),
        bio: profile.bio,
        location_label: profile.location_label,
        relationship_intention: profile.relationship_intention,
        is_discoverable: profile.is_discoverable,
      });
    }
    setEditMode(false);
    setError("");
  };

  const addInterest = async () => {
    if (!newInterest.trim() || interests.includes(newInterest.trim())) return;

    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profile_interests")
      .insert({ user_id: user.id, interest: newInterest.trim() });

    if (error) {
      setError(error.message);
      return;
    }

    setInterests([...interests, newInterest.trim()]);
    setNewInterest("");
  };

  const removeInterest = async (interest: string) => {
    if (!supabase) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("profile_interests")
      .delete()
      .eq("user_id", user.id)
      .eq("interest", interest);

    if (error) {
      setError(error.message);
      return;
    }

    setInterests(interests.filter((i) => i !== interest));
  };

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setError("Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.");
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("File size exceeds 5MB limit");
      return;
    }

    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return;

    setUploadingAvatar(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", avatarFile);

      const response = await fetch("/api/avatar/upload", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to upload avatar");
        setUploadingAvatar(false);
        return;
      }

      setMessage("Avatar uploaded successfully");
      setAvatarFile(null);
      setAvatarPreview("");
      loadProfile();
    } catch (err) {
      setError("Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleAvatarRemove = async () => {
    setUploadingAvatar(true);
    setError("");

    try {
      const response = await fetch("/api/avatar/remove", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to remove avatar");
        setUploadingAvatar(false);
        return;
      }

      setMessage("Avatar removed successfully");
      loadProfile();
    } catch (err) {
      setError("Failed to remove avatar");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const cancelAvatarUpload = () => {
    setAvatarFile(null);
    setAvatarPreview("");
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg)" }}>
        <div className="text-center" style={{ color: "var(--muted)" }}>Loading profile...</div>
      </div>
    );
  }

  if (!profile && !editMode) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "var(--bg)" }}>
        <div className="w-full max-w-md text-center">
          <h1 className="text-2xl font-semibold mb-4" style={{ color: "var(--text)" }}>Create your profile</h1>
          <p className="mb-6" style={{ color: "var(--muted)" }}>Tell us a bit about yourself to get started</p>
          <button
            onClick={() => setEditMode(true)}
            className="px-6 py-3 rounded-lg font-semibold transition-all duration-200 hover:translate-y-[-2px]"
            style={{ background: "#a27bed", color: "#100d16" }}
          >
            Get started
          </button>
        </div>
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
          <button
            onClick={handleSignOut}
            className="text-sm font-medium hover:underline"
            style={{ color: "var(--muted)" }}
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2" style={{ color: "var(--text)" }}>
            {editMode ? "Create your profile" : "My Profile"}
          </h1>
          <p style={{ color: "var(--muted)" }}>
            {editMode ? "Tell us about yourself to start connecting" : "Manage your profile information"}
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

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Basic Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                    Display name
                  </label>
                  <input
                    type="text"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: editMode ? "var(--bg)" : "transparent", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                    maxLength={40}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                    Age
                  </label>
                  <input
                    type="number"
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    disabled={!editMode}
                    min={18}
                    max={120}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: editMode ? "var(--bg)" : "transparent", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location_label}
                    onChange={(e) => setFormData({ ...formData, location_label: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: editMode ? "var(--bg)" : "transparent", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                    placeholder="City, State"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                    Bio
                  </label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                    disabled={!editMode}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed resize-none"
                    style={{ background: editMode ? "var(--bg)" : "transparent", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                  />
                  <p className="mt-1 text-xs text-right" style={{ color: "var(--muted)" }}>
                    {formData.bio.length}/500
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2" style={{ color: "var(--text)" }}>
                    Looking for
                  </label>
                  <select
                    value={formData.relationship_intention}
                    onChange={(e) => setFormData({ ...formData, relationship_intention: e.target.value })}
                    disabled={!editMode}
                    className="w-full px-4 py-3 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ background: editMode ? "var(--bg)" : "transparent", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    {relationshipOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="discoverable"
                    checked={formData.is_discoverable}
                    onChange={(e) => setFormData({ ...formData, is_discoverable: e.target.checked })}
                    disabled={!editMode}
                    className="w-5 h-5 rounded border transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ accentColor: "#a27bed", borderColor: "rgba(233,224,255,.12)" }}
                  />
                  <label htmlFor="discoverable" className="text-sm" style={{ color: "var(--text)" }}>
                    Make my profile discoverable to others
                  </label>
                </div>
              </div>

              {editMode ? (
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1 py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ background: "#a27bed", color: "#100d16" }}
                  >
                    {saving ? "Saving..." : "Save profile"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={saving}
                    className="px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                    style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setEditMode(true)}
                  className="mt-6 py-3 px-4 rounded-lg font-semibold transition-all duration-200 hover:translate-y-[-2px]"
                  style={{ background: "#a27bed", color: "#100d16" }}
                >
                  Edit profile
                </button>
              )}
            </div>

            <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Interests</h2>
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest) => (
                  <span
                    key={interest}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm"
                    style={{ background: "rgba(165,124,244,0.15)", color: "#d7baf6", border: "1px solid rgba(165,124,244,0.3)" }}
                  >
                    {interest}
                    <button
                      onClick={() => removeInterest(interest)}
                      className="ml-1 hover:text-red-400 transition-colors"
                      aria-label={`Remove ${interest}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && addInterest()}
                  placeholder="Add an interest..."
                  className="flex-1 px-4 py-2 rounded-lg border transition-all duration-200 focus:outline-none focus:border-purple-400"
                  style={{ background: "var(--bg)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                  maxLength={40}
                />
                <button
                  onClick={addInterest}
                  className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px]"
                  style={{ background: "#a27bed", color: "#100d16" }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Profile Photo</h2>
              
              {avatarPreview ? (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden relative" style={{ background: "var(--bg)" }}>
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleAvatarUpload}
                      disabled={uploadingAvatar}
                      className="flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{ background: "#a27bed", color: "#100d16" }}
                    >
                      {uploadingAvatar ? "Uploading..." : "Save photo"}
                    </button>
                    <button
                      onClick={cancelAvatarUpload}
                      disabled={uploadingAvatar}
                      className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                      style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square rounded-lg overflow-hidden mb-4 flex items-center justify-center relative" style={{ background: "var(--bg)" }}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <svg viewBox="0 0 36 36" fill="none" className="w-24 h-24" style={{ color: "rgba(233,224,255,.2)" }}>
                    <path d="M18 29.2 6.3 18.1a7 7 0 0 1 9.9-9.9L18 10l1.8-1.8a7 7 0 0 1 9.9 9.9L18 29.2Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"/>
                    <path d="M11.4 18h4l2-3.8 2.5 7.2 1.8-3.4h3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
                  </div>
                  
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
                    onChange={handleAvatarSelect}
                    className="hidden"
                  />
                  
                  <div className="flex gap-2">
                    <label
                      htmlFor="avatar-upload"
                      className="flex-1 py-2 px-4 rounded-lg font-medium text-center cursor-pointer transition-all duration-200 hover:translate-y-[-2px]"
                      style={{ background: "#a27bed", color: "#100d16" }}
                    >
                      {profile?.avatar_url ? "Change photo" : "Upload photo"}
                    </label>
                    
                    {profile?.avatar_url && (
                      <button
                        onClick={handleAvatarRemove}
                        disabled={uploadingAvatar}
                        className="px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:translate-y-[-2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                        style={{ background: "var(--surface)", borderColor: "rgba(239,68,68,0.3)", color: "#ef4444" }}
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  
                  <p className="text-xs" style={{ color: "var(--muted)" }}>
                    JPEG, PNG, WebP, or GIF. Max 5MB. Your photo will be visible to other members.
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 rounded-lg border" style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)" }}>
              <h2 className="text-lg font-semibold mb-4" style={{ color: "var(--text)" }}>Profile Preview</h2>
              <h3 className="text-xl font-semibold" style={{ color: "var(--text)" }}>
                {formData.display_name}
              </h3>
              <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                {formData.age} · {formData.location_label || "Location not set"}
              </p>
              <p className="mt-3 text-sm" style={{ color: "var(--text)" }}>
                {formData.bio || "No bio yet"}
              </p>
              <div className="mt-4 pt-4 border-t" style={{ borderColor: "rgba(233,224,255,.12)" }}>
                <p className="text-sm" style={{ color: "var(--muted)" }}>
                  Looking for: <span style={{ color: "var(--text)" }}>{relationshipOptions.find(o => o.value === formData.relationship_intention)?.label}</span>
                </p>
              </div>
            </div>

            <Link
              href="/settings"
              className="block p-6 rounded-lg border transition-all duration-200 hover:border-purple-400"
              style={{ background: "var(--surface)", borderColor: "rgba(233,224,255,.12)", color: "var(--text)" }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Account Settings</h2>
                  <p className="text-sm mt-1" style={{ color: "var(--muted)" }}>
                    Manage your account preferences
                  </p>
                </div>
                <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
