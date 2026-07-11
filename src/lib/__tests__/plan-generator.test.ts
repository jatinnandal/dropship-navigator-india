import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import { getStepDetail } from "@/lib/step-details";
import {
  applyPersonalizedPlan,
  generateModulePlan,
  isPersonalizableModule,
  profileHash,
  type PersonalizedModulePlan,
} from "@/lib/llm/plan-generator";

const base = getStepDetail("common-documentation", defaultProfile);

describe("isPersonalizableModule", () => {
  it("only the two compliance modules personalize", () => {
    expect(isPersonalizableModule("common-documentation")).toBe(true);
    expect(isPersonalizableModule("compliance-by-product")).toBe(true);
    expect(isPersonalizableModule("product-selection")).toBe(false);
    expect(isPersonalizableModule("channel-launch")).toBe(false);
    expect(isPersonalizableModule("ads-growth")).toBe(false);
  });
});

describe("profileHash", () => {
  it("is stable for the same profile", () => {
    expect(profileHash(defaultProfile)).toBe(profileHash({ ...defaultProfile }));
  });
  it("changes when the product category changes", () => {
    const a = profileHash(defaultProfile);
    const b = profileHash({ ...defaultProfile, productType: "food" });
    expect(a).not.toBe(b);
  });
  it("changes when GST status changes", () => {
    const a = profileHash({ ...defaultProfile, hasGstin: false });
    const b = profileHash({ ...defaultProfile, hasGstin: true });
    expect(a).not.toBe(b);
  });
});

describe("applyPersonalizedPlan", () => {
  it("passthrough when no personalization", () => {
    const out = applyPersonalizedPlan(base, undefined);
    expect(out.personalized).toBe(false);
    expect(out.steps).toEqual([]);
    expect(out.watchOuts).toEqual([]);
    expect(out.plainLanguageSummary).toBe(base.plainLanguageSummary);
  });

  it("overlays summary, steps, and watch-outs", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "common-documentation",
      summary: "Your exact doc path.",
      steps: [
        { title: "Register GST", detail: "As a Pvt Ltd in Karnataka…" },
        { title: "Match bank name", detail: "…" },
      ],
      watchOuts: ["Name mismatch is the #1 rejection."],
    };
    const out = applyPersonalizedPlan(base, plan);
    expect(out.personalized).toBe(true);
    expect(out.plainLanguageSummary).toBe("Your exact doc path.");
    expect(out.steps).toHaveLength(2);
    expect(out.steps[0].title).toBe("Register GST");
    expect(out.watchOuts).toHaveLength(1);
  });

  it("never touches documents / decisionFlow / done-criteria / partners", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "common-documentation",
      summary: "s",
      steps: [{ title: "t", detail: "d" }],
      watchOuts: [],
    };
    const out = applyPersonalizedPlan(base, plan);
    expect(out.mustHaveDocuments).toEqual(base.mustHaveDocuments);
    expect(out.decisionFlow).toEqual(base.decisionFlow);
    expect(out.doneCriteria).toEqual(base.doneCriteria);
    expect(out.partnerOptions).toEqual(base.partnerOptions);
  });
});

describe("generateModulePlan", () => {
  it("returns null for a non-personalizable module without calling the LLM", async () => {
    const plan = await generateModulePlan(defaultProfile, "product-selection");
    expect(plan).toBeNull();
  });

  it("returns null when the LLM is unconfigured (graceful static fallback)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const plan = await generateModulePlan(defaultProfile, "common-documentation");
    expect(plan).toBeNull();
    if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
  });
});
