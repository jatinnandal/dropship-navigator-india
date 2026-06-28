export type CrisisType = "account_suspended" | "supplier_oos";

export type CrisisSeverity = "critical" | "high" | "medium";

export type CrisisWarning = {
  id: string;
  severity: CrisisSeverity;
  title: string;
  message: string;
  href: string;
  ctaLabel: string;
};

export type DashboardBanner = {
  id: string;
  severity: CrisisSeverity | "deadline";
  message: string;
  href: string;
  ctaLabel: string;
  variant: "deadline" | "at-risk";
};

export type DashboardMode = "crisis" | "at_risk" | "normal";

export type ActiveCrisis = {
  type: CrisisType;
  startedAt: string;
  currentStepIndex: number;
};

export type CrisisLogEntry = {
  type: CrisisType;
  startedAt: string;
  resolvedAt?: string;
  selfReported: boolean;
};

export type CrisisProtocolStep = {
  title: string;
  body: string;
  timerLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  templateId?: "paos" | "supplier_eta" | "customer_whatsapp";
};

export type CrisisProtocol = {
  type: CrisisType;
  label: string;
  steps: CrisisProtocolStep[];
};

export const SELF_REPORT_CRISIS_TYPES: CrisisType[] = ["account_suspended", "supplier_oos"];

export const CRISIS_LABELS: Record<CrisisType, string> = {
  account_suspended: "Account suspended",
  supplier_oos: "Supplier out of stock",
};
