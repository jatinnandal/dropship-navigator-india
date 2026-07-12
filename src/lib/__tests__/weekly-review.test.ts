import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import { calculateProfit } from "@/lib/profit-math";
import { buildWeeklyReview } from "@/lib/weekly-review";

const baseInput = {
  profile: { ...defaultProfile, hasGstin: true },
  hasGstin: true,
  currentModuleId: "product-selection" as const,
  moduleStatus: "available" as const,
  progress: { completedSubTasks: 5, totalSubTasks: 24 },
  now: new Date("2026-07-08T12:00:00"), // a Wednesday
};

describe("buildWeeklyReview", () => {
  it("labels the Monday-anchored week", () => {
    const r = buildWeeklyReview({ ...baseInput, workspace: {} });
    expect(r.weekLabel).toBe("Week of 6 Jul - 12 Jul");
  });

  it("returns null unit economics when nothing is saved", () => {
    const r = buildWeeklyReview({ ...baseInput, workspace: {} });
    expect(r.unit).toBeNull();
  });

  it("computes unit economics from saved workspace numbers via the shared engine", () => {
    const workspace = {
      targetSellingPrice: 599,
      productCost: 200,
      shippingCost: 70,
      estimatedRtoRate: 25,
    };
    const r = buildWeeklyReview({ ...baseInput, workspace });
    const expected = calculateProfit({
      sellingPrice: 599,
      productCost: 200,
      shippingCost: 70,
      adCostPerOrder: 0,
      rtoRatePercent: 25,
      channel: defaultProfile.primaryChannel,
      category: defaultProfile.productType,
      isCod: true,
    });
    expect(r.unit?.netProfitPerOrder).toBeCloseTo(expected.netProfit, 6);
    expect(r.unit?.projections[1]).toEqual({
      orders: 30,
      weeklyProfit: expected.netProfit * 30,
    });
  });

  it("suppresses GST deadlines for sellers without GSTIN", () => {
    const r = buildWeeklyReview({
      ...baseInput,
      hasGstin: false,
      profile: { ...defaultProfile, hasGstin: false },
      workspace: {},
    });
    expect(r.gstEvents).toEqual([]);
  });

  it("carries the recon snapshot through untouched", () => {
    const recon = { uploadedAt: "2026-07-01", totalDelta: 163.41, flaggedCount: 1, tcsEstimate: 17.48 };
    const r = buildWeeklyReview({ ...baseInput, workspace: {}, recon });
    expect(r.recon).toEqual(recon);
  });
});
