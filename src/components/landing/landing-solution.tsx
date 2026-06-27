"use client";

import { motion, useReducedMotion } from "framer-motion";
import { Calculator, Map, MessageSquare, Target } from "lucide-react";

const SOLUTIONS = [
  {
    icon: Map,
    title: "Personalized launch plan",
    description:
      "A skill-tree journey — GST, product, supplier, channel, ads — sequenced for your channel and budget, not a generic checklist.",
  },
  {
    icon: Calculator,
    title: "India profit math built in",
    description:
      "Margin calculator with marketplace fees, TCS, GST on fees, and RTO weighting — know break-even ROAS before spending ₹1 on ads.",
  },
  {
    icon: Target,
    title: "Practice before real orders",
    description:
      "COD confirmation simulators, sourcing swipe games, and cashflow timelines — learn expensive lessons without losing money.",
  },
  {
    icon: MessageSquare,
    title: "Mentor voice, not docs",
    description:
      "Consequence-first guidance at every step. One hero SKU first — test the full loop before expanding your catalog.",
  },
];

export function LandingSolution() {
  const reduced = useReducedMotion();

  return (
    <section>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35 }}
      >
        <p className="eyebrow inline-block">How we help</p>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">A co-pilot, not another course</h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6 md:text-base">
          Vendor-neutral guidance with the right tools at each step — built for Meesho, Amazon, Flipkart, and Shopify
          sellers starting from zero.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {SOLUTIONS.map((item, index) => (
          <motion.article
            key={item.title}
            initial={reduced ? false : { opacity: 0, x: index % 2 === 0 ? -12 : 12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: reduced ? 0 : index * 0.08 }}
            className="glass-panel rounded-lg p-5"
          >
            <div className="mb-3 text-cyan-300">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold">{item.title}</h3>
            <p className="text-muted mt-2 text-sm leading-6">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
