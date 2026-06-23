"use server";

import { redirect } from "next/navigation";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function encodeError(errorCode: string | undefined, fallback: string): string {
  return encodeURIComponent(errorCode ?? fallback);
}

function encodeDetail(message: string | undefined, fallback = "Request failed."): string {
  return encodeURIComponent(message ?? fallback);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  if (!email) {
    redirect("/login?error=missing_email");
  }
  if (!password) {
    redirect("/login?error=missing_password");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=missing_supabase_config");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeError(error.code, "invalid_credentials")}`);
  }

  redirect("/app");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("signup_email") ?? formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("signup_password") ?? formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!email) {
    redirect("/signup?error=missing_email");
  }
  if (!password) {
    redirect("/signup?error=missing_password");
  }
  if (password !== confirmPassword) {
    redirect("/signup?error=password_mismatch");
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/signup?error=missing_supabase_config");
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    redirect("/signup?error=missing_service_role_config");
  }

  const { error } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    const mappedCode =
      error.code === "email_exists" || error.code === "user_already_exists"
        ? "user_already_exists"
        : error.code;

    redirect(
      `/signup?error=${encodeError(mappedCode, "signup_failed")}&detail=${encodeDetail(error.message)}`,
    );
  }

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) {
    redirect(
      `/signup?error=${encodeError(signInError.code, "invalid_credentials")}&detail=${encodeDetail(signInError.message)}`,
    );
  }

  redirect("/app");
}
