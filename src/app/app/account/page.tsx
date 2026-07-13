import { Suspense } from "react";
import { requireUser } from "@/lib/supauth";
import { getCurrentUserEmail } from "@/lib/current-user";
import { ChangePasswordForm } from "@/components/change-password-form";
import { signOut } from "@/app/login/actions";

export default async function AccountPage() {
  const user = await requireUser();
  const email = await getCurrentUserEmail();
  // Google-only accounts have no password; offering "change password" to them
  // can only ever fail its current-password check. Show a note instead.
  const providers = (user?.app_metadata?.providers as string[] | undefined) ?? [];
  const hasPasswordAuth = providers.includes("email");

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <h1 className="text-xl font-semibold tracking-tight text-white">Account</h1>
      <p className="mt-1 text-sm text-[var(--text-faint)]">Manage your sign-in and password.</p>

      <section className="panel mt-6 rounded-[18px] p-5">
        <p className={labelClass}>Email</p>
        <p className="mt-1 text-sm text-white">{email ?? "-"}</p>
      </section>

      {hasPasswordAuth ? (
        <section className="panel mt-4 rounded-[18px] p-5">
          <h2 className="text-[15px] font-semibold text-white">Change password</h2>
          <p className="mb-4 mt-1 text-[13px] text-[var(--text-faint)]">
            Enter your current password, then choose a new one.
          </p>
          <Suspense fallback={<p className="text-sm text-[var(--text-faint)]">Loading…</p>}>
            <ChangePasswordForm />
          </Suspense>
        </section>
      ) : (
        <section className="panel mt-4 rounded-[18px] p-5">
          <h2 className="text-[15px] font-semibold text-white">Password</h2>
          <p className="mt-1 text-[13px] leading-6 text-[var(--text-faint)]">
            You sign in with Google, so this account has no password. To add one, use
            &ldquo;Forgot password?&rdquo; on the login page - we&apos;ll email you a secure link to
            set a password. After that you can sign in either way.
          </p>
        </section>
      )}

      <section className="panel mt-4 rounded-[18px] p-5">
        <h2 className="text-[15px] font-semibold text-white">Sign out</h2>
        <p className="mb-4 mt-1 text-[13px] text-[var(--text-faint)]">Sign out of your account on this device.</p>
        <form action={signOut}>
          <button
            type="submit"
            className="min-h-[44px] rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-5 text-sm font-medium text-[var(--muted)] transition-colors hover:border-white/[0.25] hover:text-white"
          >
            Sign out
          </button>
        </form>
      </section>
    </main>
  );
}

const labelClass = "font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-faint)]";
