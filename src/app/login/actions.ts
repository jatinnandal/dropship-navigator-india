"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function sendMagicLink(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) {
    redirect("/login?error=missing_email");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=missing_supabase_config");
  }

  const headerStore = await headers();
  const origin = headerStore.get("origin") ?? "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback?next=/app`;

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  });

  if (error) {
    redirect("/login?error=auth_failed");
  }

  redirect("/login?check_email=1");
}
