import type { TaskModuleId } from "@/lib/tasks";

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
  ],
  "channel-launch": [
    { id: "seller-account-live", moduleId: "channel-launch", label: "Seller account approved" },
    { id: "first-listing-live", moduleId: "channel-launch", label: "First 3 listings live" },
    { id: "store-linked", moduleId: "channel-launch", label: "Store / channel linked and payout ready" },
  ],
  "ads-growth": [
    { id: "breakeven-roas-known", moduleId: "ads-growth", label: "Break-even ROAS calculated" },
    { id: "first-ad-test", moduleId: "ads-growth", label: "First controlled ad test running" },
  ],
  "tracking-analytics": [
    { id: "pnl-sheet-ready", moduleId: "tracking-analytics", label: "Weekly P&L sheet set up" },
    { id: "settlement-reconcile", moduleId: "tracking-analytics", label: "First settlement reconciled" },
  ],
};

/** Hard locks: module cannot start guided walkthrough until prerequisite sub-tasks done */
const MODULE_LOCKS: Partial<Record<TaskModuleId, { subTaskId: string; moduleId: TaskModuleId }[]>> = {
  "ads-growth": [{ subTaskId: "first-listing-live", moduleId: "channel-launch" }],
};

export function isSubTaskDone(subTasks: Record<string, boolean> | undefined, subTaskId: string): boolean {
  return subTasks?.[subTaskId] === true;
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

export function getJourneyNodes(input: {
  completedModules: Set<string>;
  subTasks: Record<string, boolean> | undefined;
  hasGstin: boolean;
}): JourneyNode[] {
  const { completedModules, subTasks, hasGstin } = input;
  const moduleIds = Object.keys(MODULE_SUB_TASKS) as TaskModuleId[];

  return moduleIds.map((moduleId) => {
    const defs = MODULE_SUB_TASKS[moduleId];
    const subTaskStates = defs.map((d) => ({ ...d, done: isSubTaskDone(subTasks, d.id) }));
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

    const softWarnings: string[] = [];
    if (moduleId === "compliance-by-product" && !hasGstin) {
      softWarnings.push("GSTIN not saved yet — compliance steps may block marketplace listing.");
    }

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
