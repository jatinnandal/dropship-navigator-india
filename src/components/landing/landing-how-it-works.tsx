"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ClipboardList, Compass, UserPlus } from "lucide-react";

const STEPS = [
  {
    icon: UserPlus,
    step: "1",
    title: "Create your account",
    description: "Sign up with email or Google — your progress saves to your account, not a browser cookie.",
  },
  {
    icon: ClipboardList,
    step: "2",
    title: "Answer 10 quick questions",
    description: "Channel, budget, product type, GST status — we explain why each answer matters.",
  },
  {
    icon: Compass,
    step: "3",
    title: "Follow your launch plan",
    description: "Dashboard tells you what to do now. Journey map shows what's done, locked, and next.",
  },
];

export function LandingHowItWorks() {
  const reduced = useReducedMotion();

  return (
    <section>
      <p className="eyebrow inline-block">How it works</p>
      <h2 className="mt-3 text-2xl font-bold md:text-3xl">From confused to first listing in days, not months</h2>

      <div className="mt-8 grid gap-6 md:grid-cols-3">
        {STEPS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.35, delay: reduced ? 0 : index * 0.1 }}
            className="relative"
          >
            {index < STEPS.length - 1 ? (
              <div
                className="pointer-events-none absolute left-[calc(50%+2rem)] top-8 hidden h-px w-[calc(100%-4rem)] bg-gradient-to-r from-amber-400/40 to-cyan-400/40 md:block"
                aria-hidden="true"
              />
            ) : null}
            <article className="glass-panel h-full rounded-lg p-5 text-center md:text-left">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-amber-400/15 text-amber-200 md:mx-0">
                <item.icon className="h-5 w-5" />
              </div>
              <p className="text-xs font-medium uppercase tracking-wide text-cyan-200">Step {item.step}</p>
              <h3 className="mt-1 text-base font-bold">{item.title}</h3>
              <p className="text-muted mt-2 text-sm leading-6">{item.description}</p>
            </article>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
