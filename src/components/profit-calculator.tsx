"use client";

import { useMemo, useState } from "react";
import type { PrimaryChannel } from "@/lib/mvp-data";
import { calculateProfit, calculateMonthlyProjections, rtoImpactSummary } from "@/lib/profit-math";
import type { CalculatorKind } from "@/lib/tasks/types";

type Props = {
  kind: CalculatorKind;
  channel: PrimaryChannel;
  initialValues?: {
    sellingPrice?: number;
    productCost?: number;
    shippingCost?: number;
    adCostPerOrder?: number;
    rtoRatePercent?: number;
  };
  onApply?: (result: {
    netMarginPercent: number;
    breakEvenRoas: number;
    estimatedRtoRate: number;
    targetSellingPrice: number;
    productCost: number;
  }) => void;
};

const CHANNEL_LABELS: Record<PrimaryChannel, string> = {
  amazon: "Amazon (~12% commission)",
  flipkart: "Flipkart (~13% commission)",
  meesho: "Meesho (~8% commission)",
  shopify: "Shopify (~2% transaction fee)",
};

function verdictLabel(verdict: ReturnType<typeof calculateProfit>["verdict"]): string {
  switch (verdict) {
    case "excellent":
      return "Excellent margin — room for ads and returns";
    case "healthy":
      return "Healthy margin — sustainable for growth";
    case "tight":
      return "Tight margin — risky if RTO or ads increase";
    default:
      return "Loss at these numbers — fix before listing";
  }
}

function verdictClass(verdict: ReturnType<typeof calculateProfit>["verdict"]): string {
  switch (verdict) {
    case "excellent":
      return "border-emerald-400/40 bg-emerald-400/10 text-emerald-200";
    case "healthy":
      return "border-cyan-400/40 bg-cyan-400/10 text-cyan-200";
    case "tight":
      return "border-amber-400/40 bg-amber-400/10 text-amber-200";
    default:
      return "border-rose-400/40 bg-rose-400/10 text-rose-200";
  }
}

