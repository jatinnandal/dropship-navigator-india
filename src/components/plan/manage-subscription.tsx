"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, X, Loader2, Check, AlertCircle } from "lucide-react";
import { PLAN_LABELS, PLAN_PRICES } from "@/lib/entitlements";
import {
  downgradeSubscription,
  cancelSubscription,
} from "@/app/app/upgrade/actions";

type ManageState = "idle" | "confirm_downgrade" | "confirm_cancel" | "loading" | "done" | "error";

export function ManageSubscription({
  periodEnd,
  pendingDowngrade,
}: {
  periodEnd: string | null;
  pendingDowngrade: boolean;
}) {
  const router = useRouter();
  const [state, setState] = useState<ManageState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [doneMsg, setDoneMsg] = useState("");

  const formattedEnd = periodEnd
    ? new Date(periodEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : null;

  const handleDowngrade = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    const result = await downgradeSubscription({ billing: "monthly" });
    if (result.ok) {
      setDoneMsg(
        result.periodEnd
          ? `Downgrade scheduled. You'll switch to Starter on ${new Date(result.periodEnd).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}.`
          : "Downgrade scheduled. Changes apply at end of current billing period.",
      );
      setState("done");
      setTimeout(() => router.refresh(), 2000);
    } else {
      setErrorMsg(result.error ?? "Something went wrong");
      setState("error");
    }
  }, [router]);

  const handleCancel = useCallback(async () => {
    setState("loading");
    setErrorMsg("");
    const result = await cancelSubscription();
    if (result.ok) {
      setDoneMsg("Subscription cancelled. You'll keep Growth access until the current period ends.");
      setState("done");
      setTimeout(() => router.refresh(), 2000);
    } else {
      setErrorMsg(result.error ?? "Something went wrong");
      setState("error");
    }
  }, [router]);

  if (state === "done") {
    return (
      <div
        className="mx-auto mt-8 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/[0.2] bg-[#111]">
          <Check className="h-6 w-6 text-[oklch(0.72_0.13_165)]" />
        </div>
        <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
          {doneMsg}
        </p>
      </div>
    );
  }

  if (state === "loading") {
    return (
      <div
        className="mx-auto mt-8 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
        <p className="mt-4 text-sm font-medium text-white">Processing...</p>
      </div>
    );
  }

  return (
    <div className="mx-auto mt-8 max-w-md space-y-4">
      {pendingDowngrade && (
        <div className="rounded-xl border border-[oklch(0.72_0.13_165/0.25)] bg-[oklch(0.72_0.13_165/0.06)] px-4 py-3">
          <p className="text-[13px] text-[oklch(0.85_0.1_165)]">
            Downgrade to Starter scheduled{formattedEnd ? ` — changes on ${formattedEnd}` : ""}.
            You keep Growth access until then.
          </p>
        </div>
      )}

      {formattedEnd && !pendingDowngrade && (
        <p className="text-center font-mono text-[11px] text-[var(--text-faint)]">
          Current period ends {formattedEnd}
        </p>
      )}

      {/* Confirm downgrade */}
      {state === "confirm_downgrade" && (
        <div
          className="rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-6"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <p className="text-[15px] font-medium text-white">
            Downgrade to Starter?
          </p>
          <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            You'll keep Growth access until the current period ends. After that,
            you'll be charged ₹{PLAN_PRICES.starter.monthly}/month for
            Starter.
          </p>
          <p className="mt-3 text-[12px] text-[var(--text-faint)]">
            You'll lose: unlimited reconciliations, extra profiles, full crisis
            pack, and rate alerts.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleDowngrade}
              className="flex-1 rounded-[12px] border border-white/[0.16] bg-[#111] px-4 py-3 text-[13.5px] font-medium text-white transition-colors hover:bg-[#1a1a1a]"
            >
              Confirm downgrade
            </button>
            <button
              onClick={() => setState("idle")}
              className="rounded-[12px] border border-white/[0.1] px-4 py-3 text-[13.5px] text-[var(--text-faint)] transition-colors hover:text-white"
            >
              Keep Growth
            </button>
          </div>
        </div>
      )}

      {/* Confirm cancel */}
      {state === "confirm_cancel" && (
        <div
          className="rounded-2xl border border-[oklch(0.72_0.17_20/0.3)] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-6"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <p className="text-[15px] font-medium text-white">
            Cancel subscription?
          </p>
          <p className="mt-2 text-[13px] leading-[1.65] text-[var(--muted)]">
            You'll keep Growth access until the current period ends. After that
            you'll be on the free Scout plan. No more charges.
          </p>
          <div className="mt-5 flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 rounded-[12px] border border-[oklch(0.72_0.17_20/0.3)] bg-[oklch(0.72_0.17_20/0.08)] px-4 py-3 text-[13.5px] font-medium text-[oklch(0.85_0.1_20)] transition-colors hover:bg-[oklch(0.72_0.17_20/0.14)]"
            >
              Cancel subscription
            </button>
            <button
              onClick={() => setState("idle")}
              className="rounded-[12px] border border-white/[0.1] px-4 py-3 text-[13.5px] text-[var(--text-faint)] transition-colors hover:text-white"
            >
              Keep Growth
            </button>
          </div>
        </div>
      )}

      {/* Action buttons (idle state) */}
      {state === "idle" && !pendingDowngrade && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setState("confirm_downgrade")}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-white/[0.12] bg-[#060606] px-4 py-3.5 text-[13.5px] font-medium text-[var(--muted)] transition-colors hover:border-white/[0.2] hover:text-white"
            style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
          >
            <ArrowDown className="h-3.5 w-3.5" />
            Downgrade to {PLAN_LABELS.starter} (₹{PLAN_PRICES.starter.monthly}/mo)
          </button>
          <button
            onClick={() => setState("confirm_cancel")}
            className="flex w-full items-center justify-center gap-2 rounded-[12px] border border-white/[0.08] px-4 py-3 text-[13px] text-[var(--text-faint)] transition-colors hover:border-[oklch(0.72_0.17_20/0.2)] hover:text-[oklch(0.85_0.1_20)]"
          >
            <X className="h-3.5 w-3.5" />
            Cancel subscription
          </button>
        </div>
      )}

      {/* Error */}
      {state === "error" && errorMsg && (
        <div className="flex items-center gap-2.5 rounded-xl border border-[oklch(0.72_0.17_20/0.25)] bg-[oklch(0.72_0.17_20/0.06)] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[oklch(0.8_0.13_20)]" />
          <p className="text-[13px] text-[oklch(0.85_0.1_20)]">{errorMsg}</p>
          <button
            onClick={() => setState("idle")}
            className="ml-auto text-[12px] text-[var(--text-faint)] hover:text-white"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
