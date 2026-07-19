import { PLAN_PRICES, type Plan } from "@/lib/entitlements";

export type PlanCard = {
  plan: Plan;
  name: string;
  tagline: string;
  priceMonthly: number;
  priceYearly: number | null;
  features: string[];
  highlight: boolean;
};

export const PLAN_CARDS: PlanCard[] = [
  {
    plan: "free",
    name: "Scout",
    tagline: "See how the mentor works - free forever.",
    priceMonthly: 0,
    priceYearly: null,
    features: [
      "Journey module 1: pick your product with real margin math",
      "Profit margin calculator (verified 2026 rate card)",
      "Shipping cost estimator - real courier rates",
      "Seasonal sale calendar",
      "1 seller profile",
    ],
    highlight: false,
  },
  {
    plan: "starter",
    name: "Starter",
    tagline: "The full mentor, for the price of a chai.",
    priceMonthly: PLAN_PRICES.starter.monthly,
    priceYearly: PLAN_PRICES.starter.yearly,
    features: [
      "Full 7-module launch journey, personalized",
      "Every calculator & simulator - cashflow, ROAS, COD mix, scorecards",
      "GST filing calendar + document checker + decision wizards",
      "Crisis protocols: account suspension & supplier out-of-stock",
      "2 seller profiles - test a second niche",
      "1 payout reconciliation per month",
      "Weekly profit review on your dashboard",
    ],
    highlight: true,
  },
  {
    plan: "growth",
    name: "Growth",
    tagline: "For sellers with real order flow.",
    priceMonthly: PLAN_PRICES.growth.monthly,
    priceYearly: PLAN_PRICES.growth.yearly,
    features: [
      "Everything in Starter",
      "5 seller profiles - run niches side-by-side",
      "Unlimited payout reconciliations · 12-month order-level history",
      "Full crisis pack: payment holds, IP complaints, GST notices, courier disputes, review attacks",
      "Rate-change alerts on your saved products",
      "Priority support",
    ],
    highlight: false,
  },
];
