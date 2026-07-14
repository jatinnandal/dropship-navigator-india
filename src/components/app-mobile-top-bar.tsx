"use client";

import Link from "next/link";
import { CircleUser, Bell } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { channelLabel } from "@/lib/profile-name";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  hasProfile: boolean;
  activeProfile?: SellerProfileSummary;
  notificationCount?: number;
};

export function AppMobileTopBar({ hasProfile, activeProfile, notificationCount = 0 }: Props) {
  return (
    <header className="sticky top-0 z-30 border-b border-neutral-800 bg-neutral-950/95 backdrop-blur md:hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <AppLogo href={hasProfile ? "/app" : "/app/welcome"} subtitle="Your launch plan" />
        <div className="flex items-center gap-3">
          {hasProfile && activeProfile ? (
            <Link href="/app/profiles" className="text-right text-xs">
              <span className="block font-medium text-neutral-200">{activeProfile.name}</span>
              <span className="text-muted">{channelLabel(activeProfile.primaryChannel)}</span>
            </Link>
          ) : null}
          {hasProfile && (
            <Link
              href="/app/notifications"
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
              className="relative shrink-0 rounded-full border border-white/15 p-1.5 text-neutral-300 hover:text-white"
            >
              <Bell className="h-5 w-5" aria-hidden="true" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--danger)] px-1 text-[9px] font-semibold leading-none text-white">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </Link>
          )}
          <Link href="/app/account" aria-label="Account" className="shrink-0 rounded-full border border-white/15 p-1.5 text-neutral-300 hover:text-white">
            <CircleUser className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
