import Link from "next/link";
import { Suspense } from "react";
import { AppLogo } from "@/components/app-logo";
import { AuthForm } from "@/components/auth-form";
import { AuthPageShell } from "@/components/auth-page-shell";
import { AuthSetupBanner } from "@/components/auth-setup-banner";

export default function LoginPage() {
  return (
    <AuthPageShell>
      <div className="mb-6">
        <AppLogo href="/" subtitle="Seller operating system for India" />
      </div>
      <AuthSetupBanner />
      <Suspense fallback={<p className="text-muted text-sm">Loading...</p>}>
        <AuthForm mode="login" />
      </Suspense>
      <Link href="/" className="text-muted mt-6 block text-center text-sm underline">
        Back to home
      </Link>
    </AuthPageShell>
  );
}
