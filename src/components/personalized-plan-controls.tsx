"use client";

import { useState, useTransition } from "react";
import { Sparkles, Loader2, Check } from "lucide-react";
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
  const [result, setResult] = useState<{ ok: boolean; msg: string } | null>(null);

  const run = () => {
    setResult(null);
    startTransition(async () => {
      const r = await generatePersonalizedPlanAction();
      if (r.ok) {
        setResult({ ok: true, msg: hasPlan ? "Plan regenerated." : "Your plan is personalized." });
      } else {
        setResult({ ok: false, msg: MESSAGES[r.reason] });
      }
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={pending}
          aria-busy={pending}
          className="btn-ghost inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          ) : (
            <Sparkles className="h-4 w-4" aria-hidden="true" />
          )}
          {pending ? "Generating your plan…" : hasPlan ? "Regenerate my plan" : "Personalize my plan"}
        </button>

        {!pending && result ? (
          <span
            className={`inline-flex items-center gap-1.5 text-xs ${
              result.ok ? "text-[var(--success)]" : "text-muted"
            }`}
          >
            {result.ok ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : null}
            {result.msg}
          </span>
        ) : null}
      </div>

      {pending ? (
        <p className="text-muted text-xs leading-5" aria-live="polite">
          Reading your profile and writing your plan — about 30 seconds. You can keep reading below;
          it will update when ready.
        </p>
      ) : null}
    </div>
  );
}
