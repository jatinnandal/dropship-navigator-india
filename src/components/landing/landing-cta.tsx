"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import CountUp from "@/components/CountUp";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

const AVATAR_COLORS = [
  "bg-amber-400",
  "bg-cyan-400",
  "bg-emerald-400",
  "bg-rose-400",
  "bg-violet-400",
  "bg-orange-400",
];

export function LandingCta() {
  return (
    <Reveal>
      <div className="relative z-10 text-center">
        {/* Social proof stat line */}
        <div className="mx-auto mb-6 flex flex-col items-center gap-4">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {AVATAR_COLORS.map((color, i) => (
              <div
                key={i}
                className={`h-8 w-8 rounded-full border-2 border-white ${color} shadow-sm`}
                aria-hidden
              />
            ))}
            <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-neutral-200 text-[10px] font-bold text-neutral-600 shadow-sm">
              +<CountUp to={494} duration={2} />
            </div>
          </div>
          <p className="text-sm font-medium text-neutral-600">
            Join <span className="font-bold text-black"><CountUp to={500} duration={2} separator="," />+</span> Indian sellers building real businesses
          </p>
        </div>

        <h2 className="font-display text-3xl font-bold text-black md:text-4xl lg:text-5xl">
          Ready to launch the right way?
        </h2>
        <p className="text-muted-light mx-auto mt-4 max-w-xl text-base leading-7">
          A co-pilot that tells you what to do next, not what to Google. Free to start — no credit card required.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <MagneticButton
            href="/signup"
            className="btn-landing-primary-on-light inline-flex min-h-[52px] items-center gap-2 rounded-md px-8 py-4 text-lg font-semibold"
          >
            Get started free
            <ArrowRight className="h-5 w-5" />
          </MagneticButton>
          <Link
            href="/login"
            className="btn-landing-secondary-on-light inline-flex min-h-[52px] items-center rounded-md px-8 py-4 text-lg font-medium"
          >
            Log in
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
