"use client";

import { Calculator, Map, MessageSquare, Target } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";
import { TiltCard } from "@/components/motion/tilt-card";

const SOLUTIONS = [
  {
    icon: Map,
    title: "Personalized launch plan",
    description:
      "A skill-tree journey — GST, product, supplier, channel, ads — sequenced for your channel and budget, not a generic checklist.",
    span: "bento-span-8",
    drift: 0.14,
  },
  {
    icon: Calculator,
    title: "India profit math built in",
    description:
      "Margin calculator with marketplace fees, TCS, GST on fees, and RTO weighting — know break-even ROAS before spending ₹1 on ads.",
    span: "bento-span-4",
    drift: -0.12,
  },
  {
    icon: Target,
    title: "Practice before real orders",
    description:
      "COD confirmation simulators, sourcing swipe games, and cashflow timelines — learn expensive lessons without losing money.",
    span: "bento-span-6",
    drift: 0.1,
  },
  {
    icon: MessageSquare,
    title: "Mentor voice, not docs",
    description:
      "Consequence-first guidance at every step. One hero SKU first — test the full loop before expanding your catalog.",
    span: "bento-span-6",
    drift: -0.1,
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
              <TiltCard className="glass-panel-mono h-full rounded-lg p-6 md:p-7">
                <div className="mb-3 text-neutral-300">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-lg font-bold text-white md:text-xl">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-neutral-400 md:text-base">{item.description}</p>
              </TiltCard>
            </Parallax>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
