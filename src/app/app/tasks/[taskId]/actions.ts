"use server";

import { getWorkspaceForCurrentVisitor, patchWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { setTaskState } from "@/lib/task-progress-store";
import type { TaskState } from "@/lib/tasks/types";
import type { SkuShortlistItem, Workspace } from "@/lib/workspace";

export async function persistTaskState(taskId: string, state: TaskState) {
  await setTaskState(taskId, {
    completed: Array.isArray(state.completed) ? state.completed : [],
    answers: state.answers && typeof state.answers === "object" ? state.answers : {},
  });
}

export async function persistWorkspaceField(
  workspaceKey: keyof Workspace,
  value: string | number,
  taskId: string,
  stepId: string,
  existingAnswers: Record<string, string>,
  existingCompleted: string[],
) {
  const patch: Partial<Workspace> = {};

  if (workspaceKey === "shortlistedSkus") {
    const currentWorkspace = await getWorkspaceForCurrentVisitor();
    const current = currentWorkspace.shortlistedSkus ?? [];
    const name = String(value).trim();
    if (name.length > 0) {
      const next: SkuShortlistItem[] = [...current];
      if (!next.some((sku) => sku.name.toLowerCase() === name.toLowerCase())) {
        next.push({ name });
      }
      patch.shortlistedSkus = next.slice(0, 5);
    }
  } else if (workspaceKey === "estimatedRtoRate") {
    patch.estimatedRtoRate = Number(value);
  } else if (workspaceKey === "netMarginPercent") {
    patch.netMarginPercent = Number(value);
  } else if (workspaceKey === "targetSellingPrice") {
    patch.targetSellingPrice = Number(value);
  } else if (workspaceKey === "productCost") {
    patch.productCost = Number(value);
  } else if (workspaceKey === "breakEvenRoas") {
    patch.breakEvenRoas = Number(value);
  } else if (workspaceKey === "legalBusinessName") {
    patch.legalBusinessName = String(value);
  } else if (workspaceKey === "gstin") {
    const currentWorkspace = await getWorkspaceForCurrentVisitor();
    patch.gstin = String(value);
    patch.subTasks = { ...(currentWorkspace.subTasks ?? {}), "gstin-active": true };
  } else if (workspaceKey === "bankAccountName") {
    patch.bankAccountName = String(value);
  } else if (workspaceKey === "pickupState") {
    patch.pickupState = String(value);
  } else if (workspaceKey === "chosenSupplier") {
    patch.chosenSupplier = String(value);
  }

  const workspace = await patchWorkspaceForCurrentVisitor(patch);

  const nextCompleted = new Set(existingCompleted);
  nextCompleted.add(stepId);
  const nextAnswers = { ...existingAnswers, [`input-${stepId}`]: String(value) };

  await setTaskState(taskId, {
    completed: Array.from(nextCompleted),
    answers: nextAnswers,
  });

  return workspace;
}

export async function persistCalculatorResult(
  result: {
    netMarginPercent: number;
    breakEvenRoas: number;
    estimatedRtoRate: number;
    targetSellingPrice: number;
    productCost: number;
  },
  taskId: string,
  stepId: string,
  existingAnswers: Record<string, string>,
  existingCompleted: string[],
) {
  const workspace = await patchWorkspaceForCurrentVisitor({
    netMarginPercent: result.netMarginPercent,
    breakEvenRoas: result.breakEvenRoas,
    estimatedRtoRate: result.estimatedRtoRate,
    targetSellingPrice: result.targetSellingPrice,
    productCost: result.productCost,
    calculatorSnapshot: {
      netMarginPercent: result.netMarginPercent,
      breakEvenRoas: result.breakEvenRoas,
      estimatedRtoRate: result.estimatedRtoRate,
    },
  });

  const nextCompleted = new Set(existingCompleted);
  nextCompleted.add(stepId);

  await setTaskState(taskId, {
    completed: Array.from(nextCompleted),
    answers: existingAnswers,
  });

  return workspace;
}

export async function persistSimulatorComplete(
  simulatorKind: string,
  taskId: string,
  stepId: string,
  existingAnswers: Record<string, string>,
  existingCompleted: string[],
) {
  const currentWorkspace = await getWorkspaceForCurrentVisitor();
  const nextCompleted = new Set(existingCompleted);
  nextCompleted.add(stepId);

  const workspace = await patchWorkspaceForCurrentVisitor({
    completedSimulators: {
      ...(currentWorkspace.completedSimulators ?? {}),
      [simulatorKind]: true,
    },
  });

  await setTaskState(taskId, {
    completed: Array.from(nextCompleted),
    answers: existingAnswers,
  });

  if (simulatorKind === "ndr_caller") {
    await patchWorkspaceForCurrentVisitor({
      subTasks: { ...(workspace.subTasks ?? {}), "cod-practice-done": true },
    });
  }
  if (simulatorKind === "sourcing_swipe") {
    await patchWorkspaceForCurrentVisitor({
      subTasks: { ...(workspace.subTasks ?? {}), "domestic-supplier-confirmed": true },
    });
  }

  return getWorkspaceForCurrentVisitor();
}

const STEP_SUBTASK_MAP: Record<string, string> = {
  "appeal-pack": "appeal-pack-ready",
  "gstr8-reconcile": "gstr8-reviewed",
};

export async function markSubTaskForStep(stepId: string) {
  const subTaskId = STEP_SUBTASK_MAP[stepId];
  if (!subTaskId) return;
  const workspace = await getWorkspaceForCurrentVisitor();
  await patchWorkspaceForCurrentVisitor({
    subTasks: { ...(workspace.subTasks ?? {}), [subTaskId]: true },
  });
}
