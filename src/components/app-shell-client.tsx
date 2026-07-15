"use client";

import type { ReactNode } from "react";
import { AppMobileTopBar } from "@/components/app-mobile-top-bar";
import { AppSidebar } from "@/components/app-sidebar";
import { FloatingFeedback } from "@/components/floating-feedback";
import type { Plan } from "@/lib/entitlements";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles: SellerProfileSummary[];
  activeProfileId: string | null;
  plan: Plan;
  notificationCount?: number;
  children: ReactNode;
};

export function AppShellClient({
  email,
  hasProfile,
  profiles,
  activeProfileId,
  plan,
  notificationCount = 0,
  children,
}: Props) {
  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-clip">
      {/* Ambient light */}
      <div className="ambient-light" aria-hidden="true" />

      <AppSidebar
        email={email}
        hasProfile={hasProfile}
        profiles={profiles}
        activeProfileId={activeProfileId}
        plan={plan}
        notificationCount={notificationCount}
        collapsed={false}
        onToggleCollapsed={() => {}}
      />

      <div className="app-main-with-sidebar relative z-[1] min-h-screen">
        <AppMobileTopBar
          hasProfile={hasProfile}
          activeProfile={profiles.find((p) => p.id === activeProfileId)}
          notificationCount={notificationCount}
        />
        <div className="page-reveal pb-20 md:pb-0">{children}</div>
      </div>

      <FloatingFeedback />
    </div>
  );
}
