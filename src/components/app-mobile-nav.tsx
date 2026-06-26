"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChartSpline, Map, UserRound } from "lucide-react";

const NAV = [
  { href: "/app", label: "Dashboard", icon: ChartSpline },
  { href: "/app/journey", label: "Journey", icon: Map },
  { href: "/onboarding", label: "Profile", icon: UserRound },
];

export function AppMobileNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-700/50 bg-slate-950/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || (href !== "/app" && pathname.startsWith(href));
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
