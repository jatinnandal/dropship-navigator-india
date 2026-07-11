import { CURRENT_RATES } from "@/data/rates";
import type { FeeBand, RateCard, ReferralEntry, WeightBracket } from "@/lib/rate-card";
import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";

export type { WeightBracket } from "@/lib/rate-card";
export type PaymentMode = "prepaid" | "cod";

/**
 * Freshness metadata for UI badges. Derived from the active rate card —
 * bumping the card version updates every "Rates verified" badge at once.
 */
export const MARKETPLACE_FEES_META = {
  lastVerified: CURRENT_RATES.meta.lastVerified,
  sources: CURRENT_RATES.meta.sources,
} as const;

export const WEIGHT_BRACKET_LABELS: Record<WeightBracket, string> = {
  light: "Light (<500g)",
  medium: "Medium (500g–1kg)",
  heavy: "Heavy (1–5kg)",
};

// Rate tables live in versioned cards under src/data/rates/ (one file per
// quarter + CHANGELOG.md). They are estimates for the broad category buckets
// this app models — real rate cards are subcategory-level and account-specific,
// so every consumer UI must label them as estimates.

// ── Lookup helpers ──

function lookupBand(bands: FeeBand[], price: number): number {
  for (const b of bands) {
    if (price <= b.maxPrice) return b.fee;
  }
  return bands[bands.length - 1].fee;
}

function lookupReferral(bands: ReferralEntry[], price: number): number {
  for (const b of bands) {
    if (price <= b.maxPrice) return b.percent;
  }
  return bands[bands.length - 1].percent;
}

// ── Computed fee output ──

export type ComputedFees = {
  channel: PrimaryChannel;
  name: string;
  referralPercent: number;
  /** Commission/referral — typically REVERSED by the marketplace on RTO. */
  referralFee: number;
  closingFee: number;
  fixedFee: number;
  /** One collection fee per order (payment-mode dependent on Flipkart). */
  codCollectionFee: number;
  platformFee: number;
  paymentGatewayPercent: number;
  paymentGatewayFee: number;
  gstOnFeesPercent: 18;
  gstOnFees: number;
  tcsPercent: number;
  tcs: number;
  totalFees: number;
  /**
   * Portion of totalFees NOT refunded when the order RTOs (fixed/closing/
   * collection fees + their GST). Referral + TCS are treated as reversed.
   * Assumption is labelled in UI — actual reversal varies by platform/case.
   */
  nonRefundableOnRto: number;
  /** Extra caveat the UI must surface (e.g. Shopify plan cost not included). */
  caveat?: string;
  typicalShipping: Record<WeightBracket, number>;
};

