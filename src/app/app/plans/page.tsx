import Link from "next/link";
import { ArrowLeft, Check } from "lucide-react";
import { getCurrentPlan } from "@/lib/plan";
import { PLAN_LABELS, planCovers, type Plan } from "@/lib/entitlements";
import { PLAN_CARDS } from "@/lib/pricing-tiers";

const PLAN_ORDER: Record<Plan, number> = { free: 0, starter: 1, growth: 2 };

export default async function PlansPage() {
  const current = await getCurrentPlan();

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
          Every plan, side by side
        </h1>
        <p className="mt-2 text-[15px] text-[var(--muted)]">
          See exactly what you have today and what each tier adds.
        </p>
      </div>

      <div
        className="mt-10 grid gap-4"
        style={{ gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))" }}
      >
        {PLAN_CARDS.map((card) => {
          const isCurrent = card.plan === current;
          const isUpgrade = PLAN_ORDER[card.plan] > PLAN_ORDER[current];
          const isLower = PLAN_ORDER[card.plan] < PLAN_ORDER[current];

          return (
            <section
              key={card.plan}
              className={`relative rounded-[22px] p-7 ${
                isCurrent
                  ? "border border-white/[0.28] bg-gradient-to-b from-[#101010] to-[#050505]"
                  : "border border-white/[0.12] bg-[#060606]"
              }`}
              style={{
                boxShadow: isCurrent
                  ? "0 0 60px -20px rgba(255,255,255,0.2), inset 0 1px 0 rgba(255,255,255,0.12)"
                  : "inset 0 1px 0 rgba(255,255,255,0.06)",
                opacity: isLower ? 0.75 : 1,
              }}
            >
              {isCurrent ? (
                <span className="font-mono absolute -top-3 left-7 rounded-full bg-white px-3 py-1 text-[10px] uppercase tracking-[0.12em] text-black">
                  Your plan
                </span>
              ) : null}

              <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
                {card.name}
              </p>
              <p className="mt-3.5 text-[42px] font-bold tracking-[-0.04em] text-white">
                ₹{card.priceMonthly}
                <span className="text-[15px] font-medium text-[var(--text-faint)]">
                  {card.priceMonthly === 0 ? " / forever" : " / month"}
                </span>
              </p>
              {card.priceYearly ? (
                <p className="font-mono mt-1.5 text-[11px] text-[var(--text-faint)]">
                  or ₹{card.priceYearly}/year
                </p>
              ) : null}
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
                    <p className="text-[13.5px] leading-[1.55] text-[#c9c9c9]">{f}</p>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                {isCurrent ? (
                  current === "free" ? (
                    <div className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-white/[0.16] bg-white/[0.03] text-[14px] font-medium text-[var(--muted)]">
                      Your current plan
                    </div>
                  ) : (
                    <Link
                      href="/app/upgrade"
                      className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-white/[0.16] bg-white/[0.03] text-[14px] font-medium text-[var(--muted)] no-underline transition-colors hover:text-white hover:border-white/[0.3]"
                    >
                      Manage plan →
                    </Link>
                  )
                ) : isUpgrade ? (
                  <Link
                    href={`/app/upgrade?plan=${card.plan}`}
                    className="flex min-h-[48px] items-center justify-center rounded-[12px] text-[14.5px] font-semibold text-black no-underline transition-transform hover:-translate-y-px"
                    style={{
                      background: "#ffffff",
                      boxShadow:
                        "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)",
                    }}
                  >
                    Upgrade to {card.name} →
                  </Link>
                ) : (
                  <div className="flex min-h-[48px] items-center justify-center rounded-[12px] border border-white/[0.1] text-[13px] font-medium text-[var(--text-faintest)]">
                    {planCovers(current, card.plan)
                      ? "Included in your plan"
                      : ""}
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
