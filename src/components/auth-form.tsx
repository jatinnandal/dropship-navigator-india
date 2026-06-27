"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import {
  resendConfirmationEmail,
  signInWithGoogle,
  signInWithPassword,
  signUpWithPassword,
} from "@/app/login/actions";

const ERROR_MESSAGES: Record<string, string> = {
  missing_email: "Enter your email address.",
  missing_password: "Enter your password.",
  password_mismatch: "Passwords do not match.",
  invalid_credentials: "Incorrect email or password. If you just signed up, confirm your email first or try again.",
  email_not_confirmed:
    "Your account exists but email is not confirmed yet. Add SUPABASE_SERVICE_ROLE_KEY to .env.local for instant signup, or use Resend below (may hit Supabase email limits).",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "Choose a stronger password — at least 6 characters.",
  invalid_email: "That email address was rejected. Use a real inbox you can access (not a placeholder domain).",
  email_rate_limit:
    "Supabase blocked confirmation emails (rate limit). Add SUPABASE_SERVICE_ROLE_KEY to .env.local for instant signup without email, or wait ~1 hour and try again.",
  unavailable: "Sign-in is temporarily unavailable. Check Supabase keys in .env.local and restart the dev server.",
  missing_supabase_config: "Supabase is not configured. Copy .env.example to .env.local and add your project keys.",
  oauth_failed:
    "Google sign-in failed — the provider is likely not enabled in Supabase. See the setup banner above, or use email and password.",
  signup_failed: "We couldn't create your account. Check the setup banner above and try again.",
  auth_failed: "Sign-in failed. Try again or request a new confirmation email.",
};

const INFO_MESSAGES: Record<string, string> = {
  confirm_email_required:
    "Account created, but Supabase requires email confirmation before sign-in. Check inbox and spam — or add SUPABASE_SERVICE_ROLE_KEY to .env.local to skip email verification entirely.",
  confirmation_resent: "If an account exists for this email, we sent another confirmation link. Check inbox and spam.",
};

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const messageCode = searchParams.get("message");
  const emailParam = searchParams.get("email") ?? "";
  const next = searchParams.get("next") ?? "";

  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.signup_failed) : null;

  const infoMessage = useMemo(() => {
    if (!messageCode) return null;
    const base = INFO_MESSAGES[messageCode];
    if (!base) return null;
    if (emailParam) {
      return `${base} (${decodeURIComponent(emailParam)})`;
    }
    return base;
  }, [messageCode, emailParam]);

  const showResend =
    errorCode === "email_not_confirmed" ||
    errorCode === "email_rate_limit" ||
    messageCode === "confirm_email_required" ||
    messageCode === "confirmation_resent";

  const isLogin = mode === "login";

  return (
    <div>
      <h1 className="headline-gradient text-2xl font-bold">{isLogin ? "Welcome back" : "Create your account"}</h1>
      <p className="text-muted mt-2 text-sm">
        {isLogin
          ? "Sign in to access your launch plan and journey progress."
          : "Start your India e-commerce journey with a personalized co-pilot."}
      </p>

      {infoMessage ? (
        <p className="meta-tile mt-4 rounded-lg px-3 py-2 text-sm text-emerald-200">{infoMessage}</p>
      ) : null}

      {errorMessage ? (
        <p className="banner-deadline mt-4 rounded-lg px-3 py-2 text-sm text-rose-100">{errorMessage}</p>
      ) : null}

      {showResend && emailParam ? (
        <form action={resendConfirmationEmail} className="mt-4">
          <input type="hidden" name="email" value={decodeURIComponent(emailParam)} />
          <button type="submit" className="btn-ghost min-h-[44px] w-full rounded-md px-4 py-2 text-sm font-medium">
            Resend confirmation email
          </button>
        </form>
      ) : null}

      {messageCode === "confirm_email_required" ? (
        <Link
          href={`/login?email=${encodeURIComponent(emailParam)}`}
          className="btn-primary mt-4 inline-flex min-h-[44px] w-full items-center justify-center rounded-md px-4 py-2 text-sm font-medium"
        >
          Go to sign in
        </Link>
      ) : (
        <>
          {!infoMessage || isLogin ? (
            <>
              <form action={signInWithGoogle} className="mt-6">
                <input type="hidden" name="next" value={next} />
                <button
                  type="submit"
                  className="btn-ghost flex min-h-[44px] w-full items-center justify-center gap-2 rounded-md border border-slate-600 px-4 py-2 text-sm font-medium"
                >
                  <GoogleIcon />
                  Continue with Google
                </button>
              </form>

              <div className="my-6 flex items-center gap-3">
                <div className="h-px flex-1 bg-slate-700" />
                <span className="text-muted text-xs uppercase">or</span>
                <div className="h-px flex-1 bg-slate-700" />
              </div>
            </>
          ) : null}

          {isLogin ? (
            <form action={signInWithPassword} className="space-y-4">
              <input type="hidden" name="next" value={next} />
              <AuthField
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={emailParam ? decodeURIComponent(emailParam) : undefined}
              />
              <AuthField label="Password" name="password" type="password" autoComplete="current-password" required />
              <button type="submit" className="btn-primary min-h-[44px] w-full rounded-md px-4 py-2 text-sm font-medium">
                Sign in
              </button>
            </form>
          ) : messageCode === "confirm_email_required" ? null : (
            <form action={signUpWithPassword} className="space-y-4">
              <AuthField label="Email" name="signup_email" type="email" autoComplete="email" required />
              <AuthField label="Password" name="signup_password" type="password" autoComplete="new-password" required />
              <AuthField
                label="Confirm password"
                name="confirm_password"
                type="password"
                autoComplete="new-password"
                required
              />
              <button type="submit" className="btn-primary min-h-[44px] w-full rounded-md px-4 py-2 text-sm font-medium">
                Create account
              </button>
            </form>
          )}
        </>
      )}

      <p className="text-muted mt-6 text-center text-sm">
        {isLogin ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-medium text-amber-200 underline">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-amber-200 underline">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}

function AuthField({
  label,
  name,
  type,
  autoComplete,
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <label className="block text-sm">
      <span className="text-muted">{label}</span>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        className="mt-1 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-slate-100"
      />
    </label>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
