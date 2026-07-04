import type { PrimaryChannel } from "@/lib/mvp-data";
import { SETTLEMENT_TIMELINES } from "@/lib/settlement-data";
import { calculateProfit } from "@/lib/profit-math";

export type CashFlowInputs = {
  channel: PrimaryChannel;
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

  // Calculate per-order profit using existing engine
  const profitResult = calculateProfit({
    sellingPrice,
    productCost,
    shippingCost,
    adCostPerOrder: adSpendPerDay / Math.max(1, ordersPerDay),
    rtoRatePercent: rtoPercent,
    channel,
  });

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

    // Immediate expenses: product cost + shipping for ALL orders (incl. RTO attempts)
    const dayProductCost = dayOrders * productCost;
    const dayShippingCost = dayOrders * shippingCost;
    // RTO return shipping cost
    const dayRtoShippingCost = rtoOrders * shippingCost;
    const dayAdSpend = adSpendPerDay;
    const dayExpenses = dayProductCost + dayShippingCost + dayRtoShippingCost + dayAdSpend;
    totalExpenses += dayExpenses;

    // Schedule settlements for successful orders
    // Prepaid portion
    const prepaidRevenue = successfulOrders * prepaidFraction * sellingPrice;
    if (prepaidRevenue > 0) {
      // Deduct marketplace fees from settlement
      const commissionRate = channel === "meesho" ? 0.08 : channel === "flipkart" ? 0.13 : channel === "amazon" ? 0.12 : 0.02;
      const netPrepaidSettlement = prepaidRevenue * (1 - commissionRate - 0.02 - 0.01); // commission + payment fee + tcs approx
      pendingSettlements.push({
        arrivalDay: day + prepaidSettlementDelay,
        amount: netPrepaidSettlement,
      });
    }

    // COD portion
    const codRevenue = successfulOrders * codFraction * sellingPrice;
    if (codRevenue > 0) {
      const commissionRate = channel === "meesho" ? 0.08 : channel === "flipkart" ? 0.13 : channel === "amazon" ? 0.12 : 0.02;
      const netCodSettlement = codRevenue * (1 - commissionRate - 0.02 - 0.01);
      pendingSettlements.push({
        arrivalDay: day + codSettlementDelay,
        amount: netCodSettlement,
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
