"use client";

import { useMemo, useState } from "react";
import { TrendingUp, AlertTriangle } from "lucide-react";
import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import {
  CHANNELS,
  WEIGHT_BRACKET_LABELS,
  MARKETPLACE_FEES_META,
  getShippingForWeight,
  type WeightBracket,
} from "@/lib/marketplace-fees";
import { computeRoas as computeRoasShared } from "@/lib/roas";
import { DataFreshness } from "@/components/data-freshness";

const PRODUCT_CATEGORIES: { value: ProductType; label: string }[] = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "food", label: "Food & Grocery" },
  { value: "general", label: "General / Other" },
];

function formatRoas(v: number): string {
  if (!Number.isFinite(v) || v > 99) return "∞";
  return v.toFixed(1) + "x";
}

function roasColor(v: number): string {
  if (!Number.isFinite(v) || v > 4) return "text-rose-400";
  if (v > 2.5) return "text-amber-400";
  return "text-emerald-400";
}

function roasBorder(v: number): string {
  if (!Number.isFinite(v) || v > 4) return "border-rose-500/30 bg-rose-500/5";
  if (v > 2.5) return "border-amber-500/30 bg-amber-500/5";
  return "border-emerald-500/30 bg-emerald-500/5";
}

function roasLabel(v: number): string {
  if (!Number.isFinite(v) || v > 4) return "Unprofitable";
  if (v > 2.5) return "Challenging";
  return "Achievable";
}

type RoasResult = {
  channel: PrimaryChannel;
  name: string;
  contribution: number;
  breakeven: number;
  target10: number;
  target20: number;
};

function computeRoas(
  sellingPrice: number,
  productCost: number,
  channel: PrimaryChannel,
  category: ProductType,
  weightBracket: WeightBracket,
  codMix: number,
  rtoRate: number,
): RoasResult {
  const ch = CHANNELS.find((c) => c.channel === channel)!;
  const result = computeRoasShared({
    sellingPrice,
    productCost,
    channel,
    category,
    shippingCost: getShippingForWeight(channel, weightBracket),
    codMixPercent: codMix,
    rtoRatePercent: rtoRate,
  });

  return {
    channel,
    name: ch.name,
    contribution: result.contribution,
    breakeven: result.breakeven,
    target10: result.target10,
    target20: result.target20,
  };
}

