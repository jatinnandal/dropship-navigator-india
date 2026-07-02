"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAppNavItems, isNavItemActive } from "@/lib/app-nav-items";

type Props = {
  hasProfile: boolean;
};

/** @deprecated Use AppSidebar on desktop; kept for compatibility if imported elsewhere */
export function AppNav({ hasProfile }: Props) {
  const pathname = usePathname();
  const navItems = getAppNavItems(hasProfile);

  return (
    <nav className="hidden items-center gap-3 text-sm md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = isNavItemActive(pathname, item.href);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 ${
              isActive ? "nav-active" : "btn-ghost"
            }`}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
