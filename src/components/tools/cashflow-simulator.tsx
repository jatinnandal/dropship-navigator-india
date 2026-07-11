"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Wallet,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Zap,
  IndianRupee,
} from "lucide-react";
import type { PrimaryChannel } from "@/lib/mvp-data";
import {
  simulate90DayCashFlow,
  type CashFlowInputs,
  type DayCashFlow,
} from "@/lib/cashflow-engine";
import CountUp from "@/components/CountUp";

/* ── helpers ── */
const CHANNELS: { value: PrimaryChannel; label: string }[] = [
  { value: "meesho", label: "Meesho" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "shopify", label: "Shopify" },
];

const SAMPLE_DAYS = [1, 10, 20, 30, 40, 50, 60, 70, 80, 90];

/* ── component ── */
export function CashflowSimulator() {
  const [channel, setChannel] = useState<PrimaryChannel>("meesho");
  const [sellingPrice, setSellingPrice] = useState(599);
  const [productCost, setProductCost] = useState(200);
  const [shippingCost, setShippingCost] = useState(70);
  const [ordersPerDay, setOrdersPerDay] = useState(5);
  const [adSpendPerDay, setAdSpendPerDay] = useState(200);
  const [codPercent, setCodPercent] = useState(60);
  const [rtoPercent, setRtoPercent] = useState(25);
  const [startingCapital, setStartingCapital] = useState(50000);
  const [festivalEnabled, setFestivalEnabled] = useState(false);
  const [festivalStartDay, setFestivalStartDay] = useState(45);
  const [festivalMultiplier, setFestivalMultiplier] = useState(2.5);
  const [festivalDuration, setFestivalDuration] = useState(10);
  const [showTable, setShowTable] = useState(false);

  const inputs: CashFlowInputs = useMemo(
    () => ({
      channel,
      sellingPrice,
      productCost,
      shippingCost,
      adSpendPerDay,
      ordersPerDay,
      codPercent,
      rtoPercent,
      startingCapital,
      festivalSurge: festivalEnabled
        ? { startDay: festivalStartDay, multiplier: festivalMultiplier, duration: festivalDuration }
        : undefined,
    }),
    [channel, sellingPrice, productCost, shippingCost, adSpendPerDay, ordersPerDay, codPercent, rtoPercent, startingCapital, festivalEnabled, festivalStartDay, festivalMultiplier, festivalDuration]
  );

  const result = useMemo(() => simulate90DayCashFlow(inputs), [inputs]);

  // Chart data: pick sample days
  const chartDays = useMemo(() => {
    return SAMPLE_DAYS.map((d) => result.days[d - 1]).filter(Boolean);
  }, [result]);

  const maxAbsBalance = useMemo(() => {
    const vals = chartDays.map((d) => Math.abs(d.balance));
    return Math.max(...vals, 1);
  }, [chartDays]);

  return (
    <div className="space-y-8">
      {/* ── Inputs Panel ── */}
      <div className="glass-panel grain rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Simulation Inputs</h2>

        {/* Channel tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {CHANNELS.map((ch) => (
            <button
              key={ch.value}
              onClick={() => setChannel(ch.value)}
              className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                channel === ch.value
                  ? "bg-white/20 text-white border border-white/[0.16]"
                  : "bg-white/[0.04] text-[var(--muted)] border border-white/[0.1] hover:text-white"
              }`}
            >
              {ch.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Selling Price */}
          <InputField label="Selling Price" prefix="₹" value={sellingPrice} onChange={setSellingPrice} min={0} max={10000} />
          {/* Product Cost */}
          <InputField label="Product Cost" prefix="₹" value={productCost} onChange={setProductCost} min={0} max={10000} />
          {/* Shipping Cost */}
          <InputField label="Shipping Cost" prefix="₹" value={shippingCost} onChange={setShippingCost} min={0} max={500} />
          {/* Ad Spend / Day */}
          <InputField label="Ad Spend / Day" prefix="₹" value={adSpendPerDay} onChange={setAdSpendPerDay} min={0} max={5000} />
          {/* Starting Capital */}
          <InputField label="Starting Capital" prefix="₹" value={startingCapital} onChange={setStartingCapital} min={0} max={500000} step={5000} />

          {/* Orders per day slider */}
          <div>
            <label className="text-muted text-xs font-medium block mb-1.5">
              Orders / Day: <span className="text-white">{ordersPerDay}</span>
            </label>
            <input
              type="range"
              min={1}
              max={30}
              value={ordersPerDay}
              aria-label="Orders per day"
              aria-valuetext={`${ordersPerDay} orders per day`}
              onChange={(e) => setOrdersPerDay(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          {/* COD % slider */}
          <div>
            <label className="text-muted text-xs font-medium block mb-1.5">
              COD %: <span className="text-white">{codPercent}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={100}
              value={codPercent}
              aria-label="COD share"
              aria-valuetext={`${codPercent}% COD`}
              onChange={(e) => setCodPercent(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>

          {/* RTO % slider */}
          <div>
            <label className="text-muted text-xs font-medium block mb-1.5">
              RTO %: <span className="text-white">{rtoPercent}%</span>
            </label>
            <input
              type="range"
              min={0}
              max={60}
              value={rtoPercent}
              aria-label="RTO rate"
              aria-valuetext={`${rtoPercent}% RTO`}
              onChange={(e) => setRtoPercent(Number(e.target.value))}
              className="w-full accent-white"
            />
          </div>
        </div>

        {/* Festival surge toggle */}
        <div className="mt-6 border-t border-white/[0.1] pt-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setFestivalEnabled(!festivalEnabled)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                festivalEnabled ? "bg-white" : "bg-white/[0.1]"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  festivalEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
            <span className="text-sm text-[var(--body-text)] flex items-center gap-1.5">
              <Zap className="h-4 w-4 text-white" />
              Festival Surge
            </span>
          </div>

          <AnimatePresence>
            {festivalEnabled && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
                  <InputField label="Start Day" value={festivalStartDay} onChange={setFestivalStartDay} min={1} max={80} />
                  <InputField label="Multiplier" value={festivalMultiplier} onChange={setFestivalMultiplier} min={1.5} max={5} step={0.5} suffix="x" />
                  <InputField label="Duration (days)" value={festivalDuration} onChange={setFestivalDuration} min={3} max={20} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* ── 90-Day Chart ── */}
      <div className="glass-panel grain rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-2">90-Day Cash Balance</h2>
        <p className="text-muted text-xs mb-6">Balance over time — green above zero, red below</p>

        <div className="relative h-64 flex items-end gap-1.5 sm:gap-2">
          {/* Zero line */}
          <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-white/[0.15] z-0" />

          {chartDays.map((dayData) => {
            const height = Math.abs(dayData.balance) / maxAbsBalance;
            const isPositive = dayData.balance >= 0;
            const barHeight = `${Math.max(height * 45, 2)}%`;

            // Festival period highlight
            const isFestival =
              festivalEnabled &&
              dayData.day >= festivalStartDay &&
              dayData.day < festivalStartDay + festivalDuration;

            // Break-even marker
            const isBreakEven = result.breakEvenDay === dayData.day;
            // Lowest day marker
            const isLowest = result.lowestDay === dayData.day;

            return (
              <div
                key={dayData.day}
                className="relative flex-1 flex flex-col items-center"
                style={{ height: "100%" }}
              >
                {/* Festival zone highlight */}
                {isFestival && (
                  <div className="absolute inset-0 bg-white/5 border-x border-white/10 rounded-sm z-0" />
                )}

                {/* Bar */}
                <div className="relative flex-1 w-full flex items-center justify-center">
                  <motion.div
                    className={`w-full max-w-[28px] rounded-sm ${
                      isPositive ? "bg-[var(--success)]/70" : "bg-[var(--danger)]/70"
                    } ${isBreakEven ? "ring-2 ring-white/25" : ""} ${
                      isLowest ? "ring-2 ring-[var(--danger)]" : ""
                    }`}
                    style={{
                      height: barHeight,
                      position: "absolute",
                      ...(isPositive ? { bottom: "50%" } : { top: "50%" }),
                    }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ duration: 0.4, delay: dayData.day * 0.01 }}
                  />
                </div>

                {/* Day label */}
                <span className="text-[10px] text-[var(--text-faint)] mt-1">D{dayData.day}</span>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 text-xs text-[var(--muted)]">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--success)]/70" /> Positive
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm bg-[var(--danger)]/70" /> Negative
          </span>
          {result.breakEvenDay && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm ring-2 ring-white/25 bg-transparent" /> Break-even (Day {result.breakEvenDay})
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm ring-2 ring-[var(--danger)] bg-transparent" /> Lowest (Day {result.lowestDay})
          </span>
          {festivalEnabled && (
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-white/30 border border-white/[0.16]" /> Festival
            </span>
          )}
        </div>
      </div>

      {/* ── Summary Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          icon={<Calendar className="h-5 w-5 text-white" />}
          label="Break-even Day"
          value={result.breakEvenDay ? `Day ${result.breakEvenDay}` : "Not reached"}
          valueColor={result.breakEvenDay ? "text-white" : "text-[var(--danger)]"}
        />
        <MetricCard
          icon={<Wallet className="h-5 w-5 text-[var(--muted)]" />}
          label="Peak Capital Needed"
          value={formatINR(result.peakCapitalNeeded)}
          valueColor="text-[var(--muted)]"
        />
        <MetricCard
          icon={<TrendingUp className="h-5 w-5 text-[var(--success)]" />}
          label="90-Day Profit"
          value={formatINR(result.totalProfit)}
          valueColor={result.totalProfit >= 0 ? "text-[var(--success)]" : "text-[var(--danger)]"}
        />
        <MetricCard
          icon={<TrendingDown className="h-5 w-5 text-[var(--danger)]" />}
          label="Lowest Balance"
          value={`${formatINR(result.lowestBalance)} (Day ${result.lowestDay})`}
          valueColor={result.lowestBalance >= 0 ? "text-white" : "text-[var(--danger)]"}
        />
      </div>

      {/* ── Key Insights ── */}
      <div className="rounded-xl border border-white/25/30 bg-white/[0.04] p-5">
        <h3 className="text-sm font-semibold text-[var(--muted)] mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-[var(--body-text)]">
          <li>
            You need <span className="font-semibold text-[var(--muted)]">{formatINR(result.peakCapitalNeeded)}</span> to survive the settlement delay gap.
          </li>
          {result.breakEvenDay && (
            <li>
              Break-even at <span className="font-semibold text-white">Day {result.breakEvenDay}</span> — {ordersPerDay * result.breakEvenDay} orders to recover initial investment.
            </li>
          )}
          {!result.breakEvenDay && (
            <li className="text-[var(--danger)]">
              Break-even not reached in 90 days. Consider reducing costs or increasing orders.
            </li>
          )}
          {festivalEnabled && (
            <li>
              Festival period boosts revenue <span className="font-semibold text-white">{festivalMultiplier}x</span> but requires extra capital upfront for increased orders.
            </li>
          )}
          {result.lowestBalance < 0 && (
            <li className="text-[var(--danger)]">
              Your balance goes negative on Day {result.lowestDay}. You&apos;ll need additional funding or credit.
            </li>
          )}
        </ul>
      </div>

      {/* ── Collapsible Table ── */}
      <div className="glass-panel-receded grain rounded-xl overflow-hidden">
        <button
          onClick={() => setShowTable(!showTable)}
          className="w-full flex items-center justify-between p-4 text-sm text-[var(--body-text)] hover:text-white transition-colors"
        >
          <span className="font-medium">Weekly Cash Flow Breakdown</span>
          {showTable ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>

        <AnimatePresence>
          {showTable && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="overflow-x-auto px-4 pb-4">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-white/[0.1] text-[var(--muted)]">
                      <th className="text-left py-2 pr-4">Day</th>
                      <th className="text-right py-2 px-3">Balance</th>
                      <th className="text-right py-2 px-3">Revenue</th>
                      <th className="text-right py-2 px-3">Expenses</th>
                      <th className="text-right py-2 px-3">Settlement In</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.days
                      .filter((d) => d.day % 7 === 0 || d.day === 1)
                      .map((d) => (
                        <tr key={d.day} className="border-b border-white/[0.08]">
                          <td className="py-2 pr-4 text-[var(--body-text)] font-medium">Day {d.day}</td>
                          <td className={`py-2 px-3 text-right font-mono ${d.isNegative ? "text-[var(--danger)]" : "text-[var(--success)]"}`}>
                            {formatINR(d.balance)}
                          </td>
                          <td className="py-2 px-3 text-right text-[var(--muted)]">{formatINR(d.revenue)}</td>
                          <td className="py-2 px-3 text-right text-[var(--muted)]">{formatINR(d.expenses)}</td>
                          <td className="py-2 px-3 text-right text-[var(--muted)]">{formatINR(d.settlementIncoming)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function InputField({
  label,
  value,
  onChange,
  min = 0,
  max = 100000,
  step = 1,
  prefix,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-muted text-xs font-medium block mb-1.5">{label}</label>
      <div className="flex items-center gap-1 rounded-md border border-white/[0.1] bg-white/[0.04] px-3 py-2">
        {prefix && <span className="text-[var(--text-faint)] text-sm">{prefix}</span>}
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-sm text-white outline-none w-full min-w-0"
        />
        {suffix && <span className="text-[var(--text-faint)] text-sm">{suffix}</span>}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor: string;
}) {
  return (
    <motion.div
      className="glass-panel grain rounded-xl p-4"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-muted text-xs">{label}</span>
      </div>
      <p className={`text-lg font-semibold ${valueColor}`}>{value}</p>
    </motion.div>
  );
}
