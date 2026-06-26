import type { TaskModuleId } from "@/lib/tasks";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { getSubTaskGuide } from "@/lib/subtask-guides";

export type JourneyEdgeKind = "prerequisite" | "recommended" | "loop";

export type JourneyEdge = {
  from: TaskModuleId;
  to: TaskModuleId;
  kind: JourneyEdgeKind;
};

export const JOURNEY_EDGES: JourneyEdge[] = [
  { from: "common-documentation", to: "compliance-by-product", kind: "recommended" },
  { from: "common-documentation", to: "channel-launch", kind: "recommended" },
  { from: "product-selection", to: "compliance-by-product", kind: "recommended" },
  { from: "product-selection", to: "supplier-sourcing", kind: "recommended" },
  { from: "product-selection", to: "channel-launch", kind: "recommended" },
  { from: "product-selection", to: "product-selection", kind: "loop" },
  { from: "compliance-by-product", to: "channel-launch", kind: "recommended" },
  { from: "supplier-sourcing", to: "channel-launch", kind: "recommended" },
  { from: "channel-launch", to: "ads-growth", kind: "prerequisite" },
  { from: "channel-launch", to: "tracking-analytics", kind: "recommended" },
  { from: "ads-growth", to: "tracking-analytics", kind: "recommended" },
];

export type JourneyNodeStatus = "locked" | "available" | "in_progress" | "done";

export type JourneySubTaskDef = {
  id: string;
  moduleId: TaskModuleId;
  label: string;
  hint?: string;
};

export type JourneyNode = {
  id: TaskModuleId;
  title: string;
  status: JourneyNodeStatus;
  blockedBy: { subTaskId: string; label: string; moduleId: TaskModuleId }[];
  softWarnings: string[];
  subTasks: (JourneySubTaskDef & { done: boolean })[];
  progressPercent: number;
};

export const MODULE_SUB_TASKS: Record<TaskModuleId, JourneySubTaskDef[]> = {
  "common-documentation": [
    { id: "docs-folder-ready", moduleId: "common-documentation", label: "Master document folder created" },
    { id: "gstin-active", moduleId: "common-documentation", label: "GSTIN obtained or validated" },
    { id: "bank-matched", moduleId: "common-documentation", label: "Bank name matches legal name" },
    { id: "gst-filing-understood", moduleId: "common-documentation", label: "GST filing calendar understood" },
  ],
  "product-selection": [
    { id: "product-shortlist", moduleId: "product-selection", label: "3 products shortlisted with margin check" },
    { id: "samples-ordered", moduleId: "product-selection", label: "Sample order placed" },
  ],
  "compliance-by-product": [
    { id: "hsn-mapped", moduleId: "compliance-by-product", label: "HSN codes mapped for launch SKUs" },
    { id: "category-certs", moduleId: "compliance-by-product", label: "Category certificates ready (if needed)" },
  ],
  "supplier-sourcing": [
    { id: "supplier-vetted", moduleId: "supplier-sourcing", label: "Primary supplier vetted + terms in writing" },
    { id: "backup-supplier", moduleId: "supplier-sourcing", label: "Backup supplier identified" },
    { id: "domestic-supplier-confirmed", moduleId: "supplier-sourcing", label: "Domestic supplier confirmed (not AliExpress)" },
  ],
  "channel-launch": [
    { id: "seller-account-live", moduleId: "channel-launch", label: "Seller account approved" },
    { id: "first-listing-live", moduleId: "channel-launch", label: "First 3 listings live" },
    { id: "store-linked", moduleId: "channel-launch", label: "Store / channel linked and payout ready" },
    { id: "cod-practice-done", moduleId: "channel-launch", label: "COD confirmation practice completed" },
    { id: "first-payout-received", moduleId: "channel-launch", label: "First payout received in bank" },
  ],
  "ads-growth": [
    { id: "breakeven-roas-known", moduleId: "ads-growth", label: "Break-even ROAS calculated" },
    { id: "first-ad-test", moduleId: "ads-growth", label: "First controlled ad test running" },
  ],
  "tracking-analytics": [
    { id: "pnl-sheet-ready", moduleId: "tracking-analytics", label: "Weekly P&L sheet set up" },
    { id: "settlement-reconcile", moduleId: "tracking-analytics", label: "First settlement reconciled" },
    { id: "appeal-pack-ready", moduleId: "tracking-analytics", label: "Appeal pack folder assembled" },
    { id: "gstr8-reviewed", moduleId: "tracking-analytics", label: "GSTR-8 / TCS reconciliation reviewed" },
  ],
};

/** Hard locks: module cannot start guided walkthrough until prerequisite sub-tasks done */
const MODULE_LOCKS: Partial<Record<TaskModuleId, { subTaskId: string; moduleId: TaskModuleId }[]>> = {
  "ads-growth": [{ subTaskId: "first-listing-live", moduleId: "channel-launch" }],
};

export function isSubTaskDone(subTasks: Record<string, boolean> | undefined, subTaskId: string): boolean {
  return subTasks?.[subTaskId] === true;
}

export function isSimulatorDone(
  completedSimulators: Record<string, boolean> | undefined,
  kind: string,
): boolean {
  return completedSimulators?.[kind] === true;
}

export function getSubTaskProgress(
  moduleId: TaskModuleId,
  subTasks: Record<string, boolean> | undefined,
): number {
  const defs = MODULE_SUB_TASKS[moduleId];
  if (defs.length === 0) return 0;
  const done = defs.filter((d) => isSubTaskDone(subTasks, d.id)).length;
  return Math.round((done / defs.length) * 100);
}

