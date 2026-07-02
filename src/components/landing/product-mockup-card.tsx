"use client";

import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Circle, Lock } from "lucide-react";

const MOCKUP_STEPS = [
  { label: "GST", status: "done" as const },
  { label: "Product", status: "active" as const },
  { label: "Launch", status: "locked" as const },
  { label: "Ads", status: "locked" as const },
];

type ProductMockupCardProps = {
  className?: string;
  compact?: boolean;
};

export function ProductMockupCard({ className = "", compact = false }: ProductMockupCardProps) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      animate={reduced ? undefined : { y: [0, -10, 0] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className={`product-mockup grain text-neutral-100 ${compact ? "p-4" : "p-5 md:p-6"} ${className}`}
    >
      <div className="flex items-center justify-between gap-3 border-b border-neutral-700 pb-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Your launch plan</p>
          <p className={`font-display font-bold ${compact ? "text-sm" : "text-base"}`}>Step 2 · Pick hero SKU</p>
        </div>
        <span className="rounded-md border border-neutral-600 bg-neutral-800 px-2 py-1 text-[10px] font-semibold text-neutral-300">
          38% done
        </span>
      </div>

      <div className={`mt-4 flex flex-wrap items-center justify-center gap-2 ${compact ? "py-2" : "py-4"}`}>
        {MOCKUP_STEPS.map((step) => (
          <div
            key={step.label}
            className={`flex h-12 w-12 flex-col items-center justify-center rounded-md border text-[9px] font-bold ${
              step.status === "done"
                ? "border-neutral-400 bg-neutral-700 text-white"
                : step.status === "active"
                  ? "border-white bg-white text-black shadow-[0_0_0_4px_rgba(255,255,255,0.12)]"
                  : "border-neutral-700 bg-neutral-900 text-neutral-500"
            }`}
          >
            {step.status === "done" ? (
              <CheckCircle2 className="mb-0.5 h-3 w-3" />
            ) : step.status === "locked" ? (
              <Lock className="mb-0.5 h-3 w-3" />
            ) : (
              <Circle className="mb-0.5 h-3 w-3" />
            )}
            {step.label}
          </div>
        ))}
      </div>

      <div className="mt-3 rounded-md border border-neutral-700 bg-neutral-900 p-3">
        <p className="text-[10px] font-medium uppercase tracking-wide text-neutral-400">Break-even ROAS</p>
        <p className={`font-display font-bold text-white ${compact ? "text-xl" : "text-2xl"}`}>2.4×</p>
        <p className="mt-1 text-[11px] leading-5 text-neutral-500">
          Know your floor before spending ₹1 on Meta or Amazon ads.
        </p>
      </div>
    </motion.div>
  );
}
