"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export function LandingHero() {
  const reduced = useReducedMotion();

  return (
    <section className="relative overflow-hidden">
      <div className="pointer-events-none absolute left-0 top-0 h-32 w-32 rounded-full bg-cyan-400/20 blur-3xl ambient-orb" />
      <div className="pointer-events-none absolute right-10 top-16 h-28 w-28 rounded-full bg-amber-400/20 blur-3xl ambient-orb" />

      <motion.div
        initial={reduced ? false : { opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="glass-panel-primary relative rounded-2xl p-8 md:p-12"
      >
        <p className="eyebrow inline-block">India-first seller co-pilot</p>
        <h1 className="headline-gradient mt-4 max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
          E-commerce in India is hard. We guide you through every trap.
        </h1>
        <p className="text-muted mt-5 max-w-2xl text-base leading-7 md:text-lg">
          GST rejections, COD returns, supplier scams, thin margins — most beginners quit before their first payout.
          Dropship Navigator gives you a step-by-step launch plan built for Indian marketplaces.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/signup"
            className="btn-emerald inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 py-3 font-medium"
          >
            Start free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/login" className="btn-ghost min-h-[44px] rounded-md px-5 py-3 font-medium">
            I already have an account
          </Link>
        </div>
      </motion.div>
    </section>
  );
}
