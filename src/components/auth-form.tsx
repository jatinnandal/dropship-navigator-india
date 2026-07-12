"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { useFlash } from "@/components/use-flash";
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
    "Your email isn't confirmed yet. Check your inbox and spam for the confirmation link, or resend it below.",
  user_already_exists: "An account with this email already exists. Sign in instead.",
  weak_password: "Choose a stronger password - at least 6 characters.",
  invalid_email: "That email address was rejected. Use a real inbox you can access.",
  email_rate_limit:
    "We couldn't send the confirmation email right now. Please wait a little while and try again.",
  unavailable: "Sign-in is temporarily unavailable. Please try again in a moment.",
  missing_supabase_config: "Sign-in is temporarily unavailable. Please try again later.",
  oauth_failed:
    "Google sign-in didn't work. Please try again, or sign in with your email and password.",
  signup_failed: "We couldn't create your account. Please try again.",
  auth_failed: "Sign-in failed. Please try again, or request a new confirmation email.",
};

const INFO_MESSAGES: Record<string, string> = {
  confirm_email_required:
    "Account created! Check your inbox and spam for a confirmation link to finish signing up.",
  confirmation_resent: "If an account exists for this email, we've sent another confirmation link. Check your inbox and spam.",
};

function getPasswordStrength(pw: string): { level: "weak" | "medium" | "strong"; width: string; color: string } {
  if (!pw || pw.length < 4) return { level: "weak", width: "33%", color: "oklch(0.72 0.17 20)" };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw);
  const score = (pw.length >= 8 ? 1 : 0) + (hasUpper ? 1 : 0) + (hasNumber ? 1 : 0) + (hasSpecial ? 1 : 0);
  if (score >= 3) return { level: "strong", width: "100%", color: "oklch(0.72 0.13 165)" };
  if (score >= 2) return { level: "medium", width: "66%", color: "#f59e0b" };
  return { level: "weak", width: "33%", color: "oklch(0.72 0.17 20)" };
}

type Props = {
  mode: "login" | "signup";
};

