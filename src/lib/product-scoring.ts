import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import type { WeightBracket } from "@/lib/marketplace-fees";
import { getShippingForWeight } from "@/lib/marketplace-fees";
import { calculateProfit, CATEGORY_RTO } from "@/lib/profit-math";
import { SETTLEMENT_TIMELINES } from "@/lib/settlement-data";

export type SeasonalityLevel = "year_round" | "moderate" | "highly_seasonal";

export type ScorecardInputs = {
  productName: string;
  sellingPrice: number;
  productCost: number;
  channel: PrimaryChannel;
  category: ProductType;
  weightBracket: WeightBracket;
  seasonality: SeasonalityLevel;
  moq: number;
};

export type AxisScore = {
  name: string;
  score: number;
  weight: number;
  weighted: number;
  detail: string;
};

export type ScorecardResult = {
  productName: string;
  totalScore: number;
  verdict: "excellent" | "good" | "risky" | "avoid";
  axes: AxisScore[];
  topRisks: string[];
};

const SEASONALITY_SCORES: Record<SeasonalityLevel, number> = {
  year_round: 90,
  moderate: 60,
  highly_seasonal: 25,
};

function settlementDays(channel: PrimaryChannel): number {
  return SETTLEMENT_TIMELINES[channel].codSettlementDays;
}

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}

function marginScore(netMarginPercent: number): number {
  if (netMarginPercent >= 30) return 100;
  if (netMarginPercent <= -5) return 0;
  return clamp(Math.round((netMarginPercent + 5) * (100 / 35)), 0, 100);
}

function weightScore(bracket: WeightBracket): number {
  const base: Record<WeightBracket, number> = { light: 90, medium: 60, heavy: 30 };
  return base[bracket];
}

function returnRateScore(category: ProductType): number {
  const rto = CATEGORY_RTO[category];
  return clamp(Math.round(100 - rto * 2.5), 0, 100);
}

function capitalScore(moq: number, productCost: number, settlementDays: number): number {
  const capitalNeeded = moq * productCost;
  const cashLockedDays = settlementDays;
  const workingCapital = capitalNeeded + (capitalNeeded * cashLockedDays) / 30;
  if (workingCapital <= 10000) return 95;
  if (workingCapital <= 25000) return 80;
  if (workingCapital <= 50000) return 60;
  if (workingCapital <= 100000) return 40;
  if (workingCapital <= 200000) return 20;
  return 5;
}

export function scoreProduct(inputs: ScorecardInputs): ScorecardResult {
  const { sellingPrice, productCost, channel, category, weightBracket } = inputs;

  const shipping = getShippingForWeight(channel, weightBracket);
  const rtoRate = CATEGORY_RTO[category];
  const { netMarginPercent } = calculateProfit({
    sellingPrice,
    productCost,
    shippingCost: shipping,
    adCostPerOrder: 0,
    rtoRatePercent: rtoRate,
    channel,
    category,
  });

  const axes: AxisScore[] = [
    {
      name: "Margin headroom",
      score: marginScore(netMarginPercent),
      weight: 31,
      weighted: 0,
      detail: `${netMarginPercent.toFixed(1)}% net margin on ${channel}`,
    },
    {
      name: "Shipping weight",
      score: weightScore(weightBracket),
      weight: 19,
      weighted: 0,
      detail: `${weightBracket} weight bracket`,
    },
    {
      name: "Category return rate",
      score: returnRateScore(category),
      weight: 19,
      weighted: 0,
      detail: `${category}: ~${rtoRate}% avg RTO`,
    },
    {
      name: "Seasonality",
      score: SEASONALITY_SCORES[inputs.seasonality],
      weight: 12,
      weighted: 0,
      detail: `${inputs.seasonality.replace("_", " ")} demand`,
    },
    {
      name: "Capital need",
      score: capitalScore(inputs.moq, productCost, settlementDays(channel)),
      weight: 19,
      weighted: 0,
      detail: `MOQ ${inputs.moq} × ₹${productCost} + ${settlementDays(channel)}d settlement`,
    },
  ];

  axes.forEach((a) => {
    a.weighted = Math.round((a.score * a.weight) / 100);
  });

  const totalScore = axes.reduce((sum, a) => sum + a.weighted, 0);

  let verdict: ScorecardResult["verdict"] = "avoid";
  if (totalScore >= 75) verdict = "excellent";
  else if (totalScore >= 55) verdict = "good";
  else if (totalScore >= 35) verdict = "risky";

  const sorted = [...axes].sort((a, b) => a.score - b.score);
  const topRisks = sorted
    .filter((a) => a.score < 50)
    .slice(0, 2)
    .map((a) => `${a.name}: ${a.detail}`);

  if (topRisks.length === 0 && sorted.length > 0) {
    topRisks.push(`Weakest: ${sorted[0].name} (${sorted[0].score}/100)`);
  }

  return {
    productName: inputs.productName,
    totalScore,
    verdict,
    axes,
    topRisks,
  };
}
