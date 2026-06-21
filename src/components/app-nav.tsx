"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ListChecks, SlidersHorizontal } from "lucide-react";

const navItems = [
  { href: "/app", label: "Dashboard", icon: LayoutDashboard },
  { href: "/onboarding", label: "Onboarding", icon: SlidersHorizontal },
  { href: "/app/journey", label: "Journey", icon: ListChecks },
];

export function AppNav() {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-3 text-sm">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || (item.href !== "/app" && pathname.startsWith(item.href));

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
