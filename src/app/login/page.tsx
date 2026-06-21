import Link from "next/link";
import { redirect } from "next/navigation";
import { Mail, ShieldCheck } from "lucide-react";
import { sendMagicLink } from "@/app/login/actions";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type Props = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function queryValue(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const value = searchParams[key];
  if (Array.isArray(value)) {
    return value[0];
  }
  return value;
}

export default async function LoginPage({ searchParams }: Props) {
  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    if (supabase) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        redirect("/app");
      }
    }
  }

  const params = await searchParams;
  const checkEmail = queryValue(params, "check_email") === "1";
  const error = queryValue(params, "error");

  const errorMessage =
    error === "missing_supabase_config"
      ? "Configure Supabase keys in .env.local before login."
      : error === "missing_email"
        ? "Please enter your email."
        : error === "auth_failed"
          ? "Could not send login link. Try again."
          : undefined;

  return (
    <main className="app-shell-bg min-h-screen px-6 py-14 text-slate-100">
      <div className="page-reveal mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-2">
        <section className="glass-panel rounded-xl p-8">
          <h1 className="headline-gradient text-3xl font-bold">Welcome back</h1>
          <p className="text-muted mt-3 text-sm">
            Sign in to continue your personalized journey and track progress across all modules.
          </p>

          <div className="mt-6 space-y-3 text-sm text-slate-200">
            <div className="glass-panel surface-hover flex items-start gap-3 rounded-md p-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 text-cyan-300" />
              <p>Your path, module progress, and tool recommendations are saved per account.</p>
            </div>
            <div className="glass-panel surface-hover flex items-start gap-3 rounded-md p-3">
              <Mail className="mt-0.5 h-4 w-4 text-amber-300" />
              <p>Passwordless magic link login keeps onboarding friction low for beginners.</p>
            </div>
          </div>
        </section>

        <section className="glass-panel rounded-xl p-8">
          <h2 className="text-xl font-semibold">Sign in</h2>
          <p className="text-muted mt-2 text-sm">Use your email to receive a secure login link.</p>

          {checkEmail ? (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
              Magic link sent. Check your email and click the login button.
            </div>
          ) : null}

          {errorMessage ? (
            <div className="mt-5 rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
              {errorMessage}
            </div>
          ) : null}

          <form action={sendMagicLink} className="mt-6 space-y-4">
            <label className="block text-sm font-medium" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="you@example.com"
              className="w-full rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm outline-none transition focus:border-amber-400"
            />
            <button
              type="submit"
              className="btn-primary w-full rounded-md px-4 py-2.5 text-sm font-semibold"
            >
              Send magic link
            </button>
          </form>

          <div className="text-muted mt-6 text-sm">
            <Link href="/" className="text-cyan-300 transition-colors hover:text-cyan-200">
              Back to landing page
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