export function AuthForm({ mode }: Props) {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const messageCode = searchParams.get("message");
  const emailParam = searchParams.get("email") ?? "";
  const next = searchParams.get("next") ?? "";
  const [password, setPassword] = useState("");
  const [activeTab, setActiveTab] = useState<"login" | "signup">(mode);

  const errorMessage = errorCode ? (ERROR_MESSAGES[errorCode] ?? ERROR_MESSAGES.signup_failed) : null;
  // Auto-hide transient errors; don't strip the URL so the signup-confirm /
  // resend flow (which reads the message/error params) stays intact.
  const showError = useFlash(errorCode, 6000, false);

  const infoMessage = useMemo(() => {
    if (!messageCode) return null;
    const base = INFO_MESSAGES[messageCode];
    if (!base) return null;
    if (emailParam) return `${base} (${decodeURIComponent(emailParam)})`;
    return base;
  }, [messageCode, emailParam]);

  const showResend =
    errorCode === "email_not_confirmed" ||
    errorCode === "email_rate_limit" ||
    messageCode === "confirm_email_required" ||
    messageCode === "confirmation_resent";

  const isLogin = activeTab === "login";
  const strength = !isLogin ? getPasswordStrength(password) : null;

  const inputStyle: React.CSSProperties = {
    width: "100%",
    boxSizing: "border-box",
    minHeight: 46,
    borderRadius: 11,
    padding: "0 15px",
    fontFamily: "var(--font-sans)",
    fontSize: 14,
    color: "#ffffff",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.14)",
    outline: "none",
  };

  return (
    <div>
      {/* Tab switcher */}
      <div style={{ display: "flex", gap: 4, borderRadius: 12, padding: 4, background: "#060606", border: "1px solid rgba(255,255,255,0.1)" }}>
        <button
          onClick={() => setActiveTab("login")}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "13.5px",
            fontWeight: 600,
            color: isLogin ? "#000000" : "#8a8a8a",
            background: isLogin ? "#ffffff" : "transparent",
          }}
        >
          Log in
        </button>
        <button
          onClick={() => setActiveTab("signup")}
          style={{
            flex: 1,
            minHeight: 40,
            borderRadius: 9,
            border: "none",
            cursor: "pointer",
            fontFamily: "var(--font-sans)",
            fontSize: "13.5px",
            fontWeight: 600,
            color: !isLogin ? "#000000" : "#8a8a8a",
            background: !isLogin ? "#ffffff" : "transparent",
          }}
        >
          Sign up
        </button>
      </div>

      {/* Auth card */}
      <section style={{ marginTop: 16, borderRadius: 20, padding: "30px 28px", background: "linear-gradient(165deg, #0c0c0c, #050505)", border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 70px -30px rgba(0,0,0,0.9), 0 0 60px -24px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.1)" }}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", color: "#ffffff" }}>
          {isLogin ? "Welcome back." : "Chart your route."}
        </h2>
        <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6e6e" }}>
          {isLogin ? "Your route is where you left it." : "Five quick questions, then a personalized launch plan."}
        </p>

        {infoMessage && (
          <div style={{ marginTop: 16, borderRadius: 11, padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: "oklch(0.78 0.12 165)", background: "oklch(0.72 0.13 165 / 0.08)", border: "1px solid oklch(0.72 0.13 165 / 0.2)" }}>{infoMessage}</div>
        )}

        {showError && errorMessage && (
          <div style={{ marginTop: 16, borderRadius: 11, padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: "oklch(0.8 0.13 20)", background: "oklch(0.72 0.17 20 / 0.08)", border: "1px solid oklch(0.72 0.17 20 / 0.2)" }}>{errorMessage}</div>
        )}

        {showResend && emailParam && (
          <form action={resendConfirmationEmail} style={{ marginTop: 12 }}>
            <input type="hidden" name="email" value={decodeURIComponent(emailParam)} />
            <SubmitButton className="hover:border-white/35 transition-colors" pendingLabel="Sending…" style={{ width: "100%", minHeight: 44, borderRadius: 11, border: "1px solid rgba(255,255,255,0.16)", background: "rgba(255,255,255,0.04)", fontFamily: "var(--font-sans)", fontSize: 13, fontWeight: 600, color: "#d6d6d6" }}>
              Resend confirmation email
            </SubmitButton>
          </form>
        )}

        {messageCode === "confirm_email_required" ? (
          <Link href={`/login?email=${encodeURIComponent(emailParam)}`} className="hover:-translate-y-px transition-transform" style={{ marginTop: 20, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, minHeight: 48, borderRadius: 11, fontSize: "14.5px", fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff", boxShadow: "var(--glow-white-cta), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
            Go to sign in
          </Link>
        ) : (
          <>
            {(!infoMessage || isLogin) && (
              <>
                {/* Google */}
                <form action={signInWithGoogle} style={{ marginTop: 22 }}>
                  <input type="hidden" name="next" value={next} />
                  <SubmitButton className="hover:bg-white/10 hover:border-white/40 transition-colors" pendingLabel="Connecting…" style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 10, minHeight: 46, borderRadius: 11, border: "1px solid rgba(255,255,255,0.28)", background: "rgba(255,255,255,0.08)", fontFamily: "var(--font-sans)", fontSize: 14, fontWeight: 600, color: "#ffffff" }}>
                    <GoogleIcon />
                    Continue with Google
                  </SubmitButton>
                </form>

                {/* Divider */}
                <div style={{ margin: "20px 0", display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                  <span className="font-mono" style={{ fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4a4a4a" }}>or</span>
                  <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.1)" }} />
                </div>
              </>
            )}

            {isLogin ? (
              <form action={signInWithPassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="hidden" name="next" value={next} />
                <AuthField label="Email" name="email" type="email" autoComplete="email" required defaultValue={emailParam ? decodeURIComponent(emailParam) : undefined} inputStyle={inputStyle} />
                <AuthField label="Password" name="password" type="password" autoComplete="current-password" required inputStyle={inputStyle} />
                <SubmitButton className="hover:-translate-y-px transition-transform" pendingLabel="Signing in…" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, minHeight: 48, borderRadius: 11, fontSize: "14.5px", fontWeight: 600, color: "#000", border: "none", fontFamily: "var(--font-sans)", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
                  Log in →
                </SubmitButton>
                <p style={{ margin: "4px 0 0", textAlign: "center" }}>
                  <Link href="/forgot-password" style={{ fontSize: "12.5px", color: "#6e6e6e", fontFamily: "var(--font-sans)", borderBottom: "1px solid rgba(255,255,255,0.15)", padding: 0, textDecoration: "none" }}>
                    Forgot password?
                  </Link>
                </p>
              </form>
            ) : (
              <form action={signUpWithPassword} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input type="hidden" name="next" value={next} />
                <AuthField label="Email" name="signup_email" type="email" autoComplete="email" required inputStyle={inputStyle} />
                <div>
                  <AuthField label="Password" name="signup_password" type="password" autoComplete="new-password" required onChange={(e) => setPassword(e.target.value)} inputStyle={inputStyle} />
                  {password.length > 0 && strength && (
                    <div style={{ marginTop: 8 }}>
                      <div style={{ height: 3, borderRadius: 2, background: "rgba(255,255,255,0.08)" }}>
                        <div style={{ height: "100%", borderRadius: 2, width: strength.width, background: strength.color, transition: "width 200ms, background 200ms" }} />
                      </div>
                      <p className="font-mono" style={{ margin: "4px 0 0", fontSize: 10, color: strength.color }}>
                        {strength.level === "weak" ? "Weak" : strength.level === "medium" ? "Medium" : "Strong"}
                      </p>
                    </div>
                  )}
                </div>
                <AuthField label="Confirm password" name="confirm_password" type="password" autoComplete="new-password" required inputStyle={inputStyle} />
                <SubmitButton className="hover:-translate-y-px transition-transform" pendingLabel="Creating account…" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", gap: 9, minHeight: 48, borderRadius: 11, fontSize: "14.5px", fontWeight: 600, color: "#000", border: "none", fontFamily: "var(--font-sans)", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
                  Create account →
                </SubmitButton>
                <p className="font-mono" style={{ margin: "4px 0 0", textAlign: "center", fontSize: "10.5px", lineHeight: 1.6, color: "#4a4a4a" }}>no credit card needed · start free</p>
                <p style={{ margin: "8px 0 0", textAlign: "center", fontSize: "11px", lineHeight: 1.6, color: "#5a5a5a" }}>
                  By creating an account you agree to our{" "}
                  <Link href="/terms" style={{ color: "#9a9a9a", textDecoration: "underline", textUnderlineOffset: 2 }}>Terms</Link>{" "}
                  and{" "}
                  <Link href="/privacy" style={{ color: "#9a9a9a", textDecoration: "underline", textUnderlineOffset: 2 }}>Privacy Policy</Link>.
                </p>
              </form>
            )}
          </>
        )}

        <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "#6e6e6e" }}>
          {isLogin ? (
            <>New here? <Link href="/signup" style={{ fontWeight: 600, color: "#ffffff", textDecoration: "underline", textUnderlineOffset: 3 }}>Create an account</Link></>
          ) : (
            <>Already have an account? <Link href="/login" style={{ fontWeight: 600, color: "#ffffff", textDecoration: "underline", textUnderlineOffset: 3 }}>Sign in</Link></>
          )}
        </p>
      </section>
    </div>
  );
}

function SubmitButton({
  children, style, className, pendingLabel,
}: {
  children: React.ReactNode;
  style: React.CSSProperties;
  className?: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ ...style, cursor: pending ? "wait" : "pointer", opacity: pending ? 0.65 : 1 }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

function AuthField({
  label, name, type, autoComplete, required, defaultValue, onChange, inputStyle,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete?: string;
  required?: boolean;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputStyle: React.CSSProperties;
}) {
  return (
    <div>
      <label className="font-mono" style={{ display: "block", marginBottom: 6, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6e6e6e" }}>{label}</label>
      <input
        name={name}
        type={type}
        autoComplete={autoComplete}
        required={required}
        defaultValue={defaultValue}
        onChange={onChange}
        placeholder={type === "email" ? "you@example.com" : "••••••••"}
        className="focus:border-white/45 focus:bg-white/5"
        style={inputStyle}
      />
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" fill="#4285F4" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
      <path d="M5.84 14.1c-.22-.66-.35-1.36-.35-2.1s.13-1.44.35-2.1V7.06H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.94l3.66-2.84z" fill="#FBBC05" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
    </svg>
  );
}
