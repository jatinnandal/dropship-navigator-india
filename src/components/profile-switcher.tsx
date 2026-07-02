"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { ChevronDown, Plus } from "lucide-react";
import { switchActiveProfile } from "@/app/onboarding/actions";
import { channelLabel } from "@/lib/profile-name";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  profiles: SellerProfileSummary[];
  activeProfileId: string | null;
  collapsed?: boolean;
};

export function ProfileSwitcher({ profiles, activeProfileId, collapsed }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const active = profiles.find((p) => p.id === activeProfileId) ?? profiles[0];

  if (!active || profiles.length === 0) return null;

  function handleSwitch(profileId: string) {
    if (profileId === activeProfileId) return;
    startTransition(async () => {
      await switchActiveProfile(profileId);
      router.refresh();
    });
  }

  if (profiles.length === 1) {
    return (
      <div className={`border-b border-neutral-800 px-3 py-3 ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <>
            <p className="text-xs uppercase tracking-wide text-neutral-500">Active plan</p>
            <p className="mt-1 truncate text-sm font-medium text-neutral-100">{active.name}</p>
            <p className="text-muted truncate text-xs">{channelLabel(active.primaryChannel)}</p>
          </>
        ) : (
          <span className="text-xs font-bold text-neutral-300" title={active.name}>
            {channelLabel(active.primaryChannel).charAt(0)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="border-b border-neutral-800 px-3 py-3">
      {!collapsed ? (
        <>
          <label htmlFor="profile-switcher" className="text-xs uppercase tracking-wide text-neutral-500">
            Active plan
          </label>
          <div className="relative mt-1">
            <select
              id="profile-switcher"
              value={active.id}
              disabled={pending}
              onChange={(e) => handleSwitch(e.target.value)}
              className="w-full appearance-none rounded-md border border-neutral-700 bg-neutral-900 py-2 pl-3 pr-8 text-sm text-neutral-100"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
              aria-hidden="true"
            />
          </div>
          <a
            href="/onboarding?mode=new"
            className="btn-ghost mt-2 inline-flex w-full items-center justify-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Add plan
          </a>
        </>
      ) : (
        <select
          aria-label="Switch active plan"
          value={active.id}
          disabled={pending}
          onChange={(e) => handleSwitch(e.target.value)}
          className="w-full rounded border border-neutral-700 bg-neutral-900 px-1 py-1 text-xs"
        >
          {profiles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
