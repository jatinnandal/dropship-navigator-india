"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, Bell } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { signOut } from "@/app/login/actions";
import { getAppNavItems, isNavItemActive } from "@/lib/app-nav-items";
import { PLAN_LABELS, type Plan } from "@/lib/entitlements";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles: SellerProfileSummary[];
  activeProfileId: string | null;
  plan?: Plan;
  notificationCount?: number;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function AppSidebar({
  email,
  hasProfile,
  profiles,
  activeProfileId,
  plan = "free",
  notificationCount = 0,
}: Props) {
  const pathname = usePathname();
  const navItems = getAppNavItems(hasProfile);

  return (
    <aside
      className="app-sidebar fixed left-0 top-0 z-40 hidden h-screen flex-col md:flex"
      style={{ padding: "18px 14px" }}
      aria-label="App navigation"
    >
      <div className="flex flex-1 flex-col rounded-[18px] bg-[#060606] border border-white/[0.1] p-[18px_12px] box-border"
        style={{ boxShadow: "0 24px 60px -24px rgba(0,0,0,0.9), inset 0 1px 0 rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-2 pb-4 border-b border-white/[0.08]">
          <AppLogo href={hasProfile ? "/app" : "/app/welcome"} />
        </div>

        {/* Active plan chip */}
        {hasProfile && profiles.length > 0 ? (
          <div className="mt-3.5 mx-1">
            <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} />
          </div>
        ) : null}

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-[3px] py-2.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isNavItemActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                  active
                    ? "text-white bg-white/[0.07] border border-white/[0.16]"
                    : "text-[var(--text-faint)] border border-transparent hover:text-white"
                }`}
              >
                <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Streak card - no fake counts; a real streak needs recorded activity */}
        <div className="mx-1 mb-2.5 rounded-xl p-3 bg-white/[0.03] border border-white/[0.1] flex items-center gap-2.5">
          <Flame className="h-4 w-4 text-white shrink-0" aria-hidden="true" />
          <div>
            <p className="font-mono text-sm font-medium text-white">Build a streak</p>
            <p className="text-[10.5px] font-medium text-[var(--text-faint)]">One step a day compounds fast</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/[0.08] pt-3">
          {hasProfile && (
            <Link
              href="/app/notifications"
              className={`mb-2 mx-1 flex items-center gap-[11px] rounded-[10px] px-3 py-2.5 text-[13.5px] font-medium transition-colors ${
                isNavItemActive(pathname, "/app/notifications")
                  ? "text-white bg-white/[0.07] border border-white/[0.16]"
                  : "text-[var(--text-faint)] border border-transparent hover:text-white"
              }`}
            >
              <span className="relative">
                <Bell className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
                {notificationCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-semibold leading-none text-white">
                    {notificationCount > 9 ? "9+" : notificationCount}
                  </span>
                )}
              </span>
              <span>Notifications</span>
            </Link>
          )}
          <Link
            href="/app/plans"
            className="mb-2 mx-1 flex items-center justify-between rounded-[9px] px-2 py-1.5 no-underline hover:bg-white/[0.04] transition-colors"
          >
            <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faint)]">
              {PLAN_LABELS[plan]} plan
            </span>
            <span className="font-mono text-[10px] text-white/80">
              {plan !== "growth" ? "Upgrade →" : "View →"}
            </span>
          </Link>
          <Link
            href="/app/account"
            className="mb-2 mx-1 flex items-center justify-between gap-2 rounded-[9px] px-2 py-1.5 no-underline hover:bg-white/[0.04] transition-colors"
          >
            <span className="font-mono text-[11px] text-[var(--text-faintest)] truncate">{email ?? "Account"}</span>
            <span className="font-mono text-[10px] text-white/70 shrink-0">Account →</span>
          </Link>
          <form action={signOut}>
            <button
              type="submit"
              className="w-full min-h-[38px] rounded-[10px] px-3 py-2 text-[12.5px] font-medium border border-white/[0.12] bg-white/[0.03] text-[var(--muted)] hover:text-white hover:border-white/[0.2] transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
