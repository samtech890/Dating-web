import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function loginWithError(requestUrl: URL, message: string) {
  const loginUrl = new URL("/auth/login", requestUrl.origin);
  loginUrl.searchParams.set("authError", message.slice(0, 400));
  return NextResponse.redirect(loginUrl);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    const providerError =
      requestUrl.searchParams.get("error_description") ||
      requestUrl.searchParams.get("error");
    return loginWithError(
      requestUrl,
      providerError || "Sign-in could not be completed. Please try again."
    );
  }

  try {
    const supabase = await createSupabaseServerClient();
    if (!supabase) {
      return loginWithError(requestUrl, "Authentication is not configured. Please contact support.");
    }

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      return loginWithError(requestUrl, error.message);
    }
  } catch {
    return loginWithError(requestUrl, "Sign-in could not be completed. Please try again.");
  }

  return NextResponse.redirect(new URL("/profile", requestUrl.origin));
}
