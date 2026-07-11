import { describe, expect, it } from "vitest";
import { CURRENT_RATES, PREVIOUS_RATES } from "@/data/rates";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import { defaultProfile } from "@/lib/mvp-data";
import { computeRatesImpact } from "@/lib/rates-impact";

const amazonFashionProfile = {
  ...defaultProfile,
  primaryChannel: "amazon" as const,
  productType: "fashion" as const,
};

const savedNumbers = {
  targetSellingPrice: 599,
  productCost: 200,
  shippingCost: 70,
  estimatedRtoRate: 25,
};

describe("versioned rate cards", () => {
  it("current and previous cards are distinct versions", () => {
    expect(CURRENT_RATES.meta.version).not.toBe(PREVIOUS_RATES.meta.version);
    expect(CURRENT_RATES.meta.changelog.length).toBeGreaterThan(0);
  });

  it("default fees equal explicit CURRENT_RATES fees", () => {
    const implicit = getFeesForProduct("amazon", "fashion", 599, true);
    const explicit = getFeesForProduct("amazon", "fashion", 599, true, CURRENT_RATES);
    expect(implicit.totalFees).toBe(explicit.totalFees);
  });

  it("Q1 card still charges referral under ₹1,000 (pre-program)", () => {
    const q1 = getFeesForProduct("amazon", "fashion", 599, true, PREVIOUS_RATES);
    const q3 = getFeesForProduct("amazon", "fashion", 599, true, CURRENT_RATES);
    expect(q1.referralPercent).toBe(13);
    expect(q3.referralPercent).toBe(0);
  });
});

describe("computeRatesImpact", () => {
  it("reports the margin gain for an affected user (amazon fashion ≤ ₹1,000)", () => {
    const impact = computeRatesImpact({
      profile: amazonFashionProfile,
      workspace: savedNumbers,
    });
    expect(impact).not.toBeNull();
    expect(impact!.deltaPoints).toBeGreaterThan(0); // 13% referral dropped to 0
    expect(impact!.changes.some((c) => c.includes("13%") && c.includes("0%"))).toBe(true);
    expect(impact!.toVersion).toBe(CURRENT_RATES.meta.version);
  });

  it("stays silent for unaffected users (meesho)", () => {
    const impact = computeRatesImpact({
      profile: { ...defaultProfile, primaryChannel: "meesho" as const },
      workspace: savedNumbers,
    });
    expect(impact).toBeNull();
  });

  it("stays silent without saved numbers", () => {
    const impact = computeRatesImpact({
      profile: amazonFashionProfile,
      workspace: {},
    });
    expect(impact).toBeNull();
  });

  it("delta matches the fee difference directionally", () => {
    const impact = computeRatesImpact({
      profile: amazonFashionProfile,
      workspace: savedNumbers,
    })!;
    // Removing a 13% referral fee on ₹599 saves ~₹78 + GST before RTO weighting.
    expect(impact.newNetProfit - impact.oldNetProfit).toBeGreaterThan(50);
  });
});
