import { NextResponse, type NextRequest } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { getPostAuthRedirect } from "@/lib/auth-routing";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const nextParam = url.searchParams.get("next");

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
  }

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    const destination =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : await getPostAuthRedirect(data.user.id);

    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({
      type,
      token_hash: tokenHash,
    });

    if (error || !data.user) {
      return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
    }

    const destination =
      nextParam && nextParam.startsWith("/") && !nextParam.startsWith("//")
        ? nextParam
        : await getPostAuthRedirect(data.user.id);

    return NextResponse.redirect(new URL(destination, request.url));
  }

  return NextResponse.redirect(new URL("/login?error=auth_failed", request.url));
}
