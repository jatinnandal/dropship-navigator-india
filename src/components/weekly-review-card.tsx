import Link from "next/link";
import { CalendarClock, Receipt, TrendingUp } from "lucide-react";
import { formatINR } from "@/lib/format";
import type { WeeklyReview } from "@/lib/weekly-review";

const VERDICT_LABEL: Record<string, { text: string; color: string }> = {
  excellent: { text: "Excellent", color: "var(--success)" },
  healthy: { text: "Healthy", color: "var(--success)" },
  tight: { text: "Tight", color: "#f59e0b" },
  loss: { text: "Loss-making", color: "oklch(0.8 0.13 20)" },
};

export function WeeklyReviewCard({ review }: { review: WeeklyReview }) {
  const { unit, recon, gstEvents } = review;

  return (
    <div className="panel rounded-[18px] p-5">
      <div className="flex items-baseline justify-between gap-3">
        <p className="mono-label">Weekly review</p>
        <p className="font-mono text-[10px] text-[var(--text-faintest)]">{review.weekLabel}</p>
      </div>

      {/* Unit economics */}
      {unit ? (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[13px] text-[var(--body-text)]">
              Per-order profit at {unit.rtoRatePercent}% RTO
            </p>
            <span
              className="font-mono text-[10px] uppercase tracking-[0.1em]"
              style={{ color: VERDICT_LABEL[unit.verdict].color }}
            >
              {VERDICT_LABEL[unit.verdict].text}
            </span>
          </div>
          <p className="mt-1 text-[22px] font-bold tabular-nums text-white">
            {formatINR(unit.netProfitPerOrder, { decimals: true })}
            <span className="ml-2 text-[12px] font-medium text-[var(--muted)]">
              {unit.netMarginPercent.toFixed(1)}% margin
            </span>
          </p>
          <div className="mt-2.5 flex gap-2">
            {unit.projections.map((p) => (
              <div
                key={p.orders}
                className="flex-1 rounded-[10px] border border-white/[0.08] bg-white/[0.02] px-2 py-1.5 text-center"
              >
                <p className="font-mono text-[9.5px] text-[var(--text-faint)]">{p.orders}/wk</p>
                <p className="text-[12px] font-semibold tabular-nums text-[var(--body-text)]">
                  {formatINR(p.weeklyProfit)}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-3">
          <p className="text-[13px] leading-[1.6] text-[var(--muted)]">
            Save your product numbers in the margin calculator and this becomes your Monday
            profit check-in.
          </p>
          <Link
            href="/app/tools/margin-calculator"
            className="mt-2 inline-flex items-center gap-1.5 text-[12.5px] font-medium text-white hover:text-white/70 transition-colors"
          >
            <TrendingUp className="h-3.5 w-3.5" aria-hidden="true" />
            Run the margin calculator →
          </Link>
        </div>
      )}

      {/* Payout recon snapshot */}
      <div className="mt-4 border-t border-white/[0.08] pt-3.5">
        {recon ? (
          <Link
            href="/app/tools/payout-reconciliation"
            className="group flex items-start gap-2.5"
          >
            <Receipt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" aria-hidden="true" />
            <p className="text-[12.5px] leading-[1.6] text-[var(--muted)] group-hover:text-[var(--body-text)] transition-colors">
              Last payout check:{" "}
              <span className={recon.totalDelta > 50 ? "text-[oklch(0.8_0.13_20)]" : "text-[var(--success)]"}>
                {formatINR(recon.totalDelta)} unexplained
              </span>
              {recon.flaggedCount > 0 ? <> · {recon.flaggedCount} flagged</> : null} ·{" "}
              {formatINR(recon.tcsEstimate)} TCS to claim
            </p>
          </Link>
        ) : (
          <Link href="/app/tools/payout-reconciliation" className="group flex items-start gap-2.5">
            <Receipt className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" aria-hidden="true" />
            <p className="text-[12.5px] leading-[1.6] text-[var(--muted)] group-hover:text-[var(--body-text)] transition-colors">
              No payout reconciled yet — upload last settlement's CSV and see what the
              marketplace kept.
            </p>
          </Link>
        )}
      </div>

      {/* GST deadlines */}
      {gstEvents.length > 0 ? (
        <div className="mt-3.5 border-t border-white/[0.08] pt-3.5">
          {gstEvents.map((e) => (
            <Link key={e.id} href="/app/tools/gst-calendar" className="group flex items-start gap-2.5 py-1">
              <CalendarClock className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" aria-hidden="true" />
              <p className="text-[12.5px] leading-[1.5] text-[var(--muted)] group-hover:text-[var(--body-text)] transition-colors">
                <span className="text-white">{e.filing.form}</span>{" "}
                {e.daysUntilDue === 0 ? (
                  <span className="text-[oklch(0.8_0.13_20)]">due today</span>
                ) : (
                  <>in {e.daysUntilDue} day{e.daysUntilDue === 1 ? "" : "s"}</>
                )}
              </p>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
