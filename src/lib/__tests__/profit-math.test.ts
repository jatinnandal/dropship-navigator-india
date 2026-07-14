import { describe, expect, it } from "vitest";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import {
  calculateBlendedProfitResult,
  calculateBlendedUnitEconomics,
  calculateProfit,
  DEFAULT_RTO_DAMAGE_RATE,
} from "@/lib/profit-math";
import { computeRoas } from "@/lib/roas";

const base = {
  sellingPrice: 999,
  productCost: 300,
  shippingCost: 70,
  adCostPerOrder: 50,
  channel: "meesho" as const,
  category: "fashion" as const,
  isCod: true,
};

describe("expected-value RTO model", () => {
  it("r = 0: net profit equals delivered profit, zero RTO loss", () => {
    const p = calculateProfit({ ...base, rtoRatePercent: 0 });
    expect(p.netProfit).toBeCloseTo(p.deliveredProfit, 6);
    expect(p.rtoLoss).toBeCloseTo(0, 6);
  });

  it("r = 100: net profit equals the pure RTO outcome (no revenue kept)", () => {
    const p = calculateProfit({ ...base, rtoRatePercent: 100 });
    const fees = getFeesForProduct("meesho", "fashion", 999, true);
    const expected =
      -(2 * 70) - DEFAULT_RTO_DAMAGE_RATE * 300 - 50 - fees.nonRefundableOnRto;
    expect(p.netProfit).toBeCloseTo(expected, 2);
  });

  it("expected profit interpolates linearly between the two outcomes", () => {
    const p0 = calculateProfit({ ...base, rtoRatePercent: 0 });
    const p100 = calculateProfit({ ...base, rtoRatePercent: 100 });
    const p35 = calculateProfit({ ...base, rtoRatePercent: 35 });
    expect(p35.netProfit).toBeCloseTo(0.65 * p0.netProfit + 0.35 * p100.netProfit, 2);
  });

  it("RTO risk removes revenue, not just adds cost (old model overstated profit)", () => {
    const p = calculateProfit({ ...base, rtoRatePercent: 35 });
    // Old model: revenue kept at 100%, only (2·ship + 0.3·cost)·r added as cost.
    const fees = getFeesForProduct("meesho", "fashion", 999, true);
    const oldModel =
      999 - 300 - 70 - fees.totalFees - 50 - (2 * 70 + 0.3 * 300) * 0.35;
    expect(p.netProfit).toBeLessThan(oldModel);
  });

  it("damageRate is configurable", () => {
    const lowDamage = calculateProfit({ ...base, rtoRatePercent: 50, damageRate: 0 });
    const highDamage = calculateProfit({ ...base, rtoRatePercent: 50, damageRate: 1 });
    expect(lowDamage.netProfit - highDamage.netProfit).toBeCloseTo(0.5 * 300, 2);
  });
});

describe("break-even ROAS single definition", () => {
  it("margin calculator and ROAS tool produce the same number (COD)", () => {
    const p = calculateProfit({ ...base, rtoRatePercent: 25 });
    const r = computeRoas({
      sellingPrice: base.sellingPrice,
      productCost: base.productCost,
      channel: base.channel,
      category: base.category,
      shippingCost: base.shippingCost,
      codMixPercent: 100,
      rtoRatePercent: 25,
    });
    expect(p.breakEvenRoas).toBeCloseTo(r.breakeven, 6);
  });

  it("excludes ad spend from the contribution (not circular)", () => {
    const withAds = calculateProfit({ ...base, rtoRatePercent: 25, adCostPerOrder: 50 });
    const noAds = calculateProfit({ ...base, rtoRatePercent: 25, adCostPerOrder: 0 });
    expect(withAds.breakEvenRoas).toBeCloseTo(noAds.breakEvenRoas, 6);
  });
});

describe("blended economics", () => {
  it("0% COD equals the prepaid-only result", () => {
    const blended = calculateBlendedUnitEconomics({
      sellingPrice: 999,
      productCost: 300,
      shippingCost: 70,
      adCostPerOrder: 50,
      codPercent: 0,
      codRtoPercent: 35,
      prepaidReturnPercent: 8,
      channel: "flipkart",
      category: "fashion",
    });
    const prepaid = calculateProfit({
      sellingPrice: 999,
      productCost: 300,
      shippingCost: 70,
      adCostPerOrder: 50,
      rtoRatePercent: 8,
      channel: "flipkart",
      category: "fashion",
      isCod: false,
    });
    expect(blended.netProfit).toBeCloseTo(prepaid.netProfit, 6);
  });
});

describe("calculateBlendedProfitResult (margin calculator COD slider)", () => {
  const inputs = {
    sellingPrice: 999,
    productCost: 300,
    shippingCost: 70,
    adCostPerOrder: 50,
    codRtoPercent: 35,
    prepaidReturnPercent: 2,
    channel: "flipkart" as const,
    category: "fashion" as const,
  };

  it("100% COD equals the COD-only ProfitResult", () => {
    const blended = calculateBlendedProfitResult({ ...inputs, codPercent: 100 });
    const cod = calculateProfit({
      sellingPrice: 999, productCost: 300, shippingCost: 70, adCostPerOrder: 50,
      rtoRatePercent: 35, channel: "flipkart", category: "fashion", isCod: true,
    });
    expect(blended.netProfit).toBeCloseTo(cod.netProfit, 6);
    expect(blended.codCollectionFee).toBeCloseTo(cod.codCollectionFee, 6);
    expect(blended.verdict).toBe(cod.verdict);
  });

  it("0% COD equals the prepaid-only ProfitResult (no COD collection fee)", () => {
    const blended = calculateBlendedProfitResult({ ...inputs, codPercent: 0 });
    const pre = calculateProfit({
      sellingPrice: 999, productCost: 300, shippingCost: 70, adCostPerOrder: 50,
      rtoRatePercent: 2, channel: "flipkart", category: "fashion", isCod: false,
    });
    expect(blended.netProfit).toBeCloseTo(pre.netProfit, 6);
    expect(blended.codCollectionFee).toBeCloseTo(pre.codCollectionFee, 6);
  });

  it("60% COD is the exact weighted average of the two modes", () => {
    const blended = calculateBlendedProfitResult({ ...inputs, codPercent: 60 });
    const cod = calculateProfit({
      sellingPrice: 999, productCost: 300, shippingCost: 70, adCostPerOrder: 50,
      rtoRatePercent: 35, channel: "flipkart", category: "fashion", isCod: true,
    });
    const pre = calculateProfit({
      sellingPrice: 999, productCost: 300, shippingCost: 70, adCostPerOrder: 50,
      rtoRatePercent: 2, channel: "flipkart", category: "fashion", isCod: false,
    });
    expect(blended.netProfit).toBeCloseTo(0.6 * cod.netProfit + 0.4 * pre.netProfit, 6);
    expect(blended.rtoLoss).toBeCloseTo(0.6 * cod.rtoLoss + 0.4 * pre.rtoLoss, 6);
    expect(blended.fees.totalFees).toBeCloseTo(0.6 * cod.fees.totalFees + 0.4 * pre.fees.totalFees, 6);
  });

  it("moving the mix toward prepaid improves margin (COD carries RTO risk)", () => {
    const mostlyCod = calculateBlendedProfitResult({ ...inputs, codPercent: 90 });
    const mostlyPrepaid = calculateBlendedProfitResult({ ...inputs, codPercent: 10 });
    expect(mostlyPrepaid.netMarginPercent).toBeGreaterThan(mostlyCod.netMarginPercent);
  });
});
