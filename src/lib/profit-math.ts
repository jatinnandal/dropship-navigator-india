import type { PrimaryChannel } from "@/lib/mvp-data";

export type ProfitInputs = {
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  adCostPerOrder: number;
  rtoRatePercent: number;
  channel: PrimaryChannel;
};

export type ProfitResult = {
  revenue: number;
  marketplaceCommission: number;
  paymentFee: number;
  gstOnFees: number;
  tcs: number;
  shipping: number;
  productCost: number;
  adCost: number;
  rtoLoss: number;
  netProfit: number;
  netMarginPercent: number;
  breakEvenRoas: number;
  markupMultiple: number;
  verdict: "excellent" | "healthy" | "tight" | "loss";
};

function channelCommissionRate(channel: PrimaryChannel): number {
  switch (channel) {
    case "amazon":
      return 0.12;
    case "flipkart":
      return 0.13;
    case "meesho":
      return 0.08;
    default:
      return 0.02;
  }
}

function channelTcsRate(channel: PrimaryChannel): number {
  return channel === "meesho" ? 0 : 0.01;
}

export function calculateProfit(inputs: ProfitInputs): ProfitResult {
  const {
    sellingPrice,
    productCost,
    shippingCost,
    adCostPerOrder,
    rtoRatePercent,
    channel,
  } = inputs;

  const revenue = Math.max(0, sellingPrice);
  const commissionRate = channelCommissionRate(channel);
  const marketplaceCommission = revenue * commissionRate;
  const paymentFee = revenue * 0.02;
  const platformFees = marketplaceCommission + paymentFee;
  const gstOnFees = platformFees * 0.18;
  const tcs = revenue * channelTcsRate(channel);
  const shipping = Math.max(0, shippingCost);
  const adCost = Math.max(0, adCostPerOrder);
  const rtoFraction = Math.min(100, Math.max(0, rtoRatePercent)) / 100;
  const rtoLoss = (shipping * 2 + productCost * 0.3) * rtoFraction;

  const totalCosts =
    productCost + shipping + marketplaceCommission + paymentFee + gstOnFees + tcs + adCost + rtoLoss;
  const netProfit = revenue - totalCosts;
  const netMarginPercent = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  const breakEvenRoas = netMarginPercent > 0 ? 100 / netMarginPercent : Infinity;
  const landedCost = productCost + shipping;
  const markupMultiple = landedCost > 0 ? revenue / landedCost : 0;

  let verdict: ProfitResult["verdict"] = "loss";
  if (netMarginPercent >= 25) verdict = "excellent";
  else if (netMarginPercent >= 15) verdict = "healthy";
  else if (netMarginPercent >= 5) verdict = "tight";

  return {
    revenue,
    marketplaceCommission,
    paymentFee,
    gstOnFees,
    tcs,
    shipping,
    productCost,
    adCost,
    rtoLoss,
    netProfit,
    netMarginPercent,
    breakEvenRoas: Number.isFinite(breakEvenRoas) ? breakEvenRoas : 99,
    markupMultiple,
    verdict,
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
  });

  const prepaidResult = calculateProfit({
    sellingPrice: inputs.sellingPrice,
    productCost: inputs.productCost,
    shippingCost: inputs.shippingCost,
    adCostPerOrder: inputs.adCostPerOrder,
    rtoRatePercent: inputs.prepaidReturnPercent,
    channel: inputs.channel,
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
  switch (productType) {
    case "fashion":
      return 35;
    case "electronics":
      return 18;
    case "beauty":
      return 22;
    case "food":
      return 15;
    default:
      return 25;
  }
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
