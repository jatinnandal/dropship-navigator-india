"use client";

import { useMemo, useState } from "react";

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

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">Cashflow timeline</p>
      <p className="text-muted text-xs">
        Meta bills today. COD cash arrives 5–7 days later. This is the dead zone that kills beginners.
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
      </div>

      <p className="text-sm text-amber-200">
        Lowest balance in 14 days: ₹{minBalance.toFixed(0)}
        {minBalance < 0 ? " — you run out of cash before COD arrives." : ""}
      </p>

      <ol className="max-h-64 space-y-2 overflow-y-auto pr-1">
        {days.map((row) => (
          <li
            key={row.day}
            className={`flex items-center justify-between rounded-md border px-3 py-2 text-xs ${
              row.isDeadZone
                ? "border-rose-400/40 bg-rose-400/10"
                : "border-slate-700/50 bg-slate-900/30"
            }`}
          >
            <span className="font-medium text-slate-200">Day {row.day}</span>
            <span className="text-muted">
              −₹{row.adSpend} ads
              {row.codIn > 0 ? ` · +₹${row.codIn.toFixed(0)} COD` : ""}
            </span>
            <span className={row.balance < 0 ? "text-rose-300" : "text-emerald-300"}>
              ₹{row.balance.toFixed(0)}
            </span>
          </li>
        ))}
      </ol>

      {onComplete ? (
        <button type="button" onClick={onComplete} className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold">
          Got it — I will budget for the dead zone
        </button>
      ) : null}
    </div>
  );
}
