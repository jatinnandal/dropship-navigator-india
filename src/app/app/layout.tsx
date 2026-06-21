import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { signOut } from "@/app/app/actions";
import { SetupRequired } from "@/components/setup-required";
import { AppLogo } from "@/components/app-logo";
import { AppNav } from "@/components/app-nav";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return <SetupRequired />;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-shell-bg min-h-screen text-slate-100">
      <header className="border-b border-slate-700/50 bg-slate-950/72 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-6">
            <AppLogo href="/app" subtitle={user.email ?? ""} />
            <AppNav />
          </div>
          <div className="flex items-center gap-3">
            <form action={signOut}>
              <button
                type="submit"
                className="cursor-pointer rounded-md border border-rose-400/40 bg-rose-500/12 px-3 py-1.5 text-rose-100 transition-colors hover:bg-rose-500/22"
              >
                Log out
              </button>
            </form>
          </div>
        </div>
      </header>
      <div className="page-reveal">{children}</div>
    </div>
  );
}
