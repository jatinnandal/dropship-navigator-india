"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2 } from "lucide-react";
import { generatePersonalizedPlanAction, type GeneratePlanResult } from "@/app/app/journey/actions";

const MESSAGES: Record<Exclude<GeneratePlanResult, { ok: true }>["reason"], string> = {
  locked: "Personalized plans are a Starter feature.",
  no_profile: "Set up a seller profile first.",
  limit: "You've used your plan regenerations for this month.",
  unavailable: "Personalization is warming up — using the standard plan for now.",
  store_failed: "Couldn't save the plan. Try again.",
};

export function PersonalizedPlanControls({ hasPlan }: { hasPlan: boolean }) {
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState<string | null>(null);

  const run = () => {
    setStatus(null);
    startTransition(async () => {
      const result = await generatePersonalizedPlanAction();
      if (result.ok) {
        setStatus("Your plan was personalized.");
      } else {
        setStatus(MESSAGES[result.reason]);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={run}
        disabled={pending}
        className="btn-ghost inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold disabled:opacity-60"
      >
        {pending ? (
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        ) : (
          <Sparkles className="h-4 w-4" aria-hidden="true" />
        )}
        {hasPlan ? "Regenerate my plan" : "Personalize my plan"}
      </button>
      {status ? <span className="text-muted text-xs">{status}</span> : null}
    </div>
  );
}
