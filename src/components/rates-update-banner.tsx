import { BadgePercent } from "lucide-react";
import { dismissRatesUpdate } from "@/app/app/rates-actions";
import { formatINR } from "@/lib/format";
import type { RatesImpact } from "@/lib/rates-impact";

export function RatesUpdateBanner({ impact }: { impact: RatesImpact }) {
  const improved = impact.deltaPoints >= 0;
  const accent = improved ? "var(--success)" : "oklch(0.8 0.13 20)";
  const sign = impact.deltaPoints >= 0 ? "+" : "−";

  return (
    <section
      className="mt-5 rounded-[16px] border p-4 sm:p-5"
      style={{
        borderColor: improved ? "oklch(0.72 0.13 165 / 0.25)" : "oklch(0.72 0.17 20 / 0.25)",
        background: improved ? "oklch(0.72 0.13 165 / 0.05)" : "oklch(0.72 0.17 20 / 0.05)",
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span
            className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-[9px] border border-white/[0.14] bg-[#0c0c0c]"
            aria-hidden="true"
          >
            <BadgePercent className="h-4 w-4" style={{ color: accent }} />
          </span>
          <div>
            <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
              Rate card updated · {impact.toVersion}
            </p>
            <p className="mt-1.5 text-[14.5px] font-medium text-white">
              Your saved product's margin: {impact.oldNetMarginPercent.toFixed(1)}% →{" "}
              {impact.newNetMarginPercent.toFixed(1)}%{" "}
              <span style={{ color: accent }}>
                ({sign}
                {Math.abs(impact.deltaPoints).toFixed(1)}pt ·{" "}
                {formatINR(Math.abs(impact.newNetProfit - impact.oldNetProfit), { decimals: true })}/order)
              </span>
            </p>
            {impact.changes.length > 0 ? (
              <ul className="mt-2 flex flex-col gap-1">
                {impact.changes.slice(0, 3).map((c) => (
                  <li key={c} className="text-[12.5px] leading-[1.55] text-[var(--muted)]">
                    · {c}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <form action={dismissRatesUpdate}>
          <button
            type="submit"
            className="min-h-[36px] cursor-pointer rounded-[9px] border border-white/[0.14] bg-white/[0.03] px-3.5 text-[12.5px] font-semibold text-[var(--body-text)] transition-colors hover:border-white/[0.28] hover:text-white"
          >
            Got it
          </button>
        </form>
      </div>
    </section>
  );
}
