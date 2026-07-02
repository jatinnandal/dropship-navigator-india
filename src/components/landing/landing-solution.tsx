"use client";

import { Calculator, Map, MessageSquare, Target } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

const SOLUTIONS = [
  {
    icon: Map,
    emoji: "🗺️",
    title: "Personalized launch plan",
    description:
      "A skill-tree journey — GST, product, supplier, channel, ads — sequenced for your channel and budget, not a generic checklist.",
    span: "bento-span-8",
    drift: 0.14,
    featured: true,
  },
  {
    icon: Calculator,
    emoji: "🧮",
    title: "India profit math built in",
    description:
      "Margin calculator with marketplace fees, TCS, GST on fees, and RTO weighting — know break-even ROAS before spending ₹1 on ads.",
    span: "bento-span-4",
    drift: -0.12,
    featured: false,
  },
  {
    icon: Target,
    emoji: "🎯",
    title: "Practice before real orders",
    description:
      "COD confirmation simulators, sourcing swipe games, and cashflow timelines — learn expensive lessons without losing money.",
    span: "bento-span-6",
    drift: 0.1,
    featured: false,
  },
  {
    icon: MessageSquare,
    emoji: "💬",
    title: "Mentor voice, not docs",
    description:
      "Consequence-first guidance at every step. One hero SKU first — test the full loop before expanding your catalog.",
    span: "bento-span-6",
    drift: -0.1,
    featured: false,
  },
];

export function LandingSolution() {
  return (
    <div>
      <Reveal from="right">
        <p className="eyebrow-mono inline-block">How we help</p>
        <h2 className="display-lg mt-4 max-w-3xl text-white">A co-pilot, not another course</h2>
        <p className="mt-4 max-w-2xl text-base leading-7 text-neutral-400">
          Vendor-neutral guidance with the right tools at each step — built for Meesho, Amazon, Flipkart, and Shopify
          sellers starting from zero.
        </p>
      </Reveal>

      <div className="bento-grid mt-12">
        {SOLUTIONS.map((item, index) => (
          <Reveal key={item.title} from={index % 2 === 0 ? "left" : "right"} delay={index * 0.06} className={item.span}>
            <Parallax speed={item.drift}>
              <TiltCard
                className={`h-full rounded-lg p-6 md:p-7 ${
                  item.featured
                    ? "border border-amber-400/20 bg-[rgba(12,24,41,0.92)] shadow-[var(--glow-amber)] backdrop-blur-[14px]"
                    : "glass-panel-mono"
                }`}
              >
                <div className="mb-3 flex items-center gap-3">
                  <span className="text-2xl" role="img" aria-hidden>
                    {item.emoji}
                  </span>
                  <div className="text-neutral-400">
                    <item.icon className="h-5 w-5" />
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-white md:text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400 md:text-base">{item.description}</p>
                {item.featured && (
                  <div className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-amber-400/20 bg-amber-400/10 px-3 py-1 text-xs font-semibold text-amber-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                    Most popular
                  </div>
                )}
              </TiltCard>
            </Parallax>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
