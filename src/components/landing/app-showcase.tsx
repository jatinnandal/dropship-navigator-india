"use client";

import { motion, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";
import { PinnedSection } from "@/components/motion/pinned-section";
import { Reveal } from "@/components/motion/reveal";

const SCENES = [
  {
    step: "01",
    title: "Answer 10 quick questions",
    detail: "Channel, budget, product type, GST status — we explain why each answer matters for your launch plan.",
    stat: null as { label: string; value: number; suffix: string } | null,
    panel: (
      <div className="space-y-3">
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-3">
          <p className="text-xs text-neutral-400">Which channel first?</p>
          <p className="mt-1 font-medium text-neutral-100">Meesho · Low upfront cost</p>
        </div>
        <div className="rounded-md border border-neutral-700 bg-neutral-900 p-3">
          <p className="text-xs text-neutral-400">Monthly ad budget?</p>
          <p className="mt-1 font-medium text-neutral-100">₹5,000 – ₹15,000</p>
        </div>
        <div className="rounded-md border border-white/30 bg-neutral-800 p-3">
          <p className="text-xs text-neutral-400">GST registered?</p>
          <p className="mt-1 font-medium text-neutral-100">Not yet — show me the path</p>
        </div>
      </div>
    ),
  },
  {
    step: "02",
    title: "Get your personalized launch plan",
    detail: "A skill-tree journey — GST, product, supplier, channel, ads — sequenced for your answers, not a generic checklist.",
    stat: null,
    panel: (
      <div className="flex flex-wrap justify-center gap-2 py-2">
        {["Docs", "Product", "Supplier", "Launch", "Ads"].map((node, i) => (
          <div
            key={node}
            className={`flex h-14 w-14 flex-col items-center justify-center rounded-md border-2 text-[10px] font-bold ${
              i === 0
                ? "border-neutral-400 bg-neutral-700 text-white"
                : i === 1
                  ? "border-white bg-white text-black"
                  : "border-neutral-700 bg-neutral-900 text-neutral-500"
            }`}
          >
            {node}
          </div>
        ))}
      </div>
    ),
  },
  {
    step: "03",
    title: "India profit math built in",
    detail: "Margin calculator with marketplace fees, TCS, GST on fees, and RTO weighting — know break-even ROAS before spending.",
    stat: { label: "Break-even ROAS", value: 2.4, suffix: "×" },
    panel: (
      <div className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-md bg-neutral-900 p-3">
          <p className="text-xs text-neutral-500">Selling price</p>
          <p className="font-display font-bold text-white">₹599</p>
        </div>
        <div className="rounded-md bg-neutral-900 p-3">
          <p className="text-xs text-neutral-500">Net margin</p>
          <p className="font-display font-bold text-white">₹142</p>
        </div>
        <div className="col-span-2 rounded-md border border-neutral-700 bg-neutral-900 p-3">
          <p className="text-xs text-neutral-400">After fees + 25% RTO assumption</p>
        </div>
      </div>
    ),
  },
  {
    step: "04",
    title: "Track progress & recover from quit moments",
    detail: "Dashboard tells you what to do now. Crisis playbooks kick in when you're stuck — before you abandon the business.",
    stat: { label: "Launch progress", value: 38, suffix: "%" },
    panel: (
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-neutral-500">Journey complete</span>
          <span className="font-semibold text-white">38%</span>
        </div>
        <div className="progress-track">
          <div className="progress-fill-mono" style={{ width: "38%" }} />
        </div>
        <div className="mt-3 rounded-md border border-neutral-600 bg-neutral-900 p-3 text-xs leading-5 text-neutral-300">
          At-risk: GST name mismatch — fix before listing goes live.
        </div>
      </div>
    ),
  },
];

export function AppShowcase() {
  const reduced = useReducedMotion();

  return (
    <div>
      <Reveal>
        <p className="eyebrow-mono inline-block">Inside the app</p>
        <h2 className="display-lg mt-4 max-w-2xl text-white">Watch your launch plan come alive</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
          Scroll to walk through the co-pilot — from first questions to profit math and recovery when things go wrong.
        </p>
      </Reveal>

      <PinnedSection pinHeight="300vh" className="mt-6">
        {(progress) => {
          const activeIndex = Math.min(SCENES.length - 1, Math.floor(progress * SCENES.length));
          const scene = SCENES[activeIndex];
          const sceneProgress = progress * SCENES.length - activeIndex;

          return (
            <div className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-12">
              <div>
                <div className="mb-8 flex flex-wrap gap-2">
                  {SCENES.map((s, index) => {
                    const isActive = index === activeIndex;
                    const isPast = index < activeIndex;
                    return (
                      <button
                        key={s.step}
                        type="button"
                        className={`flex min-w-[4.5rem] flex-col items-start rounded-md border px-3 py-2 text-left transition-colors ${
                          isActive
                            ? "border-white bg-white text-black"
                            : isPast
                              ? "border-neutral-500 bg-neutral-800 text-neutral-200"
                              : "border-neutral-700 bg-neutral-900 text-neutral-500"
                        }`}
                        aria-current={isActive ? "step" : undefined}
                      >
                        <span className="font-mono text-[10px] font-semibold opacity-80">{s.step}</span>
                        <span className="font-display text-xs font-bold leading-tight">
                          {s.step === "01"
                            ? "Setup"
                            : s.step === "02"
                              ? "Plan"
                              : s.step === "03"
                                ? "Math"
                                : "Track"}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <motion.div
                  key={scene.step}
                  initial={reduced ? false : { opacity: 0, x: -32 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: reduced ? 0 : 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <p className="font-mono text-sm font-semibold text-neutral-400">{scene.step}</p>
                  <h3 className="font-display mt-2 text-2xl font-bold text-white md:text-3xl">{scene.title}</h3>
                  <p className="mt-3 max-w-lg text-sm leading-7 text-neutral-400 md:text-base">{scene.detail}</p>
                  {scene.stat ? (
                    <div className="mt-5 flex items-baseline gap-2">
                      <span className="text-xs uppercase tracking-wide text-neutral-500">{scene.stat.label}</span>
                      <span className="font-display text-3xl font-bold text-white">
                        <CountUp to={scene.stat.value} duration={1.2} />
                        {scene.stat.suffix}
                      </span>
                    </div>
                  ) : null}
                </motion.div>
              </div>

              <motion.div
                className="product-mockup grain relative overflow-hidden p-6 md:p-8"
                animate={
                  reduced
                    ? { opacity: 1, x: 0 }
                    : {
                        x: (sceneProgress - 0.5) * 24,
                        opacity: 0.92 + sceneProgress * 0.08,
                      }
                }
                transition={{ duration: reduced ? 0 : 0.25, ease: "easeOut" }}
              >
                <div className="mb-4 flex items-center gap-2 border-b border-neutral-700 pb-3">
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-500" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-400" />
                  <span className="h-2.5 w-2.5 rounded-full bg-neutral-300" />
                  <span className="ml-2 text-xs text-neutral-500">Dropship Navigator</span>
                </div>
                <motion.div
                  key={`panel-${activeIndex}`}
                  initial={reduced ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: reduced ? 0 : 0.35 }}
                >
                  {scene.panel}
                </motion.div>
              </motion.div>
            </div>
          );
        }}
      </PinnedSection>
    </div>
  );
}
