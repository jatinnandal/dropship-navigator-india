import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import { hasMaterialProfileChange } from "@/lib/seller-profile-store";

describe("hasMaterialProfileChange", () => {
  it("is false when nothing changed", () => {
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile })).toBe(false);
  });

  it("is true for each personalization-relevant field", () => {
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, operatingState: "Kerala" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, businessType: "private_limited" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, hasGstin: !defaultProfile.hasGstin })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, salesModel: "own_website_only" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, productType: "electronics" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, importsProducts: !defaultProfile.importsProducts })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, sellsPrepackagedGoods: !defaultProfile.sellsPrepackagedGoods })).toBe(true);
  });

  it("counts every answer change — budget, experience, channel all count now", () => {
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, budgetBand: "above_1l" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, experienceLevel: "existing_seller" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, primaryChannel: "amazon" })).toBe(true);
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile, productDecided: !defaultProfile.productDecided })).toBe(true);
  });

  it("is false when only the name changes (name isn't an answer field)", () => {
    // name lives outside OnboardingProfile, so identical answers => no change
    expect(hasMaterialProfileChange(defaultProfile, { ...defaultProfile })).toBe(false);
  });
});
