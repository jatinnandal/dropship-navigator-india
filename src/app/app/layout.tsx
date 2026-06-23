import { AppLogo } from "@/components/app-logo";
import { AppNav } from "@/components/app-nav";
import { JargonProvider } from "@/components/jargon-provider";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <JargonProvider>
      <div className="app-shell-bg min-h-screen text-slate-100">
        <header className="border-b border-slate-700/50 bg-slate-950/72 backdrop-blur">
          <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <AppLogo href="/app" subtitle="Guest mode (no login required)" />
              <AppNav />
            </div>
            <span className="text-xs text-slate-300">No sign-in required</span>
          </div>
        </header>
        <div className="page-reveal">{children}</div>
      </div>
    </JargonProvider>
  );
}
