import type { OnboardingProfile } from "@/lib/mvp-data";
import { ALL_MODULE_IDS } from "@/lib/journey-rules";
import { getStepDetail, type StepDetail } from "@/lib/step-details";
import { getAnthropicConfig, generateStructured } from "@/lib/llm/anthropic";

/**
 * Template-anchored personalization. The LLM never supplies numbers, fees, GST
 * deadlines, or new tasks — those come from our deterministic engines. It only
 * rewrites the plain-language framing, re-prioritizes the pre-defined checklist,
 * and adds persona-specific cautions. This keeps hallucinated compliance/fee
 * claims (a legal risk for a "correct numbers" brand) out of the output.
 */

export type PersonalizedModulePlan = {
  moduleId: string;
  /** Personalized replacement for StepDetail.plainLanguageSummary. */
  summary: string;
  /** A re-ordering of the module's existing actionChecklist (validated to
   *  contain only pre-defined items — the model cannot invent actions). */
  orderedChecklist: string[];
  /** Persona-specific cautions (AI-generated prose; no fabricated figures). */
  watchOuts: string[];
};

export type PersonalizedPlan = {
  generatedAt: string;
  model: string;
  modules: PersonalizedModulePlan[];
};

/** StepDetail plus the personalized overlay the UI renders when present. */
export type PersonalizedStepDetail = StepDetail & {
  personalized: boolean;
  watchOuts: string[];
};

type ModuleAnchor = {
  moduleId: string;
  summary: string;
  checklist: string[];
  doneCriteria: string[];
};

function buildAnchors(profile: OnboardingProfile): ModuleAnchor[] {
  return ALL_MODULE_IDS.map((moduleId) => {
    const detail = getStepDetail(moduleId, profile);
    return {
      moduleId,
      summary: detail.plainLanguageSummary,
      checklist: detail.actionChecklist,
      doneCriteria: detail.doneCriteria,
    };
  });
}

const SYSTEM_PROMPT = `You are an experienced Indian e-commerce mentor personalizing a beginner seller's launch plan.

You are given the seller's profile and, per journey module, the factual checklist and done-criteria that our verified engines already produced.

STRICT RULES:
- NEVER invent or state numbers: no fees, commissions, GST rates, deadlines, RTO percentages, or rupee figures. Those live in the app's calculators, not your text.
- The "orderedChecklist" for each module MUST be a re-ordering of exactly the checklist items you were given for that module — do not add, remove, reword, merge, or split items. Copy each item verbatim.
- "summary" rewrites the module's framing in plain, encouraging language tailored to THIS seller's channel, budget, product, and GST status. 1-3 sentences.
- "watchOuts" are 1-3 short, persona-specific cautions (general judgement, not statistics). No figures.
- Be practical and India-specific. No hype, no guarantees of income.
Return JSON matching the provided schema.`;

const PLAN_SCHEMA: Record<string, unknown> = {
  type: "object",
  additionalProperties: false,
  properties: {
    modules: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          moduleId: { type: "string" },
          summary: { type: "string" },
          orderedChecklist: { type: "array", items: { type: "string" } },
          watchOuts: { type: "array", items: { type: "string" } },
        },
        required: ["moduleId", "summary", "orderedChecklist", "watchOuts"],
      },
    },
  },
  required: ["modules"],
};

function buildUserPrompt(profile: OnboardingProfile, anchors: ModuleAnchor[]): string {
  const profileLines = [
    `Experience: ${profile.experienceLevel}`,
    `Budget band: ${profile.budgetBand}`,
    `Primary channel: ${profile.primaryChannel}`,
    `Has GSTIN: ${profile.hasGstin ? "yes" : "no"}`,
    `Product type: ${profile.productType}`,
    `Operating state: ${profile.operatingState}`,
    `Business type: ${profile.businessType}`,
    `Sales model: ${profile.salesModel}`,
    `Imports products: ${profile.importsProducts ? "yes" : "no"}`,
    `Pre-packaged goods: ${profile.sellsPrepackagedGoods ? "yes" : "no"}`,
  ].join("\n");

  const moduleBlocks = anchors
    .map(
      (a) =>
        `MODULE ${a.moduleId}\nCurrent framing: ${a.summary}\nChecklist (re-order only, copy verbatim):\n${a.checklist
          .map((c, i) => `  ${i + 1}. ${c}`)
          .join("\n")}`,
    )
    .join("\n\n");

  return `SELLER PROFILE\n${profileLines}\n\nMODULES\n${moduleBlocks}`;
}

/** Keep only checklist items the model was actually given (verbatim, order-insensitive
 *  match); append any anchor items the model dropped so nothing is lost. */
function reconcileChecklist(anchorChecklist: string[], modelChecklist: string[]): string[] {
  const norm = (s: string) => s.trim().toLowerCase();
  const anchorByNorm = new Map(anchorChecklist.map((c) => [norm(c), c]));
  const result: string[] = [];
  const used = new Set<string>();
  for (const item of modelChecklist) {
    const match = anchorByNorm.get(norm(item));
    if (match && !used.has(match)) {
      result.push(match);
      used.add(match);
    }
  }
  for (const item of anchorChecklist) {
    if (!used.has(item)) result.push(item);
  }
  return result;
}

/**
 * Generate a personalized plan, or null when the LLM is unconfigured or the
 * call fails (callers fall back to static templates). Numbers are never
 * sourced from the model; checklist items are validated against the anchors.
 */
export async function generatePersonalizedPlan(
  profile: OnboardingProfile,
): Promise<PersonalizedPlan | null> {
  const config = getAnthropicConfig();
  if (!config) return null;

  const anchors = buildAnchors(profile);
  const anchorById = new Map(anchors.map((a) => [a.moduleId, a]));

  try {
    const raw = await generateStructured<{ modules: PersonalizedModulePlan[] }>({
      config,
      system: SYSTEM_PROMPT,
      userPrompt: buildUserPrompt(profile, anchors),
      schema: PLAN_SCHEMA,
    });

    const modules: PersonalizedModulePlan[] = (raw.modules ?? [])
      .filter((m) => anchorById.has(m.moduleId))
      .map((m) => {
        const anchor = anchorById.get(m.moduleId)!;
        return {
          moduleId: m.moduleId,
          summary: (m.summary ?? "").trim() || anchor.summary,
          orderedChecklist: reconcileChecklist(anchor.checklist, m.orderedChecklist ?? []),
          watchOuts: (m.watchOuts ?? []).map((w) => w.trim()).filter(Boolean).slice(0, 3),
        };
      });

    if (modules.length === 0) return null;

    return { generatedAt: new Date().toISOString(), model: config.model, modules };
  } catch {
    // Any failure → static templates. Never surface a half-built plan.
    return null;
  }
}

/**
 * Overlay a personalized module plan onto the deterministic StepDetail. Numbers,
 * documents, decision flows, and partner options are unchanged — only framing,
 * checklist order, and the watch-outs come from personalization.
 */
export function applyPersonalizedPlan(
  detail: StepDetail,
  modulePlan: PersonalizedModulePlan | undefined,
): PersonalizedStepDetail {
  if (!modulePlan) {
    return { ...detail, personalized: false, watchOuts: [] };
  }
  return {
    ...detail,
    plainLanguageSummary: modulePlan.summary,
    actionChecklist: reconcileChecklist(detail.actionChecklist, modulePlan.orderedChecklist),
    personalized: true,
    watchOuts: modulePlan.watchOuts,
  };
}
