import { createHash } from "crypto";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { getStepDetail, type StepDetail } from "@/lib/step-details";
import { getAnthropicConfig, generateStructured } from "@/lib/llm/anthropic";

/**
 * Personalized COMPLIANCE plan. Only the two modules whose required steps
 * genuinely differ per seller are personalized: documentation + GST and
 * product-compliance. The LLM assembles the seller's exact ordered path from
 * the deterministic requirement data we supply — it never invents documents,
 * fees, GST rates, or deadlines (those stay in the authoritative sections and
 * the calculators). Everything else stays on the static template.
 */

/** The only modules that get an LLM-personalized plan. */
export const PERSONALIZED_MODULES = ["common-documentation", "compliance-by-product"];

export function isPersonalizableModule(moduleId: string): boolean {
  return PERSONALIZED_MODULES.includes(moduleId);
}

export type PersonalizedStep = {
  title: string;
  detail: string;
};

export type PersonalizedModulePlan = {
  moduleId: string;
  /** Personalized replacement for StepDetail.plainLanguageSummary. */
  summary: string;
  /** Ordered, profile-exact steps assembled from the module's requirement data. */
  steps: PersonalizedStep[];
  /** Persona-specific cautions (no figures). */
  watchOuts: string[];
};

/** StepDetail plus the personalized overlay the UI renders when present. */
export type PersonalizedStepDetail = StepDetail & {
  personalized: boolean;
  steps: PersonalizedStep[];
  watchOuts: string[];
};

/**
 * Stable hash of the compliance-relevant profile fields. Two profiles with the
 * same hash produce the same plan, so generation is idempotent per (hash ×
 * module) and cannot be looped. Changing product/entity/state/GST/model mints a
 * new hash → one fresh generation.
 */
export function profileHash(profile: OnboardingProfile): string {
  const key = [
    profile.businessType,
    profile.operatingState,
    profile.hasGstin ? "gst" : "nogst",
    profile.salesModel,
    profile.productType,
    profile.importsProducts ? "import" : "domestic",
    profile.sellsPrepackagedGoods ? "prepack" : "custom",
  ].join("|");
  return createHash("sha256").update(key).digest("hex").slice(0, 16);
}

const SYSTEM_PROMPT = `You are an experienced Indian e-commerce mentor writing a seller's EXACT compliance/setup path for one journey module.

You are given the seller's profile and the deterministic requirement data our engines produced for this module (documents, decision points, execution phases, done-criteria). Turn it into a precise, ordered, plain-language plan for THIS seller's exact situation.

STRICT RULES:
- Use ONLY the provided requirements. Do NOT introduce documents, licenses, portals, fees, GST rates, thresholds, penalties, or deadlines that were not given. If a number would be needed, refer the seller to the app's calculator/checklist instead of stating it.
- "steps" is an ORDERED list (4-8 items). Each step: a short "title" (imperative) and a "detail" (1-2 sentences, tailored to this seller's entity type, state, GST status, product category, import/pre-packaged status). You may merge, sequence, and prioritize the provided requirements; do not pad with generic filler.
- "summary": 1-2 sentences framing why this module matters for THIS seller.
- "watchOuts": 1-3 short persona-specific cautions (judgement, not statistics). No figures.
- India-specific, practical, honest. No income guarantees.
Return JSON matching the provided schema.`;

const PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    summary: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
        required: ["title", "detail"],
      },
    },
    watchOuts: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "steps", "watchOuts"],
};

function buildUserPrompt(profile: OnboardingProfile, moduleId: string, detail: StepDetail): string {
  const profileLines = [
    `Experience: ${profile.experienceLevel}`,
    `Budget band: ${profile.budgetBand}`,
    `Primary channel: ${profile.primaryChannel}`,
    `Has GSTIN: ${profile.hasGstin ? "yes" : "no"}`,
    `Product category: ${profile.productType}`,
    `Operating state: ${profile.operatingState}`,
    `Business type: ${profile.businessType}`,
    `Sales model: ${profile.salesModel}`,
    `Imports products: ${profile.importsProducts ? "yes" : "no"}`,
    `Pre-packaged goods: ${profile.sellsPrepackagedGoods ? "yes" : "no"}`,
  ].join("\n");

  const requirements = [
    `Must-have documents:\n${detail.mustHaveDocuments.map((d) => `  - ${d}`).join("\n")}`,
    `Decision points:\n${detail.decisionFlow.map((d) => `  - ${d}`).join("\n")}`,
    `Execution phases:\n${detail.executionPlan
      .map((p) => `  ${p.phase} (${p.goal})\n${p.tasks.map((t) => `    - ${t}`).join("\n")}`)
      .join("\n")}`,
    `Done when:\n${detail.doneCriteria.map((d) => `  - ${d}`).join("\n")}`,
  ].join("\n\n");

  return `MODULE: ${moduleId}\n\nSELLER PROFILE\n${profileLines}\n\nREQUIREMENT DATA (use only this)\n${requirements}`;
}

/**
 * Generate a personalized plan for one compliance module, or null when the
 * module isn't personalizable, the LLM is unconfigured, or the call fails
 * (callers fall back to the static template).
 */
export async function generateModulePlan(
  profile: OnboardingProfile,
  moduleId: string,
): Promise<PersonalizedModulePlan | null> {
  if (!isPersonalizableModule(moduleId)) return null;
  const config = getAnthropicConfig();
  if (!config) return null;

  const detail = getStepDetail(moduleId, profile);

  try {
    const raw = await generateStructured<{
      summary: string;
      steps: PersonalizedStep[];
      watchOuts: string[];
    }>({
      config,
      system: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(profile, moduleId, detail),
      schema: PLAN_SCHEMA,
    });

    const steps = (raw.steps ?? [])
      .map((s) => ({ title: (s.title ?? "").trim(), detail: (s.detail ?? "").trim() }))
      .filter((s) => s.title && s.detail)
      .slice(0, 8);

    if (steps.length === 0) return null;

    return {
      moduleId,
      summary: (raw.summary ?? "").trim() || detail.plainLanguageSummary,
      steps,
      watchOuts: (raw.watchOuts ?? []).map((w) => w.trim()).filter(Boolean).slice(0, 3),
    };
  } catch (err) {
    // Any failure → static template. Surface the reason in dev only.
    if (process.env.NODE_ENV !== "production") {
      console.error(
        "[personalized-plan] generation failed:",
        err instanceof Error ? err.message : err,
      );
    }
    return null;
  }
}

/**
 * Overlay a personalized module plan onto the deterministic StepDetail. Numbers,
 * documents, decision flow, done-criteria, and partner options are unchanged —
 * they remain the authoritative ground truth; personalization adds the tailored
 * ordered path, framing, and watch-outs on top.
 */
export function applyPersonalizedPlan(
  detail: StepDetail,
  modulePlan: PersonalizedModulePlan | undefined,
): PersonalizedStepDetail {
  if (!modulePlan) {
    return { ...detail, personalized: false, steps: [], watchOuts: [] };
  }
  return {
    ...detail,
    plainLanguageSummary: modulePlan.summary,
    personalized: true,
    steps: modulePlan.steps,
    watchOuts: modulePlan.watchOuts,
  };
}
