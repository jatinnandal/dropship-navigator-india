import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCurrentPlan } from "@/lib/plan";
import { getCurrentUserEmail } from "@/lib/current-user";
import { PLAN_LABELS } from "@/lib/entitlements";
import { PlansBilling } from "@/components/plan/plans-billing";
import { getSubscriptionDetails } from "@/app/app/upgrade/actions";

type Props = {
  searchParams: Promise<{ plan?: string }>;
};

export default async function PlansPage({ searchParams }: Props) {
  const [current, email, params] = await Promise.all([
    getCurrentPlan(),
    getCurrentUserEmail(),
    searchParams,
  ]);
  const details = await getSubscriptionDetails();

  const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";
  const intentPlan =
    params.plan === "starter" || params.plan === "growth" ? params.plan : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <Link
        href="/app"
        className="inline-flex items-center gap-2 text-[13px] font-medium text-[var(--text-faint)] no-underline hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Dashboard
      </Link>

      <div className="mt-8 text-center">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Currently on {PLAN_LABELS[current]}
        </p>
        <h1 className="mt-3 text-[clamp(1.6rem,3.5vw,2.4rem)] font-bold tracking-[-0.03em] text-white">
          Plans &amp; billing
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          Every tier side by side. Upgrade, downgrade, or cancel — right here.
        </p>
      </div>

      {razorpayKeyId ? (
        <PlansBilling
          currentPlan={current}
          razorpayKeyId={razorpayKeyId}
          userEmail={email}
          intentPlan={intentPlan}
          periodEnd={details.periodEnd}
          pendingDowngrade={details.pendingDowngrade}
        />
      ) : (
        <div
          className="mx-auto mt-10 max-w-md rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] p-8 text-center"
          style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
        >
          <p className="text-[15px] font-medium text-white">Billing opens shortly</p>
          <p className="mt-2 text-[13px] text-[var(--muted)]">
            UPI AutoPay subscriptions are being set up. Check back soon.
          </p>
        </div>
      )}
    </div>
  );
}
