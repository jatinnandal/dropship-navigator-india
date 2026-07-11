import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import type { RateCard } from "@/lib/rate-card";

/**
 * Category-level average RTO rates (COD-heavy mix). Single source of truth —
 * import from here, never redefine.
 */
export const CATEGORY_RTO: Record<ProductType, number> = {
  fashion: 35,
  electronics: 18,
  beauty: 22,
  food: 15,
  general: 25,
};

/** Share of product cost written off when an RTO comes back (damage/repack). */
export const DEFAULT_RTO_DAMAGE_RATE = 0.3;

export type ProfitInputs = {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  adCostPerOrder: number;
  rtoRatePercent: number;
  channel: PrimaryChannel;
  category?: ProductType;
  isCod?: boolean;
  /** 0–1. Advanced input; defaults to DEFAULT_RTO_DAMAGE_RATE. */
  damageRate?: number;
  /** Rate card override — used by the rates-impact diff. Defaults to CURRENT. */
  rates?: RateCard;
};

export type ProfitResult = {
  revenue: number;
  marketplaceCommission: number;
  closingFee: number;
  fixedFee: number;
  codCollectionFee: number;
  platformFee: number;
  paymentFee: number;
  gstOnFees: number;
  tcs: number;
  shipping: number;
  productCost: number;
  adCost: number;
  /** Profit on an order that delivers (no RTO weighting). */
  deliveredProfit: number;
  /** Expected loss per shipped order attributable to RTO risk (≥ 0). */
  rtoLoss: number;
  /** Expected profit per shipped order: (1−r)·delivered + r·rtoOutcome. */
  netProfit: number;
  netMarginPercent: number;
  /** price / contribution-before-ads. Same definition as the ROAS tool. */
  breakEvenRoas: number;
  markupMultiple: number;
  verdict: "excellent" | "healthy" | "tight" | "loss";
  fees: ReturnType<typeof getFeesForProduct>;
};

/**
 * Expected-value model per SHIPPED order:
 *
 *   delivered (prob 1−r): price − productCost − shipping − fees − adCost
 *   rto       (prob r):  −(2×shipping) − damageRate×productCost − adCost
 *                        − fees.nonRefundableOnRto
 *
 * Ad money is spent whether or not the parcel delivers. Referral/TCS are
 * treated as reversed on RTO; fixed/closing/collection fees are not
 * (see ComputedFees.nonRefundableOnRto).
 */
export function calculateProfit(inputs: ProfitInputs): ProfitResult {
  const {
    sellingPrice,
    productCost,
    shippingCost,
    adCostPerOrder,
    rtoRatePercent,
    channel,
    category = "general",
    isCod = false,
    damageRate = DEFAULT_RTO_DAMAGE_RATE,
    rates,
  } = inputs;

  const revenue = Math.max(0, sellingPrice);
  const fees = getFeesForProduct(channel, category, revenue, isCod, rates);

  const shipping = Math.max(0, shippingCost);
  const adCost = Math.max(0, adCostPerOrder);
  const r = Math.min(100, Math.max(0, rtoRatePercent)) / 100;
  const damage = Math.min(1, Math.max(0, damageRate));

  const deliveredProfit = revenue - productCost - shipping - fees.totalFees - adCost;
  const rtoOutcome = -(2 * shipping) - damage * productCost - adCost - fees.nonRefundableOnRto;

  const netProfit = (1 - r) * deliveredProfit + r * rtoOutcome;
  const rtoLoss = deliveredProfit - netProfit; // r · (delivered − rtoOutcome)

  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  // Contribution before ads: same EV with adCost = 0 in both branches.
  const contributionBeforeAds = netProfit + adCost;
  const breakEvenRoas = contributionBeforeAds > 0 ? revenue / contributionBeforeAds : Infinity;

  const landedCost = productCost + shipping;
  const markupMultiple = landedCost > 0 ? revenue / landedCost : 0;

  let verdict: ProfitResult["verdict"] = "loss";
  if (netMarginPercent >= 25) verdict = "excellent";
  else if (netMarginPercent >= 15) verdict = "healthy";
  else if (netMarginPercent >= 5) verdict = "tight";

  return {
    revenue,
    marketplaceCommission: fees.referralFee,
    closingFee: fees.closingFee,
    fixedFee: fees.fixedFee,
    codCollectionFee: fees.codCollectionFee,
    platformFee: fees.platformFee,
    paymentFee: fees.paymentGatewayFee,
    gstOnFees: fees.gstOnFees,
    tcs: fees.tcs,
    shipping,
    productCost,
    adCost,
    deliveredProfit,
    rtoLoss,
    netProfit,
    netMarginPercent,
    breakEvenRoas: Number.isFinite(breakEvenRoas) ? breakEvenRoas : 99,
    markupMultiple,
    verdict,
    fees,
  };
}

