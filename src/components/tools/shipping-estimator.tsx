"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Truck, AlertTriangle, Clock, Package } from "lucide-react";
import CountUp from "@/components/CountUp";
import {
  CARRIERS,
  ZONE_LABELS,
  calculateShippingCost,
  type ShippingZone,
  type CarrierRate,
  type ShippingCostResult,
} from "@/lib/shipping-data";

/* ── Preset weight buttons ── */
const WEIGHT_PRESETS = [
  { label: "250g", value: 250 },
  { label: "500g", value: 500 },
  { label: "1kg", value: 1000 },
  { label: "2kg", value: 2000 },
  { label: "5kg", value: 5000 },
];

const ZONES: { value: ShippingZone; label: string }[] = [
  { value: "local", label: "Local" },
  { value: "regional", label: "Regional" },
  { value: "national", label: "National" },
  { value: "metro", label: "Metro" },
];

export function ShippingEstimator() {
  const [weightGrams, setWeightGrams] = useState(500);
  const [zone, setZone] = useState<ShippingZone>("national");
  const [orderValue, setOrderValue] = useState(500);
  const [isCod, setIsCod] = useState(true);
  const [dims, setDims] = useState({ l: 0, w: 0, h: 0 });

  /* Couriers charge max(actual, volumetric); volumetric kg = L×W×H(cm)/5000 */
  const volumetricGrams = Math.round(((dims.l * dims.w * dims.h) / 5000) * 1000);
  const chargeableGrams = Math.max(weightGrams, volumetricGrams);

  /* ── Calculate all carrier costs ── */
  const results = useMemo(() => {
    return CARRIERS.map((carrier) => ({
      carrier,
      codUnsupported: isCod && !carrier.supportsCod,
      result: calculateShippingCost({
        carrier,
        weightGrams: chargeableGrams,
        zone,
        isCod: isCod && carrier.supportsCod,
        orderValue,
      }),
    })).sort((a, b) => {
      // COD-capable carriers rank above non-COD ones when COD is on
      if (a.codUnsupported !== b.codUnsupported) return a.codUnsupported ? 1 : -1;
      return a.result.totalCost - b.result.totalCost;
    });
  }, [chargeableGrams, zone, isCod, orderValue]);

  const rankable = results.filter((r) => !r.codUnsupported);
  const cheapestTotal = rankable[0]?.result.totalCost ?? 0;

  /* ── Shiprocket "real vs advertised" ── */
  const shiprocketResult = results.find((r) => r.carrier.carrier === "Shiprocket");
  const shiprocketBase = shiprocketResult?.carrier.baseRate[zone] ?? 0;
  const shiprocketActual = shiprocketResult?.result.totalCost ?? 0;

  /* ── RTO cost insight ── */
  const rtoAmount = cheapestTotal * 2;

  return (
    <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
      {/* ── INPUT PANEL ── */}
      <div className="glass-panel grain rounded-xl p-5 space-y-5 h-fit lg:sticky lg:top-6">
        {/* Weight */}
        <div>
          <label className="text-sm font-medium text-[var(--body-text)] flex items-center gap-2">
            <Package className="h-4 w-4 text-[var(--muted)]" />
            Weight
          </label>
          <div className="mt-2 flex flex-wrap gap-2">
            {WEIGHT_PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => setWeightGrams(preset.value)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  weightGrams === preset.value
                    ? "bg-white/[0.06] text-white border border-white/[0.16]"
                    : "bg-white/[0.03] text-[var(--body-text)] border border-white/10 hover:border-white/25"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
          <input
            type="number"
            min={100}
            max={30000}
            value={weightGrams}
            onChange={(e) => setWeightGrams(Number(e.target.value) || 500)}
            className="mt-2 w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
            placeholder="Custom weight (grams)"
          />

          {/* Volumetric weight */}
          <p className="mt-3 text-xs font-medium text-[var(--muted)]">
            Box dimensions (cm, optional) — couriers bill max(actual, L×W×H÷5000)
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-2">
            {(["l", "w", "h"] as const).map((d) => (
              <input
                key={d}
                type="number"
                min={0}
                value={dims[d] || ""}
                onChange={(e) =>
                  setDims((prev) => ({ ...prev, [d]: Number(e.target.value) || 0 }))
                }
                className="w-full rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
                placeholder={d.toUpperCase()}
                aria-label={`${d === "l" ? "Length" : d === "w" ? "Width" : "Height"} in cm`}
              />
            ))}
          </div>
          {volumetricGrams > weightGrams && (
            <p className="mt-1.5 text-xs text-white">
              Volumetric weight wins: charged as {chargeableGrams} g, not {weightGrams} g
            </p>
          )}
        </div>

        {/* Zone */}
        <div>
          <label className="text-sm font-medium text-[var(--body-text)] flex items-center gap-2">
            <Truck className="h-4 w-4 text-[var(--muted)]" />
            Shipping Zone
          </label>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {ZONES.map((z) => (
              <button
                key={z.value}
                onClick={() => setZone(z.value)}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  zone === z.value
                    ? "bg-white/[0.06] text-white border border-white/[0.16]"
                    : "bg-white/[0.03] text-[var(--body-text)] border border-white/10 hover:border-white/25"
                }`}
              >
                {z.label}
              </button>
            ))}
          </div>
        </div>

        {/* Order value */}
        <div>
          <label className="text-sm font-medium text-[var(--body-text)]">Order Value</label>
          <div className="relative mt-2">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">
              ₹
            </span>
            <input
              type="number"
              min={0}
              value={orderValue}
              onChange={(e) => setOrderValue(Number(e.target.value) || 0)}
              className="w-full rounded-md border border-white/10 bg-white/[0.03] pl-7 pr-3 py-2 text-sm text-white focus:border-white/25 focus:outline-none"
            />
          </div>
        </div>

        {/* COD toggle */}
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-[var(--body-text)]">Cash on Delivery</label>
          <button
            onClick={() => setIsCod(!isCod)}
            className={`relative h-6 w-11 rounded-full transition-colors ${
              isCod ? "bg-white" : "bg-white/[0.06]"
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                isCod ? "translate-x-5" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </div>

      {/* ── RESULTS PANEL ── */}
      <div className="space-y-4">
        {/* Carrier cards */}
        <AnimatePresence mode="popLayout">
          {results.map(({ carrier, result, codUnsupported }, idx) => (
            <CarrierCard
              key={carrier.carrier}
              carrier={carrier}
              result={result}
              isCheapest={idx === 0 && !codUnsupported}
              codUnsupported={codUnsupported}
              zone={zone}
              index={idx}
            />
          ))}
        </AnimatePresence>

        {/* Real vs Advertised callout */}
        {isCod && shiprocketResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel grain rounded-xl border-[var(--danger)]/40 border p-4"
          >
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-[var(--danger)]">Real vs Advertised</p>
                <p className="text-sm text-[var(--body-text)] mt-1">
                  Shiprocket advertised:{" "}
                  <span className="text-white font-medium">
                    ₹{shiprocketBase}/500g
                  </span>{" "}
                  → Actual:{" "}
                  <span className="text-[var(--danger)] font-semibold">
                    ₹{shiprocketActual.toFixed(0)}
                  </span>{" "}
                  after COD + GST + fuel surcharge
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* RTO insight */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel grain rounded-xl border-[var(--danger)]/30 border p-4"
        >
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[var(--danger)]">RTO costs 2x shipping</p>
              <p className="text-sm text-[var(--body-text)] mt-1">
                Forward AND return journey ={" "}
                <span className="text-[var(--danger)] font-semibold">₹{rtoAmount.toFixed(0)}</span>{" "}
                lost per failed delivery (cheapest carrier)
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

/* ── Carrier Card ── */
function CarrierCard({
  carrier,
  result,
  isCheapest,
  codUnsupported = false,
  zone,
  index,
}: {
  carrier: CarrierRate;
  result: ShippingCostResult;
  isCheapest: boolean;
  codUnsupported?: boolean;
  zone: ShippingZone;
  index: number;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: codUnsupported ? 0.45 : 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25, delay: index * 0.05 }}
      className={`glass-panel grain rounded-xl p-4 ${
        isCheapest ? "border-l-4 border-l-[var(--success)]/50 border border-[var(--success)]/20" : ""
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-lg" aria-hidden="true">
            {carrier.emoji}
          </span>
          <span className="text-sm font-semibold text-white">{carrier.carrier}</span>
          {codUnsupported && (
            <span className="rounded-md bg-[var(--danger)]/15 px-2 py-0.5 text-xs font-medium text-[var(--danger)]">
              No COD
            </span>
          )}
          {isCheapest && (
            <span className="rounded-md bg-[var(--success)]/15 px-2 py-0.5 text-xs font-medium text-[var(--success)]">
              Cheapest
            </span>
          )}
        </div>
        <div className="text-right">
          <p
            className={`text-xl font-bold ${
              isCheapest ? "text-[var(--success)]" : "text-white"
            }`}
          >
            ₹<CountUp to={result.totalCost} duration={0.6} />
          </p>
        </div>
      </div>

      {/* Breakdown */}
      <p className="mt-2 text-xs text-[var(--muted)]">
        Base ₹{result.baseCharge} + Weight ₹{result.weightSurcharge} + COD ₹
        {result.codFee} + GST ₹{result.gst.toFixed(0)} + Fuel ₹
        {result.fuelSurcharge.toFixed(0)}
      </p>

      {/* Delivery + RTO */}
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="flex items-center gap-1 text-xs text-[var(--muted)]">
          <Clock className="h-3.5 w-3.5" />
          {carrier.avgDeliveryDays[zone]} days
        </span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-md ${
            carrier.rtoCharges === "full-round-trip"
              ? "bg-[var(--danger)]/10 text-[var(--danger)]"
              : carrier.rtoCharges === "one-way-return"
                ? "bg-white/[0.06] text-white"
                : "bg-[var(--success)]/10 text-[var(--success)]"
          }`}
        >
          {result.rtoRiskLabel}
        </span>
      </div>

      {/* Features */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {carrier.features.map((f) => (
          <span
            key={f}
            className="rounded-md bg-white/[0.03]/80 px-2 py-0.5 text-xs text-[var(--muted)] border border-white/10"
          >
            {f}
          </span>
        ))}
      </div>
    </motion.div>
  );
}
