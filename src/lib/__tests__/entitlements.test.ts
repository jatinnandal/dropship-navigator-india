import { describe, expect, it } from "vitest";
import {
  canUseCrisisProtocol,
  canUseJourneyModule,
  entitlementsFor,
  FREE_JOURNEY_MODULE,
  planCovers,
  requiredPlanForCrisis,
  requiredPlanForTool,
} from "@/lib/entitlements";

describe("entitlements", () => {
  it("profile caps: 1/2/5", () => {
    expect(entitlementsFor("free").maxProfiles).toBe(1);
    expect(entitlementsFor("starter").maxProfiles).toBe(2);
    expect(entitlementsFor("growth").maxProfiles).toBe(5);
  });

  it("recon quota: 0/1/unlimited", () => {
    expect(entitlementsFor("free").reconPerMonth).toBe(0);
    expect(entitlementsFor("starter").reconPerMonth).toBe(1);
    expect(entitlementsFor("growth").reconPerMonth).toBe(Infinity);
  });

  it("free gets exactly the first journey module", () => {
    expect(FREE_JOURNEY_MODULE).toBe("product-selection");
    expect(canUseJourneyModule("free", FREE_JOURNEY_MODULE)).toBe(true);
    expect(canUseJourneyModule("free", "common-documentation")).toBe(false);
    expect(canUseJourneyModule("free", "supplier-sourcing")).toBe(false);
    expect(canUseJourneyModule("starter", "common-documentation")).toBe(true);
  });

  it("crisis pack: none / core two / all", () => {
    expect(canUseCrisisProtocol("free", "account_suspended")).toBe(false);
    expect(canUseCrisisProtocol("starter", "account_suspended")).toBe(true);
    expect(canUseCrisisProtocol("starter", "gst_notice")).toBe(false);
    expect(canUseCrisisProtocol("growth", "gst_notice")).toBe(true);
    expect(requiredPlanForCrisis("supplier_oos")).toBe("starter");
    expect(requiredPlanForCrisis("review_bombing")).toBe("growth");
  });

  it("tool tiers: scout set free, rest starter", () => {
    expect(requiredPlanForTool("margin-calculator")).toBe("free");
    expect(requiredPlanForTool("seasonal-calendar")).toBe("free");
    expect(requiredPlanForTool("cashflow-simulator")).toBe("starter");
    expect(requiredPlanForTool("payout-reconciliation")).toBe("starter");
  });

  it("plan ordering", () => {
    expect(planCovers("free", "free")).toBe(true);
    expect(planCovers("free", "starter")).toBe(false);
    expect(planCovers("starter", "starter")).toBe(true);
    expect(planCovers("starter", "growth")).toBe(false);
    expect(planCovers("growth", "starter")).toBe(true);
  });

  it("weekly digest starter+, rate alerts growth only", () => {
    expect(entitlementsFor("free").weeklyDigest).toBe(false);
    expect(entitlementsFor("starter").weeklyDigest).toBe(true);
    expect(entitlementsFor("starter").rateAlerts).toBe(false);
    expect(entitlementsFor("growth").rateAlerts).toBe(true);
  });

  it("recon history retention: 0 / 3mo / 12mo", () => {
    expect(entitlementsFor("free").reconHistoryMonths).toBe(0);
    expect(entitlementsFor("starter").reconHistoryMonths).toBe(3);
    expect(entitlementsFor("growth").reconHistoryMonths).toBe(12);
  });

  it("personalized plan starter+, with regen caps", () => {
    expect(entitlementsFor("free").personalizedPlan).toBe(false);
    expect(entitlementsFor("starter").personalizedPlan).toBe(true);
    expect(entitlementsFor("growth").personalizedPlan).toBe(true);
    expect(entitlementsFor("free").llmPlanRegensPerMonth).toBe(0);
    expect(entitlementsFor("starter").llmPlanRegensPerMonth).toBe(10);
    expect(entitlementsFor("growth").llmPlanRegensPerMonth).toBe(30);
  });

  it("material profile-change cap: 2 / 6 / 20", () => {
    expect(entitlementsFor("free").materialProfileChangesPerMonth).toBe(2);
    expect(entitlementsFor("starter").materialProfileChangesPerMonth).toBe(6);
    expect(entitlementsFor("growth").materialProfileChangesPerMonth).toBe(20);
  });
});
