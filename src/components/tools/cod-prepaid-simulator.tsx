"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRightLeft,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Package,
  CreditCard,
  Truck,
  Megaphone,
} from "lucide-react";
import CountUp from "@/components/CountUp";
import {
  calculateBlendedUnitEconomics,
  type BlendedEconomicsInputs,
} from "@/lib/profit-math";
import type { PrimaryChannel } from "@/lib/mvp-data";

const channels: { value: PrimaryChannel; label: string }[] = [
  { value: "meesho", label: "Meesho" },
  { value: "amazon", label: "Amazon" },
  { value: "flipkart", label: "Flipkart" },
  { value: "shopify", label: "Shopify" },
];

function getVerdict(margin: number): {
  label: string;
  color: string;
} {
  if (margin >= 25) return { label: "Excellent", color: "text-emerald-400" };
  if (margin >= 15) return { label: "Healthy", color: "text-emerald-400" };
  if (margin >= 5) return { label: "Tight", color: "text-amber-400" };
  return { label: "Loss", color: "text-rose-400" };
}

export function CodPrepaidSimulator() {
  const [sellingPrice, setSellingPrice] = useState(999);
  const [productCost, setProductCost] = useState(250);
  const [shippingCost, setShippingCost] = useState(65);
  const [adCostPerOrder, setAdCostPerOrder] = useState(30);
  const [channel, setChannel] = useState<PrimaryChannel>("meesho");
  const [codPercent, setCodPercent] = useState(60);
  const [codRtoPercent, setCodRtoPercent] = useState(25);
  const [prepaidReturnPercent, setPrepaidReturnPercent] = useState(5);
  const [ordersPerMonth, setOrdersPerMonth] = useState(150);

  const currentScenario = useMemo(() => {
    const inputs: BlendedEconomicsInputs = {
      sellingPrice,
      productCost,
      shippingCost,
      adCostPerOrder,
      codPercent,
      codRtoPercent,
      prepaidReturnPercent,
      channel,
    };
    return calculateBlendedUnitEconomics(inputs);
  }, [sellingPrice, productCost, shippingCost, adCostPerOrder, codPercent, codRtoPercent, prepaidReturnPercent, channel]);

  const prepaidScenario = useMemo(() => {
    const inputs: BlendedEconomicsInputs = {
      sellingPrice,
      productCost,
      shippingCost,
      adCostPerOrder,
      codPercent: 20,
      codRtoPercent,
      prepaidReturnPercent: 5,
      channel,
    };
    return calculateBlendedUnitEconomics(inputs);
  }, [sellingPrice, productCost, shippingCost, adCostPerOrder, codRtoPercent, channel]);

  const savingsPerOrder = prepaidScenario.netProfit - currentScenario.netProfit;
  const monthlySavings = savingsPerOrder * ordersPerMonth;
  const yearlySavings = monthlySavings * 12;

  const perTenPercentShift = useMemo(() => {
    const shifted = calculateBlendedUnitEconomics({
      sellingPrice,
      productCost,
      shippingCost,
      adCostPerOrder,
      codPercent: Math.max(0, codPercent - 10),
      codRtoPercent,
      prepaidReturnPercent,
      channel,
    });
    return shifted.netProfit - currentScenario.netProfit;
  }, [sellingPrice, productCost, shippingCost, adCostPerOrder, codPercent, codRtoPercent, prepaidReturnPercent, channel, currentScenario.netProfit]);

  const totalLossPercent = (codPercent / 100) * (codRtoPercent / 100) * 100;

  const currentVerdict = getVerdict(currentScenario.netMarginPercent);
  const prepaidVerdict = getVerdict(prepaidScenario.netMarginPercent);

  const codBarWidth = Math.max(0, Math.min(100, ((currentScenario.codOnlyMargin + 50) / 100) * 100));
  const prepaidBarWidth = Math.max(0, Math.min(100, ((currentScenario.prepaidOnlyMargin + 50) / 100) * 100));

  return (
    <div className="space-y-6">
      {/* Scenario Inputs */}
      <motion.div
        className="glass-panel rounded-xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-4 flex items-center gap-2">
          <Package className="h-4 w-4 text-amber-400" />
          Scenario Inputs
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block text-xs">
            <span className="text-muted flex items-center gap-1">
              <CreditCard className="h-3 w-3" /> Selling Price (₹)
            </span>
            <input
              type="number"
              value={sellingPrice}
              onChange={(e) => setSellingPrice(Number(e.target.value))}
              className="mt-1 w-full min-h-[40px] rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted flex items-center gap-1">
              <Package className="h-3 w-3" /> Product Cost (₹)
            </span>
            <input
              type="number"
              value={productCost}
              onChange={(e) => setProductCost(Number(e.target.value))}
              className="mt-1 w-full min-h-[40px] rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted flex items-center gap-1">
              <Truck className="h-3 w-3" /> Shipping Cost (₹)
            </span>
            <input
              type="number"
              value={shippingCost}
              onChange={(e) => setShippingCost(Number(e.target.value))}
              className="mt-1 w-full min-h-[40px] rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </label>
          <label className="block text-xs">
            <span className="text-muted flex items-center gap-1">
              <Megaphone className="h-3 w-3" /> Ad Cost / Order (₹)
            </span>
            <input
              type="number"
              value={adCostPerOrder}
              onChange={(e) => setAdCostPerOrder(Number(e.target.value))}
              className="mt-1 w-full min-h-[40px] rounded-md border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
            />
          </label>
        </div>

        {/* Channel tabs */}
        <div className="mt-4">
          <span className="text-xs text-muted block mb-2">Channel</span>
          <div className="flex gap-1 rounded-lg bg-slate-900/60 p-1">
            {channels.map((ch) => (
              <button
                key={ch.value}
                type="button"
                onClick={() => setChannel(ch.value)}
                className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  channel === ch.value
                    ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                {ch.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="mt-5 grid gap-5 sm:grid-cols-3">
          <label className="block text-xs">
            <span className="text-muted">COD % of orders</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={codPercent}
              onChange={(e) => setCodPercent(Number(e.target.value))}
              className="mt-2 w-full accent-amber-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-slate-400">0%</span>
              <span className="text-amber-400 font-semibold">{codPercent}%</span>
              <span className="text-slate-400">100%</span>
            </div>
          </label>
          <label className="block text-xs">
            <span className="text-muted">COD RTO rate</span>
            <input
              type="range"
              min={0}
              max={50}
              step={1}
              value={codRtoPercent}
              onChange={(e) => setCodRtoPercent(Number(e.target.value))}
              className="mt-2 w-full accent-rose-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-slate-400">0%</span>
              <span className="text-rose-400 font-semibold">{codRtoPercent}%</span>
              <span className="text-slate-400">50%</span>
            </div>
          </label>
          <label className="block text-xs">
            <span className="text-muted">Prepaid return rate</span>
            <input
              type="range"
              min={0}
              max={20}
              step={1}
              value={prepaidReturnPercent}
              onChange={(e) => setPrepaidReturnPercent(Number(e.target.value))}
              className="mt-2 w-full accent-cyan-500"
            />
            <div className="flex justify-between mt-1">
              <span className="text-slate-400">0%</span>
              <span className="text-cyan-400 font-semibold">{prepaidReturnPercent}%</span>
              <span className="text-slate-400">20%</span>
            </div>
          </label>
        </div>
      </motion.div>

      {/* Visual Comparison */}
      <div className="grid gap-4 sm:grid-cols-2">
        <motion.div
          className="glass-panel rounded-xl p-5 border-rose-500/20"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown className="h-4 w-4 text-rose-400" />
            <h4 className="text-sm font-semibold text-slate-200">COD-Heavy (Current)</h4>
          </div>
          <p className="text-xs text-muted mb-1">{codPercent}% COD · {codRtoPercent}% RTO</p>
          <p className="text-2xl font-bold text-slate-100">
            ₹<CountUp to={Math.round(currentScenario.netProfit)} separator="," duration={0.8} />
            <span className="text-sm text-muted ml-1">/ order</span>
          </p>
          <p className="text-sm mt-1">
            Net margin:{" "}
            <span className={currentVerdict.color}>
              {currentScenario.netMarginPercent.toFixed(1)}%
            </span>
          </p>
          <span className={`inline-block mt-2 rounded-md px-2 py-0.5 text-xs font-medium ${
            currentVerdict.color
          } bg-slate-800/60 border border-slate-700`}>
            {currentVerdict.label}
          </span>
        </motion.div>

        <motion.div
          className="glass-panel rounded-xl p-5 border-emerald-500/20"
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.15 }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            <h4 className="text-sm font-semibold text-slate-200">Prepaid-Heavy (80/20)</h4>
          </div>
          <p className="text-xs text-muted mb-1">20% COD · 5% returns</p>
          <p className="text-2xl font-bold text-slate-100">
            ₹<CountUp to={Math.round(prepaidScenario.netProfit)} separator="," duration={0.8} />
            <span className="text-sm text-muted ml-1">/ order</span>
          </p>
          <p className="text-sm mt-1">
            Net margin:{" "}
            <span className={prepaidVerdict.color}>
              {prepaidScenario.netMarginPercent.toFixed(1)}%
            </span>
          </p>
          <span className={`inline-block mt-2 rounded-md px-2 py-0.5 text-xs font-medium ${
            prepaidVerdict.color
          } bg-slate-800/60 border border-slate-700`}>
            {prepaidVerdict.label}
          </span>
        </motion.div>
      </div>

      {/* Savings highlight */}
      {savingsPerOrder > 0 && (
        <motion.div
          className="glass-panel-receded rounded-xl p-4 flex items-center gap-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <ArrowRightLeft className="h-5 w-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-slate-200">
            Switching to 80% prepaid saves{" "}
            <span className="font-bold text-emerald-400">
              ₹{Math.round(savingsPerOrder).toLocaleString("en-IN")}
            </span>{" "}
            per order
          </p>
        </motion.div>
      )}

      {/* Blended Results Panel */}
      <motion.div
        className="glass-panel rounded-xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Blended Results</h3>
        <div className="grid gap-3 sm:grid-cols-3 mb-5">
          <div className="rounded-lg bg-slate-900/50 p-3 text-center">
            <p className="text-xs text-muted">Blended Margin</p>
            <p className="text-xl font-bold text-slate-100 mt-1">
              {currentScenario.netMarginPercent.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/50 p-3 text-center">
            <p className="text-xs text-muted">Blended RTO</p>
            <p className="text-xl font-bold text-slate-100 mt-1">
              {currentScenario.blendedRtoPercent.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg bg-slate-900/50 p-3 text-center">
            <p className="text-xs text-muted">Profit / Order</p>
            <p className="text-xl font-bold text-slate-100 mt-1">
              ₹{Math.round(currentScenario.netProfit).toLocaleString("en-IN")}
            </p>
          </div>
        </div>

        {/* COD vs Prepaid margin bars */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-rose-400">COD-only margin</span>
              <span className="text-slate-300">{currentScenario.codOnlyMargin.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-rose-500/70"
                initial={{ width: 0 }}
                animate={{ width: `${codBarWidth}%` }}
                transition={{ duration: 0.6, delay: 0.3 }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-emerald-400">Prepaid-only margin</span>
              <span className="text-slate-300">{currentScenario.prepaidOnlyMargin.toFixed(1)}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-800 overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-emerald-500/70"
                initial={{ width: 0 }}
                animate={{ width: `${prepaidBarWidth}%` }}
                transition={{ duration: 0.6, delay: 0.35 }}
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Monthly Impact at Scale */}
      <motion.div
        className="glass-panel rounded-xl p-5"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.25 }}
      >
        <h3 className="text-sm font-semibold text-slate-100 mb-4">Monthly Impact at Scale</h3>
        <label className="block text-xs mb-4">
          <span className="text-muted">Orders per month</span>
          <input
            type="range"
            min={50}
            max={500}
            step={10}
            value={ordersPerMonth}
            onChange={(e) => setOrdersPerMonth(Number(e.target.value))}
            className="mt-2 w-full accent-amber-500"
          />
          <div className="flex justify-between mt-1">
            <span className="text-slate-400">50</span>
            <span className="text-amber-400 font-semibold">{ordersPerMonth} orders/mo</span>
            <span className="text-slate-400">500</span>
          </div>
        </label>

        {savingsPerOrder > 0 && (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg bg-slate-900/50 border border-rose-500/20 p-4">
              <p className="text-xs text-muted">Monthly COD penalty</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                ₹<CountUp to={Math.round(monthlySavings)} separator="," duration={1} />
              </p>
              <p className="text-xs text-muted mt-1">
                At {ordersPerMonth} orders/month, COD costs you ₹{Math.round(monthlySavings).toLocaleString("en-IN")}/month more than prepaid
              </p>
            </div>
            <div className="rounded-lg bg-slate-900/50 border border-rose-500/20 p-4">
              <p className="text-xs text-muted">Yearly projection</p>
              <p className="text-2xl font-bold text-rose-400 mt-1">
                ₹<CountUp to={Math.round(yearlySavings)} separator="," duration={1.2} />
              </p>
              <p className="text-xs text-muted mt-1">
                That&apos;s ₹{Math.round(yearlySavings).toLocaleString("en-IN")}/year in avoidable RTO losses
              </p>
            </div>
          </div>
        )}

        {savingsPerOrder <= 0 && (
          <div className="rounded-lg bg-slate-900/50 border border-emerald-500/20 p-4">
            <p className="text-sm text-emerald-400 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Your current COD mix is already efficient — no significant penalty detected.
            </p>
          </div>
        )}
      </motion.div>

      {/* Key Insight */}
      <motion.div
        className="glass-panel rounded-xl p-5 border border-rose-500/30"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-2">
            <p className="text-sm text-slate-200">
              Every 10% shift from COD to prepaid saves{" "}
              <span className="font-bold text-emerald-400">
                ₹{Math.round(perTenPercentShift).toLocaleString("en-IN")}
              </span>{" "}
              per order due to eliminated RTO risk.
            </p>
            <p className="text-sm text-slate-200">
              {codPercent}% COD with {codRtoPercent}% RTO means{" "}
              <span className="font-bold text-rose-400">
                {totalLossPercent.toFixed(1)}%
              </span>{" "}
              of ALL orders are total losses.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
