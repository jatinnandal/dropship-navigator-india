import {
  BookOpen,
  Compass,
  Gem,
  Home,
  LayoutDashboard,
  SlidersHorizontal,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";

export type AppNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

export function getAppNavItems(hasProfile: boolean): AppNavItem[] {
  if (hasProfile) {
    return [
      { href: "/app", label: "Dashboard", icon: LayoutDashboard },
      { href: "/app/journey", label: "Journey", icon: Compass },
      { href: "/app/tools", label: "Tools", icon: Wrench },
      { href: "/app/profiles", label: "Profiles", icon: Users },
      { href: "/app/resources", label: "Resources", icon: BookOpen },
      { href: "/app/plans", label: "Plans", icon: Gem },
    ];
  }

  return [
    { href: "/app/welcome", label: "Home", icon: Home },
    { href: "/onboarding", label: "Setup", icon: SlidersHorizontal },
    { href: "/app/journey", label: "Preview", icon: Compass },
    { href: "/app/resources", label: "Resources", icon: BookOpen },
  ];
}

export function isNavItemActive(pathname: string, href: string): boolean {
  if (pathname === href) return true;
  if (href === "/app" && pathname === "/app") return true;
  if (href === "/app/welcome" && pathname === "/app/welcome") return true;
  if (href !== "/app" && href !== "/app/welcome" && pathname.startsWith(href)) return true;
  return false;
}
