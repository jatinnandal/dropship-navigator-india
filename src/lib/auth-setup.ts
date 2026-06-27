import { isAdminAuthConfigured } from "@/lib/auth-admin";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

export type AuthSetupIssue = {
  id: string;
  title: string;
  fix: string;
};

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function getAuthSetupIssues(): AuthSetupIssue[] {
  const issues: AuthSetupIssue[] = [];

  if (!isSupabaseConfigured()) {
    issues.push({
      id: "missing_supabase",
      title: "Supabase keys are missing from .env.local",
      fix: "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then restart npm run dev.",
    });
    return issues;
  }

  if (!isAdminAuthConfigured() && process.env.NODE_ENV === "development") {
    issues.push({
      id: "missing_service_role",
      title: "Dev instant signup is off (no service role key)",
      fix: "Add SUPABASE_SERVICE_ROLE_KEY to .env.local for local dev only. Without it, signup requires confirmation emails.",
    });
  }

  return issues;
}

/** Returns false when Google provider is disabled in Supabase. */
export async function isGoogleAuthEnabled(): Promise<boolean | null> {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  const redirectTo = `${siteUrl()}/auth/callback`;
  const authorizeUrl = `${supabaseUrl}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectTo)}`;

  try {
    const response = await fetch(authorizeUrl, {
      headers: {
        apikey: supabaseAnonKey,
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      redirect: "manual",
      cache: "no-store",
    });

    if (response.status === 400) {
      const body = (await response.json()) as { msg?: string };
      if (body.msg?.toLowerCase().includes("not enabled")) {
        return false;
      }
    }

    const location = response.headers.get("location");
    if (response.status >= 300 && response.status < 400 && location) {
      return location.includes("accounts.google.com") || location.includes("supabase.co");
    }

    return null;
  } catch {
    return null;
  }
}

export async function getAuthSetupIssuesWithRemoteChecks(): Promise<AuthSetupIssue[]> {
  const issues = getAuthSetupIssues();
  const googleEnabled = await isGoogleAuthEnabled();

  if (googleEnabled === false) {
    issues.push({
      id: "google_disabled",
      title: "Google sign-in is not enabled in your Supabase project",
      fix: "Supabase Dashboard → Authentication → Providers → Google → Enable, add OAuth client ID + secret, and add http://localhost:3000/auth/callback to Redirect URLs.",
    });
  }

  return issues;
}

export function mapSupabaseAuthErrorCode(error: { code?: string; message?: string }): string {
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();

  if (code === "over_email_send_rate_limit" || message.includes("rate limit")) {
    return "email_rate_limit";
  }
  if (code === "email_address_invalid") {
    return "invalid_email";
  }
  if (code === "user_already_exists" || message.includes("already registered")) {
    return "user_already_exists";
  }
  if (code === "weak_password") {
    return "weak_password";
  }
  if (code === "email_not_confirmed" || message.includes("email not confirmed")) {
    return "email_not_confirmed";
  }
  if (code === "invalid_credentials") {
    return "invalid_credentials";
  }

  return "signup_failed";
}
