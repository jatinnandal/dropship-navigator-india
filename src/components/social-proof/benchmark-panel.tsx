"use client";

import { useMemo } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import { BENCHMARKS, estimateUserStage } from "@/lib/seller-benchmarks";

type BenchmarkPanelProps = {
  ordersPerDay?: number;
  monthsActive?: number;
};

export function BenchmarkPanel({
  ordersPerDay = 3,
  monthsActive = 1,
}: BenchmarkPanelProps) {
  const currentStage = useMemo(
    () => estimateUserStage(ordersPerDay, monthsActive),
    [ordersPerDay, monthsActive]
  );

  const currentIdx = BENCHMARKS.findIndex((b) => b.stage === currentStage.stage);
  const nextStage = currentIdx < BENCHMARKS.length - 1 ? BENCHMARKS[currentIdx + 1] : null;

  return (
    <div className="glass-panel grain rounded-xl p-5 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Your Stage</p>
          <p className="text-lg font-bold text-slate-200">{currentStage.label}</p>
          <p className="text-xs text-slate-500">{currentStage.monthsRange}</p>
        </div>
        <div className="rounded-md bg-amber-500/10 border border-amber-500/30 px-3 py-1.5">
          <p className="text-xs text-amber-400 font-medium">{ordersPerDay} orders/day</p>
        </div>
      </div>

      {/* Benchmark metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {Object.entries(currentStage.metrics).map(([key, value]) => (
          <div key={key} className="rounded-md bg-slate-900/60 p-2.5">
            <p className="text-xs text-slate-500 capitalize">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="text-sm font-medium text-slate-300">{value}</p>
          </div>
        ))}
      </div>

      {/* Next stage */}
      {nextStage && (
        <div className="rounded-lg border border-slate-700 bg-slate-900/40 p-3 space-y-1.5">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-cyan-400" />
            <p className="text-xs font-medium text-cyan-400">
              Next: {nextStage.label} ({nextStage.monthsRange})
            </p>
          </div>
          <p className="text-xs text-slate-500">
            Target {nextStage.metrics.ordersPerDay} orders/day · {nextStage.metrics.monthlyRevenue} revenue
          </p>
        </div>
      )}

      {/* Common mistakes */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-rose-400" />
          <p className="text-xs font-semibold text-rose-400">Common Mistakes at This Stage</p>
        </div>
        <ul className="space-y-1.5">
          {currentStage.commonMistakes.map((mistake, i) => (
            <li key={i} className="text-xs text-slate-400 leading-relaxed pl-4 relative before:absolute before:left-1 before:top-1.5 before:h-1 before:w-1 before:rounded-full before:bg-rose-500/60">
              {mistake}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