export function BreakevenRoas() {
  const [sellingPrice, setSellingPrice] = useState(999);
  const [productCost, setProductCost] = useState(250);
  const [channel, setChannel] = useState<PrimaryChannel>("amazon");
  const [category, setCategory] = useState<ProductType>("general");
  const [weightBracket, setWeightBracket] = useState<WeightBracket>("light");
  const [codMix, setCodMix] = useState(60);
  const [rtoRate, setRtoRate] = useState(25);

  const primary = useMemo(
    () => computeRoas(sellingPrice, productCost, channel, category, weightBracket, codMix, rtoRate),
    [sellingPrice, productCost, channel, category, weightBracket, codMix, rtoRate],
  );

  const allChannels = useMemo(
    () =>
      CHANNELS.map((ch) =>
        computeRoas(sellingPrice, productCost, ch.channel, category, weightBracket, codMix, rtoRate),
      ),
    [sellingPrice, productCost, category, weightBracket, codMix, rtoRate],
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[1fr,1.4fr]">
        {/* Inputs */}
        <div className="glass-panel grain rounded-xl p-5 sm:p-6">
          <h2 className="font-display text-lg font-bold text-slate-100">Unit Economics</h2>
          <p className="text-muted mt-1 text-xs">Your product numbers</p>

          <div className="mt-5 space-y-4">
            <Field label="Selling Price" prefix="₹" value={sellingPrice} onChange={setSellingPrice} />
            <Field label="Product Cost (COGS)" prefix="₹" value={productCost} onChange={setProductCost} />

            <div>
              <label className="text-xs font-medium text-slate-300">Channel</label>
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value as PrimaryChannel)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                {CHANNELS.map((ch) => (
                  <option key={ch.channel} value={ch.channel}>
                    {ch.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Product Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductType)}
                className="mt-1.5 w-full min-h-[40px] rounded-md border border-neutral-700 bg-neutral-900/80 px-3 py-2 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
              >
                {PRODUCT_CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-300">Weight Bracket</label>
              <div className="mt-1.5 grid grid-cols-3 gap-2">
                {(Object.keys(WEIGHT_BRACKET_LABELS) as WeightBracket[]).map((w) => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setWeightBracket(w)}
                    className={`min-h-[40px] rounded-md border px-2 py-1.5 text-xs font-medium transition-colors ${
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

            <Slider label="COD Mix" value={codMix} min={0} max={100} suffix="%" onChange={setCodMix} />
            <Slider label="RTO Rate" value={rtoRate} min={0} max={50} suffix="%" onChange={setRtoRate} />
          </div>
        </div>

        {/* Results */}
        <div className="space-y-4">
          {/* Hero ROAS */}
          <div className={`rounded-xl border p-6 ${roasBorder(primary.breakeven)}`}>
            <p className="text-xs font-medium text-slate-400">Break-even ROAS</p>
            <p className={`mt-1 text-5xl font-bold tabular-nums ${roasColor(primary.breakeven)}`}>
              {formatRoas(primary.breakeven)}
            </p>
            <p className={`mt-1 text-sm font-medium ${roasColor(primary.breakeven)}`}>
              {roasLabel(primary.breakeven)}
            </p>
            {primary.breakeven > 4 && Number.isFinite(primary.breakeven) && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-xs leading-relaxed text-rose-300">
                  Structurally unprofitable for cold Meta traffic. Consider
                  lowering COGS, switching channels, or reducing COD/RTO exposure.
                </p>
              </div>
            )}
            {primary.contribution <= 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-rose-500/20 bg-rose-500/5 p-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                <p className="text-xs leading-relaxed text-rose-300">
                  Negative contribution margin — you lose money on every shipped
                  order even without ad spend. Fix unit economics first.
                </p>
              </div>
            )}
          </div>

          {/* Target table */}
          <div className="glass-panel grain rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-sm font-bold text-slate-200">
              ROAS Targets
            </h3>
            <div className="mt-3 space-y-1">
              {[
                { label: "Break-even (0% profit)", value: primary.breakeven },
                { label: "10% net profit target", value: primary.target10 },
                { label: "20% net profit target", value: primary.target20 },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between py-2 text-sm">
                  <span className="text-slate-400">{row.label}</span>
                  <span className={`font-bold tabular-nums ${roasColor(row.value)}`}>
                    {formatRoas(row.value)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 border-t border-neutral-700 pt-3">
              <p className="text-xs text-slate-500">
                Contribution per shipped order:{" "}
                <span className="font-semibold text-slate-300">
                  ₹{Math.round(primary.contribution).toLocaleString("en-IN")}
                </span>
              </p>
            </div>
          </div>

          {/* Channel comparison */}
          <div className="glass-panel grain rounded-xl p-5 sm:p-6">
            <h3 className="font-display text-sm font-bold text-slate-200">
              Break-even ROAS by Channel
            </h3>
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {allChannels.map((r) => (
                <div
                  key={r.channel}
                  className={`rounded-lg border p-3 text-center ${
                    r.channel === channel ? roasBorder(r.breakeven) : "border-neutral-800 bg-neutral-900/40"
                  }`}
                >
                  <p className="text-xs font-medium text-slate-400">{r.name}</p>
                  <p className={`mt-1 text-xl font-bold tabular-nums ${roasColor(r.breakeven)}`}>
                    {formatRoas(r.breakeven)}
                  </p>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ₹{Math.round(r.contribution)}/order
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Insight */}
      <div className="glass-panel rounded-xl border-l-4 border-l-cyan-500 p-5 sm:p-6">
        <div className="flex gap-3">
          <TrendingUp className="h-5 w-5 shrink-0 text-cyan-400 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-slate-100">What This Means</p>
            <p className="text-muted mt-1.5 text-sm leading-relaxed">
              {primary.contribution > 0 ? (
                <>
                  Every ₹100 you spend on ads must generate at least{" "}
                  <span className={`font-bold ${roasColor(primary.breakeven)}`}>
                    ₹{Math.round(primary.breakeven * 100)}
                  </span>{" "}
                  in revenue to break even on {CHANNELS.find((c) => c.channel === channel)?.name}.
                  {primary.breakeven <= 2.5
                    ? " That is very achievable with warm audiences and retargeting."
                    : primary.breakeven <= 4
                      ? " Doable with optimized campaigns, but leaves little room for error."
                      : " This is extremely hard to sustain — most Meta campaigns average 2-3x ROAS."}
                </>
              ) : (
                "Unit economics are negative — no amount of ad spend can make this product profitable on this channel. Reduce COGS or switch to a lower-fee marketplace."
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-end px-1">
        <DataFreshness meta={MARKETPLACE_FEES_META} />
      </div>
    </div>
  );
}

function Field({
  label,
  prefix,
  value,
  onChange,
}: {
  label: string;
  prefix?: string;
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="relative mt-1.5">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className={`w-full min-h-[40px] rounded-md border border-neutral-700 bg-neutral-900/80 ${
            prefix ? "pl-7" : "px-3"
          } pr-3 py-2 text-sm text-slate-200 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
        />
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">
        <span className="flex items-center justify-between">
          <span>{label}</span>
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
