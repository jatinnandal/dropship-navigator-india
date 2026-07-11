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
  amber: "bg-white shadow-white/20",
  emerald: "bg-[var(--success)] shadow-[var(--success)]/30",
  rose: "bg-[var(--danger)] shadow-[var(--danger)]/30",
  cyan: "bg-white/40 shadow-white/20",
};

const DOT_TEXT_COLORS: Record<string, string> = {
  amber: "text-white",
  emerald: "text-[var(--success)]",
  rose: "text-[var(--danger)]",
  cyan: "text-[var(--muted)]",
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
                ? "bg-white/[0.06] text-white border border-white/[0.16]"
                : "text-[var(--muted)] hover:text-[var(--body-text)]"
            }`}
          >
            {CHANNEL_LABELS[ch]}
          </button>
        ))}
      </div>

      {/* ── Order Lifecycle Timeline ── */}
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Clock className="h-5 w-5 text-white" />
          Order Lifecycle — {CHANNEL_LABELS[activeChannel]}
        </h2>

        {/* Desktop: horizontal timeline */}
        <div className="hidden sm:block relative">
          {/* Track line */}
          <div className="absolute top-4 left-4 right-4 h-0.5 bg-white/[0.06] rounded-full" />

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
                <span className="text-xs text-[var(--muted)] mt-2 max-w-[80px] leading-tight">
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
                  <div className="w-0.5 h-6 bg-white/[0.06] mt-1" />
                )}
              </div>
              <div>
                <span className={`text-xs font-mono ${DOT_TEXT_COLORS[m.color]}`}>
                  Day {m.day}
                </span>
                <p className="text-sm text-[var(--body-text)]">{m.label}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Marketplace Comparison Table ── */}
      <section className="glass-panel rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-[var(--muted)]" />
          Marketplace Comparison
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[var(--muted)] text-xs uppercase border-b border-white/10">
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
                    className={`border-b border-white/10 ${
                      ch === activeChannel ? "bg-white/[0.03]" : ""
                    }`}
                  >
                    <td className="py-3 pr-4 font-medium text-[var(--body-text)]">
                      {CHANNEL_LABELS[ch]}
                    </td>
                    <td className="text-center py-3 px-2 text-[var(--body-text)]">
                      {t.deliveryDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-[var(--body-text)]">
                      {t.returnWindowDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-[var(--body-text)]">
                      {t.prepaidSettlementDays}d
                    </td>
                    <td className="text-center py-3 px-2 text-[var(--body-text)]">
                      {t.codSettlementDays}d
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-2 justify-center">
                        <div className="w-16 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              isMin
                                ? "bg-[var(--success)]"
                                : isMax
                                ? "bg-[var(--danger)]"
                                : "bg-white/20"
                            }`}
                            style={{
                              width: `${(totalCOD / maxTotal) * 100}%`,
                            }}
                          />
                        </div>
                        <span
                          className={`text-xs font-mono ${
                            isMin
                              ? "text-[var(--success)]"
                              : isMax
                              ? "text-[var(--danger)]"
                              : "text-[var(--body-text)]"
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
        <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
          <Wallet className="h-5 w-5 text-white" />
          Working Capital Calculator
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Inputs */}
          <div className="space-y-5">
            {/* Monthly Orders */}
            <div>
              <label className="flex justify-between text-sm text-[var(--body-text)] mb-2">
                <span>Monthly Orders</span>
                <span className="text-white font-mono">{monthlyOrders}</span>
              </label>
              <input
                type="range"
                min={50}
                max={500}
                step={10}
                value={monthlyOrders}
                onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            {/* Avg Order Value */}
            <div>
              <label className="text-sm text-[var(--body-text)] mb-2 block">
                Avg Order Value (₹)
              </label>
              <input
                type="number"
                min={100}
                max={10000}
                step={50}
                value={avgOrderValue}
                onChange={(e) => setAvgOrderValue(Number(e.target.value))}
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/25"
              />
            </div>

            {/* COD % */}
            <div>
              <label className="flex justify-between text-sm text-[var(--body-text)] mb-2">
                <span>COD %</span>
                <span className="text-white font-mono">{codPercent}%</span>
              </label>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={codPercent}
                onChange={(e) => setCodPercent(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>

            {/* Product Cost % */}
            <div>
              <label className="flex justify-between text-sm text-[var(--body-text)] mb-2">
                <span>Product Cost %</span>
                <span className="text-white font-mono">{productCostPercent}%</span>
              </label>
              <input
                type="range"
                min={20}
                max={60}
                step={5}
                value={productCostPercent}
                onChange={(e) => setProductCostPercent(Number(e.target.value))}
                className="w-full accent-white"
              />
            </div>
          </div>

          {/* Results */}
          <div className="space-y-4">
            {/* Total Working Capital */}
            <div className="glass-panel-receded rounded-lg p-5 text-center">
              <p className="text-xs uppercase text-[var(--muted)] mb-1">
                Total Working Capital Needed
              </p>
              <p className="text-3xl font-bold text-white">
                ₹<CountUp to={workingCapital.totalWorkingCapitalNeeded} separator="," />
              </p>
              <span className="inline-block mt-2 px-2 py-0.5 rounded bg-white/[0.06] text-[var(--muted)] text-xs font-mono border border-white/10">
                {workingCapital.daysOfCashLocked} days cash locked
              </span>
            </div>

            {/* Breakdown cards */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-center">
                <Truck className="h-4 w-4 text-white mx-auto mb-1" />
                <p className="text-xs text-[var(--muted)]">In Transit</p>
                <p className="text-sm font-semibold text-white">
                  {formatINR(workingCapital.capitalLockedInTransit)}
                </p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.04] p-3 text-center">
                <Clock className="h-4 w-4 text-[var(--muted)] mx-auto mb-1" />
                <p className="text-xs text-[var(--muted)]">In Settlement</p>
                <p className="text-sm font-semibold text-[var(--muted)]">
                  {formatINR(workingCapital.capitalLockedInSettlement)}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--success)]/20 bg-[var(--success)]/10 p-3 text-center">
                <Wallet className="h-4 w-4 text-[var(--success)] mx-auto mb-1" />
                <p className="text-xs text-[var(--muted)]">Inventory</p>
                <p className="text-sm font-semibold text-[var(--success)]">
                  {formatINR(workingCapital.capitalNeededForInventory)}
                </p>
              </div>
            </div>

            {/* Stacked bar */}
            <div className="h-3 rounded-full overflow-hidden flex bg-white/[0.03]">
              <div
                className="bg-white transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalLockedInTransit / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
              <div
                className="bg-white/40 transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalLockedInSettlement / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
              <div
                className="bg-[var(--success)] transition-all duration-500"
                style={{
                  width: `${(workingCapital.capitalNeededForInventory / workingCapital.totalWorkingCapitalNeeded) * 100}%`,
                }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Key Insight Panel ── */}
      <section className="glass-panel rounded-xl p-5 border-l-4 border-l-white/25">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 flex items-center gap-2">
          <ArrowRight className="h-4 w-4" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-[var(--body-text)]">
          <li>
            A seller doing{" "}
            <span className="text-white font-semibold">
              {formatINR(totalMonthlyRevenue)}
            </span>
            /month on{" "}
            <span className="text-white font-medium">
              {CHANNEL_LABELS[activeChannel]}
            </span>{" "}
            needs{" "}
            <span className="text-white font-semibold">
              {formatINR(workingCapital.totalWorkingCapitalNeeded)}
            </span>{" "}
            locked as working capital.
          </li>
          <li>
            COD orders lock money{" "}
            <span className="text-[var(--danger)] font-semibold">
              {timeline.codSettlementDays - timeline.prepaidSettlementDays} extra days
            </span>{" "}
            vs prepaid on {CHANNEL_LABELS[activeChannel]}.
          </li>
        </ul>
      </section>
    </div>
  );
}
