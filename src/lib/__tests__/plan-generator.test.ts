import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import { getStepDetail } from "@/lib/step-details";
import {
  applyPersonalizedPlan,
  generatePersonalizedPlan,
  type PersonalizedModulePlan,
} from "@/lib/llm/plan-generator";

const base = getStepDetail("product-selection", defaultProfile);

describe("applyPersonalizedPlan", () => {
  it("passthrough when no personalization", () => {
    const out = applyPersonalizedPlan(base, undefined);
    expect(out.personalized).toBe(false);
    expect(out.watchOuts).toEqual([]);
    expect(out.actionChecklist).toEqual(base.actionChecklist);
    expect(out.plainLanguageSummary).toBe(base.plainLanguageSummary);
  });

  it("overlays summary + watch-outs and re-orders the checklist", () => {
    const reversed = [...base.actionChecklist].reverse();
    const plan: PersonalizedModulePlan = {
      moduleId: "product-selection",
      summary: "Custom summary for this seller.",
      orderedChecklist: reversed,
      watchOuts: ["Watch your COD mix.", "Don't over-order samples."],
    };
    const out = applyPersonalizedPlan(base, plan);
    expect(out.personalized).toBe(true);
    expect(out.plainLanguageSummary).toBe("Custom summary for this seller.");
    expect(out.actionChecklist).toEqual(reversed);
    expect(out.watchOuts).toHaveLength(2);
  });

  it("drops invented checklist items and never loses a real one", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "product-selection",
      summary: "s",
      // one real item (verbatim) + one hallucinated item
      orderedChecklist: [base.actionChecklist[1], "Buy 500 units up front today"],
      watchOuts: [],
    };
    const out = applyPersonalizedPlan(base, plan);
    // hallucinated item must not appear
    expect(out.actionChecklist).not.toContain("Buy 500 units up front today");
    // every original item is still present (nothing lost)
    for (const item of base.actionChecklist) {
      expect(out.actionChecklist).toContain(item);
    }
    // the model's prioritized real item leads
    expect(out.actionChecklist[0]).toBe(base.actionChecklist[1]);
  });

  it("numbers/documents/decisionFlow are never touched by personalization", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "product-selection",
      summary: "s",
      orderedChecklist: base.actionChecklist,
      watchOuts: [],
    };
    const out = applyPersonalizedPlan(base, plan);
    expect(out.mustHaveDocuments).toEqual(base.mustHaveDocuments);
    expect(out.decisionFlow).toEqual(base.decisionFlow);
    expect(out.partnerOptions).toEqual(base.partnerOptions);
  });
});

describe("generatePersonalizedPlan", () => {
  it("returns null when the LLM is unconfigured (graceful static fallback)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    const plan = await generatePersonalizedPlan(defaultProfile);
    expect(plan).toBeNull();
    if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
  });
});
