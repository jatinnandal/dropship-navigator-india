"use client";

import { useState } from "react";
import Link from "next/link";
import type { CrisisWarning } from "@/lib/crisis/types";
import { dismissWarning } from "@/app/app/crisis/actions";
import { RtoScenarioSlider } from "@/components/crisis/rto-scenario-slider";
import type { OnboardingProfile } from "@/lib/mvp-data";

type Props = {
  warnings: CrisisWarning[];
  profile: OnboardingProfile;
  showRtoSlider: boolean;
  defaultSellingPrice?: number;
  defaultProductCost?: number;
  defaultShippingCost?: number;
  defaultRtoRate?: number;
};

export function AtRiskPanel({
  warnings,
  profile,
  showRtoSlider,
  defaultSellingPrice,
  defaultProductCost,
  defaultShippingCost,
  defaultRtoRate,
}: Props) {
  const [dismissing, setDismissing] = useState<string | null>(null);

  async function handleDismiss(id: string) {
    setDismissing(id);
    await dismissWarning(id);
    setDismissing(null);
  }

  return (
    <section className="banner-at-risk mt-4 rounded-xl p-4 sm:p-5">
      <p className="text-sm font-semibold text-amber-100">
        {warnings.length} risk factor{warnings.length === 1 ? "" : "s"} detected
      </p>
      <p className="text-muted mt-1 text-xs">Address these before they become costly mistakes.</p>
      <ul className="mt-4 space-y-3">
        {warnings.map((warning) => (
          <li key={warning.id} className="glass-panel rounded-lg p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-amber-200">{warning.severity}</p>
                <p className="mt-1 text-sm font-semibold text-slate-100">{warning.title}</p>
                <p className="text-muted mt-1 text-sm leading-6">{warning.message}</p>
              </div>
              <div className="flex shrink-0 flex-wrap gap-2">
                <Link
                  href={warning.href}
                  className="btn-primary inline-flex min-h-[40px] items-center rounded-md px-3 py-1.5 text-xs font-medium"
                >
                  {warning.ctaLabel}
                </Link>
                {warning.severity !== "critical" ? (
                  <button
                    type="button"
                    disabled={dismissing === warning.id}
                    onClick={() => void handleDismiss(warning.id)}
                    className="btn-ghost min-h-[40px] rounded-md px-3 py-1.5 text-xs font-medium"
                  >
                    Snooze 7 days
                  </button>
                ) : null}
              </div>
            </div>
            {showRtoSlider && warning.id === "rto-shock" ? (
              <div className="mt-4 border-t border-amber-500/20 pt-4">
                <RtoScenarioSlider
                  profile={profile}
                  defaultSellingPrice={defaultSellingPrice}
                  defaultProductCost={defaultProductCost}
                  defaultShippingCost={defaultShippingCost}
                  defaultRtoRate={defaultRtoRate}
                />
              </div>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
