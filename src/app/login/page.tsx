import { Suspense } from "react";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthSetupBanner } from "@/components/auth-setup-banner";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <AuthSetupBanner />
      <Suspense fallback={<p style={{ fontSize: 13, color: "#6e6e6e" }}>Loading...</p>}>
        <AuthForm mode="login" />
      </Suspense>
    </AuthPageShell>
  );
}
