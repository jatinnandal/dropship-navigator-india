"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { requestPasswordReset } from "@/app/login/actions";
import { SubmitButton } from "@/components/submit-button";

const ERRORS: Record<string, string> = {
  missing_email: "Enter your email address.",
  unavailable: "Sign-in is temporarily unavailable. Please try again in a moment.",
};

const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", minHeight: 46, borderRadius: 11, padding: "0 15px",
  fontFamily: "var(--font-sans)", fontSize: 14, color: "#ffffff",
  background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.14)", outline: "none",
};

const cardStyle: React.CSSProperties = {
  borderRadius: 20, padding: "30px 28px", background: "linear-gradient(165deg, #0c0c0c, #050505)",
  border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 70px -30px rgba(0,0,0,0.9)",
};

export function ForgotPasswordForm() {
  const params = useSearchParams();
  const sent = params.get("sent") === "1";
  const errorCode = params.get("error");
  const errorMessage = errorCode ? (ERRORS[errorCode] ?? ERRORS.unavailable) : null;

  if (sent) {
    return (
      <section style={cardStyle}>
        <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", color: "#ffffff" }}>Check your email</h2>
        <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "#8a8a8a" }}>
          If an account exists for that address, we&apos;ve sent a link to reset your password. Check your
          inbox and spam folder.
        </p>
        <Link href="/login" style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 46, borderRadius: 11, fontSize: 14, fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff" }}>
          Back to sign in
        </Link>
      </section>
    );
  }

  return (
    <section style={cardStyle}>
      <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", color: "#ffffff" }}>Reset your password</h2>
      <p style={{ margin: "6px 0 0", fontSize: 13, color: "#6e6e6e" }}>
        Enter your email and we&apos;ll send you a reset link.
      </p>

      {errorMessage && (
        <div style={{ marginTop: 16, borderRadius: 11, padding: "10px 14px", fontSize: 13, lineHeight: 1.6, color: "oklch(0.8 0.13 20)", background: "oklch(0.72 0.17 20 / 0.08)", border: "1px solid oklch(0.72 0.17 20 / 0.2)" }}>{errorMessage}</div>
      )}

      <form action={requestPasswordReset} style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
        <div>
          <label className="font-mono" style={{ display: "block", marginBottom: 6, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6e6e6e" }}>Email</label>
          <input name="email" type="email" autoComplete="email" required placeholder="you@example.com" className="focus:border-white/45 focus:bg-white/5" style={inputStyle} />
        </div>
        <SubmitButton className="hover:-translate-y-px transition-transform" pendingLabel="Sending…" style={{ marginTop: 8, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 11, fontSize: "14.5px", fontWeight: 600, color: "#000", border: "none", fontFamily: "var(--font-sans)", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
          Send reset link
        </SubmitButton>
      </form>

      <p style={{ margin: "16px 0 0", textAlign: "center", fontSize: 13, color: "#6e6e6e" }}>
        Remembered it? <Link href="/login" style={{ fontWeight: 600, color: "#ffffff", textDecoration: "underline", textUnderlineOffset: 3 }}>Sign in</Link>
      </p>
    </section>
  );
}
