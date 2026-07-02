"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getAppNavItems, isNavItemActive } from "@/lib/app-nav-items";

type Props = {
  hasProfile: boolean;
};

export function AppMobileNav({ hasProfile }: Props) {
  const pathname = usePathname();
  const navItems = getAppNavItems(hasProfile);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden"
      aria-label="Mobile navigation"
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = isNavItemActive(pathname, href);
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex min-h-[56px] flex-col items-center justify-center gap-1 text-[10px] sm:text-xs ${
                  active ? "text-white" : "text-muted"
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
