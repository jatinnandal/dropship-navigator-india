"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { EnsurePlanResult } from "@/app/app/journey/actions";

const FAIL_MESSAGES: Partial<Record<Exclude<EnsurePlanResult, { ok: true }>["reason"], string>> = {
  limit: "Personalized steps paused — you've hit this month's generation limit. The standard walkthrough below still applies.",
  unavailable: "Personalization is warming up — showing the standard walkthrough for now.",
  store_failed: "Couldn't save the personalized copy — showing the standard walkthrough.",
};

/**
 * Auto-fires personalization once on mount via a plain fetch (NOT a server
 * action) so the slow generation never blocks router navigation — the seller
 * can move to the dashboard/journey while it runs, and the request survives
 * client-side navigation. On success it refreshes the route so the personalized
 * copy appears in place.
 */
export function PersonalizedPlanAutoLoader({ moduleId }: { moduleId: string }) {
  const router = useRouter();
  const [failMsg, setFailMsg] = useState<string | null>(null);
  const fired = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;

    // Intentionally not aborted on unmount: if the seller navigates away the
    // request keeps running and caches the plan for their next visit.
    void (async () => {
      try {
        const res = await fetch("/api/journey/personalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ moduleId }),
        });
        const result: EnsurePlanResult = await res.json();
        if (!mounted.current) return;
        if (result.ok) {
          router.refresh();
        } else {
          setFailMsg(FAIL_MESSAGES[result.reason] ?? null);
        }
      } catch {
        // Network/parse failure → leave the standard walkthrough in place.
      }
    })();
  }, [moduleId, router]);

  if (failMsg) {
    return <p className="text-muted text-xs leading-5">{failMsg}</p>;
  }

  return (
    <div className="text-muted flex items-center gap-2 text-xs leading-5" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Tailoring this walkthrough to your state, entity type, and product — this can take up to a
      minute. You can keep using the app; it&apos;ll update here when ready.
    </div>
  );
}
