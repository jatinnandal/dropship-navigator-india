"use client";

import { useMemo, useState } from "react";
import { Copy, Check } from "lucide-react";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { PAOS_APPEAL_TEMPLATE, fillTemplate } from "@/lib/mentor-templates";

type Props = {
  profile: OnboardingProfile;
  legalBusinessName?: string;
  gstin?: string;
  className?: string;
};

export function PaosEditor({ profile, legalBusinessName, gstin, className }: Props) {
  const initial = useMemo(
    () =>
      fillTemplate(PAOS_APPEAL_TEMPLATE, {
        marketplace: profile.primaryChannel,
        seller_id: "YOUR_SELLER_ID",
        gstin: gstin ?? "YOUR_GSTIN",
        suspension_date: new Date().toLocaleDateString("en-IN"),
        suspension_reason: "Dispatch rate / policy violation — update with exact reason from email",
        root_cause_detail: "e.g. dispatch rate dropped below 90% during a long weekend",
        action_1: "Paused affected listings and notified supplier of dispatch SLA",
        action_2: "Updated inventory sync to prevent overselling",
        action_3: "Reviewed all active listings for IP/brand compliance",
        review_date: new Date().toLocaleDateString("en-IN"),
        legal_name: legalBusinessName ?? "Your legal business name",
        contact: "your.email@example.com",
      }),
    [profile.primaryChannel, legalBusinessName, gstin],
  );

  const [text, setText] = useState(initial);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={className}>
      <p className="mb-2 text-xs uppercase tracking-wide text-amber-200">Plan of Action editor</p>
      <div className="relative rounded-lg border border-slate-700/60 bg-slate-900/60">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={14}
          className="w-full resize-y bg-transparent p-4 font-mono text-xs leading-5 text-slate-200 outline-none"
        />
        <button
          type="button"
          onClick={() => void handleCopy()}
          className="btn-ghost absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
