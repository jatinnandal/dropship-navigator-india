"use client";

import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Banknote,
  PackageX,
  Scale,
  ShieldAlert,
  Truck,
} from "lucide-react";

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
  const reduced = useReducedMotion();

  return (
    <section>
      <motion.div
        initial={reduced ? false : { opacity: 0, y: 12 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.35 }}
      >
        <p className="eyebrow inline-block">Why beginners quit</p>
        <h2 className="mt-3 text-2xl font-bold md:text-3xl">India e-commerce is not a YouTube tutorial</h2>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6 md:text-base">
          Every step has a consequence if you skip it. Our co-pilot is built around real seller pain — not generic
          advice.
        </p>
      </motion.div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CHALLENGES.map((item, index) => (
          <motion.article
            key={item.title}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.35, delay: reduced ? 0 : index * 0.06 }}
            className="glass-panel surface-hover rounded-lg p-5"
          >
            <div className="mb-3 text-amber-300">
              <item.icon className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold">{item.title}</h3>
            <p className="text-muted mt-2 text-sm leading-6">{item.description}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
