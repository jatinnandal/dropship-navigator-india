import Link from "next/link";
import { Suspense } from "react";
import { AppLogo } from "@/components/app-logo";
import { AuthForm } from "@/components/auth-form";
import { AuthSetupBanner } from "@/components/auth-setup-banner";

export default function LoginPage() {
  return (
    <main className="app-shell-bg min-h-screen text-slate-100">
      <div className="mx-auto flex w-full max-w-md flex-col gap-8 px-6 py-14">
        <AppLogo href="/" subtitle="Seller operating system for India" />
        <AuthSetupBanner />
        <section className="glass-panel rounded-xl p-6 sm:p-8">
          <Suspense fallback={<p className="text-muted text-sm">Loading...</p>}>
            <AuthForm mode="login" />
          </Suspense>
        </section>
        <Link href="/" className="text-muted text-center text-sm underline">
          Back to home
        </Link>
      </div>
    </main>
  );
}
