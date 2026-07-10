import { describe, expect, it } from "vitest";
import { simulate90DayCashFlow } from "@/lib/cashflow-engine";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import { calculateProfit } from "@/lib/profit-math";
import { SETTLEMENT_TIMELINES } from "@/lib/settlement-data";

describe("margin calculator ↔ cashflow simulator parity", () => {
  it("both engines price fees from the same source (no hardcoded commissions)", () => {
    // rto = 0, ads = 0, prepaid-only: per-settled-order profit must match.
    const inputs = {
      channel: "meesho" as const,
      category: "fashion" as const,
      sellingPrice: 599,
      productCost: 200,
      shippingCost: 70,
      adSpendPerDay: 0,
      ordersPerDay: 1,
      codPercent: 0,
      rtoPercent: 0,
      startingCapital: 100000,
    };
    const sim = simulate90DayCashFlow(inputs);

    const perOrder = calculateProfit({
      sellingPrice: inputs.sellingPrice,
      productCost: inputs.productCost,
      shippingCost: inputs.shippingCost,
      adCostPerOrder: 0,
      rtoRatePercent: 0,
      channel: inputs.channel,
      category: inputs.category,
    });

    // Cash basis: costs go out for all 90 orders; settlements arrive only for
    // orders placed before day 90 − settlementDelay.
    const t = SETTLEMENT_TIMELINES.meesho;
    const delay = t.deliveryDays + t.prepaidSettlementDays;
    const settledOrders = 90 - delay;
    const fees = getFeesForProduct("meesho", "fashion", 599, false);
    const netSettlement = 599 - fees.totalFees;
    const expectedTotal =
      settledOrders * netSettlement - 90 * (inputs.productCost + inputs.shippingCost);

    expect(sim.totalProfit).toBeCloseTo(expectedTotal, 0);

    // And the settled per-order economics equal the margin calculator's.
    expect(netSettlement - inputs.productCost - inputs.shippingCost).toBeCloseTo(
      perOrder.netProfit,
      2,
    );
  });

  it("meesho commission is 0% in the simulator (was hardcoded 8%)", () => {
    const withOrders = simulate90DayCashFlow({
      channel: "meesho",
      sellingPrice: 1000,
      productCost: 0,
      shippingCost: 0,
      adSpendPerDay: 0,
      ordersPerDay: 1,
      codPercent: 0,
      rtoPercent: 0,
      startingCapital: 0,
    });
    const fees = getFeesForProduct("meesho", "general", 1000, false);
    const t = SETTLEMENT_TIMELINES.meesho;
    const settledOrders = 90 - (t.deliveryDays + t.prepaidSettlementDays);
    expect(withOrders.totalProfit).toBeCloseTo(settledOrders * (1000 - fees.totalFees), 0);
  });
});
