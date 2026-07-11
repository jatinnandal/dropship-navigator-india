"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Loader2 } from "lucide-react";
import { ensureModulePlan, type EnsurePlanResult } from "@/app/app/journey/actions";

const FAIL_MESSAGES: Partial<Record<Exclude<EnsurePlanResult, { ok: true }>["reason"], string>> = {
  limit: "Personalized steps paused — you've hit this month's generation limit. Standard checklist below still applies.",
  unavailable: "Personalized steps are warming up — showing the standard checklist for now.",
  store_failed: "Couldn't save personalized steps — showing the standard checklist.",
};

/**
 * Auto-fires plan generation once on mount for a personalizable module that has
 * no cached plan yet. On success the server action revalidates the page, which
 * re-renders with the plan and unmounts this loader. No manual button.
 */
export function PersonalizedPlanAutoLoader({ moduleId }: { moduleId: string }) {
  const [, startTransition] = useTransition();
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    startTransition(async () => {
      const result = await ensureModulePlan(moduleId);
      if (!result.ok) setFailMsg(FAIL_MESSAGES[result.reason] ?? null);
    });
  }, [moduleId]);

  if (failMsg) {
    return <p className="text-muted text-xs leading-5">{failMsg}</p>;
  }

  return (
    <div className="text-muted flex items-center gap-2 text-xs leading-5" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Tailoring this walkthrough to your state, entity type, and product — this can take up to a
      minute. You can start reading; it&apos;ll update in place when ready.
    </div>
  );
}
