import { Suspense } from "react";
import Link from "next/link";
import { AuthPageShell } from "@/components/auth-page-shell";
import { ResetPasswordForm } from "@/components/reset-password-form";
import { getCurrentUser } from "@/lib/current-user";

const cardStyle: React.CSSProperties = {
  borderRadius: 20, padding: "30px 28px", background: "linear-gradient(165deg, #0c0c0c, #050505)",
  border: "1px solid rgba(255,255,255,0.14)", boxShadow: "0 30px 70px -30px rgba(0,0,0,0.9)",
};

export default async function ResetPasswordPage() {
  // The recovery link routes through /auth/callback, which sets a session before
  // redirecting here. No session ⇒ the link was invalid or has expired.
  const user = await getCurrentUser();

  return (
    <AuthPageShell>
      {user ? (
        <Suspense fallback={<p style={{ fontSize: 13, color: "#6e6e6e" }}>Loading...</p>}>
          <ResetPasswordForm />
        </Suspense>
      ) : (
        <section style={cardStyle}>
          <h2 style={{ margin: 0, fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", color: "#ffffff" }}>Link expired</h2>
          <p style={{ margin: "10px 0 0", fontSize: 13, lineHeight: 1.6, color: "#8a8a8a" }}>
            This password reset link is invalid or has expired. Request a new one and try again.
          </p>
          <Link href="/forgot-password" style={{ marginTop: 22, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 46, borderRadius: 11, fontSize: 14, fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff" }}>
            Request a new link
          </Link>
        </section>
      )}
    </AuthPageShell>
  );
}
