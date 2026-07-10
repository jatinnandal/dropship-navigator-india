"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { motion } from "framer-motion";
import { Clock, Truck, Wallet, TrendingUp, ArrowRight } from "lucide-react";
import CountUp from "@/components/CountUp";
import type { PrimaryChannel } from "@/lib/mvp-data";
import {
  ALL_CHANNELS,
  SETTLEMENT_TIMELINES,
  getOrderLifecycleMilestones,
  calculateWorkingCapital,
  type WorkingCapitalResult,
} from "@/lib/settlement-data";

/* ── helpers ── */
const CHANNEL_LABELS: Record<PrimaryChannel, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  meesho: "Meesho",
  shopify: "Shopify",
};

const DOT_COLORS: Record<string, string> = {
  amber: "bg-amber-400 shadow-amber-400/40",
  emerald: "bg-emerald-400 shadow-emerald-400/40",
  rose: "bg-rose-400 shadow-rose-400/40",
  cyan: "bg-cyan-400 shadow-cyan-400/40",
};

const DOT_TEXT_COLORS: Record<string, string> = {
  amber: "text-amber-400",
  emerald: "text-emerald-400",
  rose: "text-rose-400",
  cyan: "text-cyan-400",
};

/* ── component ── */
export function SettlementTimeline() {
  const [activeChannel, setActiveChannel] = useState<PrimaryChannel>("amazon");

  // Working capital inputs
  const [monthlyOrders, setMonthlyOrders] = useState(150);
  const [avgOrderValue, setAvgOrderValue] = useState(800);
  const [codPercent, setCodPercent] = useState(60);
  const [productCostPercent, setProductCostPercent] = useState(40);

  const milestones = useMemo(
    () => getOrderLifecycleMilestones(activeChannel),
    [activeChannel]
  );

  const workingCapital: WorkingCapitalResult = useMemo(
    () =>
      calculateWorkingCapital({
        monthlyOrders,
        avgOrderValue,
        codPercent,
        channel: activeChannel,
        productCostPercent,
      }),
    [monthlyOrders, avgOrderValue, codPercent, activeChannel, productCostPercent]
  );

  const totalMonthlyRevenue = monthlyOrders * avgOrderValue;
  const timeline = SETTLEMENT_TIMELINES[activeChannel];

  return (
    <div className="space-y-8">
      {/* ── Channel Selector ── */}
      <div className="glass-panel rounded-lg p-1 inline-flex gap-1">
        {ALL_CHANNELS.map((ch) => (
          <button
            key={ch}
            onClick={() => setActiveChannel(ch)}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeChannel === ch
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            {CHANNEL_LABELS[ch]}
          </button>
        ))}
      </div>

      {/* ── Order Lifecycle Timeline ── */}
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-amber-400" />
          Order Lifecycle — {CHANNEL_LABELS[activeChannel]}
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden sm:block relative">
          {/* Track line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-slate-700 rounded-full" />

          <div className="relative flex justify-between">
            {milestones.map((m, i) => (
              <motion.div
                key={`${activeChannel}-${i}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1, duration: 0.3 }}
                className="flex flex-col items-center text-center"
              >
                <span className={`text-xs font-mono mb-1 ${DOT_TEXT_COLORS[m.color]}`}>
                  Day {m.day}
                </span>
                <div
                  className={`w-3 h-3 rounded-full shadow-md ${DOT_COLORS[m.color]} z-10`}
                />
                <span className="text-xs text-slate-400 mt-2 max-w-[80px] leading-tight">
                  {m.label}
                </span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mobile: vertical timeline */}
        <div className="sm:hidden space-y-4">
          {milestones.map((m, i) => (
            <motion.div
              key={`${activeChannel}-mob-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1, duration: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 rounded-full shadow-md ${DOT_COLORS[m.color]}`}
                />
                {i < milestones.length - 1 && (
                  <div className="w-0.5 h-6 bg-slate-700 mt-1" />
                )}
              </div>
              <div>
                <span className={`text-xs font-mono ${DOT_TEXT_COLORS[m.color]}`}>
                  Day {m.day}
                </span>
                <p className="text-sm text-slate-300">{m.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Marketplace Comparison Table ── */}
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-cyan-400" />
          Marketplace Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-slate-400 text-xs uppercase border-b border-slate-700/50">
                <th className="text-left pb-3 pr-4">Channel</th>
                <th className="text-center pb-3 px-2">Delivery</th>
                <th className="text-center pb-3 px-2">Return Window</th>
                <th className="text-center pb-3 px-2">Prepaid</th>
                <th className="text-center pb-3 px-2">COD</th>
                <th className="text-center pb-3 px-2">Total Locked</th>
              </tr>
            </thead>
            <tbody>
              {ALL_CHANNELS.map((ch) => {
                const t = SETTLEMENT_TIMELINES[ch];
                const totalPrepaid = t.deliveryDays + t.prepaidSettlementDays;
                const totalCOD = t.deliveryDays + t.codSettlementDays;
                const maxTotal = Math.max(
                  ...ALL_CHANNELS.map(
                    (c) =>
                      SETTLEMENT_TIMELINES[c].deliveryDays +
                      SETTLEMENT_TIMELINES[c].codSettlementDays
                  )
                );
                const minTotal = Math.min(
                  ...ALL_CHANNELS.map(
                    (c) =>
                      SETTLEMENT_TIMELINES[c].deliveryDays +
                      SETTLEMENT_TIMELINES[c].prepaidSettlementDays
                  )
                );
                const isMin = totalPrepaid === minTotal;
                const isMax = totalCOD === maxTotal;

                return (
                  <tr
                    key={ch}
                    className={`border-b border-slate-700/30 ${
                      ch === activeChannel ? "bg-slate-800/50" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-slate-200">
                      {CHANNEL_LABELS[ch]}
                    </td>
                    <td className="text-center py-3 px-2 text-slate-300">
                      {t.deliveryDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-slate-300">
                      {t.returnWindowDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-slate-300">
                      {t.prepaidSettlementDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-slate-300">
                      {t.codSettlementDays}d
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 rounded-full bg-slate-700 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMin
                                ? "bg-emerald-400"
                                : isMax
                                ? "bg-rose-400"
                                : "bg-slate-400"
                            }`}
                            style={{
                              width: `${(totalCOD / maxTotal) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono ${
                            isMin
                              ? "text-emerald-400"
                              : isMax
                              ? "text-rose-400"
                              : "text-slate-300"
                          }`}
                        >
                          {totalCOD}d
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Working Capital Calculator ── */}
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-slate-100 flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-amber-400" />
          Working Capital Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            {/* Monthly Orders */}
            <div>
              <label className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Monthly Orders</span>
                <span className="text-amber-400 font-mono">{monthlyOrders}</span>
              </label>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Avg Order Value */}
            <div>
              <label className="text-sm text-slate-300 mb-2 block">
                Avg Order Value (₹)
              </label>
              <input
                type="number"
                min={100}
                max={10000}
                step={50}
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full rounded-md border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              />
            </div>

            {/* COD % */}
            <div>
              <label className="flex justify-between text-sm text-slate-300 mb-2">
                <span>COD %</span>
                <span className="text-amber-400 font-mono">{codPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={codPercent}
                onChange={(e) => setCodPercent(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>

            {/* Product Cost % */}
            <div>
              <label className="flex justify-between text-sm text-slate-300 mb-2">
                <span>Product Cost %</span>
                <span className="text-amber-400 font-mono">{productCostPercent}%</span>
              </label>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={productCostPercent}
                onChange={(e) => setProductCostPercent(Number(e.target.value))}
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Total Working Capital */}
            <div className="glass-panel-receded rounded-lg p-5 text-center">
              <p className="text-xs uppercase text-slate-400 mb-1">
                Total Working Capital Needed
              </p>
              <p className="text-3xl font-bold text-amber-400">
                ₹<CountUp to={workingCapital.totalWorkingCapitalNeeded} separator="," />
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/20">
                {workingCapital.daysOfCashLocked} days cash locked
              </span>
            </div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3 text-center">
                <Truck className="h-4 w-4 text-amber-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">In Transit</p>
                <p className="text-sm font-semibold text-amber-400">
                  {formatINR(workingCapital.capitalLockedInTransit)}
                </p>
              </div>
              <div className="rounded-lg border border-cyan-500/20 bg-cyan-500/5 p-3 text-center">
                <Clock className="h-4 w-4 text-cyan-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">In Settlement</p>
                <p className="text-sm font-semibold text-cyan-400">
                  {formatINR(workingCapital.capitalLockedInSettlement)}
                </p>
              </div>
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
                <Wallet className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
                <p className="text-xs text-slate-400">Inventory</p>
                <p className="text-sm font-semibold text-emerald-400">
                  {formatINR(workingCapital.capitalNeededForInventory)}
                </p>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-slate-800">
              <div
                className="bg-amber-400 transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalLockedInTransit / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
              <div
                className="bg-cyan-400 transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalLockedInSettlement / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
              <div
                className="bg-emerald-400 transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalNeededForInventory / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Insight Panel ── */}
      <section className="glass-panel rounded-xl p-5 border-l-4 border-l-cyan-400">
        <h3 className="text-sm font-semibold text-cyan-400 mb-3 flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-slate-300">
          <li>
            A seller doing{" "}
            <span className="text-amber-400 font-semibold">
              {formatINR(totalMonthlyRevenue)}
            </span>
            /month on{" "}
            <span className="text-slate-100 font-medium">
              {CHANNEL_LABELS[activeChannel]}
            </span>{" "}
            needs{" "}
            <span className="text-amber-400 font-semibold">
              {formatINR(workingCapital.totalWorkingCapitalNeeded)}
            </span>{" "}
            locked as working capital.
          </li>
          <li>
            COD orders lock money{" "}
            <span className="text-rose-400 font-semibold">
              {timeline.codSettlementDays - timeline.prepaidSettlementDays} extra days
            </span>{" "}
            vs prepaid on {CHANNEL_LABELS[activeChannel]}.
          </li>
        </ul>
      </section>
    </div>
  );
}
