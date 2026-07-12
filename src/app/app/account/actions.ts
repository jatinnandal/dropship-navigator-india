"use server";

import { redirect } from "next/navigation";
import { getCurrentUserEmail } from "@/lib/current-user";
import { mapSupabaseAuthErrorCode } from "@/lib/auth-setup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function changePassword(formData: FormData) {
  const current = String(formData.get("current_password") ?? "");
  const next = String(formData.get("new_password") ?? "");
  const confirm = String(formData.get("confirm_password") ?? "");

  if (!current) redirect("/app/account?error=missing_current");
  if (next.length < 6) redirect("/app/account?error=weak_password");
  if (next !== confirm) redirect("/app/account?error=password_mismatch");
  if (next === current) redirect("/app/account?error=same_password");

  const email = await getCurrentUserEmail();
  if (!email) redirect("/login");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/app/account?error=unavailable");

  // Re-verify the current password before allowing a change (defence against a
  // walk-up on an unlocked session). Google-only accounts have no password and
  // will fail here - expected.
  const { error: verifyError } = await supabase.auth.signInWithPassword({ email, password: current });
  if (verifyError) redirect("/app/account?error=wrong_current");

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) redirect(`/app/account?error=${encodeURIComponent(mapSupabaseAuthErrorCode(error))}`);

  redirect("/app/account?message=password_changed");
}
