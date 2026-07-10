"use client";

import { useMemo, useState } from "react";
import { formatINR } from "@/lib/format";
import { motion, AnimatePresence } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  ShoppingCart,
  Truck,
  Megaphone,
  RotateCcw,
  Save,
  Check,
  Info,
  BarChart3,
} from "lucide-react";
import { calculateProfit, defaultRtoForProductType } from "@/lib/profit-math";
import type { ProfitResult } from "@/lib/profit-math";
import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import {
  CHANNELS,
  WEIGHT_BRACKET_LABELS,
  MARKETPLACE_FEES_META,
  type WeightBracket,
  type ChannelInfo,
} from "@/lib/marketplace-fees";
import { DataFreshness } from "@/components/data-freshness";
import CountUp from "@/components/CountUp";

/* ── types ── */
type Scenario = {
  sellingPrice: number;
  productCost: number;
  weightBracket: WeightBracket;
  shippingOverride: number | null;
  adCostPerOrder: number;
  rtoRate: number;
  codPercent: number;
  productCategory: ProductType;
  monthlyOrders: number;
  savedAt: string;
};

const PRODUCT_CATEGORIES: { value: ProductType; label: string }[] = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "food", label: "Food & Grocery" },
  { value: "general", label: "General / Other" },
];

const VERDICT_CONFIG = {
  excellent: { label: "Excellent", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
  healthy: { label: "Healthy", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
  tight: { label: "Tight", className: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
  loss: { label: "Loss", className: "bg-rose-500/20 text-rose-400 border-rose-500/30" },
} as const;

function marginColor(margin: number): string {
  if (margin >= 25) return "text-emerald-400";
  if (margin >= 15) return "text-amber-400";
  return "text-rose-400";
}

function marginBg(margin: number): string {
  if (margin >= 25) return "border-emerald-500/30 bg-emerald-500/5";
  if (margin >= 15) return "border-amber-500/30 bg-amber-500/5";
  return "border-rose-500/30 bg-rose-500/5";
}

/* ── component ── */
export function MarginCalculator({
  defaultChannel,
  defaultProductType,
}: {
  defaultChannel?: PrimaryChannel;
  defaultProductType?: ProductType;
}) {
  /* inputs */
  const [sellingPrice, setSellingPrice] = useState(999);
  const [productCost, setProductCost] = useState(250);
  const [weightBracket, setWeightBracket] = useState<WeightBracket>("light");
  const [shippingOverride, setShippingOverride] = useState<number | null>(null);
  const [adCostPerOrder, setAdCostPerOrder] = useState(0);
  const [productCategory, setProductCategory] = useState<ProductType>(
    defaultProductType ?? "general",
  );
  const [rtoRate, setRtoRate] = useState(defaultRtoForProductType(productCategory));
  const [codPercent, setCodPercent] = useState(60);
  const [monthlyOrders, setMonthlyOrders] = useState(100);
  const [activeTab, setActiveTab] = useState<PrimaryChannel>(defaultChannel ?? "amazon");
  const [saved, setSaved] = useState(false);

  /* when category changes, update RTO default */
  function handleCategoryChange(cat: ProductType) {
    setProductCategory(cat);
    setRtoRate(defaultRtoForProductType(cat));
  }

  /* compute results for all 4 marketplaces */
  const allResults = useMemo(() => {
    return CHANNELS.map((ch) => {
      const shipping =
        shippingOverride ?? ch.typicalShipping[weightBracket];
      const result = calculateProfit({
        sellingPrice,
        productCost,
        shippingCost: shipping,
        adCostPerOrder,
        rtoRatePercent: rtoRate,
        channel: ch.channel,
        category: productCategory,
      });
      return { ch, result, shipping };
    });
  }, [sellingPrice, productCost, weightBracket, shippingOverride, adCostPerOrder, rtoRate, productCategory]);

  const bestIdx = useMemo(() => {
    let best = 0;
    for (let i = 1; i < allResults.length; i++) {
      if (allResults[i].result.netMarginPercent > allResults[best].result.netMarginPercent) {
        best = i;
      }
    }
    return best;
  }, [allResults]);

  const activeResult = allResults.find((r) => r.ch.channel === activeTab)!;

  /* save scenario */
  function handleSave() {
    const scenario: Scenario = {
      sellingPrice,
      productCost,
      weightBracket,
      shippingOverride,
      adCostPerOrder,
      rtoRate,
      codPercent,
      productCategory,
      monthlyOrders,
      savedAt: new Date().toISOString(),
    };
    const existing = JSON.parse(localStorage.getItem("dni-margin-scenarios") || "[]");
    existing.push(scenario);
    localStorage.setItem("dni-margin-scenarios", JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-6">
      {/* ── INPUT SECTION ── */}
      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        {/* left: inputs (min-w-0: grid items must be allowed to shrink below content size) */}
        <div className="glass-panel grain min-w-0 rounded-xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-slate-100">Product Details</h2>
          <p className="text-muted mt-1 text-xs">Enter your product economics</p>

          <div className="mt-5 space-y-4">
            {/* Selling price */}
            <InputField
              icon={<ShoppingCart className="h-4 w-4 text-amber-400" />}
              label="Selling Price"
              prefix="₹"
              value={sellingPrice}
              onChange={setSellingPrice}
            />
            {/* Product cost */}
            <InputField
              icon={<Package className="h-4 w-4 text-cyan-400" />}
              label="Product Cost (COGS)"
              prefix="₹"
              value={productCost}
              onChange={setProductCost}
            />
            {/* Weight bracket */}
            <div>
              <label className="text-xs font-medium text-slate-300">
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-cyan-400" />
                  Weight Bracket
                </span>
              </label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(Object.keys(WEIGHT_BRACKET_LABELS) as WeightBracket[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => {
                      setWeightBracket(w);
                      setShippingOverride(null);
                    }}
                    className={`min-w-0 min-h-[40px] rounded-md border px-1.5 sm:px-2 py-1.5 text-xs font-medium transition-colors ${
                      weightBracket === w
                        ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                        : "border-neutral-700 bg-neutral-900/60 text-slate-400 hover:border-neutral-500"
                    }`}
                  >
                    {WEIGHT_BRACKET_LABELS[w]}
                  </button>
                ))}
              </div>
            </div>
            {/* Shipping override */}
            <InputField
              icon={<Truck className="h-4 w-4 text-slate-400" />}
              label="Shipping Override (optional)"
              prefix="₹"
              value={shippingOverride ?? ""}
              placeholder={`Auto: ₹${activeResult.shipping}`}
              onChange={(v) => setShippingOverride(v === 0 ? null : v || null)}
            />
            {/* Ad cost */}
            <InputField
              icon={<Megaphone className="h-4 w-4 text-rose-400" />}
              label="Ad Cost per Order"
              prefix="₹"
              value={adCostPerOrder}
              onChange={setAdCostPerOrder}
            />
            {/* Product category */}
            <div>
              <label className="text-xs font-medium text-slate-300">Product Category</label>
              <select
                value={productCategory}
                onChange={(e) => handleCategoryChange(e.target.value as ProductType)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            {/* RTO rate slider */}
            <SliderField
              icon={<RotateCcw className="h-4 w-4 text-rose-400" />}
              label="RTO Rate"
              value={rtoRate}
              min={0}
              max={50}
              suffix="%"
              onChange={setRtoRate}
              trackColor="bg-rose-500"
            />
            {/* COD percent slider */}
            <SliderField
              icon={<Info className="h-4 w-4 text-slate-400" />}
              label="COD Orders"
              value={codPercent}
              min={0}
              max={100}
              suffix="%"
              onChange={setCodPercent}
              trackColor="bg-amber-500"
            />
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="btn-primary mt-5 flex w-full items-center justify-center gap-2 min-h-[44px] rounded-md px-4 py-2.5 text-sm font-medium"
          >
            {saved ? (
              <>
                <Check className="h-4 w-4" /> Scenario Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save Scenario
              </>
            )}
          </button>
        </div>

        {/* right: marketplace tabs + active detail */}
        <div className="min-w-0 space-y-4">
          {/* Marketplace tab bar */}
          <div className="flex gap-1 rounded-lg bg-neutral-900/60 p-1 border border-neutral-800">
            {CHANNELS.map((ch, i) => (
              <button
                key={ch.channel}
                type="button"
                onClick={() => setActiveTab(ch.channel)}
                className={`relative min-w-0 flex-1 min-h-[40px] rounded-md px-2 sm:px-3 py-2 text-[13px] sm:text-sm font-medium transition-colors ${
                  activeTab === ch.channel
                    ? "text-amber-300"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                {activeTab === ch.channel && (
                  <motion.div
                    layoutId="activeMarketplaceTab"
                    className="absolute inset-0 rounded-md border border-amber-500/30 bg-amber-500/10"
                    transition={{ type: "spring", bounce: 0.15, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  {ch.name}
                  {i === bestIdx && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" title="Best margin" />
                  )}
                </span>
              </button>
            ))}
          </div>

          {/* Active marketplace detail */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="glass-panel grain rounded-xl p-5 sm:p-6"
            >
              <MarketplaceDetail
                ch={activeResult.ch}
                result={activeResult.result}
                shipping={activeResult.shipping}
                isBest={allResults[bestIdx].ch.channel === activeTab}
              />
            </motion.div>
          </AnimatePresence>

          {/* Comparison grid */}
          <div className="glass-panel-receded grain rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-sm font-bold text-slate-200">
              Side-by-Side Comparison
            </h3>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-slate-500">
                    <th className="pb-2 pr-3 font-medium">Marketplace</th>
                    <th className="pb-2 pr-3 font-medium text-right">Commission</th>
                    <th className="pb-2 pr-3 font-medium text-right">Fees</th>
                    <th className="pb-2 pr-3 font-medium text-right">Shipping</th>
                    <th className="pb-2 pr-3 font-medium text-right">RTO Loss</th>
                    <th className="pb-2 pr-3 font-medium text-right">Net Profit</th>
                    <th className="pb-2 font-medium text-right">Margin</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800">
                  {allResults.map(({ ch, result }, i) => (
                    <tr
                      key={ch.channel}
                      className={`${
                        i === bestIdx ? "bg-emerald-500/5" : ""
                      } ${ch.channel === activeTab ? "text-slate-100" : "text-slate-400"}`}
                    >
                      <td className="py-2.5 pr-3 font-medium">
                        <span className="flex items-center gap-1.5">
                          {ch.name}
                          {i === bestIdx && (
                            <TrendingUp className="h-3 w-3 text-emerald-400" />
                          )}
                        </span>
                      </td>
                      <td className="py-2.5 pr-3 text-right">{formatINR(result.marketplaceCommission)}</td>
                      <td className="py-2.5 pr-3 text-right">
                        {formatINR(result.paymentFee + result.gstOnFees + result.tcs + result.closingFee + result.fixedFee + result.codCollectionFee + result.platformFee)}
                      </td>
                      <td className="py-2.5 pr-3 text-right">{formatINR(result.shipping)}</td>
                      <td className="py-2.5 pr-3 text-right">{formatINR(result.rtoLoss)}</td>
                      <td className={`py-2.5 pr-3 text-right font-semibold ${marginColor(result.netMarginPercent)}`}>
                        {formatINR(result.netProfit)}
                      </td>
                      <td className={`py-2.5 text-right font-bold ${marginColor(result.netMarginPercent)}`}>
                        {result.netMarginPercent.toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* ── MONTHLY PROJECTIONS ── */}
      <div className="glass-panel grain rounded-xl p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-display flex items-center gap-2 text-lg font-bold text-slate-100">
              <BarChart3 className="h-5 w-5 text-cyan-400" />
              Monthly Projections
            </h3>
            <p className="text-muted mt-1 text-xs">
              Estimated net profit at different volumes
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-slate-400">Orders/month</label>
            <input
              type="range"
              min={50}
              max={500}
              step={10}
              value={monthlyOrders}
              onChange={(e) => setMonthlyOrders(Number(e.target.value))}
              className="w-32 accent-cyan-400"
            />
            <span className="min-w-[3ch] text-sm font-semibold text-slate-200">
              {monthlyOrders}
            </span>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {allResults.map(({ ch, result }, i) => {
            const monthly = result.netProfit * monthlyOrders;
            const positive = monthly >= 0;
            return (
              <div
                key={ch.channel}
                className={`rounded-lg border p-4 transition-colors ${
                  i === bestIdx
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-neutral-800 bg-neutral-900/40"
                }`}
              >
                <p className="text-xs font-medium text-slate-400">{ch.name}</p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    positive ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {positive ? "+" : ""}
                  <CountUp
                    to={Math.round(monthly)}
                    from={0}
                    duration={0.8}
                    separator=","
                    className="tabular-nums"
                  />
                </p>
                <p className="text-muted mt-1 text-xs">
                  ₹{formatINR(result.netProfit).slice(1)} × {monthlyOrders} orders
                </p>
                <div className="mt-2 h-2 w-full rounded-full bg-neutral-800 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${positive ? "bg-emerald-500" : "bg-rose-500"}`}
                    initial={{ width: 0 }}
                    animate={{
                      width: `${Math.min(100, Math.max(2, (Math.abs(result.netMarginPercent) / 40) * 100))}%`,
                    }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── KEY INSIGHT ── */}
      <div className="glass-panel rounded-xl border-l-4 border-l-cyan-500 p-5 sm:p-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-100">The Real Margin Story</p>
            <p className="text-muted mt-1.5 text-sm leading-relaxed">
              A{" "}
              <span className="font-semibold text-slate-200">
                {formatINR(sellingPrice)}
              </span>{" "}
              product with{" "}
              <span className="font-semibold text-slate-200">
                {((sellingPrice - productCost) / sellingPrice * 100).toFixed(0)}%
              </span>{" "}
              gross margin actually yields{" "}
              <span className={`font-bold ${marginColor(allResults[bestIdx].result.netMarginPercent)}`}>
                {allResults[bestIdx].result.netMarginPercent.toFixed(1)}%
              </span>{" "}
              net on{" "}
              <span className="font-semibold text-slate-200">
                {allResults[bestIdx].ch.name}
              </span>{" "}
              after all marketplace fees, shipping, and RTO losses. That is{" "}
              <span className="font-bold text-amber-400">
                {formatINR(allResults[bestIdx].result.netProfit)}
              </span>{" "}
              per order in your pocket.
            </p>
          </div>
        </div>
      </div>

      {/* ── DATA FRESHNESS ── */}
      <div className="flex justify-end px-1">
        <DataFreshness meta={MARKETPLACE_FEES_META} />
      </div>
    </div>
  );
}

/* ── sub-components ── */

function MarketplaceDetail({
  ch,
  result,
  shipping,
  isBest,
}: {
  ch: ChannelInfo;
  result: ProfitResult;
  shipping: number;
  isBest: boolean;
}) {
  const f = result.fees;
  const rows: { label: string; value: number; type?: "cost" | "revenue" }[] = [
    { label: "Revenue", value: result.revenue, type: "revenue" },
    ...(f.referralFee > 0 ? [{ label: `Commission (${f.referralPercent}%)`, value: result.marketplaceCommission, type: "cost" as const }] : []),
    ...(f.closingFee > 0 ? [{ label: "Closing Fee", value: f.closingFee, type: "cost" as const }] : []),
    ...(f.fixedFee > 0 ? [{ label: "Fixed Fee", value: f.fixedFee, type: "cost" as const }] : []),
    ...(f.codCollectionFee > 0 ? [{ label: "COD Collection Fee", value: f.codCollectionFee, type: "cost" as const }] : []),
    ...(f.platformFee > 0 ? [{ label: "Platform Fee", value: f.platformFee, type: "cost" as const }] : []),
    ...(f.paymentGatewayFee > 0 ? [{ label: `Payment Gateway (${f.paymentGatewayPercent}%)`, value: result.paymentFee, type: "cost" as const }] : []),
    { label: "GST on Fees (18%)", value: result.gstOnFees, type: "cost" },
    ...(result.tcs > 0 ? [{ label: `TCS (${f.tcsPercent}%)`, value: result.tcs, type: "cost" as const }] : []),
    { label: "Shipping", value: shipping, type: "cost" },
    { label: "Product Cost", value: result.productCost, type: "cost" },
    ...(result.adCost > 0 ? [{ label: "Ad Cost", value: result.adCost, type: "cost" as const }] : []),
    { label: "RTO Loss", value: result.rtoLoss, type: "cost" },
  ];

  const vc = VERDICT_CONFIG[result.verdict];

  return (
    <div>
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg font-bold text-slate-100">{ch.name}</h3>
        <span
          className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${vc.className}`}
        >
          {vc.label}
        </span>
      </div>

      {/* Hero numbers */}
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className={`rounded-lg border p-3 ${marginBg(result.netMarginPercent)}`}>
          <p className="text-xs text-slate-400">Net Profit</p>
          <p className={`text-2xl font-bold ${marginColor(result.netMarginPercent)}`}>
            {result.netProfit >= 0 ? "+" : ""}
            <CountUp to={Math.round(result.netProfit)} from={0} duration={0.6} separator="," />
          </p>
          <p className="text-muted text-xs">per order</p>
        </div>
        <div className={`rounded-lg border p-3 ${marginBg(result.netMarginPercent)}`}>
          <p className="text-xs text-slate-400">Net Margin</p>
          <p className={`text-2xl font-bold ${marginColor(result.netMarginPercent)}`}>
            <CountUp
              to={Math.round(result.netMarginPercent * 10) / 10}
              from={0}
              duration={0.6}
            />
            %
          </p>
          <p className="text-muted text-xs">
            {isBest ? "Best option" : ""}
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <div className="mt-4 space-y-1">
        {rows.map((row) => (
          <div
            key={row.label}
            className="flex items-center justify-between py-1.5 text-sm"
          >
            <span className="text-slate-400">{row.label}</span>
            <span
              className={`font-medium tabular-nums ${
                row.type === "revenue"
                  ? "text-slate-100"
                  : "text-slate-300"
              }`}
            >
              {row.type === "cost" ? "−" : ""}
              {formatINR(row.value)}
            </span>
          </div>
        ))}
        <div className="mt-1 border-t border-neutral-700 pt-2 flex items-center justify-between text-sm font-bold">
          <span className="text-slate-200">Net Profit</span>
          <span className={marginColor(result.netMarginPercent)}>
            {result.netProfit >= 0 ? "+" : ""}
            {formatINR(result.netProfit)}
          </span>
        </div>
      </div>
    </div>
  );
}

function InputField({
  icon,
  label,
  prefix,
  value,
  placeholder,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  prefix?: string;
  value: number | string;
  placeholder?: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">
        <span className="flex items-center gap-1.5">
          {icon}
          {label}
        </span>
      </label>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full min-h-[40px] rounded-md border border-neutral-700 bg-neutral-900/80 ${
            prefix ? "pl-7" : "px-3"
          } pr-3 py-2 text-sm text-slate-200 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
        />
      </div>
    </div>
  );
}

function SliderField({
  icon,
  label,
  value,
  min,
  max,
  suffix,
  onChange,
  trackColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
  trackColor: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">
        <span className="flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            {icon}
            {label}
          </span>
          <span className="font-semibold text-slate-200 tabular-nums">
            {value}{suffix}
          </span>
        </span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-amber-500"
      />
    </div>
  );
}
