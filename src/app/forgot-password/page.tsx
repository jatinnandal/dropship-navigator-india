import { Suspense } from "react";
import { AuthPageShell } from "@/components/auth-page-shell";
import { ForgotPasswordForm } from "@/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthPageShell>
      <Suspense fallback={<p style={{ fontSize: 13, color: "#6e6e6e" }}>Loading...</p>}>
        <ForgotPasswordForm />
      </Suspense>
    </AuthPageShell>
  );
}
