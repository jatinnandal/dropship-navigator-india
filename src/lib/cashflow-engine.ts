import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import { DEFAULT_RTO_DAMAGE_RATE } from "@/lib/profit-math";
import { SETTLEMENT_TIMELINES } from "@/lib/settlement-data";

export type CashFlowInputs = {
  channel: PrimaryChannel;
  category?: ProductType;
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  adSpendPerDay: number;
  ordersPerDay: number;
  codPercent: number;
  rtoPercent: number;
  startingCapital: number;
  festivalSurge?: { startDay: number; multiplier: number; duration: number };
};

export type DayCashFlow = {
  day: number;
  revenue: number;
  expenses: number;
  settlementIncoming: number;
  adSpend: number;
  balance: number;
  isNegative: boolean;
};

export type CashFlowResult = {
  days: DayCashFlow[];
  breakEvenDay: number | null;
  lowestBalance: number;
  lowestDay: number;
  totalRevenue: number;
  totalProfit: number;
  peakCapitalNeeded: number;
};

export function simulate90DayCashFlow(inputs: CashFlowInputs): CashFlowResult {
  const {
    channel,
    category = "general",
    sellingPrice,
    productCost,
    shippingCost,
    adSpendPerDay,
    ordersPerDay,
    codPercent,
    rtoPercent,
    startingCapital,
    festivalSurge,
  } = inputs;

  const timeline = SETTLEMENT_TIMELINES[channel];
  const codFraction = codPercent / 100;
  const prepaidFraction = 1 - codFraction;
  const rtoFraction = rtoPercent / 100;

  // Same fee source as every other money tool — settlement = price − fees.
  const codFees = getFeesForProduct(channel, category, sellingPrice, true);
  const prepaidFees = getFeesForProduct(channel, category, sellingPrice, false);
  const netPerCodOrder = Math.max(0, sellingPrice - codFees.totalFees);
  const netPerPrepaidOrder = Math.max(0, sellingPrice - prepaidFees.totalFees);

  // Settlement delays (days after order placed)
  const prepaidSettlementDelay = timeline.deliveryDays + timeline.prepaidSettlementDays;
  const codSettlementDelay = timeline.deliveryDays + timeline.codSettlementDays;

  // Track pending settlements: array of { arrivalDay, amount }
  const pendingSettlements: { arrivalDay: number; amount: number }[] = [];

  const days: DayCashFlow[] = [];
  let balance = startingCapital;
  let lowestBalance = startingCapital;
  let lowestDay = 0;
  let breakEvenDay: number | null = null;
  let totalRevenue = 0;
  let totalExpenses = 0;

  for (let day = 1; day <= 90; day++) {
    // Determine orders for this day (festival surge)
    let dayOrders = ordersPerDay;
    if (festivalSurge) {
      const { startDay, multiplier, duration } = festivalSurge;
      if (day >= startDay && day < startDay + duration) {
        dayOrders = Math.round(ordersPerDay * multiplier);
      }
    }

    // Successful orders (after RTO)
    const successfulOrders = dayOrders * (1 - rtoFraction);
    const rtoOrders = dayOrders * rtoFraction;

    // Revenue generated today (will be settled later)
    const dayRevenue = successfulOrders * sellingPrice;
    totalRevenue += dayRevenue;

    // Immediate expenses. Product cost goes out for every order shipped;
    // RTO'd units come back with only the damage share written off
    // (same DEFAULT_RTO_DAMAGE_RATE as the margin calculator).
    const dayProductCost =
      successfulOrders * productCost + rtoOrders * productCost * DEFAULT_RTO_DAMAGE_RATE;
    const dayShippingCost = dayOrders * shippingCost;
    // RTO return shipping cost
    const dayRtoShippingCost = rtoOrders * shippingCost;
    const dayAdSpend = adSpendPerDay;
    const dayExpenses = dayProductCost + dayShippingCost + dayRtoShippingCost + dayAdSpend;
    totalExpenses += dayExpenses;

    // Schedule settlements for successful orders
    const prepaidSettlement = successfulOrders * prepaidFraction * netPerPrepaidOrder;
    if (prepaidSettlement > 0) {
      pendingSettlements.push({
        arrivalDay: day + prepaidSettlementDelay,
        amount: prepaidSettlement,
      });
    }

    const codSettlement = successfulOrders * codFraction * netPerCodOrder;
    if (codSettlement > 0) {
      pendingSettlements.push({
        arrivalDay: day + codSettlementDelay,
        amount: codSettlement,
      });
    }

    // Collect settlements arriving today
    let settlementIncoming = 0;
    for (const s of pendingSettlements) {
      if (s.arrivalDay === day) {
        settlementIncoming += s.amount;
      }
    }

    // Update balance
    balance = balance - dayExpenses + settlementIncoming;

    if (balance < lowestBalance) {
      lowestBalance = balance;
      lowestDay = day;
    }

    if (breakEvenDay === null && balance >= startingCapital && day > 1) {
      breakEvenDay = day;
    }

    days.push({
      day,
      revenue: Math.round(dayRevenue),
      expenses: Math.round(dayExpenses),
      settlementIncoming: Math.round(settlementIncoming),
      adSpend: Math.round(dayAdSpend),
      balance: Math.round(balance),
      isNegative: balance < 0,
    });
  }

  const totalProfit = balance - startingCapital;
  const peakCapitalNeeded = lowestBalance < 0 ? Math.abs(lowestBalance) + startingCapital : startingCapital - lowestBalance;

  return {
    days,
    breakEvenDay,
    lowestBalance: Math.round(lowestBalance),
    lowestDay,
    totalRevenue: Math.round(totalRevenue),
    totalProfit: Math.round(totalProfit),
    peakCapitalNeeded: Math.round(peakCapitalNeeded),
  };
}