function buildSoftWarnings(
  moduleId: TaskModuleId,
  input: {
    hasGstin: boolean;
    profile: OnboardingProfile;
    completedSimulators?: Record<string, boolean>;
    subTasks?: Record<string, boolean>;
  },
): string[] {
  const { hasGstin, profile, completedSimulators, subTasks } = input;
  const warnings: string[] = [];

  if (moduleId === "compliance-by-product" && !hasGstin) {
    warnings.push("GSTIN not saved yet — compliance steps may block marketplace listing.");
  }

  if (moduleId === "product-selection" && profile.productType === "fashion") {
    if (!isSimulatorDone(completedSimulators, "rto_reality")) {
      warnings.push("Recommended: complete the RTO Reality slider with fashion defaults (35% RTO).");
    }
  }

  if (moduleId === "supplier-sourcing" && !isSimulatorDone(completedSimulators, "sourcing_swipe")) {
    warnings.push("Recommended: play the sourcing swipe game — avoid AliExpress/CJ traps.");
  }

  if (moduleId === "ads-growth") {
    if (!isSimulatorDone(completedSimulators, "rto_reality")) {
      warnings.push("Recommended: run Will I Survive? RTO slider before scaling ad spend.");
    }
    if (!isSimulatorDone(completedSimulators, "cod_prepaid_mix")) {
      warnings.push("Recommended: model your COD vs prepaid payment mix.");
    }
    if (profile.productType === "fashion") {
      warnings.push("Fashion + COD: budget 35% RTO and high return rates in ad math.");
    }
  }

  if (moduleId === "tracking-analytics" && !isSubTaskDone(subTasks, "settlement-reconcile")) {
    warnings.push("Reconcile your first settlement — catches payout holds and silent underpayment.");
  }

  if (moduleId === "channel-launch" && profile.primaryChannel === "shopify") {
    if (profile.businessType === "individual") {
      warnings.push("Individuals face higher PG rejection — Zero-PG COD path may be needed.");
    }
  }

  if (moduleId === "channel-launch") {
    if (!isSubTaskDone(subTasks, "hsn-mapped")) {
      warnings.push("Recommended: map HSN codes before listing — wrong tax rate triggers suppression.");
    }
    if (!hasGstin) {
      warnings.push("No GSTIN saved — most marketplaces block listing until GST is active.");
    }
    if (!isSubTaskDone(subTasks, "supplier-vetted")) {
      warnings.push("Recommended: vet supplier before scaling listings — stockouts cause cancellation penalties.");
    }
  }

  if (moduleId === "ads-growth" && !isSubTaskDone(subTasks, "breakeven-roas-known")) {
    warnings.push("Recommended: know break-even ROAS before spending on ads.");
  }

  return warnings;
}

export function getJourneyNodes(input: {
  completedModules: Set<string>;
  subTasks: Record<string, boolean> | undefined;
  completedSimulators?: Record<string, boolean>;
  hasGstin: boolean;
  profile: OnboardingProfile;
}): JourneyNode[] {
  const { completedModules, subTasks, completedSimulators, hasGstin, profile } = input;
  const moduleIds = Object.keys(MODULE_SUB_TASKS) as TaskModuleId[];

  return moduleIds.map((moduleId) => {
    const defs = MODULE_SUB_TASKS[moduleId];
    const subTaskStates = defs.map((d) => {
      const guide = getSubTaskGuide(d.id, moduleId);
      return { ...d, hint: guide.hint, done: isSubTaskDone(subTasks, d.id) };
    });
    const progressPercent = getSubTaskProgress(moduleId, subTasks);
    const allSubDone = subTaskStates.every((s) => s.done);
    const moduleMarkedDone = completedModules.has(moduleId);

    const locks = MODULE_LOCKS[moduleId] ?? [];
    const blockedBy = locks
      .filter((lock) => !isSubTaskDone(subTasks, lock.subTaskId))
      .map((lock) => {
        const def = MODULE_SUB_TASKS[lock.moduleId].find((d) => d.id === lock.subTaskId);
        return {
          subTaskId: lock.subTaskId,
          moduleId: lock.moduleId,
          label: def?.label ?? lock.subTaskId,
        };
      });

    const softWarnings = buildSoftWarnings(moduleId, {
      hasGstin,
      profile,
      completedSimulators,
      subTasks,
    });

    let status: JourneyNodeStatus = "available";
    if (moduleMarkedDone || allSubDone) {
      status = "done";
    } else if (blockedBy.length > 0) {
      status = "locked";
    } else if (progressPercent > 0) {
      status = "in_progress";
    }

    const titles: Record<TaskModuleId, string> = {
      "common-documentation": "Business docs + GST",
      "product-selection": "Pick your product",
      "compliance-by-product": "Product compliance",
      "supplier-sourcing": "Find suppliers",
      "channel-launch": "Launch on channel",
      "ads-growth": "Run ads",
      "tracking-analytics": "Track profit",
    };

    return {
      id: moduleId,
      title: titles[moduleId],
      status,
      blockedBy,
      softWarnings,
      subTasks: subTaskStates,
      progressPercent,
    };
  });
}

export function allSubTasksDone(moduleId: TaskModuleId, subTasks: Record<string, boolean> | undefined): boolean {
  return MODULE_SUB_TASKS[moduleId].every((d) => isSubTaskDone(subTasks, d.id));
}
