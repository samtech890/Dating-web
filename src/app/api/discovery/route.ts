import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.json({ error: "Discovery is not configured yet." }, { status: 503 });
  }

  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError || !authData.user) {
    return NextResponse.json({ error: "Sign in to discover profiles." }, { status: 401 });
  }

  const searchParams = new URL(request.url).searchParams;
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit")) || 20));
  const offset = Math.min(500, Math.max(0, Number(searchParams.get("offset")) || 0));

  const { data, error } = await supabase.rpc("get_discovery_candidates", {
    p_limit: limit,
    p_offset: offset,
  });

  if (error) {
    console.error("Discovery candidate request failed", error.code);
    return NextResponse.json(
      { error: "Discovery is not ready for this account. Complete your profile and preferences first." },
      { status: 409 },
    );
  }

  return NextResponse.json({ profiles: data ?? [], limit, offset });
}
