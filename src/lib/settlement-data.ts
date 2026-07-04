import type { PrimaryChannel } from "./mvp-data";

export type SettlementTimeline = {
  channel: PrimaryChannel;
  label: string;
  prepaidSettlementDays: number;
  codSettlementDays: number;
  deliveryDays: number;
  returnWindowDays: number;
  refundProcessingDays: number;
};

export const SETTLEMENT_TIMELINES: Record<PrimaryChannel, SettlementTimeline> = {
  amazon: {
    channel: "amazon",
    label: "Amazon",
    prepaidSettlementDays: 7,
    codSettlementDays: 14,
    deliveryDays: 4,
    returnWindowDays: 7,
    refundProcessingDays: 5,
  },
  flipkart: {
    channel: "flipkart",
    label: "Flipkart",
    prepaidSettlementDays: 10,
    codSettlementDays: 15,
    deliveryDays: 5,
    returnWindowDays: 10,
    refundProcessingDays: 7,
  },
  meesho: {
    channel: "meesho",
    label: "Meesho",
    prepaidSettlementDays: 7,
    codSettlementDays: 15,
    deliveryDays: 6,
    returnWindowDays: 7,
    refundProcessingDays: 5,
  },
  shopify: {
    channel: "shopify",
    label: "Shopify (Own Store)",
    prepaidSettlementDays: 3,
    codSettlementDays: 3,
    deliveryDays: 5,
    returnWindowDays: 0,
    refundProcessingDays: 3,
  },
};

export const ALL_CHANNELS: PrimaryChannel[] = ["amazon", "flipkart", "meesho", "shopify"];

export type WorkingCapitalInputs = {
  monthlyOrders: number;
  avgOrderValue: number;
  codPercent: number;
  channel: PrimaryChannel;
  productCostPercent: number;
};

export type WorkingCapitalResult = {
  totalMonthlyRevenue: number;
  capitalLockedInTransit: number;
  capitalLockedInSettlement: number;
  capitalNeededForInventory: number;
  totalWorkingCapitalNeeded: number;
  daysOfCashLocked: number;
};

export function calculateWorkingCapital(inputs: WorkingCapitalInputs): WorkingCapitalResult {
  const { monthlyOrders, avgOrderValue, codPercent, channel, productCostPercent } = inputs;
  const timeline = SETTLEMENT_TIMELINES[channel];

  const totalMonthlyRevenue = monthlyOrders * avgOrderValue;
  const dailyRevenue = totalMonthlyRevenue / 30;

  const codFraction = codPercent / 100;
  const prepaidFraction = 1 - codFraction;

  // Days money is locked in transit (order placed → delivered)
  const transitDays = timeline.deliveryDays;
  const capitalLockedInTransit = dailyRevenue * transitDays;

  // Days money is locked in settlement (delivered → bank credit)
  const avgSettlementDays =
    prepaidFraction * timeline.prepaidSettlementDays +
    codFraction * timeline.codSettlementDays;
  const capitalLockedInSettlement = dailyRevenue * avgSettlementDays;

  // Inventory investment: need ~1 month of product cost on hand
  const capitalNeededForInventory = totalMonthlyRevenue * (productCostPercent / 100);

  const totalWorkingCapitalNeeded =
    capitalLockedInTransit + capitalLockedInSettlement + capitalNeededForInventory;

  const daysOfCashLocked = transitDays + avgSettlementDays;

  return {
    totalMonthlyRevenue,
    capitalLockedInTransit: Math.round(capitalLockedInTransit),
    capitalLockedInSettlement: Math.round(capitalLockedInSettlement),
    capitalNeededForInventory: Math.round(capitalNeededForInventory),
    totalWorkingCapitalNeeded: Math.round(totalWorkingCapitalNeeded),
    daysOfCashLocked: Math.round(daysOfCashLocked),
  };
}

/** Milestone events for the order lifecycle timeline */
export type TimelineMilestone = {
  day: number;
  label: string;
  color: "amber" | "emerald" | "rose" | "cyan";
};

export function getOrderLifecycleMilestones(channel: PrimaryChannel): TimelineMilestone[] {
  const t = SETTLEMENT_TIMELINES[channel];
  return [
    { day: 0, label: "Order Placed", color: "amber" },
    { day: 1, label: "Dispatched", color: "amber" },
    { day: t.deliveryDays, label: "Delivered", color: "emerald" },
    {
      day: t.deliveryDays + t.returnWindowDays,
      label: t.returnWindowDays > 0 ? "Return Window Ends" : "No Return Window",
      color: t.returnWindowDays > 0 ? "rose" : "emerald",
    },
    {
      day: t.deliveryDays + t.prepaidSettlementDays,
      label: "Prepaid Settlement",
      color: "cyan",
    },
    {
      day: t.deliveryDays + t.codSettlementDays,
      label: "COD Settlement",
      color: "emerald",
    },
  ];
}
