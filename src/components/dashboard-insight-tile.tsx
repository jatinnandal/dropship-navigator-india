"use client";

import CountUp from "@/components/CountUp";
import type { DashboardInsight } from "@/lib/dashboard-insights";

const ACCENT_CLASS: Record<DashboardInsight["accent"], string> = {
  info: "insight-tile-info",
  safe: "insight-tile-safe",
  warn: "insight-tile-warn",
  neutral: "insight-tile-neutral",
};

type Props = {
  insight: DashboardInsight;
};

export function DashboardInsightTile({ insight }: Props) {
  return (
    <article
      className={`insight-tile spotlight-card ${ACCENT_CLASS[insight.accent]}`}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
        event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
      }}
    >
      <p className="text-muted text-xs font-medium uppercase tracking-wide">{insight.label}</p>
      <p className="font-display mt-2 text-lg font-semibold text-slate-100">
        {insight.countUp !== undefined ? (
          <>
            <CountUp to={insight.countUp} duration={1.1} />
            {insight.countUpSuffix ?? ""}
          </>
        ) : (
          insight.value
        )}
      </p>
      <p className="text-muted mt-2 text-sm leading-5">{insight.consequence}</p>
    </article>
  );
}
