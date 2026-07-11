import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import type { TaskStep } from "@/lib/tasks/types";
import {
  applyStepCopy,
  generateModuleCopy,
  isPersonalizableModule,
  profileHash,
  type PersonalizedModulePlan,
} from "@/lib/llm/plan-generator";

describe("isPersonalizableModule", () => {
  it("only the two compliance modules personalize", () => {
    expect(isPersonalizableModule("common-documentation")).toBe(true);
    expect(isPersonalizableModule("compliance-by-product")).toBe(true);
    expect(isPersonalizableModule("product-selection")).toBe(false);
    expect(isPersonalizableModule("channel-launch")).toBe(false);
  });
});

describe("profileHash", () => {
  it("is stable for the same profile", () => {
    expect(profileHash(defaultProfile)).toBe(profileHash({ ...defaultProfile }));
  });
  it("changes with product category and GST status", () => {
    expect(profileHash(defaultProfile)).not.toBe(profileHash({ ...defaultProfile, productType: "food" }));
    expect(profileHash({ ...defaultProfile, hasGstin: false })).not.toBe(
      profileHash({ ...defaultProfile, hasGstin: true }),
    );
  });
});

const staticSteps: TaskStep[] = [
  {
    id: "gstin-input",
    title: "Enter your GSTIN",
    why: "Marketplaces need it.",
    how: ["Paste your 15-digit GSTIN."],
    kind: "input",
    input: { id: "gstin-input", label: "GSTIN", workspaceKey: "gstin" },
  },
  {
    id: "premises",
    title: "Where do you operate?",
    why: "Address proof differs.",
    how: ["Pick owned or rented."],
    kind: "question",
    question: { id: "premises", prompt: "Owned or rented?", options: [] },
    trap: "Missing NOC bounces filings.",
  },
];

describe("applyStepCopy", () => {
  it("returns steps unchanged when there is no plan", () => {
    expect(applyStepCopy(staticSteps, null)).toEqual(staticSteps);
  });

  it("overlays title/why/how/trap by id but preserves the interactive skeleton", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "common-documentation",
      intro: "Tailored intro.",
      steps: [
        {
          id: "gstin-input",
          title: "Enter your Karnataka GSTIN",
          why: "Amazon needs it for your proprietorship.",
          how: ["Paste the 15-digit GSTIN from gst.gov.in."],
        },
      ],
    };
    const out = applyStepCopy(staticSteps, plan);

    // copy overlaid on the matching step
    expect(out[0].title).toBe("Enter your Karnataka GSTIN");
    expect(out[0].why).toContain("proprietorship");
    // interactive skeleton preserved
    expect(out[0].kind).toBe("input");
    expect(out[0].input).toEqual(staticSteps[0].input);
    // step without copy is untouched (incl. its trap + question)
    expect(out[1]).toEqual(staticSteps[1]);
  });

  it("keeps static copy when the personalized fields are empty", () => {
    const plan: PersonalizedModulePlan = {
      moduleId: "common-documentation",
      intro: "",
      steps: [{ id: "gstin-input", title: "", why: "", how: [] }],
    };
    const out = applyStepCopy(staticSteps, plan);
    expect(out[0].title).toBe(staticSteps[0].title);
    expect(out[0].how).toEqual(staticSteps[0].how);
  });
});

describe("generateModuleCopy", () => {
  it("returns null for a non-personalizable module", async () => {
    expect(await generateModuleCopy(defaultProfile, "product-selection")).toBeNull();
  });

  it("returns null when the LLM is unconfigured (graceful static fallback)", async () => {
    const prev = process.env.ANTHROPIC_API_KEY;
    delete process.env.ANTHROPIC_API_KEY;
    expect(await generateModuleCopy(defaultProfile, "common-documentation")).toBeNull();
    if (prev !== undefined) process.env.ANTHROPIC_API_KEY = prev;
  });
});
