import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";

export const MARKETPLACE_FEES_META = {
  lastVerified: "2026-07-09",
  sources: [
    "sell.amazon.in/fees-and-pricing (0% referral ≤ ₹1,000 in eligible categories, Mar 16 2026)",
    "seller.flipkart.com/fees-and-commission (commission + fixed fee + collection fee by payment mode)",
    "supplier.meesho.com/pricing (0% commission + platform fee)",
    "taxguru.in (TCS 0.5% effective July 2024)",
  ],
} as const;

export type WeightBracket = "light" | "medium" | "heavy";
export type PaymentMode = "prepaid" | "cod";

export const WEIGHT_BRACKET_LABELS: Record<WeightBracket, string> = {
  light: "Light (<500g)",
  medium: "Medium (500g–1kg)",
  heavy: "Heavy (1–5kg)",
};

// ── Rate tables: category × price-band ──
// Estimates for the broad category buckets this app models. Real rate cards are
// subcategory-level and account-specific — every consumer UI must label these
// as estimates ("check your rate card in Seller Hub").

type ReferralEntry = { maxPrice: number; percent: number };

/**
 * Amazon's Mar-2026 zero-referral program (≤ ₹1,000) covers apparel, footwear,
 * fashion jewellery, grocery, home, beauty, toys, kitchen, automotive, pet —
 * NOT most consumer electronics. Our buckets: fashion/beauty/food/general are
 * in-program; electronics keeps its normal card at all price points.
 */
const AMAZON_REFERRAL: Record<ProductType, ReferralEntry[]> = {
  fashion:      [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 13 }],
  electronics:  [{ maxPrice: 500, percent: 8 }, { maxPrice: Infinity, percent: 9.5 }],
  beauty:       [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 7 }],
  food:         [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 7 }],
  general:      [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 11 }],
};

type FeeBand = { maxPrice: number; fee: number };

/** Easy Ship assumed. FBA/Self-Ship closing fees differ — labelled in UI. */
const AMAZON_CLOSING_FEE: FeeBand[] = [
  { maxPrice: 300,  fee: 20 },
  { maxPrice: 500,  fee: 26 },
  { maxPrice: 1000, fee: 30 },
  { maxPrice: Infinity, fee: 35 },
];

const FLIPKART_COMMISSION: Record<ProductType, number> = {
  fashion: 14,
  electronics: 6,
  beauty: 8,
  food: 7,
  general: 11,
};

/** Published fixed-fee range is ₹8–35 by price slab (Bronze tier assumed). */
const FLIPKART_FIXED_FEE: FeeBand[] = [
  { maxPrice: 250,  fee: 8 },
  { maxPrice: 500,  fee: 17 },
  { maxPrice: 1000, fee: 30 },
  { maxPrice: Infinity, fee: 35 },
];

/**
 * Flipkart charges ONE collection fee per order, varying by payment mode:
 * ~2% of order value for prepaid, slab-based for COD.
 */
const FLIPKART_COD_COLLECTION: FeeBand[] = [
  { maxPrice: 500,  fee: 10 },
  { maxPrice: 1000, fee: 20 },
  { maxPrice: Infinity, fee: 30 },
];
const FLIPKART_PREPAID_COLLECTION_PERCENT = 2;

/** Meesho: 0% commission; per-order platform fee ~₹25–30 (we model ₹27). */
const MEESHO_PLATFORM_FEE = 27;

/** Own-store payment gateway (Razorpay/Cashfree standard card/UPI blend). */
const SHOPIFY_GATEWAY_PERCENT = 2;

const TCS_PERCENT = 0.5; // 0.25% CGST + 0.25% SGST since July 2024
const GST_ON_FEES = 0.18;

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

const TYPICAL_SHIPPING: Record<PrimaryChannel, Record<WeightBracket, number>> = {
  amazon:   { light: 65, medium: 85, heavy: 120 },
  flipkart: { light: 55, medium: 75, heavy: 110 },
  meesho:   { light: 50, medium: 70, heavy: 100 },
  shopify:  { light: 60, medium: 80, heavy: 115 },
};

