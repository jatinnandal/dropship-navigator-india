"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { ProfileSwitcher } from "@/components/profile-switcher";
import { signOut } from "@/app/login/actions";
import { getAppNavItems, isNavItemActive } from "@/lib/app-nav-items";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles: SellerProfileSummary[];
  activeProfileId: string | null;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

export function AppSidebar({
  email,
  hasProfile,
  profiles,
  activeProfileId,
  collapsed,
  onToggleCollapsed,
}: Props) {
  const pathname = usePathname();
  const navItems = getAppNavItems(hasProfile);

  return (
    <aside
      className={`app-sidebar fixed left-0 top-0 z-40 hidden h-screen flex-col border-r border-neutral-800 bg-neutral-950/95 backdrop-blur md:flex ${
        collapsed ? "app-sidebar-collapsed" : ""
      }`}
      aria-label="App navigation"
    >
      <div className={`flex items-center border-b border-neutral-800 p-4 ${collapsed ? "justify-center" : ""}`}>
        {collapsed ? (
          <AppLogo href={hasProfile ? "/app" : "/app/welcome"} />
        ) : (
          <AppLogo href={hasProfile ? "/app" : "/app/welcome"} subtitle="Your launch plan" />
        )}
      </div>

      {hasProfile && profiles.length > 0 ? (
        <ProfileSwitcher profiles={profiles} activeProfileId={activeProfileId} collapsed={collapsed} />
      ) : null}

      <nav className="flex flex-1 flex-col gap-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = isNavItemActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors ${
                active ? "nav-active" : "text-muted hover:bg-neutral-900 hover:text-neutral-100"
              } ${collapsed ? "justify-center px-2" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              {!collapsed ? <span>{item.label}</span> : null}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-neutral-800 p-3">
        {!collapsed && email ? (
          <p className="text-muted mb-2 truncate px-2 text-xs">{email}</p>
        ) : null}
        <form action={signOut}>
          <button
            type="submit"
            className={`btn-ghost w-full min-h-[44px] rounded-md px-3 py-2 text-xs font-medium ${
              collapsed ? "px-2" : ""
            }`}
          >
            {collapsed ? "Out" : "Sign out"}
          </button>
        </form>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="btn-ghost mt-2 flex w-full min-h-[36px] items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          {!collapsed ? <span>Collapse</span> : null}
        </button>
      </div>
    </aside>
  );
}
