"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Check, AlertCircle } from "lucide-react";
import { cancelSubscription } from "@/app/app/upgrade/actions";

type State = "idle" | "confirm" | "loading" | "done" | "error";

export function CancelSubscriptionButton() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleCancel = useCallback(async () => {
    setState("loading");
    const result = await cancelSubscription();
    if (result.ok) {
      setState("done");
      setTimeout(() => router.refresh(), 2000);
    } else {
      setErrorMsg(result.error ?? "Something went wrong");
      setState("error");
    }
  }, [router]);

  if (state === "done") {
    return (
      <div className="mx-auto mt-6 flex max-w-md items-center justify-center gap-2 text-[13px] text-[oklch(0.85_0.1_165)]">
        <Check className="h-3.5 w-3.5" />
        Cancelled. Access continues until period ends.
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div className="mx-auto mt-6 flex items-center justify-center gap-2 text-[13px] text-[var(--text-faint)]">
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
        Cancelling...
      </div>
    );
  }

  if (state === "confirm") {
    return (
      <div className="mx-auto mt-6 max-w-md rounded-xl border border-[oklch(0.72_0.17_20/0.25)] bg-[oklch(0.72_0.17_20/0.06)] px-4 py-3">
        <p className="text-[13px] text-[oklch(0.85_0.1_20)]">
          Cancel subscription? You'll keep access until the current period ends, then revert to Scout (free).
        </p>
        <div className="mt-3 flex gap-3">
          <button
            onClick={handleCancel}
            className="rounded-lg border border-[oklch(0.72_0.17_20/0.3)] px-4 py-2 text-[12.5px] font-medium text-[oklch(0.85_0.1_20)] transition-colors hover:bg-[oklch(0.72_0.17_20/0.1)]"
          >
            Confirm cancel
          </button>
          <button
            onClick={() => setState("idle")}
            className="px-4 py-2 text-[12.5px] text-[var(--text-faint)] hover:text-white"
          >
            Keep plan
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <button
        onClick={() => setState("confirm")}
        className="mx-auto mt-6 flex items-center gap-1.5 text-[12.5px] text-[var(--text-faintest)] transition-colors hover:text-[var(--text-faint)]"
      >
        <X className="h-3 w-3" />
        Cancel subscription
      </button>
      {state === "error" && errorMsg && (
        <div className="mx-auto mt-3 flex max-w-md items-center gap-2 rounded-xl border border-[oklch(0.72_0.17_20/0.25)] bg-[oklch(0.72_0.17_20/0.06)] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[oklch(0.8_0.13_20)]" />
          <p className="text-[13px] text-[oklch(0.85_0.1_20)]">{errorMsg}</p>
        </div>
      )}
    </>
  );
}
