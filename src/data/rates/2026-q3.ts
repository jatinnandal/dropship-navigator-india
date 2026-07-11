import type { RateCard } from "@/lib/rate-card";

/**
 * 2026 Q3 card — verified 2026-07-09. Next verification pass due early
 * October 2026 (see CHANGELOG.md for the process).
 */
export const RATES_2026_Q3: RateCard = {
  meta: {
    version: "2026-Q3",
    lastVerified: "2026-07-09",
    sources: [
      "sell.amazon.in/fees-and-pricing (0% referral ≤ ₹1,000 in eligible categories, Mar 16 2026)",
      "seller.flipkart.com/fees-and-commission (commission + fixed fee + collection fee by payment mode)",
      "supplier.meesho.com/pricing (0% commission + platform fee)",
      "taxguru.in (TCS 0.5% effective July 2024)",
    ],
    changelog: [
      "Amazon: 0% referral fee for products ≤ ₹1,000 in eligible categories (apparel, beauty, grocery, home & kitchen — effective Mar 16, 2026). Electronics keeps its normal card.",
      "Amazon: referral above ₹1,000 re-verified per category (fashion 13%, beauty 7%, grocery 7%, general 11%).",
      "Flipkart, Meesho, TCS, shipping bands: re-verified, unchanged from Q1.",
    ],
  },
  amazonReferral: {
    fashion:     [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 13 }],
    electronics: [{ maxPrice: 500, percent: 8 }, { maxPrice: Infinity, percent: 9.5 }],
    beauty:      [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 7 }],
    food:        [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 7 }],
    general:     [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 11 }],
  },
  amazonClosingFee: [
    { maxPrice: 300, fee: 20 },
    { maxPrice: 500, fee: 26 },
    { maxPrice: 1000, fee: 30 },
    { maxPrice: Infinity, fee: 35 },
  ],
  flipkartCommission: {
    fashion: 14,
    electronics: 6,
    beauty: 8,
    food: 7,
    general: 11,
  },
  flipkartFixedFee: [
    { maxPrice: 250, fee: 8 },
    { maxPrice: 500, fee: 17 },
    { maxPrice: 1000, fee: 30 },
    { maxPrice: Infinity, fee: 35 },
  ],
  flipkartCodCollection: [
    { maxPrice: 500, fee: 10 },
    { maxPrice: 1000, fee: 20 },
    { maxPrice: Infinity, fee: 30 },
  ],
  flipkartPrepaidCollectionPercent: 2,
  meeshoPlatformFee: 27,
  shopifyGatewayPercent: 2,
  tcsPercent: 0.5,
  gstOnFees: 0.18,
  typicalShipping: {
    amazon: { light: 65, medium: 85, heavy: 120 },
    flipkart: { light: 55, medium: 75, heavy: 110 },
    meesho: { light: 50, medium: 70, heavy: 100 },
    shopify: { light: 60, medium: 80, heavy: 115 },
  },
};