export function ProfitCalculator({ kind, channel, initialValues, onApply }: Props) {
  const [sellingPrice, setSellingPrice] = useState(String(initialValues?.sellingPrice ?? 999));
  const [productCost, setProductCost] = useState(String(initialValues?.productCost ?? 350));
  const [shippingCost, setShippingCost] = useState(String(initialValues?.shippingCost ?? 60));
  const [adCost, setAdCost] = useState(String(initialValues?.adCostPerOrder ?? 80));
  const [rtoRate, setRtoRate] = useState(String(initialValues?.rtoRatePercent ?? 18));
  const [ordersPerMonth, setOrdersPerMonth] = useState("100");
  const [monthlyFixed, setMonthlyFixed] = useState("5000");

  const result = useMemo(() => {
    return calculateProfit({
      sellingPrice: Number(sellingPrice) || 0,
      productCost: Number(productCost) || 0,
      shippingCost: Number(shippingCost) || 0,
      adCostPerOrder: Number(adCost) || 0,
      rtoRatePercent: Number(rtoRate) || 0,
      channel,
    });
  }, [sellingPrice, productCost, shippingCost, adCost, rtoRate, channel]);

  const projections = useMemo(() => {
    return calculateMonthlyProjections(
      {
        sellingPrice: Number(sellingPrice) || 0,
        productCost: Number(productCost) || 0,
        shippingCost: Number(shippingCost) || 0,
        adCostPerOrder: Number(adCost) || 0,
        rtoRatePercent: Number(rtoRate) || 0,
        channel,
      },
      Number(monthlyFixed) || 0,
    );
  }, [sellingPrice, productCost, shippingCost, adCost, rtoRate, channel, monthlyFixed]);

  const rtoImpact = useMemo(() => {
    const base = Number(rtoRate) || 26;
    return rtoImpactSummary(base, 14, Number(ordersPerMonth) || 100);
  }, [rtoRate, ordersPerMonth]);

  if (kind === "rto_impact") {
    return (
      <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
        <p className="text-sm font-semibold text-slate-100">RTO impact estimator</p>
        <p className="text-muted mt-1 text-xs">
          COD confirmation within 30 minutes typically cuts RTO from ~26% to ~12-14%.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted">Current RTO rate (%)</span>
            <input
              type="number"
              value={rtoRate}
              onChange={(e) => setRtoRate(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
            />
          </label>
          <label className="block text-sm">
            <span className="text-muted">COD orders per month</span>
            <input
              type="number"
              value={ordersPerMonth}
              onChange={(e) => setOrdersPerMonth(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
            />
          </label>
        </div>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          <div className="meta-tile">
            <p className="text-xs text-muted">Without confirmation</p>
            <p className="text-lg font-semibold text-rose-200">{rtoImpact.baseRto}% RTO</p>
          </div>
          <div className="meta-tile">
            <p className="text-xs text-muted">With WhatsApp confirm</p>
            <p className="text-lg font-semibold text-emerald-200">{rtoImpact.withConfirmationRto}% RTO</p>
          </div>
          <div className="meta-tile">
            <p className="text-xs text-muted">Orders saved / month</p>
            <p className="text-lg font-semibold text-amber-200">~{rtoImpact.ordersSavedPerMonth}</p>
          </div>
        </div>
        {onApply ? (
          <button
            type="button"
            onClick={() =>
              onApply({
                netMarginPercent: result.netMarginPercent,
                breakEvenRoas: result.breakEvenRoas,
                estimatedRtoRate: Number(rtoRate) || 18,
                targetSellingPrice: Number(sellingPrice) || 0,
                productCost: Number(productCost) || 0,
              })
            }
            className="btn-emerald mt-4 rounded-md px-4 py-2 text-sm font-semibold"
          >
            Save RTO estimate to my profile
          </button>
        ) : null}
      </div>
    );
  }

  const showFullBreakdown = kind === "margin" || kind === "breakeven_roas";

  return (
    <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">
        {kind === "breakeven_roas" ? "Break-even ROAS calculator" : "India profit calculator"}
      </p>
      <p className="text-muted mt-1 text-xs">{CHANNEL_LABELS[channel]} + 18% GST on fees + 1% TCS</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="block text-sm">
          <span className="text-muted">Selling price (₹)</span>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Product cost (₹)</span>
          <input
            type="number"
            value={productCost}
            onChange={(e) => setProductCost(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Shipping per order (₹)</span>
          <input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="block text-sm">
          <span className="text-muted">Ad cost per order (₹)</span>
          <input
            type="number"
            value={adCost}
            onChange={(e) => setAdCost(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="block text-sm sm:col-span-2">
          <span className="text-muted">Expected RTO rate (% on COD orders)</span>
          <input
            type="number"
            value={rtoRate}
            onChange={(e) => setRtoRate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        {kind === "margin" ? (
          <label className="block text-sm sm:col-span-2">
            <span className="text-muted">Monthly fixed costs (₹) — optional</span>
            <input
              type="number"
              value={monthlyFixed}
              onChange={(e) => setMonthlyFixed(e.target.value)}
              className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
            />
          </label>
        ) : null}
      </div>

      <div className={`mt-4 rounded-lg border p-4 ${verdictClass(result.verdict)}`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Net profit / order</p>
            <p className="text-xl font-bold">₹{result.netProfit.toFixed(0)}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Net margin</p>
            <p className="text-xl font-bold">{result.netMarginPercent.toFixed(1)}%</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide opacity-80">Break-even ROAS</p>
            <p className="text-xl font-bold">{result.breakEvenRoas.toFixed(2)}x</p>
          </div>
        </div>
        <p className="mt-2 text-sm">{verdictLabel(result.verdict)}</p>
        <p className="mt-1 text-xs opacity-80">
          Markup: {result.markupMultiple.toFixed(1)}x landed cost
          {result.markupMultiple < 3 ? " — below 3x, risky for paid ads" : " — passes 3x gate"}
        </p>
      </div>

      {showFullBreakdown ? (
        <>
          <details className="mt-3">
            <summary className="cursor-pointer text-sm text-amber-200">Show cost breakdown</summary>
            <ul className="text-muted mt-2 space-y-1 text-xs">
              <li>Marketplace commission: ₹{result.marketplaceCommission.toFixed(0)}</li>
              <li>Payment fee (2%): ₹{result.paymentFee.toFixed(0)}</li>
              <li>GST on fees (18%): ₹{result.gstOnFees.toFixed(0)}</li>
              <li>TCS (1%): ₹{result.tcs.toFixed(0)}</li>
              <li>RTO loss (weighted): ₹{result.rtoLoss.toFixed(0)}</li>
              <li>Ad cost: ₹{result.adCost.toFixed(0)}</li>
            </ul>
          </details>
          {kind === "margin" ? (
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              <div className="meta-tile">
                <p className="text-xs text-muted">Break-even orders / month</p>
                <p className="text-lg font-semibold text-amber-200">
                  {Number.isFinite(projections.breakEvenOrders)
                    ? projections.breakEvenOrders
                    : "N/A (negative margin)"}
                </p>
              </div>
              {projections.projections.map((p) => (
                <div key={p.orders} className="meta-tile">
                  <p className="text-xs text-muted">{p.orders} orders / month</p>
                  <p className={`text-lg font-semibold ${p.monthlyProfit >= 0 ? "text-emerald-200" : "text-rose-200"}`}>
                    ₹{p.monthlyProfit.toFixed(0)} profit
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}

      {onApply ? (
        <button
          type="button"
          onClick={() =>
            onApply({
              netMarginPercent: result.netMarginPercent,
              breakEvenRoas: result.breakEvenRoas,
              estimatedRtoRate: Number(rtoRate) || 18,
              targetSellingPrice: Number(sellingPrice) || 0,
              productCost: Number(productCost) || 0,
            })
          }
          className="btn-emerald mt-4 rounded-md px-4 py-2 text-sm font-semibold"
        >
          Save these numbers to my profile
        </button>
      ) : null}
    </div>
  );
}
