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

const CHALLENGES = [
  {
    icon: Truck,
    title: "COD & RTO eat your margin",
    description:
      "20–35% of COD orders return unpaid. One bad confirmation call costs you ₹60–90 in forward + reverse shipping.",
  },
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
    icon: Banknote,
    title: "Revenue is not profit",
    description:
      "Marketplace fees, TCS, RTO losses, and ad spend disappear before money hits your bank. Dashboard sales lie.",
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

      <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {CHALLENGES.map((item, index) => (
          <Reveal key={item.title} from="left" delay={index * 0.07}>
            <article className="h-full rounded-lg border border-neutral-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="mb-3 text-black">
                <item.icon className="h-5 w-5" />
              </div>
              <h3 className="font-display text-base font-bold text-black">{item.title}</h3>
              <p className="text-muted-light mt-2 text-sm leading-6">{item.description}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
