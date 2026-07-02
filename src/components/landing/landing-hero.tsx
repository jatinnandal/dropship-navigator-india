"use client";

import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import { MarketplaceLogoLoop } from "@/components/landing/marketplace-logo-loop";
import { ProductMockupCard } from "@/components/landing/product-mockup-card";
import { MagneticButton } from "@/components/motion/magnetic-button";
import { Parallax } from "@/components/motion/parallax";
import { Reveal } from "@/components/motion/reveal";

export function LandingHero() {
  return (
    <div className="relative grid min-h-[85vh] items-center gap-12 py-8 lg:min-h-[92vh] lg:grid-cols-2 lg:gap-10">
      <div className="relative z-10">
        <Reveal from="left">
          <p className="eyebrow-mono inline-block">India-first seller co-pilot</p>
        </Reveal>

        <Reveal from="left" delay={0.06}>
          <h1 className="display-xl mt-5 max-w-2xl text-white">
            E-commerce in India is hard.
            <span className="block text-neutral-400">We guide you through every trap.</span>
          </h1>
        </Reveal>

        <Reveal from="left" delay={0.12}>
          <p className="mt-6 max-w-xl text-base leading-7 text-neutral-400 md:text-lg">
            GST rejections, COD returns, supplier scams, thin margins — most beginners quit before their first payout.
            Dropship Navigator gives you a step-by-step launch plan built for Indian marketplaces.
          </p>
        </Reveal>

        <Reveal from="left" delay={0.18}>
          <div className="mt-8 flex flex-wrap gap-3">
            <MagneticButton
              href="/signup"
              className="btn-landing-primary inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 py-3 font-medium"
            >
              Start free
              <ArrowRight className="h-4 w-4" />
            </MagneticButton>
            <Link href="/login" className="btn-landing-secondary min-h-[44px] rounded-md px-5 py-3 font-medium">
              I already have an account
            </Link>
          </div>
        </Reveal>

        <Reveal from="left" delay={0.24}>
          <MarketplaceLogoLoop />
        </Reveal>
      </div>

      <div className="relative flex items-center justify-center lg:justify-end">
        <Parallax speed={0.22} className="w-full max-w-md">
          <Reveal from="right" delay={0.1}>
            <ProductMockupCard />
          </Reveal>
        </Parallax>
      </div>

      <div className="absolute bottom-2 left-1/2 hidden -translate-x-1/2 lg:block">
        <div className="scroll-cue">
          Scroll
          <span className="scroll-cue-line" aria-hidden />
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}
