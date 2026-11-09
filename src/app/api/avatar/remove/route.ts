import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Storage is not configured yet." }, { status: 503 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Sign in to remove your avatar." }, { status: 401 });
  }

  try {
    // Get current profile to find avatar URL
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", authData.user.id)
      .single();

    if (profileError || !profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    if (!profile.avatar_url) {
      return NextResponse.json({ error: "No avatar to remove" }, { status: 400 });
    }

    // Extract file path from URL
    const url = new URL(profile.avatar_url);
    const pathParts = url.pathname.split("/avatars/");
    if (pathParts.length < 2) {
      return NextResponse.json({ error: "Invalid avatar URL" }, { status: 400 });
    }

    const filePath = pathParts[1];

    // Remove file from storage
    const { error: removeError } = await supabase.storage
      .from("avatars")
      .remove([filePath]);

    if (removeError) {
      console.error("Avatar removal failed", removeError);
      return NextResponse.json({ error: "Failed to remove avatar" }, { status: 500 });
    }

    // Update profile to remove avatar URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ avatar_url: null })
      .eq("id", authData.user.id);

    if (updateError) {
      console.error("Profile update failed", updateError);
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Avatar removal error", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