export function getFeesForProduct(
  channel: PrimaryChannel,
  category: ProductType,
  sellingPrice: number,
  isCod = false,
  rates: RateCard = CURRENT_RATES,
): ComputedFees {
  const price = Math.max(0, sellingPrice);
  const gstRate = rates.gstOnFees;

  switch (channel) {
    case "amazon": {
      const referralPercent = lookupReferral(
        rates.amazonReferral[category] ?? rates.amazonReferral.general,
        price,
      );
      const referralFee = price * (referralPercent / 100);
      const closingFee = lookupBand(rates.amazonClosingFee, price);
      const feesBeforeGst = referralFee + closingFee;
      const gstOnFees = feesBeforeGst * gstRate;
      const tcs = price * (rates.tcsPercent / 100);
      return {
        channel, name: "Amazon",
        referralPercent, referralFee,
        closingFee, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: 0, paymentGatewayFee: 0,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: rates.tcsPercent, tcs,
        totalFees: feesBeforeGst + gstOnFees + tcs,
        nonRefundableOnRto: closingFee * (1 + gstRate),
        caveat: "Easy Ship assumed — FBA adds storage/pick-pack fees",
        typicalShipping: rates.typicalShipping.amazon,
      };
    }

    case "flipkart": {
      const referralPercent = rates.flipkartCommission[category] ?? rates.flipkartCommission.general;
      const referralFee = price * (referralPercent / 100);
      const fixedFee = lookupBand(rates.flipkartFixedFee, price);
      const collectionFee = isCod
        ? lookupBand(rates.flipkartCodCollection, price)
        : price * (rates.flipkartPrepaidCollectionPercent / 100);
      const feesBeforeGst = referralFee + fixedFee + collectionFee;
      const gstOnFees = feesBeforeGst * gstRate;
      const tcs = price * (rates.tcsPercent / 100);
      return {
        channel, name: "Flipkart",
        referralPercent, referralFee,
        closingFee: 0, fixedFee,
        codCollectionFee: isCod ? collectionFee : 0,
        platformFee: 0,
        paymentGatewayPercent: isCod ? 0 : rates.flipkartPrepaidCollectionPercent,
        paymentGatewayFee: isCod ? 0 : collectionFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: rates.tcsPercent, tcs,
        totalFees: feesBeforeGst + gstOnFees + tcs,
        nonRefundableOnRto: (fixedFee + collectionFee) * (1 + gstRate),
        caveat: "Bronze tier assumed — Gold/Silver fixed fees are lower",
        typicalShipping: rates.typicalShipping.flipkart,
      };
    }

    case "meesho": {
      const platformFee = rates.meeshoPlatformFee;
      const gstOnFees = platformFee * gstRate;
      const tcs = price * (rates.tcsPercent / 100);
      return {
        channel, name: "Meesho",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee,
        paymentGatewayPercent: 0, paymentGatewayFee: 0,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: rates.tcsPercent, tcs,
        totalFees: platformFee + gstOnFees + tcs,
        nonRefundableOnRto: platformFee * (1 + gstRate),
        typicalShipping: rates.typicalShipping.meesho,
      };
    }

    case "shopify":
    default: {
      const paymentGatewayFee = price * (rates.shopifyGatewayPercent / 100);
      const gstOnFees = paymentGatewayFee * gstRate;
      return {
        channel, name: "Shopify",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: rates.shopifyGatewayPercent, paymentGatewayFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0, tcs: 0, // no TCS on your own website (no e-commerce operator)
        totalFees: paymentGatewayFee + gstOnFees,
        nonRefundableOnRto: paymentGatewayFee * (1 + gstRate),
        caveat: "Excludes Shopify plan cost (₹1,500–2,300/mo) and the ad spend needed to buy your own traffic",
        typicalShipping: rates.typicalShipping.shopify,
      };
    }
  }
}

// ── Channel list for iteration ──

export type ChannelInfo = {
  channel: PrimaryChannel;
  name: string;
  typicalShipping: Record<WeightBracket, number>;
};

export const CHANNELS: ChannelInfo[] = [
  { channel: "amazon",   name: "Amazon",        typicalShipping: CURRENT_RATES.typicalShipping.amazon },
  { channel: "flipkart", name: "Flipkart",      typicalShipping: CURRENT_RATES.typicalShipping.flipkart },
  { channel: "meesho",   name: "Meesho",        typicalShipping: CURRENT_RATES.typicalShipping.meesho },
  { channel: "shopify",  name: "Shopify",       typicalShipping: CURRENT_RATES.typicalShipping.shopify },
];

export function getShippingForWeight(
  channel: PrimaryChannel,
  weight: WeightBracket,
): number {
  return (CURRENT_RATES.typicalShipping[channel] ?? CURRENT_RATES.typicalShipping.amazon)[weight];
}

// ── Rate table exports for UI display ──

export const RATE_TABLES = {
  amazonReferral: CURRENT_RATES.amazonReferral,
  amazonClosingFee: CURRENT_RATES.amazonClosingFee,
  flipkartCommission: CURRENT_RATES.flipkartCommission,
  flipkartFixedFee: CURRENT_RATES.flipkartFixedFee,
  flipkartCodCollection: CURRENT_RATES.flipkartCodCollection,
} as const;
