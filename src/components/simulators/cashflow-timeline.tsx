"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

type DayRow = {
  day: number;
  adSpend: number;
  codIn: number;
  balance: number;
  isDeadZone: boolean;
};

type Props = {
  onComplete?: () => void;
};

export function CashflowTimeline({ onComplete }: Props) {
  const [budget, setBudget] = useState(10000);
  const [dailyAdSpend, setDailyAdSpend] = useState(800);
  const [ordersPerDay, setOrdersPerDay] = useState(3);
  const [avgOrderValue, setAvgOrderValue] = useState(499);
  const [activeDay, setActiveDay] = useState(1);
  const [playing, setPlaying] = useState(false);

  const days = useMemo((): DayRow[] => {
    const rows: DayRow[] = [];
    let balance = budget;
    const codPayoutPerOrder = avgOrderValue * 0.85;

    for (let day = 1; day <= 14; day += 1) {
      const adSpend = dailyAdSpend;
      balance -= adSpend;
      const codIn = day >= 6 && (day - 6) % 2 === 0 ? ordersPerDay * codPayoutPerOrder : 0;
      balance += codIn;
      rows.push({
        day,
        adSpend,
        codIn,
        balance,
        isDeadZone: balance < budget * 0.3 && day <= 7,
      });
    }
    return rows;
  }, [budget, dailyAdSpend, ordersPerDay, avgOrderValue]);

  const minBalance = Math.min(...days.map((d) => d.balance));
  const activeRow = days[activeDay - 1];
  const recommendedBuffer = Math.max(5000, dailyAdSpend * 7);

  function playTimeline() {
    setPlaying(true);
    setActiveDay(1);
    let day = 1;
    const interval = setInterval(() => {
      day += 1;
      if (day > 14) {
        clearInterval(interval);
        setPlaying(false);
        return;
      }
      setActiveDay(day);
    }, 600);
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">Cashflow timeline — the dead zone</p>
      <p className="text-muted text-xs">
        Meta bills daily. COD remittance arrives day 5–7. Marketplace settlements can take 7–14 days. Plan
        float accordingly.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-muted">Starting budget (₹)</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Daily ad spend (₹)</span>
          <input
            type="number"
            value={dailyAdSpend}
            onChange={(e) => setDailyAdSpend(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Orders per day</span>
          <input
            type="number"
            min={1}
            max={20}
            value={ordersPerDay}
            onChange={(e) => setOrdersPerDay(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Avg order value (₹)</span>
          <input
            type="number"
            value={avgOrderValue}
            onChange={(e) => setAvgOrderValue(Number(e.target.value) || 0)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
      </div>

      <div className="rounded-lg border border-amber-300/30 bg-amber-300/5 p-3">
        <p className="text-sm text-amber-200">
          Lowest balance: ₹{minBalance.toFixed(0)}
          {minBalance < 0 ? " — you run out before COD arrives." : ""}
        </p>
        <p className="text-muted mt-1 text-xs">
          Recommended float buffer: ₹{recommendedBuffer.toLocaleString("en-IN")} (keep this aside for ads while
          waiting for payouts)
        </p>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeDay}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25 }}
          className={`rounded-lg border p-4 ${
            activeRow?.isDeadZone
              ? "border-rose-400/40 bg-rose-400/10"
              : "border-cyan-400/30 bg-cyan-400/5"
          }`}
        >
          <p className="text-lg font-bold text-slate-100">Day {activeDay}</p>
          <p className="text-muted mt-1 text-sm">
            −₹{activeRow?.adSpend} ads
            {activeRow && activeRow.codIn > 0 ? ` · +₹${activeRow.codIn.toFixed(0)} COD in` : " · no COD yet"}
          </p>
          <motion.p
            className={`mt-2 text-3xl font-bold ${activeRow && activeRow.balance < 0 ? "text-rose-300" : "text-emerald-300"}`}
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 0.4 }}
          >
            ₹{activeRow?.balance.toFixed(0)}
          </motion.p>
          {activeRow?.isDeadZone ? (
            <p className="mt-2 text-xs text-rose-200">Dead zone — cash locked in transit, ads still billing.</p>
          ) : null}
        </motion.div>
      </AnimatePresence>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={playTimeline}
          disabled={playing}
          className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          {playing ? "Playing…" : "Animate 14 days"}
        </button>
        <input
          type="range"
          min={1}
          max={14}
          value={activeDay}
          onChange={(e) => setActiveDay(Number(e.target.value))}
          className="flex-1 accent-amber-400"
          aria-label="Select day"
        />
      </div>

      {onComplete ? (
        <button type="button" onClick={onComplete} className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold">
          Got it — I will budget for the dead zone
        </button>
      ) : null}
    </div>
  );
}
