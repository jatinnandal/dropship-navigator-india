import type { PrimaryChannel } from "@/lib/mvp-data";

export type MarketplaceFeeStructure = {
  name: string;
  channel: PrimaryChannel;
  referralPercent: number;
  closingFee: number;
  paymentGatewayPercent: number;
  gstOnFeesPercent: number;
  tcsPercent: number;
  typicalShipping: { light: number; medium: number; heavy: number };
  codHandlingFee: number;
};

export type WeightBracket = "light" | "medium" | "heavy";

export const WEIGHT_BRACKET_LABELS: Record<WeightBracket, string> = {
  light: "Light (<500g)",
  medium: "Medium (500g–1kg)",
  heavy: "Heavy (1–5kg)",
};

export const MARKETPLACE_FEES: MarketplaceFeeStructure[] = [
  {
    name: "Amazon",
    channel: "amazon",
    referralPercent: 12,
    closingFee: 25,
    paymentGatewayPercent: 2,
    gstOnFeesPercent: 18,
    tcsPercent: 1,
    typicalShipping: { light: 65, medium: 85, heavy: 120 },
    codHandlingFee: 30,
  },
  {
    name: "Flipkart",
    channel: "flipkart",
    referralPercent: 13,
    closingFee: 20,
    paymentGatewayPercent: 2,
    gstOnFeesPercent: 18,
    tcsPercent: 1,
    typicalShipping: { light: 55, medium: 75, heavy: 110 },
    codHandlingFee: 25,
  },
  {
    name: "Meesho",
    channel: "meesho",
    referralPercent: 8,
    closingFee: 0,
    paymentGatewayPercent: 0,
    gstOnFeesPercent: 18,
    tcsPercent: 0,
    typicalShipping: { light: 50, medium: 70, heavy: 100 },
    codHandlingFee: 0,
  },
  {
    name: "Shopify",
    channel: "shopify",
    referralPercent: 2,
    closingFee: 0,
    paymentGatewayPercent: 2,
    gstOnFeesPercent: 18,
    tcsPercent: 0,
    typicalShipping: { light: 60, medium: 80, heavy: 115 },
    codHandlingFee: 0,
  },
];

export function getFeeStructure(channel: PrimaryChannel): MarketplaceFeeStructure {
  return MARKETPLACE_FEES.find((m) => m.channel === channel) ?? MARKETPLACE_FEES[0];
}

export function getShippingForWeight(
  channel: PrimaryChannel,
  weight: WeightBracket,
): number {
  return getFeeStructure(channel).typicalShipping[weight];
}
