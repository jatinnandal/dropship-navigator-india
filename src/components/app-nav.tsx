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

export function AppNav({ hasProfile }: Props) {
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
    <nav className="hidden items-center gap-3 text-sm md:flex">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href ||
          (item.href !== "/app" && item.href !== "/app/welcome" && pathname.startsWith(item.href)) ||
          (item.href === "/app" && pathname === "/app");

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
