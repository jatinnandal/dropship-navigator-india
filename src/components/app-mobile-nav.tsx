"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LayoutDashboard, ListChecks, SlidersHorizontal } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: typeof Home;
};

type Props = {
  hasProfile: boolean;
};

export function AppMobileNav({ hasProfile }: Props) {
  const pathname = usePathname();

  const navItems: NavItem[] = hasProfile
    ? [
        { href: "/app", label: "Dashboard", icon: LayoutDashboard },
        { href: "/app/journey", label: "Journey", icon: ListChecks },
      ]
    : [
        { href: "/app/welcome", label: "Home", icon: Home },
        { href: "/onboarding", label: "Setup", icon: SlidersHorizontal },
        { href: "/app/journey", label: "Preview", icon: ListChecks },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/50 bg-slate-950/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active =
            pathname === href ||
            (href === "/app" && pathname === "/app") ||
            (href !== "/app" && href !== "/app/welcome" && pathname.startsWith(href));
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs ${
                  active ? "text-amber-200" : "text-muted"
                }`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
