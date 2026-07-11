import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { getCurrentPlan } from "@/lib/plan";
import { getCurrentUserEmail } from "@/lib/current-user";
import { PLAN_LABELS } from "@/lib/entitlements";
import { CheckoutFlow } from "@/components/plan/checkout-flow";
import { ManageSubscription } from "@/components/plan/manage-subscription";
import { CancelSubscriptionButton } from "@/components/plan/cancel-subscription-button";
import { getSubscriptionDetails } from "./actions";

export default async function UpgradePage() {
  const [plan, email] = await Promise.all([
    getCurrentPlan(),
    getCurrentUserEmail(),
  ]);

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

  if (plan === "growth") {
    const details = await getSubscriptionDetails();

    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-white/[0.2] bg-[#111]">
          <Check className="h-6 w-6 text-[oklch(0.72_0.13_165)]" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-white">
          You're on the Growth plan
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
          You have access to everything Navigator offers.
        </p>
        <ManageSubscription
          periodEnd={details.periodEnd}
          pendingDowngrade={details.pendingDowngrade}
        />
        <Link
          href="/app"
          className="mt-6 inline-flex items-center gap-2 text-[13.5px] font-medium text-[var(--text-faint)] no-underline hover:text-white transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-12">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-faint)] no-underline hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <div className="mt-8 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Currently on {PLAN_LABELS[plan]}
        </p>
        <h1 className="mt-3 text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-[-0.03em] text-white">
          Upgrade your plan
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          Unlock more tools, profiles, and crisis protocols.
        </p>
      </div>

      {razorpayKeyId ? (
        <CheckoutFlow
          currentPlan={plan}
          razorpayKeyId={razorpayKeyId}
          userEmail={email}
        />
      ) : (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}>
          <p className="text-[15px] font-medium text-white">
            Billing opens shortly
          </p>
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            UPI AutoPay subscriptions are being set up. Check back soon.
          </p>
          <Link
            href="/app"
            className="mt-5 inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-faint)] no-underline hover:text-white transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to dashboard
          </Link>
        </div>
      )}

      {plan === "starter" && <CancelSubscriptionButton />}

      {/* Honesty note */}
      <div className="mx-auto mt-10 flex max-w-lg gap-3 rounded-[14px] border border-white/[0.1] bg-[#060606] p-4">
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white text-sm text-black">
          🧭
        </div>
        <p className="text-[13px] leading-[1.7] text-[var(--body-text)]">
          <span className="font-serif-accent text-[14.5px] text-white">
            &ldquo;Don&apos;t upgrade yet.
          </span>{" "}
          Seriously — if you haven&apos;t launched, the free plan is the whole
          mentor. Upgrade when reconciling settlements starts eating your
          evenings.&rdquo;
        </p>
      </div>
    </div>
  );
}
