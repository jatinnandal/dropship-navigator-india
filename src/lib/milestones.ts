export type MilestoneId =
  | "gstin-saved"
  | "first-listing-live"
  | "store-linked"
  | "module-complete"
  | "product-picked"
  | "supplier-locked";

export const MILESTONE_LABELS: Record<MilestoneId, string> = {
  "gstin-saved": "GSTIN saved — you're marketplace-ready on paper",
  "first-listing-live": "First listings live — you are officially selling",
  "store-linked": "Store linked — payouts can flow",
  "module-complete": "Module complete — great momentum",
  "product-picked": "Winning product shortlisted",
  "supplier-locked": "Supplier locked in",
};

/** Map sub-task completions to milestones for confetti */
export const SUBTASK_TO_MILESTONE: Record<string, MilestoneId> = {
  "gstin-active": "gstin-saved",
  "first-listing-live": "first-listing-live",
  "store-linked": "store-linked",
  "product-shortlist": "product-picked",
  "supplier-vetted": "supplier-locked",
};

export function milestoneForSubTask(subTaskId: string): MilestoneId | null {
  return SUBTASK_TO_MILESTONE[subTaskId] ?? null;
}
