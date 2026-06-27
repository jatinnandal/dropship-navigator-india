"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const PREVIEW_NODES = [
  { label: "Docs", status: "done" as const },
  { label: "Product", status: "active" as const },
  { label: "Launch", status: "locked" as const },
  { label: "Ads", status: "locked" as const },
];

export function LandingJourneyPreview() {
  const reduced = useReducedMotion();

  return (
    <section>
      <p className="eyebrow inline-block">Inside the app</p>
      <h2 className="mt-3 text-2xl font-bold md:text-3xl">Always know your next step</h2>
      <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
        No guessing what to do today. The dashboard pins one action with time estimate and consequence-first why.
      </p>

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.4 }}
        className="mt-8 grid gap-4 lg:grid-cols-2"
      >
        <div className="glass-panel-primary rounded-xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-200">Do this now</p>
          <h3 className="mt-2 text-lg font-bold">Pick your hero SKU</h3>
          <p className="text-muted mt-2 text-sm leading-6">
            One product with margin math done beats ten untested listings. Estimated time: ~45 mins.
          </p>
          <span className="btn-primary mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-xs font-medium">
            Start this step
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="glass-panel rounded-xl p-5">
          <p className="text-muted mb-4 text-xs uppercase tracking-wide">Your launch plan</p>
          <div className="flex flex-wrap items-center justify-center gap-3 py-4">
            {PREVIEW_NODES.map((node, index) => (
              <div key={node.label} className="flex items-center gap-3">
                <motion.div
                  animate={
                    reduced || node.status !== "active"
                      ? undefined
                      : { boxShadow: ["0 0 0 0 rgba(245,158,11,0)", "0 0 0 8px rgba(245,158,11,0.15)", "0 0 0 0 rgba(245,158,11,0)"] }
                  }
                  transition={{ duration: 2, repeat: Infinity }}
                  className={`flex h-14 w-14 flex-col items-center justify-center rounded-full border-2 text-[10px] font-bold ${
                    node.status === "done"
                      ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                      : node.status === "active"
                        ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                        : "border-slate-600 bg-slate-800/60 text-slate-400"
                  }`}
                >
                  {node.label}
                </motion.div>
                {index < PREVIEW_NODES.length - 1 ? (
                  <div className="hidden h-px w-6 bg-slate-600 sm:block" aria-hidden="true" />
                ) : null}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
