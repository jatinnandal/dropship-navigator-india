"use client";

import { useMemo, useState } from "react";
import type { PrimaryChannel } from "@/lib/mvp-data";
import { calculateProfit } from "@/lib/profit-math";

type Props = {
  channel: PrimaryChannel;
  sellingPrice?: number;
  onComplete?: (result: { netProfit: number; rtoRate: number }) => void;
};

export function RtoRealitySlider({ channel, sellingPrice = 999, onComplete }: Props) {
  const [productCost, setProductCost] = useState(350);
  const [adCost, setAdCost] = useState(80);
  const [rtoRate, setRtoRate] = useState(15);

  const result = useMemo(
    () =>
      calculateProfit({
        sellingPrice,
        productCost,
        shippingCost: 60,
        adCostPerOrder: adCost,
        rtoRatePercent: rtoRate,
        channel,
      }),
    [sellingPrice, productCost, adCost, rtoRate, channel],
  );

  const profitClass =
    result.netProfit <= 0
      ? "text-rose-400"
      : result.netMarginPercent < 10
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div className="mt-4 space-y-5 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">RTO Reality Slider</p>
      <p className="text-muted text-xs">
        Drag RTO up and watch profit die — this is why Indian COD dropshipping is brutal.
      </p>

      <label className="block text-sm">
        <span className="text-muted">Product cost (₹): {productCost}</span>
        <input
          type="range"
          min={100}
          max={800}
          value={productCost}
          onChange={(e) => setProductCost(Number(e.target.value))}
          className="mt-2 w-full accent-amber-400"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">Ad cost per order (₹): {adCost}</span>
        <input
          type="range"
          min={0}
          max={300}
          value={adCost}
          onChange={(e) => setAdCost(Number(e.target.value))}
          className="mt-2 w-full accent-amber-400"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">RTO rate (%): {rtoRate}</span>
        <input
          type="range"
          min={0}
          max={45}
          value={rtoRate}
          onChange={(e) => setRtoRate(Number(e.target.value))}
          className="mt-2 w-full accent-rose-400"
        />
      </label>

      <div className={`rounded-lg border border-slate-600/50 bg-slate-900/50 p-4 text-center transition-colors`}>
        <p className="text-xs uppercase tracking-wide text-muted">Net profit per order</p>
        <p className={`text-4xl font-bold transition-colors ${profitClass}`}>
          ₹{result.netProfit.toFixed(0)}
        </p>
        <p className="text-muted mt-1 text-xs">
          Margin {result.netMarginPercent.toFixed(1)}% at ₹{sellingPrice} selling price
        </p>
        {rtoRate >= 25 ? (
          <p className="mt-2 text-sm text-rose-300">
            At {rtoRate}% RTO, you are likely losing money even when ads &quot;work.&quot;
          </p>
        ) : null}
      </div>

      {onComplete ? (
        <button
          type="button"
          onClick={() => onComplete({ netProfit: result.netProfit, rtoRate })}
          className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold"
        >
          I understand — save RTO estimate
        </button>
      ) : null}
    </div>
  );
}
