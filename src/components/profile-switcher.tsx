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
      <div className={`mx-1 rounded-xl p-2.5 px-3 bg-white/[0.04] border border-white/[0.08] ${collapsed ? "text-center" : ""}`}>
        {!collapsed ? (
          <>
            <p className="mono-label-sm">Active plan</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-white">{active.name}</p>
            <p className="mt-0.5 font-mono text-[11px] text-[var(--muted)]">
              {channelLabel(active.primaryChannel)}
            </p>
          </>
        ) : (
          <span className="text-xs font-bold text-white" title={active.name}>
            {channelLabel(active.primaryChannel).charAt(0)}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mx-1 rounded-xl p-2.5 px-3 bg-white/[0.04] border border-white/[0.08]">
      {!collapsed ? (
        <>
          <label htmlFor="profile-switcher" className="mono-label-sm">
            Active plan
          </label>
          <div className="relative mt-1">
            <select
              id="profile-switcher"
              value={active.id}
              disabled={pending}
              onChange={(e) => handleSwitch(e.target.value)}
              className="w-full appearance-none rounded-lg border border-white/[0.1] bg-white/[0.03] py-2 pl-3 pr-8 text-[13px] font-semibold text-white"
            >
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-faint)]"
              aria-hidden="true"
            />
          </div>
          <a
            href="/onboarding?mode=new"
            className="mt-2 flex w-full items-center justify-center gap-1 rounded-lg border border-white/[0.1] bg-white/[0.03] px-2 py-1.5 text-xs font-medium text-[var(--muted)] hover:text-white hover:border-white/[0.2] transition-colors"
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
          className="w-full rounded-lg border border-white/[0.1] bg-white/[0.03] px-1 py-1 text-xs text-white"
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
