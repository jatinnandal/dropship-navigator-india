"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import CountUp from "@/components/CountUp";
import { PinnedSection } from "@/components/motion/pinned-section";
import { Reveal } from "@/components/motion/reveal";

const PREVIEW_NODES = [
  {
    label: "Docs",
    status: "done" as const,
    title: "Get your paperwork right",
    detail: "GSTIN, PAN match, bank KYC — one mismatch blocks listing for weeks.",
  },
  {
    label: "Product",
    status: "active" as const,
    title: "Pick your hero SKU",
    detail: "One product with margin math done beats ten untested listings.",
  },
  {
    label: "Launch",
    status: "locked" as const,
    title: "Go live on your channel",
    detail: "Meesho, Amazon, or Flipkart — each has different dispatch and KYC rules.",
  },
  {
    label: "Ads",
    status: "locked" as const,
    title: "Spend with a ROAS floor",
    detail: "Know your break-even ROAS before burning budget on Meta or Amazon ads.",
  },
];

export function LandingJourneyPreview() {
  const reduced = useReducedMotion();

  return (
    <section>
      <Reveal>
        <p className="eyebrow inline-block">Inside the app</p>
        <h2 className="font-display mt-3 text-2xl font-bold md:text-3xl">Always know your next step</h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Scroll to walk through a sample launch plan — your real journey unlocks as you complete tasks.
        </p>
      </Reveal>

      <PinnedSection pinHeight="240vh" className="mt-4">
        {(progress) => {
          const activeIndex = Math.min(
            PREVIEW_NODES.length - 1,
            Math.floor(progress * PREVIEW_NODES.length),
          );
          const active = PREVIEW_NODES[activeIndex];

          return (
            <div className="grid gap-4 lg:grid-cols-2">
              {/* Active step card — amber accent */}
              <motion.div
                key={activeIndex}
                initial={reduced ? undefined : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="glass-panel-primary grain rounded-xl border-amber-400/20 p-5 md:p-6"
              >
                <p className="text-xs font-medium uppercase tracking-wide text-amber-200">Do this now</p>
                <h3 className="font-display mt-2 text-lg font-bold md:text-xl">{active.title}</h3>
                <p className="text-muted mt-2 text-sm leading-6">{active.detail}</p>
                {activeIndex === 1 ? (
                  <div className="mt-4 flex flex-wrap items-baseline gap-2">
                    <span className="text-muted text-xs uppercase tracking-wide">Break-even ROAS</span>
                    <span className="font-display text-2xl font-bold text-info">
                      <CountUp to={2.4} duration={1.4} />
                      <span className="text-lg">x</span>
                    </span>
                  </div>
                ) : null}
                <span className="btn-primary mt-4 inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-xs font-medium">
                  Start this step
                  <ArrowRight className="h-3 w-3" />
                </span>
              </motion.div>

              {/* Journey node rail — cyan connectors */}
              <div className="glass-panel rounded-xl p-5 md:p-6">
                <p className="text-muted mb-4 text-xs uppercase tracking-wide">Your launch plan</p>
                <div className="flex flex-wrap items-center justify-center gap-3 py-4">
                  {PREVIEW_NODES.map((node, index) => {
                    const isActive = index === activeIndex;
                    return (
                      <div key={node.label} className="flex items-center gap-3">
                        <motion.div
                          animate={
                            reduced || !isActive
                              ? undefined
                              : {
                                  boxShadow: [
                                    "0 0 0 0 rgba(245,158,11,0)",
                                    "0 0 0 6px rgba(245,158,11,0.12)",
                                    "0 0 0 0 rgba(245,158,11,0)",
                                  ],
                                }
                          }
                          transition={{ duration: 2.2, repeat: Infinity }}
                          className={`flex h-14 w-14 flex-col items-center justify-center rounded-md border-2 text-[10px] font-bold transition-colors ${
                            node.status === "done"
                              ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-200"
                              : isActive
                                ? "border-amber-400/60 bg-amber-400/15 text-amber-200"
                                : "border-slate-600 bg-slate-800/60 text-slate-400"
                          }`}
                        >
                          {node.label}
                        </motion.div>
                        {index < PREVIEW_NODES.length - 1 ? (
                          <div
                            className={`hidden h-px w-6 sm:block ${
                              index < activeIndex ? "bg-emerald-400/40" : "bg-slate-600"
                            }`}
                            aria-hidden="true"
                          />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted text-center text-xs">
                  Step {activeIndex + 1} of {PREVIEW_NODES.length} — keep scrolling
                </p>
              </div>
            </div>
          );
        }}
      </PinnedSection>
    </section>
  );
}
