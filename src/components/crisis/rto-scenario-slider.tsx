"use client";

import { useMemo, useState, useTransition } from "react";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { calculateProfit, defaultRtoForProductType } from "@/lib/profit-math";
import { saveRtoScenario } from "@/app/app/crisis/actions";

type Props = {
  profile: OnboardingProfile;
  defaultSellingPrice?: number;
  defaultProductCost?: number;
  defaultShippingCost?: number;
  defaultRtoRate?: number;
};

export function RtoScenarioSlider({
  profile,
  defaultSellingPrice = 499,
  defaultProductCost = 180,
  defaultShippingCost = 65,
  defaultRtoRate,
}: Props) {
  const [orders, setOrders] = useState(40);
  const [rtoRate, setRtoRate] = useState(defaultRtoRate ?? defaultRtoForProductType(profile.productType));
  const [sellingPrice, setSellingPrice] = useState(defaultSellingPrice);
  const [productCost, setProductCost] = useState(defaultProductCost);
  const [shippingCost, setShippingCost] = useState(defaultShippingCost);
  const [saved, setSaved] = useState(false);
  const [pending, startTransition] = useTransition();

  const result = useMemo(() => {
    const unit = calculateProfit({
      sellingPrice,
      productCost,
      shippingCost,
      adCostPerOrder: 0,
      rtoRatePercent: rtoRate,
      channel: profile.primaryChannel,
    });
    const monthlyOrders = orders;
    const rtoOrders = Math.round(monthlyOrders * (rtoRate / 100));
    const totalProfit = unit.netProfit * monthlyOrders;
    const rtoLossTotal = unit.rtoLoss * monthlyOrders;
    return { unit, monthlyOrders, rtoOrders, totalProfit, rtoLossTotal };
  }, [orders, rtoRate, sellingPrice, productCost, shippingCost, profile.primaryChannel]);

  function handleSave() {
    startTransition(async () => {
      await saveRtoScenario({
        orders,
        rtoRatePercent: rtoRate,
        sellingPrice,
        productCost,
        shippingCost,
        netMarginPercent: result.unit.netMarginPercent,
        breakEvenRoas: result.unit.breakEvenRoas,
      });
      setSaved(true);
    });
  }

  const profitPositive = result.totalProfit >= 0;

  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-amber-200">Try this — RTO scenario</p>
      <p className="text-muted mt-1 text-xs">Slide to see what your first batch of orders actually earns.</p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block text-xs">
          <span className="text-muted">Orders in batch</span>
          <input
            type="range"
            min={10}
            max={100}
            step={5}
            value={orders}
            onChange={(e) => setOrders(Number(e.target.value))}
            className="mt-1 w-full accent-amber-400"
          />
          <span className="text-slate-200">{orders} orders</span>
        </label>
        <label className="block text-xs">
          <span className="text-muted">RTO rate %</span>
          <input
            type="range"
            min={10}
            max={40}
            step={1}
            value={rtoRate}
            onChange={(e) => setRtoRate(Number(e.target.value))}
            className="mt-1 w-full accent-amber-400"
          />
          <span className="text-slate-200">{rtoRate}% (~{result.rtoOrders} returns)</span>
        </label>
        <label className="block text-xs">
          <span className="text-muted">Selling price ₹</span>
          <input
            type="number"
            value={sellingPrice}
            onChange={(e) => setSellingPrice(Number(e.target.value))}
            className="mt-1 w-full min-h-[40px] rounded-md border border-slate-600 bg-slate-950/80 px-2 py-1"
          />
        </label>
        <label className="block text-xs">
          <span className="text-muted">Product cost ₹</span>
          <input
            type="number"
            value={productCost}
            onChange={(e) => setProductCost(Number(e.target.value))}
            className="mt-1 w-full min-h-[40px] rounded-md border border-slate-600 bg-slate-950/80 px-2 py-1"
          />
        </label>
        <label className="block text-xs sm:col-span-2">
          <span className="text-muted">Shipping cost ₹ (one way)</span>
          <input
            type="number"
            value={shippingCost}
            onChange={(e) => setShippingCost(Number(e.target.value))}
            className="mt-1 w-full min-h-[40px] rounded-md border border-slate-600 bg-slate-950/80 px-2 py-1"
          />
        </label>
      </div>

      <div
        className={`mt-4 rounded-lg border px-4 py-3 ${
          profitPositive ? "border-emerald-500/40 bg-emerald-500/10" : "border-rose-500/40 bg-rose-500/10"
        }`}
      >
        <p className="text-sm font-semibold text-slate-100">
          {orders} orders at {rtoRate}% RTO →{" "}
          <span className={profitPositive ? "text-emerald-200" : "text-rose-200"}>
            {profitPositive ? "+" : ""}₹{Math.round(result.totalProfit).toLocaleString("en-IN")} net
          </span>
        </p>
        <p className="text-muted mt-1 text-xs">
          Per unit margin {result.unit.netMarginPercent.toFixed(1)}% · RTO drag ~₹
          {Math.round(result.rtoLossTotal).toLocaleString("en-IN")} on this batch
        </p>
      </div>

      <button
        type="button"
        disabled={pending}
        onClick={handleSave}
        className="btn-primary mt-4 min-h-[44px] rounded-md px-4 py-2 text-sm font-medium"
      >
        {pending ? "Saving…" : saved ? "Saved — refresh to update warnings" : "Save this calculation"}
      </button>
    </div>
  );
}
