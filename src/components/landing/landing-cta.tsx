"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Reveal } from "@/components/motion/reveal";

export function LandingCta() {
  return (
    <Reveal>
      <div className="relative z-10 text-center">
        <h2 className="font-display text-3xl font-bold text-black md:text-4xl lg:text-5xl">
          Ready to launch the right way?
        </h2>
        <p className="text-muted-light mx-auto mt-4 max-w-xl text-base leading-7">
          Join sellers building real businesses in India — with a co-pilot that tells you what to do next, not what to
          Google.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <MagneticButton
            href="/signup"
            className="btn-landing-primary-on-light inline-flex min-h-[44px] items-center gap-2 rounded-md px-6 py-3 font-medium"
          >
            Get started free
            <ArrowRight className="h-4 w-4" />
          </MagneticButton>
          <Link
            href="/login"
            className="btn-landing-secondary-on-light inline-flex min-h-[44px] items-center rounded-md px-6 py-3 font-medium"
          >
            Log in
          </Link>
        </div>
      </div>
    </Reveal>
  );
}
