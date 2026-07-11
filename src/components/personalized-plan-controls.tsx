"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import type { EnsurePlanResult } from "@/app/app/journey/actions";

const FAIL_MESSAGES: Partial<Record<Exclude<EnsurePlanResult, { ok: true }>["reason"], string>> = {
  limit: "You've hit this month's personalization limit. The standard walkthrough below still applies.",
  unavailable: "Personalization is warming up — showing the standard walkthrough for now.",
  store_failed: "Couldn't save the personalized copy — please try again.",
  no_profile: "Set up a seller profile first.",
};

type State = "idle" | "generating" | "failed";

/**
 * Explicit "Personalize" button for the compliance walkthroughs. Manual (not
 * auto) and non-blocking: it POSTs to the fetch route so a slow generation
 * never blocks router navigation — the seller can leave the page while it runs.
 * On success the route revalidates + we refresh, the personalized copy renders,
 * and the page stops passing `ready` so this button disappears. It reappears
 * only when the seller's key details change (new profile hash → no cached plan).
 */
export function PersonalizePlanButton({
  moduleId,
  disabledReason,
}: {
  moduleId: string;
  /** When set, the button is disabled and this explains what's missing. */
  disabledReason?: string | null;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [failMsg, setFailMsg] = useState<string | null>(null);

  const run = () => {
    setState("generating");
    setFailMsg(null);
    // Not awaited against navigation; the request survives client-side nav.
    void (async () => {
      try {
        const res = await fetch("/api/journey/personalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId }),
        });
        const result: EnsurePlanResult = await res.json();
        if (result.ok) {
          router.refresh();
        } else {
          setFailMsg(FAIL_MESSAGES[result.reason] ?? "Couldn't personalize right now.");
          setState("failed");
        }
      } catch {
        setFailMsg("Couldn't reach the personalization service. Try again.");
        setState("failed");
      }
    })();
  };

  if (state === "generating") {
    return (
      <div className="text-muted flex items-center gap-2 text-xs leading-5" aria-live="polite">
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
        Tailoring this walkthrough to your details — up to a minute. You can keep using the app; it
        updates here when ready.
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        type="button"
        onClick={run}
        disabled={!!disabledReason}
        title={disabledReason ?? undefined}
        className="btn-ghost inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
      >
        <Sparkles className="h-4 w-4" aria-hidden="true" />
        {state === "failed" ? "Try again" : "Personalize this walkthrough"}
      </button>
      {disabledReason ? (
        <span className="text-[var(--text-faint)] text-xs">{disabledReason}</span>
      ) : null}
      {failMsg ? <span className="text-muted text-xs">{failMsg}</span> : null}
    </div>
  );
}