export type BlendedEconomicsInputs = {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  adCostPerOrder: number;
  codPercent: number;
  codRtoPercent: number;
  prepaidReturnPercent: number;
  channel: PrimaryChannel;
  category?: ProductType;
};

export type BlendedEconomicsResult = {
  blendedRtoPercent: number;
  codShare: number;
  prepaidShare: number;
  netProfit: number;
  netMarginPercent: number;
  codOnlyMargin: number;
  prepaidOnlyMargin: number;
};

export function calculateBlendedUnitEconomics(inputs: BlendedEconomicsInputs): BlendedEconomicsResult {
  const codShare = Math.min(100, Math.max(0, inputs.codPercent)) / 100;
  const prepaidShare = 1 - codShare;

  const codResult = calculateProfit({
    sellingPrice: inputs.sellingPrice,
    productCost: inputs.productCost,
    shippingCost: inputs.shippingCost,
    adCostPerOrder: inputs.adCostPerOrder,
    rtoRatePercent: inputs.codRtoPercent,
    channel: inputs.channel,
    category: inputs.category,
    isCod: true,
  });

  const prepaidResult = calculateProfit({
    sellingPrice: inputs.sellingPrice,
    productCost: inputs.productCost,
    shippingCost: inputs.shippingCost,
    adCostPerOrder: inputs.adCostPerOrder,
    rtoRatePercent: inputs.prepaidReturnPercent,
    channel: inputs.channel,
    category: inputs.category,
    isCod: false,
  });

  const blendedRtoPercent =
    codShare * inputs.codRtoPercent + prepaidShare * inputs.prepaidReturnPercent;
  const netProfit = codShare * codResult.netProfit + prepaidShare * prepaidResult.netProfit;
  const netMarginPercent =
    inputs.sellingPrice > 0 ? (netProfit / inputs.sellingPrice) * 100 : 0;

  return {
    blendedRtoPercent,
    codShare,
    prepaidShare,
    netProfit,
    netMarginPercent,
    codOnlyMargin: codResult.netMarginPercent,
    prepaidOnlyMargin: prepaidResult.netMarginPercent,
  };
}

export function defaultRtoForProductType(productType: string): number {
  return CATEGORY_RTO[productType as ProductType] ?? CATEGORY_RTO.general;
}

export function calculateMonthlyProjections(
  inputs: ProfitInputs,
  monthlyFixedCost = 0,
): { breakEvenOrders: number; projections: { orders: number; monthlyProfit: number }[] } {
  const unit = calculateProfit(inputs);
  const breakEvenOrders =
    unit.netProfit > 0 ? Math.ceil(monthlyFixedCost / unit.netProfit) : Infinity;
  const volumes = [50, 100, 200];
  const projections = volumes.map((orders) => ({
    orders,
    monthlyProfit: unit.netProfit * orders - monthlyFixedCost,
  }));
  return { breakEvenOrders, projections };
}

export function rtoImpactSummary(baseRto: number, withConfirmationRto: number, ordersPerMonth: number) {
  const savedOrders = ((baseRto - withConfirmationRto) / 100) * ordersPerMonth;
  return {
    baseRto,
    withConfirmationRto,
    ordersSavedPerMonth: Math.max(0, Math.round(savedOrders)),
  };
}
