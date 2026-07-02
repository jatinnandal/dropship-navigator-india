"use client";

import {
  AlertTriangle,
  Banknote,
  PackageX,
  Scale,
  ShieldAlert,
  Truck,
} from "lucide-react";
import { Reveal } from "@/components/motion/reveal";

const CHALLENGES_LEFT = [
  {
    icon: Truck,
    title: "COD & RTO eat your margin",
    stat: "35%",
    statLabel: "RTO rate on COD",
    description:
      "20–35% of COD orders return unpaid. One bad confirmation call costs you ₹60–90 in forward + reverse shipping.",
    accent: "rose",
  },
  {
    icon: Banknote,
    title: "Revenue is not profit",
    stat: "₹60–90",
    statLabel: "per failed COD order",
    description:
      "Marketplace fees, TCS, RTO losses, and ad spend disappear before money hits your bank. Dashboard sales lie.",
    accent: "rose",
  },
];

const CHALLENGES_RIGHT = [
  {
    icon: Scale,
    title: "GST maze from day one",
    description:
      "Marketplaces require GSTIN before listing. Name mismatches between PAN, bank, and GST block KYC for weeks.",
  },
  {
    icon: PackageX,
    title: "Supplier traps everywhere",
    description:
      "AliExpress looks cheap until 3-week delivery kills COD. IndiaMART traders demand 100% advance with no samples.",
  },
  {
    icon: ShieldAlert,
    title: "Account suspension risk",
    description:
      "Late dispatch, weak listings, and IP complaints trigger listing suppression — often before your first payout.",
  },
  {
    icon: AlertTriangle,
    title: "Cashflow dead zone",
    description:
      "Meta bills today. COD cash arrives day 5–7. Most beginners run out of ad budget in week one.",
  },
];

export function LandingChallenges() {
  return (
    <div className="relative z-10">
      <Reveal from="left">
        <p className="eyebrow-light inline-block">Why beginners quit</p>
        <h2 className="display-lg mt-4 max-w-3xl text-black">
          India e-commerce is not a YouTube tutorial
        </h2>
        <p className="text-muted-light mt-4 max-w-2xl text-base leading-7">
          Every step has a consequence if you skip it. Our co-pilot is built around real seller pain — not generic advice.
        </p>
      </Reveal>

      {/* Asymmetric 2-column bento layout */}
      <div className="mt-12 grid gap-4 md:grid-cols-5">
        {/* Left column — 2 large statement cards */}
        <div className="flex flex-col gap-4 md:col-span-3">
          {CHALLENGES_LEFT.map((item, index) => (
            <Reveal key={item.title} from="left" delay={index * 0.08}>
              <article className="relative overflow-hidden rounded-xl border border-rose-200/60 bg-white p-6 shadow-sm transition-shadow hover:shadow-md md:p-8">
                <div className="absolute -right-4 -top-4 font-display text-[7rem] font-bold leading-none text-rose-50 select-none md:text-[9rem]">
                  {item.stat}
                </div>
                <div className="relative z-10">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-rose-50 text-rose-500">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <span className="text-xs font-semibold uppercase tracking-wider text-rose-500">
                      {item.statLabel}
                    </span>
                  </div>
                  <h3 className="font-display text-xl font-bold text-black md:text-2xl">{item.title}</h3>
                  <p className="text-muted-light mt-3 max-w-lg text-sm leading-6 md:text-base">{item.description}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>

        {/* Right column — 4 compact cards */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {CHALLENGES_RIGHT.map((item, index) => (
            <Reveal key={item.title} from="right" delay={index * 0.06}>
              <article className="h-full rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-3 text-neutral-700">
                  <item.icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-base font-bold text-black">{item.title}</h3>
                <p className="text-muted-light mt-2 text-sm leading-6">{item.description}</p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
