"use client";

import { useState, useMemo } from "react";
import { Plus, X, Target, AlertTriangle } from "lucide-react";
import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import {
  CHANNELS,
  WEIGHT_BRACKET_LABELS,
  MARKETPLACE_FEES_META,
  type WeightBracket,
} from "@/lib/marketplace-fees";
import { DataFreshness } from "@/components/data-freshness";
import {
  scoreProduct,
  type ScorecardInputs,
  type ScorecardResult,
  type CompetitionLevel,
  type FragilityLevel,
  type SeasonalityLevel,
} from "@/lib/product-scoring";

const PRODUCT_CATEGORIES: { value: ProductType; label: string }[] = [
  { value: "fashion", label: "Fashion & Apparel" },
  { value: "electronics", label: "Electronics" },
  { value: "beauty", label: "Beauty & Personal Care" },
  { value: "food", label: "Food & Grocery" },
  { value: "general", label: "General / Other" },
];

const COMPETITION_OPTIONS: { value: CompetitionLevel; label: string }[] = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "saturated", label: "Saturated" },
];

const FRAGILITY_OPTIONS: { value: FragilityLevel; label: string }[] = [
  { value: "sturdy", label: "Sturdy" },
  { value: "normal", label: "Normal" },
  { value: "fragile", label: "Fragile" },
];

const SEASONALITY_OPTIONS: { value: SeasonalityLevel; label: string }[] = [
  { value: "year_round", label: "Year-round" },
  { value: "moderate", label: "Moderate" },
  { value: "highly_seasonal", label: "Highly seasonal" },
];

const VERDICT_CONFIG = {
  excellent: { label: "Excellent Pick", color: "text-emerald-400", bg: "border-emerald-500/30 bg-emerald-500/5" },
  good: { label: "Good Potential", color: "text-amber-400", bg: "border-amber-500/30 bg-amber-500/5" },
  risky: { label: "Risky", color: "text-orange-400", bg: "border-orange-500/30 bg-orange-500/5" },
  avoid: { label: "Avoid", color: "text-rose-400", bg: "border-rose-500/30 bg-rose-500/5" },
} as const;

function defaultInputs(): ScorecardInputs {
  return {
    productName: "",
    sellingPrice: 999,
    productCost: 250,
    channel: "amazon",
    category: "general",
    weightBracket: "light",
    competition: "medium",
    fragility: "normal",
    seasonality: "year_round",
    moq: 50,
  };
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-400";
  if (score >= 55) return "text-amber-400";
  if (score >= 35) return "text-orange-400";
  return "text-rose-400";
}

function scoreBg(score: number): string {
  if (score >= 75) return "bg-emerald-500";
  if (score >= 55) return "bg-amber-500";
  if (score >= 35) return "bg-orange-500";
  return "bg-rose-500";
}

