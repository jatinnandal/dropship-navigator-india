"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Parallax } from "@/components/motion/parallax";
import { ProductMockupCard } from "@/components/landing/product-mockup-card";
import { ScrollAtmosphere } from "@/components/motion/scroll-atmosphere";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

const VALUE_PROPS = [
  "Step-by-step launch plan for Indian marketplaces",
  "Profit math with fees, GST, and RTO built in",
  "Crisis playbooks when you're about to quit",
];

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <SmoothScroll>
      <main className="relative min-h-screen overflow-hidden text-neutral-100">
        <ScrollAtmosphere />

        <div className="relative z-10 mx-auto grid min-h-screen w-full max-w-6xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-14">
          <motion.div
            initial={{ opacity: 0, x: -32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="auth-brand-panel grain relative hidden overflow-hidden rounded-2xl p-8 lg:block"
          >
            <p className="eyebrow-mono inline-block">Dropship Navigator India</p>
            <h1 className="font-display mt-4 text-3xl font-bold leading-tight text-white md:text-4xl">
              Your seller co-pilot for GST, margins, and launch day.
            </h1>
            <ul className="mt-6 space-y-3">
              {VALUE_PROPS.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm leading-6 text-neutral-400">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-10 max-w-sm">
              <Parallax speed={0.12}>
                <ProductMockupCard compact />
              </Parallax>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="w-full"
          >
            <div className="rounded-xl border border-neutral-800 bg-neutral-950/90 p-6 shadow-2xl backdrop-blur-md sm:p-8">
              {children}
            </div>
          </motion.div>
        </div>
      </main>
    </SmoothScroll>
  );
}
