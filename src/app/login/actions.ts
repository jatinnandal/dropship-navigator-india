"use server";

import { redirect } from "next/navigation";
import { confirmExistingUserEmail, ensureConfirmedUserWithPassword, isInstantSignupEnabled } from "@/lib/auth-admin";
import { getPostAuthRedirect } from "@/lib/auth-routing";
import { mapSupabaseAuthErrorCode } from "@/lib/auth-setup";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function encodeError(errorCode: string): string {
  return encodeURIComponent(errorCode);
}

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

async function redirectAfterAuth(userId: string, next?: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    redirect(next);
  }
  redirect(await getPostAuthRedirect(userId));
}

async function signInOrRedirect(
  email: string,
  password: string,
  next: string | null,
  errorPath: "/login" | "/signup",
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect(`${errorPath}?error=unavailable`);
  }

  let { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const repaired =
      isInstantSignupEnabled() &&
      error.message.toLowerCase().includes("invalid login credentials") &&
      (await confirmExistingUserEmail(email));

    if (repaired) {
      const retry = await supabase.auth.signInWithPassword({ email, password });
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      const unconfirmed =
        error.message.toLowerCase().includes("email not confirmed") ||
        error.code === "email_not_confirmed";
      const code = unconfirmed ? "email_not_confirmed" : "invalid_credentials";
      redirect(`${errorPath}?error=${encodeError(code)}&email=${encodeURIComponent(email)}`);
    }
  }

  if (!data?.user) {
    redirect(`${errorPath}?error=${encodeError("invalid_credentials")}`);
  }

  await redirectAfterAuth(data.user.id, next);
}

export async function signInWithPassword(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "") || null;

  if (!email) redirect("/login?error=missing_email");
  if (!password) redirect("/login?error=missing_password");

  await signInOrRedirect(email, password, next, "/login");
}

export async function signUpWithPassword(formData: FormData) {
  const email = String(formData.get("signup_email") ?? formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("signup_password") ?? formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirm_password") ?? "");

  if (!email) redirect("/signup?error=missing_email");
  if (!password) redirect("/signup?error=missing_password");
  if (password !== confirmPassword) redirect("/signup?error=password_mismatch");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/signup?error=unavailable");

  if (isInstantSignupEnabled()) {
    const ensured = await ensureConfirmedUserWithPassword(email, password);

    if (ensured.ok) {
      await signInOrRedirect(email, password, null, "/signup");
    }

    if (!ensured.ok) {
      const code =
        ensured.code === "weak_password"
          ? "weak_password"
          : ensured.code === "user_already_exists"
            ? "user_already_exists"
            : "signup_failed";
      redirect(`/signup?error=${encodeError(code)}`);
    }
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent("/app/welcome")}`,
    },
  });

  if (error) {
    const code = mapSupabaseAuthErrorCode(error);
    redirect(`/signup?error=${encodeError(code)}&email=${encodeURIComponent(email)}`);
  }

  if (data.user && data.user.identities?.length === 0) {
    redirect(`/signup?error=${encodeError("user_already_exists")}`);
  }

  if (data.session && data.user) {
    await redirectAfterAuth(data.user.id, null);
  }

  redirect(`/signup?message=confirm_email_required&email=${encodeURIComponent(email)}`);
}

export async function resendConfirmationEmail(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) redirect("/login?error=missing_email");

  const supabase = await createSupabaseServerClient();
  if (!supabase) redirect("/login?error=unavailable");

  const { error } = await supabase.auth.resend({
    type: "signup",
    email,
    options: {
      emailRedirectTo: `${siteUrl()}/auth/callback?next=${encodeURIComponent("/app/welcome")}`,
    },
  });

  if (error) {
    const code = mapSupabaseAuthErrorCode(error);
    redirect(`/login?error=${encodeError(code)}&email=${encodeURIComponent(email)}`);
  }

  redirect(`/login?message=confirmation_resent&email=${encodeURIComponent(email)}`);
}

export async function signInWithGoogle(formData: FormData) {
  const next = String(formData.get("next") ?? "");
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    redirect("/login?error=unavailable");
  }

  const callbackNext = next && next.startsWith("/") && !next.startsWith("//") ? next : "/app/welcome";
  const redirectTo = `${siteUrl()}/auth/callback?next=${encodeURIComponent(callbackNext)}`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error || !data.url) {
    redirect(`/login?error=${encodeError("oauth_failed")}`);
  }

  redirect(data.url);
}

export async function signOut() {
  const supabase = await createSupabaseServerClient();
  if (supabase) {
    await supabase.auth.signOut();
  }
  redirect("/");
}
