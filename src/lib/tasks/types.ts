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

export type CalculatorSpec = {
  kind: CalculatorKind;
};

export type StepKind = "info" | "question" | "input" | "calculator";

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

export type TaskBuildContext = {
  answers: Record<string, string>;
};
