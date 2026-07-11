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
import { generatePersonalizedPlan } from "@/lib/llm/plan-generator";
import { countRegensThisMonth, insertPlan } from "@/lib/journey-plan-store";

export type GeneratePlanResult =
  | { ok: true }
  | { ok: false; reason: "locked" | "no_profile" | "limit" | "unavailable" | "store_failed" };

/**
 * Generate + persist an LLM personalized plan for the active profile.
 * Starter+ only; capped per month; degrades to static templates when the LLM
 * is unconfigured or declines (reason "unavailable").
 */
export async function generatePersonalizedPlanAction(): Promise<GeneratePlanResult> {
  const [plan, profile, sellerProfile] = await Promise.all([
    getCurrentPlan(),
    getStoredProfileForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);

  const ent = entitlementsFor(plan);
  if (!ent.personalizedPlan) return { ok: false, reason: "locked" };
  if (!sellerProfile) return { ok: false, reason: "no_profile" };

  const used = await countRegensThisMonth(sellerProfile.id);
  if (used >= ent.llmPlanRegensPerMonth) return { ok: false, reason: "limit" };

  const generated = await generatePersonalizedPlan(profile);
  if (!generated) return { ok: false, reason: "unavailable" };

  const stored = await insertPlan(sellerProfile.id, generated);
  if (!stored) return { ok: false, reason: "store_failed" };

  revalidatePath("/app/journey", "layout");
  revalidatePath("/app");
  return { ok: true };
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
