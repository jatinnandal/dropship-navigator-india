"use client";

import { ClipboardList, Compass, UserPlus } from "lucide-react";
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
  return (
    <div className="relative z-10">
      <Reveal from="right">
        <p className="eyebrow-light inline-block">How it works</p>
        <h2 className="display-lg mt-4 max-w-3xl text-black">
          From confused to first listing in days, not months
        </h2>
      </Reveal>

      <div className="mt-12 grid gap-8 md:grid-cols-3">
        {STEPS.map((item, index) => (
          <Reveal key={item.title} from="up" delay={index * 0.1}>
            <article className="relative rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
              <p className="font-display text-5xl font-bold leading-none text-neutral-200 md:text-6xl">{item.step}</p>
              <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-md border border-neutral-200 bg-neutral-100 text-black">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display mt-4 text-lg font-bold text-black">{item.title}</h3>
              <p className="text-muted-light mt-2 text-sm leading-6">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