export function getFeesForProduct(
  channel: PrimaryChannel,
  category: ProductType,
  sellingPrice: number,
  isCod = false,
): ComputedFees {
  const price = Math.max(0, sellingPrice);

  switch (channel) {
    case "amazon": {
      const referralPercent = lookupReferral(AMAZON_REFERRAL[category] ?? AMAZON_REFERRAL.general, price);
      const referralFee = price * (referralPercent / 100);
      const closingFee = lookupBand(AMAZON_CLOSING_FEE, price);
      const feesBeforeGst = referralFee + closingFee;
      const gstOnFees = feesBeforeGst * GST_ON_FEES;
      const tcs = price * (TCS_PERCENT / 100);
      return {
        channel, name: "Amazon",
        referralPercent, referralFee,
        closingFee, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: 0, paymentGatewayFee: 0,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: TCS_PERCENT, tcs,
        totalFees: feesBeforeGst + gstOnFees + tcs,
        nonRefundableOnRto: closingFee * (1 + GST_ON_FEES),
        caveat: "Easy Ship assumed — FBA adds storage/pick-pack fees",
        typicalShipping: TYPICAL_SHIPPING.amazon,
      };
    }

    case "flipkart": {
      const referralPercent = FLIPKART_COMMISSION[category] ?? FLIPKART_COMMISSION.general;
      const referralFee = price * (referralPercent / 100);
      const fixedFee = lookupBand(FLIPKART_FIXED_FEE, price);
      const collectionFee = isCod
        ? lookupBand(FLIPKART_COD_COLLECTION, price)
        : price * (FLIPKART_PREPAID_COLLECTION_PERCENT / 100);
      const feesBeforeGst = referralFee + fixedFee + collectionFee;
      const gstOnFees = feesBeforeGst * GST_ON_FEES;
      const tcs = price * (TCS_PERCENT / 100);
      return {
        channel, name: "Flipkart",
        referralPercent, referralFee,
        closingFee: 0, fixedFee,
        codCollectionFee: isCod ? collectionFee : 0,
        platformFee: 0,
        paymentGatewayPercent: isCod ? 0 : FLIPKART_PREPAID_COLLECTION_PERCENT,
        paymentGatewayFee: isCod ? 0 : collectionFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: TCS_PERCENT, tcs,
        totalFees: feesBeforeGst + gstOnFees + tcs,
        nonRefundableOnRto: (fixedFee + collectionFee) * (1 + GST_ON_FEES),
        caveat: "Bronze tier assumed — Gold/Silver fixed fees are lower",
        typicalShipping: TYPICAL_SHIPPING.flipkart,
      };
    }

    case "meesho": {
      const platformFee = MEESHO_PLATFORM_FEE;
      const gstOnFees = platformFee * GST_ON_FEES;
      const tcs = price * (TCS_PERCENT / 100);
      return {
        channel, name: "Meesho",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee,
        paymentGatewayPercent: 0, paymentGatewayFee: 0,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: TCS_PERCENT, tcs,
        totalFees: platformFee + gstOnFees + tcs,
        nonRefundableOnRto: platformFee * (1 + GST_ON_FEES),
        typicalShipping: TYPICAL_SHIPPING.meesho,
      };
    }

    case "shopify":
    default: {
      const paymentGatewayFee = price * (SHOPIFY_GATEWAY_PERCENT / 100);
      const gstOnFees = paymentGatewayFee * GST_ON_FEES;
      return {
        channel, name: "Shopify",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: SHOPIFY_GATEWAY_PERCENT, paymentGatewayFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0, tcs: 0, // no TCS on your own website (no e-commerce operator)
        totalFees: paymentGatewayFee + gstOnFees,
        nonRefundableOnRto: paymentGatewayFee * (1 + GST_ON_FEES),
        caveat: "Excludes Shopify plan cost (₹1,500–2,300/mo) and the ad spend needed to buy your own traffic",
        typicalShipping: TYPICAL_SHIPPING.shopify,
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
  { channel: "amazon",   name: "Amazon",        typicalShipping: TYPICAL_SHIPPING.amazon },
  { channel: "flipkart", name: "Flipkart",      typicalShipping: TYPICAL_SHIPPING.flipkart },
  { channel: "meesho",   name: "Meesho",        typicalShipping: TYPICAL_SHIPPING.meesho },
  { channel: "shopify",  name: "Shopify",       typicalShipping: TYPICAL_SHIPPING.shopify },
];

export function getShippingForWeight(
  channel: PrimaryChannel,
  weight: WeightBracket,
): number {
  return (TYPICAL_SHIPPING[channel] ?? TYPICAL_SHIPPING.amazon)[weight];
}

// ── Rate table exports for UI display ──

export const RATE_TABLES = {
  amazonReferral: AMAZON_REFERRAL,
  amazonClosingFee: AMAZON_CLOSING_FEE,
  flipkartCommission: FLIPKART_COMMISSION,
  flipkartFixedFee: FLIPKART_FIXED_FEE,
  flipkartCodCollection: FLIPKART_COD_COLLECTION,
} as const;
