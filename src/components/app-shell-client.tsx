"use client";

import { useState, type ReactNode } from "react";
import { AppMobileTopBar } from "@/components/app-mobile-top-bar";
import { AppSidebar } from "@/components/app-sidebar";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

const SIDEBAR_STORAGE_KEY = "dni-sidebar-collapsed";

function readSidebarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
}

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles: SellerProfileSummary[];
  activeProfileId: string | null;
  children: ReactNode;
};

export function AppShellClient({
  email,
  hasProfile,
  profiles,
  activeProfileId,
  children,
}: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(readSidebarCollapsed);

  function toggleSidebar() {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_STORAGE_KEY, String(next));
      return next;
    });
  }

  return (
    <div className="app-shell-bg relative min-h-screen text-neutral-100">
      <AppSidebar
        email={email}
        hasProfile={hasProfile}
        profiles={profiles}
        activeProfileId={activeProfileId}
        collapsed={sidebarCollapsed}
        onToggleCollapsed={toggleSidebar}
      />
      <div
        className={`app-main-with-sidebar relative z-10 min-h-screen ${sidebarCollapsed ? "app-main-sidebar-collapsed" : ""}`}
      >
        <AppMobileTopBar hasProfile={hasProfile} activeProfile={profiles.find((p) => p.id === activeProfileId)} />
        <div className="page-reveal pb-20 md:pb-0">{children}</div>
      </div>
    </div>
  );
}
