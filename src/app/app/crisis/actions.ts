"use server";

import { revalidatePath } from "next/cache";
import type { CrisisType } from "@/lib/crisis/types";
import { getCrisisProtocol } from "@/lib/crisis/playbooks";
import {
  getWorkspaceForCurrentVisitor,
  patchWorkspaceForCurrentVisitor,
} from "@/lib/workspace-store";

function revalidateDashboard() {
  revalidatePath("/app");
}

export async function reportCrisis(type: CrisisType) {
  const workspace = await getWorkspaceForCurrentVisitor();
  const startedAt = new Date().toISOString();

  await patchWorkspaceForCurrentVisitor({
    activeCrisis: { type, startedAt, currentStepIndex: 0 },
    crisisLog: [
      ...(workspace.crisisLog ?? []),
      { type, startedAt, selfReported: true },
    ],
  });

  revalidateDashboard();
}

export async function advanceCrisisStep() {
  const workspace = await getWorkspaceForCurrentVisitor();
  const crisis = workspace.activeCrisis;
  if (!crisis) return;

  const protocol = getCrisisProtocol(crisis.type);
  const nextIndex = Math.min(crisis.currentStepIndex + 1, protocol.steps.length - 1);

  await patchWorkspaceForCurrentVisitor({
    activeCrisis: { ...crisis, currentStepIndex: nextIndex },
  });

  revalidateDashboard();
}

export async function setCrisisStep(stepIndex: number) {
  const workspace = await getWorkspaceForCurrentVisitor();
  const crisis = workspace.activeCrisis;
  if (!crisis) return;

  const protocol = getCrisisProtocol(crisis.type);
  const clamped = Math.max(0, Math.min(stepIndex, protocol.steps.length - 1));

  await patchWorkspaceForCurrentVisitor({
    activeCrisis: { ...crisis, currentStepIndex: clamped },
  });

  revalidateDashboard();
}

export async function resolveCrisis() {
  const workspace = await getWorkspaceForCurrentVisitor();
  const crisis = workspace.activeCrisis;
  if (!crisis) return;

  const resolvedAt = new Date().toISOString();
  const log = [...(workspace.crisisLog ?? [])];
  const lastIdx = log.findLastIndex(
    (entry) => entry.type === crisis.type && !entry.resolvedAt,
  );
  if (lastIdx >= 0) {
    log[lastIdx] = { ...log[lastIdx], resolvedAt };
  }

  await patchWorkspaceForCurrentVisitor({
    activeCrisis: undefined,
    crisisLog: log,
  });

  revalidateDashboard();
}

export async function dismissWarning(warningId: string) {
  const workspace = await getWorkspaceForCurrentVisitor();
  await patchWorkspaceForCurrentVisitor({
    dismissedWarnings: {
      ...(workspace.dismissedWarnings ?? {}),
      [warningId]: new Date().toISOString(),
    },
  });

  revalidateDashboard();
}

export async function saveRtoScenario(input: {
  orders: number;
  rtoRatePercent: number;
  sellingPrice: number;
  productCost: number;
  shippingCost: number;
  netMarginPercent: number;
  breakEvenRoas: number;
}) {
  const workspace = await getWorkspaceForCurrentVisitor();

  await patchWorkspaceForCurrentVisitor({
    targetSellingPrice: input.sellingPrice,
    productCost: input.productCost,
    shippingCost: input.shippingCost,
    estimatedRtoRate: input.rtoRatePercent,
    netMarginPercent: input.netMarginPercent,
    breakEvenRoas: input.breakEvenRoas,
    calculatorSnapshot: {
      netMarginPercent: input.netMarginPercent,
      breakEvenRoas: input.breakEvenRoas,
      estimatedRtoRate: input.rtoRatePercent,
    },
    subTasks: {
      ...(workspace.subTasks ?? {}),
      "breakeven-roas-known": true,
    },
  });

  revalidateDashboard();
}
