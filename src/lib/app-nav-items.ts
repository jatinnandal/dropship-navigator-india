import {
  BookOpen,
  Home,
  LayoutDashboard,
  ListChecks,
  SlidersHorizontal,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getAppNavItems(hasProfile: boolean): AppNavItem[] {
  const resources: AppNavItem = {
    href: "/app/resources",
    label: "Resources",
    icon: BookOpen,
  };

  if (hasProfile) {
    return [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/journey", label: "Journey", icon: ListChecks },
      { href: "/app/profiles", label: "Profiles", icon: Users },
      resources,
    ];
  }

  return [
    { href: "/app/welcome", label: "Home", icon: Home },
    { href: "/onboarding", label: "Setup", icon: SlidersHorizontal },
    { href: "/app/journey", label: "Preview", icon: ListChecks },
    resources,
  ];
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/app" && pathname === "/app") return true;
  if (href === "/app/welcome" && pathname === "/app/welcome") return true;
  if (href !== "/app" && href !== "/app/welcome" && pathname.startsWith(href)) return true;
  return false;
}
