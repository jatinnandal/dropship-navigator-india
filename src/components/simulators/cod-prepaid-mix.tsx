"use client";

import { useMemo, useState } from "react";
import type { PrimaryChannel } from "@/lib/mvp-data";
import { calculateBlendedUnitEconomics } from "@/lib/profit-math";

type Props = {
  channel: PrimaryChannel;
  sellingPrice?: number;
  onComplete?: () => void;
};

export function CodPrepaidMix({ channel, sellingPrice = 899, onComplete }: Props) {
  const [codPercent, setCodPercent] = useState(80);
  const [codRto, setCodRto] = useState(26);
  const [prepaidReturn, setPrepaidReturn] = useState(2);
  const [productCost, setProductCost] = useState(350);
  const [adCost, setAdCost] = useState(100);

  const result = useMemo(
    () =>
      calculateBlendedUnitEconomics({
        sellingPrice,
        productCost,
        shippingCost: 60,
        adCostPerOrder: adCost,
        codPercent,
        codRtoPercent: codRto,
        prepaidReturnPercent: prepaidReturn,
        channel,
      }),
    [sellingPrice, productCost, adCost, codPercent, codRto, prepaidReturn, channel],
  );

  const marginClass =
    result.netMarginPercent <= 0
      ? "text-rose-400"
      : result.netMarginPercent < 10
        ? "text-amber-300"
        : "text-emerald-300";

  return (
    <div className="mt-4 space-y-5 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">COD vs prepaid mix simulator</p>
      <p className="text-muted text-xs">
        COD RTO ~20–26%. Prepaid returns &lt;2%. Your payment mix changes blended unit economics.
      </p>

      <label className="block text-sm">
        <span className="text-muted">COD orders (%): {codPercent}</span>
        <input
          type="range"
          min={0}
          max={100}
          value={codPercent}
          onChange={(e) => setCodPercent(Number(e.target.value))}
          className="mt-2 w-full accent-amber-400"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">COD RTO rate (%): {codRto}</span>
        <input
          type="range"
          min={5}
          max={40}
          value={codRto}
          onChange={(e) => setCodRto(Number(e.target.value))}
          className="mt-2 w-full accent-rose-400"
        />
      </label>

      <label className="block text-sm">
        <span className="text-muted">Prepaid return rate (%): {prepaidReturn}</span>
        <input
          type="range"
          min={0}
          max={15}
          value={prepaidReturn}
          onChange={(e) => setPrepaidReturn(Number(e.target.value))}
          className="mt-2 w-full accent-cyan-400"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="meta-tile text-center">
          <p className="text-xs text-muted">100% COD margin</p>
          <p className="text-lg font-bold text-rose-300">{result.codOnlyMargin.toFixed(1)}%</p>
        </div>
        <div className="meta-tile text-center">
          <p className="text-xs text-muted">Your blend ({codPercent}% COD)</p>
          <p className={`text-lg font-bold ${marginClass}`}>{result.netMarginPercent.toFixed(1)}%</p>
        </div>
        <div className="meta-tile text-center">
          <p className="text-xs text-muted">100% prepaid margin</p>
          <p className="text-lg font-bold text-emerald-300">{result.prepaidOnlyMargin.toFixed(1)}%</p>
        </div>
      </div>

      {codPercent >= 70 && result.netMarginPercent < 10 ? (
        <p className="text-sm text-amber-200">
          At {codPercent}% COD, consider pushing prepaid (UPI discount, partial prepay) before scaling ads.
        </p>
      ) : null}

      {onComplete ? (
        <button type="button" onClick={onComplete} className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold">
          I understand my payment mix risk
        </button>
      ) : null}
    </div>
  );
}
