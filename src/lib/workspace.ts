export type SkuShortlistItem = {
  name: string;
  sellingPrice?: number;
  productCost?: number;
  netMarginPercent?: number;
};

export type Workspace = {
  legalBusinessName?: string;
  gstin?: string;
  bankAccountName?: string;
  pickupState?: string;
  shortlistedSkus?: SkuShortlistItem[];
  chosenSupplier?: string;
  targetSellingPrice?: number;
  productCost?: number;
  shippingCost?: number;
  netMarginPercent?: number;
  breakEvenRoas?: number;
  estimatedRtoRate?: number;
  calculatorSnapshot?: Record<string, number>;
  subTasks?: Record<string, boolean>;
  completedMilestones?: string[];
  completedSimulators?: Record<string, boolean>;
};

export const emptyWorkspace: Workspace = {};

export function parseWorkspace(raw: string | undefined): Workspace {
  if (!raw) return { ...emptyWorkspace };
  try {
    const parsed = JSON.parse(raw) as Partial<Workspace>;
    return {
      legalBusinessName:
        typeof parsed.legalBusinessName === "string" ? parsed.legalBusinessName : undefined,
      gstin: typeof parsed.gstin === "string" ? parsed.gstin : undefined,
      bankAccountName: typeof parsed.bankAccountName === "string" ? parsed.bankAccountName : undefined,
      pickupState: typeof parsed.pickupState === "string" ? parsed.pickupState : undefined,
      shortlistedSkus: Array.isArray(parsed.shortlistedSkus)
        ? parsed.shortlistedSkus.filter(
            (item): item is SkuShortlistItem =>
              typeof item === "object" &&
              item !== null &&
              typeof (item as SkuShortlistItem).name === "string",
          )
        : undefined,
      chosenSupplier: typeof parsed.chosenSupplier === "string" ? parsed.chosenSupplier : undefined,
      targetSellingPrice:
        typeof parsed.targetSellingPrice === "number" ? parsed.targetSellingPrice : undefined,
      productCost: typeof parsed.productCost === "number" ? parsed.productCost : undefined,
      shippingCost: typeof parsed.shippingCost === "number" ? parsed.shippingCost : undefined,
      netMarginPercent:
        typeof parsed.netMarginPercent === "number" ? parsed.netMarginPercent : undefined,
      breakEvenRoas: typeof parsed.breakEvenRoas === "number" ? parsed.breakEvenRoas : undefined,
      estimatedRtoRate:
        typeof parsed.estimatedRtoRate === "number" ? parsed.estimatedRtoRate : undefined,
      calculatorSnapshot:
        parsed.calculatorSnapshot && typeof parsed.calculatorSnapshot === "object"
          ? (parsed.calculatorSnapshot as Record<string, number>)
          : undefined,
      subTasks:
        parsed.subTasks && typeof parsed.subTasks === "object"
          ? (parsed.subTasks as Record<string, boolean>)
          : undefined,
      completedMilestones: Array.isArray(parsed.completedMilestones)
        ? parsed.completedMilestones.filter((m): m is string => typeof m === "string")
        : undefined,
      completedSimulators:
        parsed.completedSimulators && typeof parsed.completedSimulators === "object"
          ? (parsed.completedSimulators as Record<string, boolean>)
          : undefined,
    };
  } catch {
    return { ...emptyWorkspace };
  }
}

export function workspaceRecapItems(workspace: Workspace): { label: string; value: string }[] {
  const items: { label: string; value: string }[] = [];
  if (workspace.legalBusinessName) {
    items.push({ label: "Legal name", value: workspace.legalBusinessName });
  }
  if (workspace.gstin) {
    items.push({ label: "GSTIN", value: workspace.gstin });
  }
  if (workspace.bankAccountName) {
    items.push({ label: "Bank name", value: workspace.bankAccountName });
  }
  if (workspace.pickupState) {
    items.push({ label: "Pickup state", value: workspace.pickupState });
  }
  if (workspace.shortlistedSkus && workspace.shortlistedSkus.length > 0) {
    items.push({
      label: "Shortlisted SKUs",
      value: workspace.shortlistedSkus.map((sku) => sku.name).join(", "),
    });
  }
  if (workspace.chosenSupplier) {
    items.push({ label: "Supplier", value: workspace.chosenSupplier });
  }
  if (workspace.netMarginPercent !== undefined) {
    items.push({ label: "Net margin", value: `${workspace.netMarginPercent.toFixed(1)}%` });
  }
  if (workspace.breakEvenRoas !== undefined) {
    items.push({ label: "Break-even ROAS", value: workspace.breakEvenRoas.toFixed(2) });
  }
  if (workspace.estimatedRtoRate !== undefined) {
    items.push({ label: "Est. RTO rate", value: `${workspace.estimatedRtoRate.toFixed(0)}%` });
  }
  return items;
}
