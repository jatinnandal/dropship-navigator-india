import { createHash } from "crypto";
import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { TaskStep } from "@/lib/tasks/types";
import { buildTask } from "@/lib/tasks";
import { getAnthropicConfig, generateStructured } from "@/lib/llm/anthropic";

/**
 * Personalizes the COMPLIANCE walkthroughs by rewriting each step's copy for the
 * seller's exact situation ("fill the template"). The interactive skeleton —
 * which steps exist, their inputs, questions, subtask/milestone wiring — is
 * untouched; only the title/why/how/trap text changes. The LLM never introduces
 * documents, fees, GST rates, or deadlines beyond what the step already covers.
 */

/** The only modules that get LLM-personalized copy. */
export const PERSONALIZED_MODULES = ["common-documentation", "compliance-by-product"];

export function isPersonalizableModule(moduleId: string): boolean {
  return PERSONALIZED_MODULES.includes(moduleId);
}

export type PersonalizedStepCopy = {
  id: string;
  title: string;
  why: string;
  how: string[];
  trap?: string;
};

export type PersonalizedModulePlan = {
  moduleId: string;
  /** Personalized replacement for the walkthrough intro. */
  intro: string;
  /** Per-step copy, keyed by the static step id (extra ids are ignored). */
  steps: PersonalizedStepCopy[];
};

/**
 * Stable hash of the compliance-relevant profile fields. Same hash → same copy,
 * so generation is idempotent per (hash × module); changing product/entity/
 * state/GST/model mints one fresh personalization.
 */
/** Bump when the generation shape changes — invalidates all prior cached rows. */
const PLAN_SCHEMA_VERSION = "v2";

export function profileHash(profile: OnboardingProfile): string {
  const key = [
    PLAN_SCHEMA_VERSION,
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

const SYSTEM_PROMPT = `You are an experienced Indian e-commerce mentor personalizing the copy of a guided compliance walkthrough for one seller.

You are given the seller's profile and the walkthrough's existing steps (id + title + why + how + optional trap). Rewrite the TEXT of each step so it speaks directly to THIS seller's entity type, state, GST status, product category, and import/pre-packaged status.

STRICT RULES:
- Keep every step's id EXACTLY as given, and keep the same set of steps (do not add, drop, merge, or reorder). If a step asks the seller to enter or confirm something, keep that intent — only change the wording.
- Do NOT introduce documents, licenses, portals, fees, GST rates, thresholds, penalties, or deadlines beyond what the original step already covers. If a number would be needed, keep the original's phrasing or refer to the app's checklist.
- "why" is 1 sentence. "how" is 2-4 short imperative bullets. "trap" (only if the original had one, or the seller's setup has a clear specific risk) is 1 sentence.
- "intro" is 1-2 sentences framing the whole walkthrough for this seller.
- India-specific, practical, plain language. No hype, no income guarantees.
Return JSON matching the provided schema.`;

const PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    intro: { type: "string" },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          id: { type: "string" },
          title: { type: "string" },
          why: { type: "string" },
          how: { type: "array", items: { type: "string" } },
          trap: { type: "string" },
        },
        required: ["id", "title", "why", "how"],
      },
    },
  },
  required: ["intro", "steps"],
};

function baseSteps(profile: OnboardingProfile, moduleId: string): TaskStep[] {
  const task = buildTask(moduleId, profile, {}, {} as Workspace);
  return task?.steps ?? [];
}

function buildUserPrompt(profile: OnboardingProfile, steps: TaskStep[]): string {
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

  const stepBlocks = steps
    .map(
      (s) =>
        `id: ${s.id}\ntitle: ${s.title}\nwhy: ${s.why}\nhow:\n${s.how.map((h) => `  - ${h}`).join("\n")}${
          s.trap ? `\ntrap: ${s.trap}` : ""
        }`,
    )
    .join("\n\n");

  return `SELLER PROFILE\n${profileLines}\n\nWALKTHROUGH STEPS (rewrite the copy, keep ids)\n${stepBlocks}`;
}

/**
 * Generate personalized copy for one compliance module, or null when the module
 * isn't personalizable, the LLM is unconfigured, or the call fails (callers
 * fall back to the static template).
 */
export async function generateModuleCopy(
  profile: OnboardingProfile,
  moduleId: string,
): Promise<PersonalizedModulePlan | null> {
  if (!isPersonalizableModule(moduleId)) return null;
  const config = getAnthropicConfig();
  if (!config) return null;

  const steps = baseSteps(profile, moduleId);
  if (steps.length === 0) return null;
  const validIds = new Set(steps.map((s) => s.id));

  try {
    const raw = await generateStructured<{ intro: string; steps: PersonalizedStepCopy[] }>({
      config,
      system: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(profile, steps),
      schema: PLAN_SCHEMA,
      maxTokens: 4096,
    });

    const copy: PersonalizedStepCopy[] = (raw.steps ?? [])
      .filter((s) => s && validIds.has(s.id))
      .map((s) => ({
        id: s.id,
        title: (s.title ?? "").trim(),
        why: (s.why ?? "").trim(),
        how: (s.how ?? []).map((h) => h.trim()).filter(Boolean),
        trap: s.trap?.trim() || undefined,
      }))
      .filter((s) => s.title || s.why || s.how.length > 0);

    if (copy.length === 0) return null;

    return { moduleId, intro: (raw.intro ?? "").trim(), steps: copy };
  } catch (err) {
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
 * Overlay personalized copy onto the walkthrough's steps. Only title/why/how/trap
 * are replaced (per matching id); kind, inputs, questions, tools, and mentor
 * notes — everything interactive — are preserved. Steps without personalized
 * copy keep their static text.
 */
export function applyStepCopy(
  steps: TaskStep[],
  plan: PersonalizedModulePlan | null | undefined,
): TaskStep[] {
  if (!plan) return steps;
  const byId = new Map(plan.steps.map((s) => [s.id, s]));
  return steps.map((step) => {
    const c = byId.get(step.id);
    if (!c) return step;
    return {
      ...step,
      title: c.title || step.title,
      why: c.why || step.why,
      how: c.how.length > 0 ? c.how : step.how,
      trap: c.trap ?? step.trap,
    };
  });
}
