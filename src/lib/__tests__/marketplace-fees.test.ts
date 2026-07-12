import { describe, expect, it } from "vitest";
import { getFeesForProduct } from "@/lib/marketplace-fees";

describe("Amazon fees", () => {
  it("₹999 fashion: 0% referral (Mar-2026 program), closing fee only", () => {
    const f = getFeesForProduct("amazon", "fashion", 999);
    expect(f.referralPercent).toBe(0);
    expect(f.referralFee).toBe(0);
    expect(f.closingFee).toBe(30); // ₹500-1,000 band
    expect(f.paymentGatewayFee).toBe(0); // no invented PG fee
    expect(f.gstOnFees).toBeCloseTo(30 * 0.18, 2);
    expect(f.tcs).toBeCloseTo(999 * 0.005, 2);
    expect(f.totalFees).toBeCloseTo(30 + 5.4 + 4.995, 2);
  });

  it("electronics are NOT in the 0% program", () => {
    const f = getFeesForProduct("amazon", "electronics", 999);
    expect(f.referralPercent).toBeGreaterThan(0);
  });

  it("fashion above ₹1,000 pays category referral", () => {
    const f = getFeesForProduct("amazon", "fashion", 1500);
    expect(f.referralPercent).toBeGreaterThan(0);
    expect(f.referralFee).toBeCloseTo((1500 * f.referralPercent) / 100, 2);
  });

  it("closing fee is non-refundable on RTO, referral+TCS reversed", () => {
    const f = getFeesForProduct("amazon", "fashion", 1500);
    expect(f.nonRefundableOnRto).toBeCloseTo(f.closingFee * 1.18, 2);
    expect(f.nonRefundableOnRto).toBeLessThan(f.totalFees);
  });
});

describe("Flipkart fees", () => {
  it("charges ONE collection fee: COD slab for COD orders", () => {
    const cod = getFeesForProduct("flipkart", "general", 800, true);
    expect(cod.codCollectionFee).toBe(20); // ₹500-1,000 slab
    expect(cod.paymentGatewayFee).toBe(0); // no double-count
  });

  it("charges ONE collection fee: ~2% for prepaid orders", () => {
    const prepaid = getFeesForProduct("flipkart", "general", 800, false);
    expect(prepaid.codCollectionFee).toBe(0);
    expect(prepaid.paymentGatewayFee).toBeCloseTo(16, 2); // 2% of 800
  });

  it("fixed fee stays inside published ₹8-35 band", () => {
    for (const price of [100, 400, 900, 5000]) {
      const f = getFeesForProduct("flipkart", "general", price);
      expect(f.fixedFee).toBeGreaterThanOrEqual(8);
      expect(f.fixedFee).toBeLessThanOrEqual(35);
    }
  });

  it("GST applies to commission + fixed + collection", () => {
    const f = getFeesForProduct("flipkart", "fashion", 1000, true);
    const preGst = f.referralFee + f.fixedFee + f.codCollectionFee;
    expect(f.gstOnFees).toBeCloseTo(preGst * 0.18, 2);
  });
});

describe("Meesho fees", () => {
  it("0% commission; platform fee + GST + TCS only", () => {
    const f = getFeesForProduct("meesho", "fashion", 599);
    expect(f.referralFee).toBe(0);
    expect(f.platformFee).toBe(27);
    expect(f.gstOnFees).toBeCloseTo(27 * 0.18, 2);
    expect(f.tcs).toBeCloseTo(599 * 0.005, 2);
    expect(f.totalFees).toBeCloseTo(27 + 4.86 + 2.995, 2);
  });
});

describe("Shopify (own store)", () => {
  it("no TCS (no e-commerce operator), gateway fee only, caveat present", () => {
    const f = getFeesForProduct("shopify", "general", 1000);
    expect(f.tcs).toBe(0);
    expect(f.paymentGatewayFee).toBeCloseTo(20, 2);
    expect(f.caveat).toMatch(/plan cost/i);
  });
});

describe("TCS", () => {
  it("is 0.5% on every marketplace (July 2024 rate)", () => {
    for (const channel of ["amazon", "flipkart", "meesho"] as const) {
      const f = getFeesForProduct(channel, "general", 1000);
      expect(f.tcsPercent).toBe(0.5);
      expect(f.tcs).toBeCloseTo(5, 2);
    }
  });
});
