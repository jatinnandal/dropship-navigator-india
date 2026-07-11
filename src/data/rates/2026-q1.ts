import type { RateCard } from "@/lib/rate-card";

/**
 * 2026 Q1 card — the state of play BEFORE Amazon's Mar 16, 2026 zero-referral
 * program. Kept so saved calculator snapshots can be diffed across versions.
 */
export const RATES_2026_Q1: RateCard = {
  meta: {
    version: "2026-Q1",
    lastVerified: "2026-01-15",
    sources: [
      "sell.amazon.in/fees-and-pricing",
      "seller.flipkart.com/fees-and-commission",
      "supplier.meesho.com/pricing",
      "taxguru.in (TCS 0.5% effective July 2024)",
    ],
    changelog: [],
  },
  amazonReferral: {
    fashion:     [{ maxPrice: Infinity, percent: 13 }],
    electronics: [{ maxPrice: 500, percent: 8 }, { maxPrice: Infinity, percent: 9.5 }],
    beauty:      [{ maxPrice: Infinity, percent: 7 }],
    food:        [{ maxPrice: Infinity, percent: 7 }],
    general:     [{ maxPrice: Infinity, percent: 11 }],
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
