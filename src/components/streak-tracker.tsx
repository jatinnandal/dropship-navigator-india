"use client";

import { useState, useEffect, useCallback } from "react";
import { Flame, RotateCcw, CheckCircle2 } from "lucide-react";
import { checkIn, getActiveStreaks, getStreakStats, type StreakState } from "@/lib/streak-data";

const STORAGE_KEY = "dni-streaks";

function loadState(): StreakState {
  if (typeof window === "undefined") return { habits: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { habits: {} };
    return JSON.parse(raw) as StreakState;
  } catch {
    return { habits: {} };
  }
}

function saveState(state: StreakState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

const CATEGORY_COLORS: Record<string, string> = {
  compliance: "text-rose-400",
  operations: "text-cyan-400",
  marketing: "text-amber-400",
  learning: "text-emerald-400",
};

const FREQUENCY_BADGE: Record<string, string> = {
  daily: "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
  weekly: "bg-amber-400/10 text-amber-400 border-amber-400/20",
  monthly: "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
};

export function StreakTracker() {
  const [state, setState] = useState<StreakState>({ habits: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  const handleCheckIn = useCallback(
    (habitId: string) => {
      const next = checkIn(state, habitId);
      setState(next);
      saveState(next);
    },
    [state]
  );

  if (!mounted) return null;

  const streaks = getActiveStreaks(state);
  const stats = getStreakStats(state);

  const activeStreaks = streaks.filter((s) => s.streak > 0 && !s.isBroken);
  const atRiskStreaks = streaks.filter((s) => s.isAtRisk);
  const brokenOrNew = streaks.filter((s) => s.streak === 0 || s.isBroken);

  return (
    <div className="glass-panel space-y-4 rounded-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-amber-400" />
          <h3 className="text-sm font-semibold text-slate-100">Consistency Streaks</h3>
        </div>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>
            <span className="font-medium text-slate-200">{stats.totalActive}</span> active
          </span>
          {stats.atRisk > 0 && (
            <span className="text-amber-400">
              {stats.atRisk} at risk
            </span>
          )}
          {stats.longestCurrent > 0 && (
            <span>
              Best: <span className="font-medium text-emerald-400">{stats.longestCurrent}</span>
            </span>
          )}
        </div>
      </div>

      {/* At-risk streaks */}
      {atRiskStreaks.length > 0 && (
        <div className="rounded-md border border-amber-400/20 bg-amber-400/5 px-3 py-2">
          <p className="text-xs font-medium text-amber-400">
            {atRiskStreaks.length} streak{atRiskStreaks.length > 1 ? "s" : ""} at risk - check in before the window closes
          </p>
        </div>
      )}

      {/* Active streaks */}
      {activeStreaks.length > 0 && (
        <div className="space-y-2">
          {activeStreaks.map(({ habit, streak, isAtRisk }) => (
            <div
              key={habit.id}
              className={`flex items-center justify-between rounded-md border px-3 py-2 ${
                isAtRisk
                  ? "border-amber-400/30 bg-amber-400/5"
                  : "border-slate-700/50 bg-slate-800/30"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <Flame className={`h-3.5 w-3.5 ${isAtRisk ? "text-amber-400" : "text-orange-400"}`} />
                  <span className="text-xs font-bold text-slate-100">{streak}</span>
                </div>
                <span className="text-xs text-slate-200">{habit.label}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${FREQUENCY_BADGE[habit.frequency]}`}
                >
                  {habit.frequency}
                </span>
              </div>
              <button
                onClick={() => handleCheckIn(habit.id)}
                className="flex items-center gap-1 rounded-md bg-emerald-400/10 px-2 py-1 text-[10px] font-medium text-emerald-400 transition-colors hover:bg-emerald-400/20"
              >
                <CheckCircle2 className="h-3 w-3" />
                Check in
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Broken / not started */}
      {brokenOrNew.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
            Not active
          </p>
          {brokenOrNew.map(({ habit }) => (
            <div
              key={habit.id}
              className="flex items-center justify-between rounded-md border border-slate-800/50 bg-slate-900/30 px-3 py-2 opacity-60 transition-opacity hover:opacity-100"
            >
              <div className="flex items-center gap-2.5">
                <span className={`text-xs ${CATEGORY_COLORS[habit.category]}`}>●</span>
                <span className="text-xs text-slate-400">{habit.label}</span>
                <span
                  className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${FREQUENCY_BADGE[habit.frequency]}`}
                >
                  {habit.frequency}
                </span>
              </div>
              <button
                onClick={() => handleCheckIn(habit.id)}
                className="flex items-center gap-1 rounded-md bg-slate-700/50 px-2 py-1 text-[10px] font-medium text-slate-300 transition-colors hover:bg-slate-700"
              >
                <RotateCcw className="h-3 w-3" />
                Start
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Impact tooltip area */}
      <p className="text-[10px] text-slate-500">
        Real business habits - each one protects revenue or improves performance.
      </p>
    </div>
  );
}
