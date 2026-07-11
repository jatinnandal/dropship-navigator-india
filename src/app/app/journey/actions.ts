"use server";

import { revalidatePath } from "next/cache";
import { allSubTasksDone, MODULE_SUB_TASKS } from "@/lib/journey-graph";
import {
  getActiveSellerProfileForCurrentVisitor,
  getStoredProfileForCurrentVisitor,
  setModuleCompletionForCurrentVisitor,
} from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor, patchWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { getCurrentPlan } from "@/lib/plan";
import { entitlementsFor } from "@/lib/entitlements";
import { getAnthropicConfig } from "@/lib/llm/anthropic";
import {
  generateModuleCopy,
  isPersonalizableModule,
  profileHash,
} from "@/lib/llm/plan-generator";
import {
  countGenerationsThisMonth,
  getModulePlan,
  insertModulePlan,
} from "@/lib/journey-plan-store";

export type EnsurePlanResult =
  | { ok: true; state: "cached" | "generated" }
  | {
      ok: false;
      reason: "locked" | "no_profile" | "not_personalizable" | "limit" | "unavailable" | "store_failed";
    };

/**
 * Ensure a personalized plan exists for one compliance module + the active
 * profile's current state. Idempotent: if one is already cached for this
 * (profile, module, profile-hash) it does nothing. Otherwise it generates once,
 * under the monthly cap. Auto-fired on the module page; there is no manual
 * regenerate. Degrades to the static template on any failure.
 */
export async function ensureModulePlan(moduleId: string): Promise<EnsurePlanResult> {
  if (!isPersonalizableModule(moduleId)) return { ok: false, reason: "not_personalizable" };

  const [plan, profile, sellerProfile] = await Promise.all([
    getCurrentPlan(),
    getStoredProfileForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);

  const ent = entitlementsFor(plan);
  if (!ent.personalizedPlan) return { ok: false, reason: "locked" };
  if (!sellerProfile) return { ok: false, reason: "no_profile" };

  const hash = profileHash(profile);

  const existing = await getModulePlan(sellerProfile.id, moduleId, hash);
  if (existing) return { ok: true, state: "cached" };

  const used = await countGenerationsThisMonth(sellerProfile.id);
  if (used >= ent.llmPlanRegensPerMonth) return { ok: false, reason: "limit" };

  const generated = await generateModuleCopy(profile, moduleId);
  if (!generated) return { ok: false, reason: "unavailable" };

  const model = getAnthropicConfig()?.model ?? "unknown";
  const stored = await insertModulePlan(sellerProfile.id, moduleId, hash, model, generated);
  if (!stored) return { ok: false, reason: "store_failed" };

  // Personalization renders in the guided walkthrough; refresh it so the
  // auto-loader's generation shows up in place without a manual reload.
  revalidatePath(`/app/tasks/${moduleId}`);
  return { ok: true, state: "generated" };
}

export async function updateModuleCompletion(formData: FormData) {
  const moduleId = String(formData.get("moduleId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!moduleId) return;

  await setModuleCompletionForCurrentVisitor(moduleId, completed);
  revalidatePath("/app/journey");
  revalidatePath("/app");
}

export async function toggleSubTask(subTaskId: string, checked: boolean) {
  const workspace = await getWorkspaceForCurrentVisitor();
  const subTasks = { ...(workspace.subTasks ?? {}), [subTaskId]: checked };

  const def = Object.values(MODULE_SUB_TASKS)
    .flat()
    .find((d) => d.id === subTaskId);

  await patchWorkspaceForCurrentVisitor({ subTasks });

  if (def && checked && allSubTasksDone(def.moduleId, subTasks)) {
    await setModuleCompletionForCurrentVisitor(def.moduleId, true);
  }

  revalidatePath("/app/journey");
  revalidatePath("/app");
  return { subTaskId, checked };
}

export async function resetProductWorkspace() {
  const workspace = await getWorkspaceForCurrentVisitor();
  const subTasks = { ...(workspace.subTasks ?? {}) };
  for (const st of MODULE_SUB_TASKS["product-selection"]) {
    delete subTasks[st.id];
  }

  await patchWorkspaceForCurrentVisitor({
    shortlistedSkus: [],
    targetSellingPrice: undefined,
    productCost: undefined,
    netMarginPercent: undefined,
    breakEvenRoas: undefined,
    estimatedRtoRate: undefined,
    calculatorSnapshot: undefined,
    subTasks,
  });

  await setModuleCompletionForCurrentVisitor("product-selection", false);
  revalidatePath("/app/journey");
  revalidatePath("/app");
}
