"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { PLAN_LABELS, PLAN_PRICES, type Plan } from "@/lib/entitlements";
import { PLAN_CARDS } from "@/lib/pricing-tiers";
import {
  createCheckoutSubscription,
  getSubscriptionStatus,
} from "@/app/app/upgrade/actions";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
      close: () => void;
    };
  }
}

type CheckoutState =
  | "idle"
  | "creating"
  | "checkout_open"
  | "verifying"
  | "success"
  | "error";

type BillingPeriod = "monthly" | "yearly";

export function CheckoutFlow({
  currentPlan,
  razorpayKeyId,
  userEmail,
  intentPlan = null,
}: {
  currentPlan: Plan;
  razorpayKeyId: string;
  userEmail: string | null;
  /** Plan the user picked on the public pricing page — highlighted here. */
  intentPlan?: "starter" | "growth" | null;
}) {
  const router = useRouter();
  const [billing, setBilling] = useState<BillingPeriod>("monthly");
  const [state, setState] = useState<CheckoutState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const upgradePlans = PLAN_CARDS.filter((c) => {
    if (c.plan === "free") return false;
    if (currentPlan === "starter" && c.plan === "starter") return false;
    return true;
  });

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const startPolling = useCallback(
    (targetPlan: string) => {
      let attempts = 0;
      pollRef.current = setInterval(async () => {
        attempts++;
        try {
          const { plan } = await getSubscriptionStatus();
          if (plan === targetPlan) {
            stopPolling();
            setState("success");
            setTimeout(() => router.refresh(), 1500);
          }
        } catch {
          // keep polling
        }
        if (attempts >= 15) {
          stopPolling();
          setState("success");
          setTimeout(() => router.refresh(), 1500);
        }
      }, 2000);
    },
    [stopPolling, router],
  );

  const handleSubscribe = useCallback(
    async (plan: "starter" | "growth") => {
      if (!scriptLoaded || !window.Razorpay) {
        setErrorMsg("Payment system loading. Please wait a moment.");
        setState("error");
        return;
      }

      setState("creating");
      setErrorMsg("");

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
        description: `${PLAN_LABELS[plan]} plan (${billing})`,
        handler: () => {
          setState("verifying");
          startPolling(plan);
        },
        prefill: {
          email: userEmail ?? undefined,
        },
        theme: {
          color: "#ffffff",
          backdrop_color: "#000000",
        },
        modal: {
          ondismiss: () => {
            setState("idle");
          },
        },
      });

      rzp.open();
    },
    [billing, razorpayKeyId, userEmail, scriptLoaded, startPolling],
  );

  if (state === "success") {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/[0.2] bg-[#111]">
          <Check className="h-6 w-6 text-[oklch(0.72_0.13_165)]" />
        </div>
        <p className="mt-4 text-lg font-semibold text-white">You're upgraded!</p>
        <p className="mt-2 text-sm text-[var(--muted)]">
          Your plan is now active. Refreshing...
        </p>
      </div>
    );
  }

  if (state === "verifying") {
    return (
      <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
        style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <Loader2 className="mx-auto h-8 w-8 animate-spin text-white" />
        <p className="mt-4 text-sm font-medium text-white">Verifying payment...</p>
        <p className="mt-2 text-xs text-[var(--text-faint)]">
          This usually takes a few seconds.
        </p>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
        onLoad={() => setScriptLoaded(true)}
      />

      {/* Billing toggle */}
      <div className="mx-auto mt-8 flex w-fit items-center gap-1 rounded-full border border-white/[0.12] bg-[#060606] p-1">
        <button
          onClick={() => setBilling("monthly")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
            billing === "monthly"
              ? "bg-white text-black"
              : "text-[var(--muted)] hover:text-white"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setBilling("yearly")}
          className={`rounded-full px-5 py-2 text-[13px] font-medium transition-colors ${
            billing === "yearly"
              ? "bg-white text-black"
              : "text-[var(--muted)] hover:text-white"
          }`}
        >
          Yearly
          <span className="ml-1.5 text-[11px] text-[oklch(0.72_0.13_165)]">
            save ~32%
          </span>
        </button>
      </div>

      {/* Plan cards */}
      <div
        className="mx-auto mt-6 grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${upgradePlans.length}, minmax(280px, 1fr))`,
          maxWidth: upgradePlans.length === 1 ? "400px" : "720px",
        }}
      >
        {upgradePlans.map((card) => {
          const emphasized = intentPlan
            ? card.plan === intentPlan
            : card.highlight;
          const price =
            card.plan === "free"
              ? null
              : PLAN_PRICES[card.plan as "starter" | "growth"];
          const displayPrice = price
            ? billing === "yearly"
              ? Math.round(price.yearly / 12)
              : price.monthly
            : 0;
          const totalYearly = price?.yearly ?? 0;

          return (
            <div
              key={card.plan}
              className={`relative rounded-[22px] p-7 ${
                emphasized
                  ? "border border-white/[0.28] bg-gradient-to-b from-[#101010] to-[#050505]"
                  : "border border-white/[0.12] bg-[#060606]"
              }`}
              style={{
                boxShadow: emphasized
                  ? "0 0 60px -20px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.14)"
                  : "inset 0 1px 0 rgba(255,255,255,0.06)",
              }}
            >
              {emphasized && (
                <span
                  className="font-mono"
                  style={{
                    position: "absolute",
                    top: -12,
                    left: 30,
                    padding: "4px 12px",
                    borderRadius: 999,
                    background: "#ffffff",
                    color: "#000",
                    fontSize: 10,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  {intentPlan ? "your pick" : "most popular"}
                </span>
              )}

              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                {card.name}
              </p>
              <p className="mt-3.5 text-[42px] font-bold tracking-[-0.04em] text-white">
                ₹{displayPrice}
                <span className="text-[15px] font-medium text-[var(--text-faint)]">
                  {" "}/ month
                </span>
              </p>
              {billing === "yearly" && price && (
                <p className="font-mono mt-1.5 text-[11px] text-[var(--text-faint)]">
                  billed ₹{totalYearly}/year
                </p>
              )}
              <p className="mt-2.5 text-[13.5px] leading-[1.65] text-[var(--muted)]">
                {card.tagline}
              </p>

              <div className="mt-5 flex flex-col gap-2.5">
                {card.features.map((f) => (
                  <div key={f} className="flex items-start gap-2.5">
                    <Check
                      size={13}
                      className="mt-0.5 shrink-0"
                      style={{ color: "oklch(0.75 0.12 165)" }}
                    />
                    <p className="text-[13.5px] leading-[1.55] text-[#c9c9c9]">
                      {f}
                    </p>
                  </div>
                ))}
              </div>

              <button
                onClick={() =>
                  handleSubscribe(card.plan as "starter" | "growth")
                }
                disabled={state === "creating" || state === "checkout_open"}
                className="mt-6 flex w-full items-center justify-center min-h-[48px] rounded-[12px] text-[14.5px] font-semibold transition-transform hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: "#ffffff",
                  color: "#000",
                  border: "none",
                  cursor: "pointer",
                  boxShadow:
                    "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)",
                }}
              >
                {state === "creating" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Subscribe to ${card.name}`
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Error message */}
      {state === "error" && errorMsg && (
        <div className="mx-auto mt-4 flex max-w-md items-center gap-2.5 rounded-xl border border-[oklch(0.72_0.17_20/0.25)] bg-[oklch(0.72_0.17_20/0.06)] px-4 py-3">
          <AlertCircle className="h-4 w-4 shrink-0 text-[oklch(0.8_0.13_20)]" />
          <p className="text-[13px] text-[oklch(0.85_0.1_20)]">{errorMsg}</p>
        </div>
      )}

      {/* UPI note */}
      <p className="mx-auto mt-6 max-w-md text-center font-mono text-[11px] text-[var(--text-faintest)]">
        UPI AutoPay · Cards · Net Banking — powered by Razorpay
      </p>
    </>
  );
}
