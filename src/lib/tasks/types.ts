export type TaskQuestionOption = {
  value: string;
  label: string;
};

export type TaskQuestion = {
  id: string;
  prompt: string;
  options: TaskQuestionOption[];
};

export type ToolRec = {
  name: string;
  whenToUse: string;
  why: string;
  affiliateSlug?: string;
  /** External URL the tool opens - renders the pill and title as a real link. */
  href?: string;
};

export type WorkspaceFieldKey =
  | "legalBusinessName"
  | "gstin"
  | "bankAccountName"
  | "pickupState"
  | "shortlistedSkus"
  | "chosenSupplier"
  | "targetSellingPrice"
  | "productCost"
  | "netMarginPercent"
  | "breakEvenRoas"
  | "estimatedRtoRate";

export type InputSpec = {
  id: string;
  label: string;
  placeholder?: string;
  workspaceKey: WorkspaceFieldKey;
  inputType?: "text" | "number" | "textarea";
  hint?: string;
};

export type CalculatorKind = "margin" | "breakeven_roas" | "rto_impact";

export type SimulatorKind =
  | "rto_reality"
  | "cashflow_timeline"
  | "ndr_caller"
  | "product_swipe"
  | "sourcing_swipe"
  | "cod_prepaid_mix"
  | "pincode_pilot";

export type CalculatorSpec = {
  kind: CalculatorKind;
};

export type SimulatorSpec = {
  kind: SimulatorKind;
};

export type StepKind = "info" | "question" | "input" | "calculator" | "simulator";

export type TaskStep = {
  id: string;
  title: string;
  why: string;
  needs?: string[];
  how: string[];
  trap?: string;
  stuck?: string[];
  question?: TaskQuestion;
  tools?: ToolRec[];
  mentorNote?: string;
  kind?: StepKind;
  input?: InputSpec;
  calculator?: CalculatorSpec;
  simulator?: SimulatorSpec;
};

export type Task = {
  id: string;
  title: string;
  intro: string;
  steps: TaskStep[];
};

export type TaskState = {
  completed: string[];
  answers: Record<string, string>;
};

export function parseTaskStateRow(row: { completed: unknown; answers: unknown } | null): TaskState {
  if (!row) return { completed: [], answers: {} };
  const completed = Array.isArray(row.completed)
    ? row.completed.filter((item): item is string => typeof item === "string")
    : [];
  const answers: Record<string, string> = {};
  if (row.answers && typeof row.answers === "object") {
    for (const [key, value] of Object.entries(row.answers as Record<string, unknown>)) {
      if (typeof value === "string") answers[key] = value;
    }
  }
  return { completed, answers };
}

export type TaskBuildContext = {
  answers: Record<string, string>;
};
