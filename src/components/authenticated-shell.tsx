import { AppLogo } from "@/components/app-logo";
import { AppNav } from "@/components/app-nav";
import { signOut } from "@/app/login/actions";

type Props = {
  email: string | null;
  hasProfile: boolean;
  children: React.ReactNode;
};

export function AuthenticatedShell({ email, hasProfile, children }: Props) {
  return (
    <div className="app-shell-bg min-h-screen text-slate-100">
      <header className="border-b border-slate-700/50 bg-slate-950/72 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-6 py-4">
          <div className="flex min-w-0 items-center gap-6">
            <AppLogo href={hasProfile ? "/app" : "/app/welcome"} subtitle="Your launch plan" />
            <AppNav hasProfile={hasProfile} />
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {email ? (
              <span className="text-muted hidden max-w-[180px] truncate text-xs sm:inline">{email}</span>
            ) : null}
            <form action={signOut}>
              <button type="submit" className="btn-ghost min-h-[44px] rounded-md px-3 py-2 text-xs font-medium">
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="page-reveal pb-20 md:pb-0">{children}</div>
    </div>
  );
}
