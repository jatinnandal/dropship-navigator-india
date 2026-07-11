"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { PLAN_PRICES, type Plan } from "@/lib/entitlements";
import { PLAN_CARDS } from "@/lib/pricing-tiers";
import {
  createCheckoutSubscription,
  getSubscriptionStatus,
} from "@/app/app/upgrade/actions";
import { ManageSubscription } from "@/components/plan/manage-subscription";
import { CancelSubscriptionButton } from "@/components/plan/cancel-subscription-button";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

type CheckoutState = "idle" | "creating" | "checkout_open" | "verifying" | "success" | "error";
type BillingPeriod = "monthly" | "yearly";

const PLAN_ORDER: Record<Plan, number> = { free: 0, starter: 1, growth: 2 };

const RAZORPAY_SRC = "https://checkout.razorpay.com/v1/checkout.js";

export function PlansBilling({
  currentPlan,
  razorpayKeyId,
  userEmail,
  intentPlan = null,
  periodEnd,
  pendingDowngrade,
}: {
  currentPlan: Plan;
  razorpayKeyId: string;
  userEmail: string | null;
  intentPlan?: "starter" | "growth" | null;
  periodEnd: string | null;
  pendingDowngrade: boolean;
}) {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [state, setState] = useState<CheckoutState>("idle");
  const [activePlan, setActivePlan] = useState<"starter" | "growth" | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, []);

  const startPolling = useCallback(
    (targetPlan: string) => {
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const { plan } = await getSubscriptionStatus();
          if (plan === targetPlan) {
            if (pollRef.current) clearInterval(pollRef.current);
            setState("success");
            setTimeout(() => router.refresh(), 1500);
          }
        } catch {
          // keep polling
        }
        if (attempts >= 15) {
          if (pollRef.current) clearInterval(pollRef.current);
          setState("success");
          setTimeout(() => router.refresh(), 1500);
        }
      }, 2000);
    },
    [router],
  );

  // Load the Razorpay checkout script on demand (first Subscribe click) instead
  // of eagerly on page mount — nothing loads while a user is just viewing plans.
  // The click handler awaits onload, so there's no false "still loading" race.
  const ensureRazorpay = useCallback(async (): Promise<boolean> => {
    if (typeof window === "undefined") return false;
    if (window.Razorpay) return true;

    let script = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SRC}"]`);
    if (!script) {
      script = document.createElement("script");
      script.src = RAZORPAY_SRC;
      script.async = true;
      document.body.appendChild(script);
    }

    await new Promise<void>((resolve) => {
      if (window.Razorpay) return resolve();
      const done = () => resolve();
      script!.addEventListener("load", done, { once: true });
      script!.addEventListener("error", done, { once: true });
      // Safety net if the load/error event already fired before we attached.
      setTimeout(done, 8000);
    });

    return !!window.Razorpay;
  }, []);

  const handleSubscribe = useCallback(
    async (plan: "starter" | "growth") => {
      setActivePlan(plan);
      setState("creating");
      setErrorMsg("");

      const ready = await ensureRazorpay();
      if (!ready) {
        setErrorMsg(
          "Couldn't load the payment window. Disable ad-blockers or check your connection, then retry.",
        );
        setState("error");
        return;
      }

      const result = await createCheckoutSubscription({ plan, billing });
      if ("error" in result) {
        setErrorMsg(result.error);
        setState("error");
        return;
      }

      setState("checkout_open");

      const rzp = new window.Razorpay({
        key: razorpayKeyId,
        subscription_id: result.subscriptionId,
        name: "Navigator India",
        description: `${plan[0].toUpperCase()}${plan.slice(1)} plan (${billing})`,
        handler: () => {
          setState("verifying");
          startPolling(plan);
        },
        prefill: { email: userEmail ?? undefined },
        theme: { color: "#ffffff", backdrop_color: "#000000" },
        modal: { ondismiss: () => setState("idle") },
      });

      rzp.open();
    },
    [billing, razorpayKeyId, userEmail, ensureRazorpay, startPolling],
  );

  if (state === "success") {
    return (
      <div
        className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/[0.2] bg-[#111]">
          <Check className="h-6 w-6 text-[oklch(0.72_0.13_165)]" />
        </div>
        <p className="mt-4 text-lg font-semibold text-white">You&apos;re upgraded!</p>
        <p className="mt-2 text-sm text-[var(--muted)]">Your plan is now active. Refreshing…</p>
      </div>
    );
  }

  if (state === "verifying") {
    return (
      <div
        className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
      >
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
        <p className="mt-4 text-sm font-medium text-white">Verifying payment…</p>
        <p className="mt-2 text-xs text-[var(--text-faint)]">This usually takes a few seconds.</p>
      </div>
    );
  }

  return (
    <>
      {/* Billing toggle */}
      <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-white/[0.12] bg-[#060606] p-1">
        <button
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
            billing === "monthly" ? "bg-white text-black" : "text-[var(--muted)] hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
            billing === "yearly" ? "bg-white text-black" : "text-[var(--muted)] hover:text-white"
          }`}
        >
          Yearly
          <span className="ml-1.5 text-[11px] text-[oklch(0.72_0.13_165)]">save ~32%</span>
        </button>
      </div>

      <div
        className="mx-auto mt-8 grid max-w-5xl gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {PLAN_CARDS.map((card) => {
          const isCurrent = card.plan === currentPlan;
          const isUpgrade = PLAN_ORDER[card.plan] > PLAN_ORDER[currentPlan];
          const emphasized = intentPlan ? card.plan === intentPlan : isCurrent;

          const price =
            card.plan === "free" ? null : PLAN_PRICES[card.plan as "starter" | "growth"];
          const displayPrice = price
            ? billing === "yearly"
              ? Math.round(price.yearly / 12)
              : price.monthly
            : 0;

          const busy =
            (state === "creating" || state === "checkout_open") && activePlan === card.plan;

          return (
            <section
              key={card.plan}
              className={`relative rounded-[22px] p-7 ${
                emphasized
                  ? "border border-white/[0.28] bg-gradient-to-b from-[#101010] to-[#050505]"
                  : "border border-white/[0.12] bg-[#060606]"
              }`}
              style={{
                boxShadow: emphasized
                  ? "0 0 60px -20px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
                  : "inset 0 1px 0 rgba(255,255,255,0.06)",
                opacity: !isCurrent && !isUpgrade ? 0.75 : 1,
              }}
            >
              {isCurrent ? (
                <span className="font-mono absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-black">
                  Your plan
                </span>
              ) : intentPlan === card.plan ? (
                <span className="font-mono absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-black">
                  Your pick
                </span>
              ) : null}

              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                {card.name}
              </p>
              <p className="mt-3.5 text-[42px] font-bold tracking-[-0.04em] text-white">
                ₹{displayPrice}
                <span className="text-[15px] font-medium text-[var(--text-faint)]">
                  {card.priceMonthly === 0 ? " / forever" : " / month"}
                </span>
              </p>
              {price && billing === "yearly" ? (
                <p className="font-mono mt-1.5 text-[11px] text-[var(--text-faint)]">
                  billed ₹{price.yearly}/year
                </p>
              ) : (
                <p className="font-mono mt-1.5 text-[11px] text-[var(--text-faint)]">
                  {card.priceYearly ? `or ₹${card.priceYearly}/year` : " "}
                </p>
              )}
              <p className="mt-2.5 text-[13.5px] leading-[1.65] text-[var(--muted)]">{card.tagline}</p>

              <div className="mt-5 flex flex-col gap-2.5">
                {card.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check size={13} className="mt-0.5 shrink-0" style={{ color: "oklch(0.75 0.12 165)" }} />
                    <p className="text-[13.5px] leading-[1.55] text-[#c9c9c9]">{f}</p>
                  </div>
                ))}
              </div>

              {/* Action */}
              <div className="mt-6">
                {isCurrent ? (
                  <div className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-white/[0.16] bg-white/[0.03] text-[14px] font-medium text-[var(--muted)]">
                    Your current plan
                  </div>
                ) : isUpgrade ? (
                  <button
                    onClick={() => handleSubscribe(card.plan as "starter" | "growth")}
                    disabled={busy}
                    className="flex w-full items-center justify-center min-h-[48px] rounded-[12px] text-[14.5px] font-semibold transition-transform hover:-translate-y-px disabled:cursor-not-allowed disabled:opacity-60"
                    style={{
                      background: "#ffffff",
                      color: "#000",
                      border: "none",
                      cursor: "pointer",
                      boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)",
                    }}
                  >
                    {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : `Subscribe to ${card.name}`}
                  </button>
                ) : (
                  <div className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-white/[0.1] text-[13px] font-medium text-[var(--text-faintest)]">
                    Included in your plan
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {/* Error */}
      {state === "error" && errorMsg && (
        <div className="mx-auto mt-4 flex max-w-md items-center gap-2.5 rounded-xl border border-[oklch(0.72_0.17_20/0.25)] bg-[oklch(0.72_0.17_20/0.06)] px-4 py-3">
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

      <p className="mx-auto mt-6 max-w-md text-center font-mono text-[11px] text-[var(--text-faintest)]">
        UPI AutoPay · Cards · Net Banking — powered by Razorpay
      </p>

      {/* Manage current paid plan */}
      {currentPlan === "growth" ? (
        <ManageSubscription periodEnd={periodEnd} pendingDowngrade={pendingDowngrade} />
      ) : currentPlan === "starter" ? (
        <CancelSubscriptionButton />
      ) : null}
    </>
  );
}
