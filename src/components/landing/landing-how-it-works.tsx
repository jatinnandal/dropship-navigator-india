"use client";

import { ClipboardList, Compass, UserPlus } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { Reveal } from "@/components/motion/reveal";

const STEPS = [
  {
    icon: UserPlus,
    step: "01",
    title: "Create your account",
    description: "Sign up with email or Google — your progress saves to your account, not a browser cookie.",
  },
  {
    icon: ClipboardList,
    step: "02",
    title: "Answer 10 quick questions",
    description: "Channel, budget, product type, GST status — we explain why each answer matters.",
  },
  {
    icon: Compass,
    step: "03",
    title: "Follow your launch plan",
    description: "Dashboard tells you what to do now. Journey map shows what's done, locked, and next.",
  },
];

export function LandingHowItWorks() {
  const reduced = useReducedMotion();

  return (
    <div className="relative z-10">
      <Reveal from="right">
        <p className="eyebrow-light inline-block">How it works</p>
        <h2 className="display-lg mt-4 max-w-3xl text-black">
          From confused to first listing in days, not months
        </h2>
      </Reveal>

      {/* Vertical stepped timeline */}
      <div className="mt-16 space-y-0">
        {STEPS.map((item, index) => (
          <motion.div
            key={item.title}
            initial={reduced ? { opacity: 0 } : { opacity: 0, x: index % 2 === 0 ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{
              duration: reduced ? 0.3 : 0.6,
              delay: reduced ? 0 : index * 0.12,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative flex gap-6 pb-16 last:pb-0 md:gap-10">
              {/* Timeline spine */}
              <div className="relative flex flex-col items-center">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-neutral-300 bg-white font-display text-lg font-bold text-black shadow-sm">
                  {item.step}
                </div>
                {index < STEPS.length - 1 && (
                  <div className="mt-2 w-px grow bg-gradient-to-b from-neutral-300 to-neutral-100" />
                )}
              </div>

              {/* Content card */}
              <div className="relative flex-1 rounded-xl border border-neutral-200 bg-white p-6 shadow-sm md:p-8">
                {/* Watermark step number */}
                <span
                  className="absolute -top-3 right-4 font-display text-[6rem] font-bold leading-none text-neutral-100/80 select-none md:right-8 md:text-[8rem]"
                  aria-hidden
                >
                  {item.step}
                </span>

                <div className="relative z-10">
                  <div className="flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-black">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display mt-4 text-lg font-bold text-black md:text-xl">{item.title}</h3>
                  <p className="text-muted-light mt-2 max-w-md text-sm leading-6 md:text-base">{item.description}</p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
