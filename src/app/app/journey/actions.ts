"use server";

import { revalidatePath } from "next/cache";
import { allSubTasksDone, MODULE_SUB_TASKS } from "@/lib/journey-graph";
import { setModuleCompletionForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor, patchWorkspaceForCurrentVisitor } from "@/lib/workspace-store";

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
