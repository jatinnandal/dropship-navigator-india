import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import type { WeightBracket } from "@/lib/marketplace-fees";
import { calculateProfit } from "@/lib/profit-math";

export type RoasInputs = {
  sellingPrice: number;
  productCost: number;
  channel: PrimaryChannel;
  category: ProductType;
  shippingCost: number;
  /** 0–100 share of COD orders. */
  codMixPercent: number;
  rtoRatePercent: number;
};

export type RoasResult = {
  /** Expected contribution per shipped order BEFORE ad spend. */
  contribution: number;
  /** price / contribution. Infinity when contribution ≤ 0. */
  breakeven: number;
  /** ROAS needed to keep 10% / 20% of price as net margin after ads. */
  target10: number;
  target20: number;
};

/**
 * Single break-even ROAS definition shared by the ROAS tool and the margin
 * calculator: revenue ÷ contribution-before-ads, where contribution uses the
 * expected-value RTO model and blends COD/prepaid fee structures.
 */
export function computeRoas(inputs: RoasInputs): RoasResult {
  const codShare = Math.min(100, Math.max(0, inputs.codMixPercent)) / 100;
  const prepaidShare = 1 - codShare;

  const base = {
    sellingPrice: inputs.sellingPrice,
    productCost: inputs.productCost,
    shippingCost: inputs.shippingCost,
    adCostPerOrder: 0,
    rtoRatePercent: inputs.rtoRatePercent,
    channel: inputs.channel,
    category: inputs.category,
  };

  const codContribution = calculateProfit({ ...base, isCod: true }).netProfit;
  const prepaidContribution = calculateProfit({ ...base, isCod: false }).netProfit;
  const contribution = codShare * codContribution + prepaidShare * prepaidContribution;

  const price = Math.max(0, inputs.sellingPrice);
  const breakeven = contribution > 0 ? price / contribution : Infinity;
  const margin10 = contribution - price * 0.1;
  const margin20 = contribution - price * 0.2;

  return {
    contribution,
    breakeven,
    target10: margin10 > 0 ? price / margin10 : Infinity,
    target20: margin20 > 0 ? price / margin20 : Infinity,
  };
}

export function roasForWeightBracket(
  inputs: Omit<RoasInputs, "shippingCost"> & { weightBracket: WeightBracket },
  shippingForWeight: (channel: PrimaryChannel, weight: WeightBracket) => number,
): RoasResult {
  return computeRoas({
    ...inputs,
    shippingCost: shippingForWeight(inputs.channel, inputs.weightBracket),
  });
}
