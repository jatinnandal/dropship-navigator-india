import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";

export const MARKETPLACE_FEES_META = {
  lastVerified: "2026-07-07",
  sources: [
    "sell.amazon.in/fees-and-pricing",
    "seller.flipkart.com/fees-and-commission",
    "supplier.meesho.com",
    "taxguru.in (TCS 0.5% effective July 2024)",
  ],
} as const;

export type WeightBracket = "light" | "medium" | "heavy";

export const WEIGHT_BRACKET_LABELS: Record<WeightBracket, string> = {
  light: "Light (<500g)",
  medium: "Medium (500g–1kg)",
  heavy: "Heavy (1–5kg)",
};

// ── Rate tables: category × price-band ──

type ReferralEntry = { maxPrice: number; percent: number };

const AMAZON_REFERRAL: Record<ProductType, ReferralEntry[]> = {
  fashion:      [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 6 }],
  electronics:  [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 9 }],
  beauty:       [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 5 }],
  food:         [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 6 }],
  general:      [{ maxPrice: 1000, percent: 0 }, { maxPrice: Infinity, percent: 10 }],
};

type ClosingFeeEntry = { maxPrice: number; fee: number };

const AMAZON_CLOSING_FEE: ClosingFeeEntry[] = [
  { maxPrice: 300,  fee: 20 },
  { maxPrice: 500,  fee: 26 },
  { maxPrice: 1000, fee: 30 },
  { maxPrice: Infinity, fee: 35 },
];

const FLIPKART_COMMISSION: Record<ProductType, number> = {
  fashion: 14,
  electronics: 5,
  beauty: 8,
  food: 6,
  general: 10,
};

const FLIPKART_FIXED_FEE: ClosingFeeEntry[] = [
  { maxPrice: 250,  fee: 7 },
  { maxPrice: 500,  fee: 17 },
  { maxPrice: 1000, fee: 30 },
  { maxPrice: Infinity, fee: 50 },
];

const FLIPKART_COD_COLLECTION: ClosingFeeEntry[] = [
  { maxPrice: 500,  fee: 10 },
  { maxPrice: 1000, fee: 20 },
  { maxPrice: Infinity, fee: 30 },
];

// ── Lookup helpers ──

function lookupBand(bands: { maxPrice: number; fee: number }[], price: number): number {
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
  referralFee: number;
  closingFee: number;
  fixedFee: number;
  codCollectionFee: number;
  platformFee: number;
  paymentGatewayPercent: number;
  paymentGatewayFee: number;
  gstOnFeesPercent: 18;
  gstOnFees: number;
  tcsPercent: number;
  tcs: number;
  totalFees: number;
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
      const paymentGatewayFee = price * 0.02;
      const feesBeforeGst = referralFee + closingFee + paymentGatewayFee;
      const gstOnFees = feesBeforeGst * 0.18;
      const tcs = price * 0.005;
      return {
        channel, name: "Amazon",
        referralPercent, referralFee,
        closingFee, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: 2, paymentGatewayFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0.5, tcs,
        totalFees: referralFee + closingFee + paymentGatewayFee + gstOnFees + tcs,
        typicalShipping: TYPICAL_SHIPPING.amazon,
      };
    }

    case "flipkart": {
      const referralPercent = FLIPKART_COMMISSION[category] ?? FLIPKART_COMMISSION.general;
      const referralFee = price * (referralPercent / 100);
      const fixedFee = lookupBand(FLIPKART_FIXED_FEE, price);
      const codCollectionFee = isCod ? lookupBand(FLIPKART_COD_COLLECTION, price) : 0;
      const paymentGatewayFee = price * 0.02;
      const feesBeforeGst = referralFee + fixedFee + codCollectionFee + paymentGatewayFee;
      const gstOnFees = feesBeforeGst * 0.18;
      const tcs = price * 0.005;
      return {
        channel, name: "Flipkart",
        referralPercent, referralFee,
        closingFee: 0, fixedFee,
        codCollectionFee,
        platformFee: 0,
        paymentGatewayPercent: 2, paymentGatewayFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0.5, tcs,
        totalFees: referralFee + fixedFee + codCollectionFee + paymentGatewayFee + gstOnFees + tcs,
        typicalShipping: TYPICAL_SHIPPING.flipkart,
      };
    }

    case "meesho": {
      const platformFee = 27;
      const gstOnFees = platformFee * 0.18;
      return {
        channel, name: "Meesho",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee,
        paymentGatewayPercent: 0, paymentGatewayFee: 0,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0.5, tcs: price * 0.005,
        totalFees: platformFee + gstOnFees + price * 0.005,
        typicalShipping: TYPICAL_SHIPPING.meesho,
      };
    }

    case "shopify":
    default: {
      const paymentGatewayFee = price * 0.02;
      const gstOnFees = paymentGatewayFee * 0.18;
      return {
        channel, name: "Shopify",
        referralPercent: 0, referralFee: 0,
        closingFee: 0, fixedFee: 0,
        codCollectionFee: 0,
        platformFee: 0,
        paymentGatewayPercent: 2, paymentGatewayFee,
        gstOnFeesPercent: 18, gstOnFees,
        tcsPercent: 0, tcs: 0,
        totalFees: paymentGatewayFee + gstOnFees,
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
