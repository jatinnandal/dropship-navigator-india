"use client";

import CountUp from "@/components/CountUp";
import type { DashboardInsight } from "@/lib/dashboard-insights";

const VALUE_COLOR: Record<DashboardInsight["accent"], string> = {
  info: "text-white",
  safe: "text-success",
  warn: "text-danger",
  neutral: "text-white",
};

type Props = {
  insight: DashboardInsight;
};

export function DashboardInsightTile({ insight }: Props) {
  return (
    <article className="insight-tile">
      <p className="mono-label">{insight.label}</p>
      <p className={`mt-2 text-lg font-semibold ${VALUE_COLOR[insight.accent]}`}>
        {insight.countUp !== undefined ? (
          <>
            <CountUp to={insight.countUp} duration={1.1} />
            {insight.countUpSuffix ?? ""}
          </>
        ) : (
          insight.value
        )}
      </p>
      <p className="mt-2 text-sm leading-5 text-[var(--body-text)]">{insight.consequence}</p>
    </article>
  );
}
