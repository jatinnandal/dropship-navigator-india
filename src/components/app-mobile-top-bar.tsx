"use client";

import Link from "next/link";
import { CircleUser } from "lucide-react";
import { AppLogo } from "@/components/app-logo";
import { channelLabel } from "@/lib/profile-name";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  hasProfile: boolean;
  activeProfile?: SellerProfileSummary;
};

export function AppMobileTopBar({ hasProfile, activeProfile }: Props) {
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
          <Link href="/app/account" aria-label="Account" className="shrink-0 rounded-full border border-white/15 p-1.5 text-neutral-300 hover:text-white">
            <CircleUser className="h-5 w-5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </header>
  );
}
