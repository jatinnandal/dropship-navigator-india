import type { OnboardingProfile } from "@/lib/mvp-data";
import {
  allSubTasksDoneForPlan,
  buildJourneyPlan,
  buildSoftWarnings,
  getSubTaskProgressForPlan,
  mergeProfileSubTaskDefaults,
} from "@/lib/journey-engine";
import { getSubTaskGuide } from "@/lib/subtask-guides";
import type { TaskModuleId } from "@/lib/tasks";
import type { RequirementSeverity } from "@/lib/journey-rules";

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
  severity: RequirementSeverity;
  why?: string;
};

export type JourneyNode = {
  id: TaskModuleId;
  title: string;
  status: JourneyNodeStatus;
  deprioritized: boolean;
  blockedBy: { subTaskId: string; label: string; moduleId: TaskModuleId }[];
  softWarnings: string[];
  subTasks: (JourneySubTaskDef & { done: boolean })[];
  progressPercent: number;
};

/** Legacy base catalog — kept for milestone/crisis lookups of known subtask IDs. */
export const MODULE_SUB_TASKS: Record<TaskModuleId, JourneySubTaskDef[]> = {
  "common-documentation": [
    { id: "docs-folder-ready", moduleId: "common-documentation", label: "Master document folder created", severity: "required" },
    { id: "gstin-active", moduleId: "common-documentation", label: "GSTIN obtained or validated", severity: "required" },
    { id: "bank-matched", moduleId: "common-documentation", label: "Bank name matches legal name", severity: "required" },
    { id: "gst-filing-understood", moduleId: "common-documentation", label: "GST filing calendar understood", severity: "required" },
  ],
  "product-selection": [
    { id: "product-shortlist", moduleId: "product-selection", label: "3 products shortlisted with margin check", severity: "required" },
    { id: "samples-ordered", moduleId: "product-selection", label: "Sample order placed", severity: "required" },
  ],
  "compliance-by-product": [
    { id: "hsn-mapped", moduleId: "compliance-by-product", label: "HSN codes mapped for launch SKUs", severity: "required" },
    { id: "category-certs", moduleId: "compliance-by-product", label: "Category certificates ready (if needed)", severity: "required" },
  ],
  "supplier-sourcing": [
    { id: "supplier-vetted", moduleId: "supplier-sourcing", label: "Primary supplier vetted + terms in writing", severity: "required" },
    { id: "backup-supplier", moduleId: "supplier-sourcing", label: "Backup supplier identified", severity: "recommended" },
    { id: "domestic-supplier-confirmed", moduleId: "supplier-sourcing", label: "Domestic supplier confirmed (not AliExpress)", severity: "required" },
  ],
  "channel-launch": [
    { id: "seller-account-live", moduleId: "channel-launch", label: "Seller account approved", severity: "required" },
    { id: "first-listing-live", moduleId: "channel-launch", label: "First listing live (1 hero SKU)", severity: "required" },
    { id: "store-linked", moduleId: "channel-launch", label: "Store / channel linked and payout ready", severity: "required" },
    { id: "cod-practice-done", moduleId: "channel-launch", label: "COD confirmation practice completed", severity: "required" },
    { id: "first-payout-received", moduleId: "channel-launch", label: "First payout received in bank", severity: "required" },
  ],
  "ads-growth": [
    { id: "breakeven-roas-known", moduleId: "ads-growth", label: "Break-even ROAS calculated", severity: "required" },
    { id: "first-ad-test", moduleId: "ads-growth", label: "First controlled ad test running", severity: "recommended" },
  ],
  "tracking-analytics": [
    { id: "pnl-sheet-ready", moduleId: "tracking-analytics", label: "Weekly P&L sheet set up", severity: "required" },
    { id: "settlement-reconcile", moduleId: "tracking-analytics", label: "First settlement reconciled", severity: "required" },
    { id: "appeal-pack-ready", moduleId: "tracking-analytics", label: "Appeal pack folder assembled", severity: "recommended" },
    { id: "gstr8-reviewed", moduleId: "tracking-analytics", label: "GSTR-8 / TCS reconciliation reviewed", severity: "required" },
  ],
};

export { mergeProfileSubTaskDefaults } from "@/lib/journey-engine";

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
  profile?: OnboardingProfile,
): number {
  if (profile) {
    const plan = buildJourneyPlan(profile);
    return getSubTaskProgressForPlan(moduleId, plan, subTasks);
  }
  const defs = MODULE_SUB_TASKS[moduleId];
  if (defs.length === 0) return 0;
  const done = defs.filter((d) => isSubTaskDone(subTasks, d.id)).length;
  return Math.round((done / defs.length) * 100);
}

export function getJourneyNodes(input: {
  completedModules: Set<string>;
  subTasks: Record<string, boolean> | undefined;
  completedSimulators?: Record<string, boolean>;
  hasGstin: boolean;
  profile: OnboardingProfile;
}): JourneyNode[] {
  const { completedModules, completedSimulators, hasGstin, profile } = input;
  const subTasks = mergeProfileSubTaskDefaults(profile, input.subTasks);
  const plan = buildJourneyPlan(profile);
  const runtime = { hasGstin, subTasks, completedSimulators };

  return plan.modules.map((mod) => {
    const subTaskStates = mod.subTasks.map((d) => {
      const guide = getSubTaskGuide(d.id, mod.id);
      return {
        id: d.id,
        moduleId: d.moduleId,
        label: d.label,
        why: d.why,
        severity: d.severity,
        hint: guide.hint,
        done: isSubTaskDone(subTasks, d.id),
      };
    });

    const progressPercent = getSubTaskProgressForPlan(mod.id, plan, subTasks);
    const requiredTasks = mod.subTasks.filter((s) => s.severity === "required");
    const allRequiredDone =
      requiredTasks.length === 0 || requiredTasks.every((s) => isSubTaskDone(subTasks, s.id));
    const allSubDone = allSubTasksDoneForPlan(mod.id, plan, subTasks);
    const moduleMarkedDone = completedModules.has(mod.id);

    const locks = plan.moduleLocks[mod.id] ?? [];
    const blockedBy = locks
      .filter((lock) => !isSubTaskDone(subTasks, lock.subTaskId))
      .map((lock) => ({
        subTaskId: lock.subTaskId,
        moduleId: lock.moduleId,
        label: lock.label,
      }));

    const softWarnings = buildSoftWarnings(mod.id, plan.facts, runtime);

    let status: JourneyNodeStatus = "available";
    if (moduleMarkedDone || (allSubDone && allRequiredDone)) {
      status = "done";
    } else if (blockedBy.length > 0) {
      status = "locked";
    } else if (progressPercent > 0) {
      status = "in_progress";
    }

    return {
      id: mod.id,
      title: mod.title,
      status,
      deprioritized: mod.deprioritized,
      blockedBy,
      softWarnings,
      subTasks: subTaskStates,
      progressPercent,
    };
  });
}

export function allSubTasksDone(
  moduleId: TaskModuleId,
  subTasks: Record<string, boolean> | undefined,
  profile?: OnboardingProfile,
): boolean {
  if (profile) {
    const plan = buildJourneyPlan(profile);
    return allSubTasksDoneForPlan(moduleId, plan, subTasks);
  }
  return MODULE_SUB_TASKS[moduleId].every((d) => isSubTaskDone(subTasks, d.id));
}