export function ProductScorecard() {
  const [slots, setSlots] = useState<ScorecardInputs[]>([
    { ...defaultInputs(), productName: "Product 1" },
  ]);

  const results = useMemo(
    () => slots.map((s) => scoreProduct(s)),
    [slots],
  );

  function updateSlot(index: number, patch: Partial<ScorecardInputs>) {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    if (slots.length >= 3) return;
    setSlots((prev) => [
      ...prev,
      { ...defaultInputs(), productName: `Product ${prev.length + 1}` },
    ]);
  }

  function removeSlot(index: number) {
    if (slots.length <= 1) return;
    setSlots((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-6">
      {/* Product input cards */}
      <div className={`grid gap-4 ${slots.length > 1 ? "lg:grid-cols-2" : ""} ${slots.length > 2 ? "xl:grid-cols-3" : ""}`}>
        {slots.map((slot, idx) => (
          <ProductForm
            key={idx}
            inputs={slot}
            index={idx}
            total={slots.length}
            onChange={(patch) => updateSlot(idx, patch)}
            onRemove={() => removeSlot(idx)}
          />
        ))}
      </div>

      {slots.length < 3 && (
        <button
          type="button"
          onClick={addSlot}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-neutral-700 py-4 text-sm text-slate-400 transition-colors hover:border-neutral-500 hover:text-slate-200"
        >
          <Plus className="h-4 w-4" />
          Compare another product ({slots.length}/3)
        </button>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          {/* Score cards */}
          <div className={`grid gap-4 ${results.length > 1 ? "lg:grid-cols-2" : ""} ${results.length > 2 ? "xl:grid-cols-3" : ""}`}>
            {results.map((r, idx) => (
              <ScoreCard key={idx} result={r} rank={results.length > 1 ? idx + 1 : undefined} />
            ))}
          </div>

          {/* Comparison table */}
          {results.length > 1 && <CompareTable results={results} />}
        </div>
      )}

      <div className="flex justify-end px-1">
        <DataFreshness meta={MARKETPLACE_FEES_META} />
      </div>
    </div>
  );
}

function ProductForm({
  inputs,
  index,
  total,
  onChange,
  onRemove,
}: {
  inputs: ScorecardInputs;
  index: number;
  total: number;
  onChange: (patch: Partial<ScorecardInputs>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="glass-panel grain rounded-xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-bold text-slate-100">
          {inputs.productName || `Product ${index + 1}`}
        </h2>
        {total > 1 && (
          <button type="button" onClick={onRemove} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 space-y-3">
        <Field
          label="Product Name"
          value={inputs.productName}
          onChange={(v) => onChange({ productName: v })}
          type="text"
        />

        <div className="grid grid-cols-2 gap-3">
          <Field label="Selling Price" prefix="₹" value={inputs.sellingPrice} onChange={(v) => onChange({ sellingPrice: Number(v) })} />
          <Field label="COGS" prefix="₹" value={inputs.productCost} onChange={(v) => onChange({ productCost: Number(v) })} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Channel"
            value={inputs.channel}
            options={CHANNELS.map((c) => ({ value: c.channel, label: c.name }))}
            onChange={(v) => onChange({ channel: v as PrimaryChannel })}
          />
          <Select
            label="Category"
            value={inputs.category}
            options={PRODUCT_CATEGORIES}
            onChange={(v) => onChange({ category: v as ProductType })}
          />
        </div>

        <ToggleGroup
          label="Weight"
          value={inputs.weightBracket}
          options={(Object.keys(WEIGHT_BRACKET_LABELS) as WeightBracket[]).map((w) => ({
            value: w,
            label: WEIGHT_BRACKET_LABELS[w],
          }))}
          onChange={(v) => onChange({ weightBracket: v as WeightBracket })}
        />

        <div className="grid grid-cols-3 gap-3">
          <Select label="Competition" value={inputs.competition} options={COMPETITION_OPTIONS} onChange={(v) => onChange({ competition: v as CompetitionLevel })} />
          <Select label="Fragility" value={inputs.fragility} options={FRAGILITY_OPTIONS} onChange={(v) => onChange({ fragility: v as FragilityLevel })} />
          <Select label="Seasonality" value={inputs.seasonality} options={SEASONALITY_OPTIONS} onChange={(v) => onChange({ seasonality: v as SeasonalityLevel })} />
        </div>

        <Field label="MOQ (min order qty)" value={inputs.moq} onChange={(v) => onChange({ moq: Number(v) })} />
      </div>
    </div>
  );
}

function ScoreCard({ result, rank }: { result: ScorecardResult; rank?: number }) {
  const vc = VERDICT_CONFIG[result.verdict];

  return (
    <div className={`rounded-xl border p-5 sm:p-6 ${vc.bg}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className={`h-5 w-5 ${vc.color}`} />
          <h3 className="font-display text-base font-bold text-slate-100">
            {result.productName || `Product ${rank ?? 1}`}
          </h3>
        </div>
        <span className={`rounded-md border px-2.5 py-1 text-xs font-semibold ${vc.bg} ${vc.color}`}>
          {vc.label}
        </span>
      </div>

      {/* Hero score */}
      <div className="mt-4 text-center">
        <p className={`text-5xl font-bold tabular-nums ${scoreColor(result.totalScore)}`}>
          {result.totalScore}
        </p>
        <p className="text-xs text-slate-500 mt-1">out of 100</p>
      </div>

      {/* Axis bars */}
      <div className="mt-5 space-y-2">
        {result.axes.map((axis) => (
          <div key={axis.name}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">{axis.name}</span>
              <span className="font-mono text-slate-300">{axis.score}</span>
            </div>
            <div className="mt-1 h-1.5 w-full rounded-full bg-neutral-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${scoreBg(axis.score)}`}
                style={{ width: `${axis.score}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* Top risks */}
      {result.topRisks.length > 0 && (
        <div className="mt-4 space-y-1.5">
          {result.topRisks.map((risk, i) => (
            <div key={i} className="flex items-start gap-2 text-xs text-slate-400">
              <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-amber-500" />
              <span>{risk}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CompareTable({ results }: { results: ScorecardResult[] }) {
  const axisNames = results[0].axes.map((a) => a.name);
  const best = results.reduce((b, r, i) => (r.totalScore > results[b].totalScore ? i : b), 0);

  return (
    <div className="glass-panel grain rounded-xl p-5 sm:p-6">
      <h3 className="font-display text-sm font-bold text-slate-200">
        Side-by-Side Comparison
      </h3>
      <div className="mt-3 overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-left text-slate-500">
              <th className="pb-2 pr-3 font-medium">Axis</th>
              {results.map((r, i) => (
                <th key={i} className="pb-2 pr-3 text-right font-medium">
                  {r.productName || `Product ${i + 1}`}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-800">
            {axisNames.map((name) => (
              <tr key={name}>
                <td className="py-2 pr-3 text-slate-400">{name}</td>
                {results.map((r, i) => {
                  const axis = r.axes.find((a) => a.name === name)!;
                  return (
                    <td key={i} className={`py-2 pr-3 text-right font-semibold tabular-nums ${scoreColor(axis.score)}`}>
                      {axis.score}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr className="border-t border-neutral-700">
              <td className="py-2.5 pr-3 font-bold text-slate-200">Total</td>
              {results.map((r, i) => (
                <td key={i} className={`py-2.5 pr-3 text-right text-lg font-bold tabular-nums ${scoreColor(r.totalScore)} ${i === best ? "underline decoration-emerald-500/40 underline-offset-2" : ""}`}>
                  {r.totalScore}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Field({
  label,
  prefix,
  value,
  onChange,
  type = "number",
}: {
  label: string;
  prefix?: string;
  value: string | number;
  onChange: (v: string) => void;
  type?: "text" | "number";
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="relative mt-1">
        {prefix && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-500">{prefix}</span>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[36px] rounded-md border border-neutral-700 bg-neutral-900/80 ${prefix ? "pl-7" : "px-3"} pr-3 py-1.5 text-sm text-slate-200 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30`}
        />
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full min-h-[36px] rounded-md border border-neutral-700 bg-neutral-900/80 px-2 py-1.5 text-sm text-slate-200 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function ToggleGroup({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-300">{label}</label>
      <div className="mt-1 grid gap-1.5" style={{ gridTemplateColumns: `repeat(${options.length}, 1fr)` }}>
        {options.map((o) => (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`min-h-[36px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
              value === o.value
                ? "border-amber-500/50 bg-amber-500/10 text-amber-300"
                : "border-neutral-700 bg-neutral-900/60 text-slate-400 hover:border-neutral-500"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}
