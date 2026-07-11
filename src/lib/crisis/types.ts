export type CrisisType =
  | "account_suspended"
  | "supplier_oos"
  | "payment_hold"
  | "ip_complaint"
  | "gst_notice"
  | "courier_dispute"
  | "review_bombing";

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

export type CrisisTemplateId =
  | "paos"
  | "supplier_eta"
  | "customer_whatsapp"
  | "settlement_ticket"
  | "settlement_escalation"
  | "ip_response"
  | "gst_scn_reply"
  | "courier_dispute"
  | "review_response";

export type CrisisProtocolStep = {
  title: string;
  body: string;
  timerLabel?: string;
  actionHref?: string;
  actionLabel?: string;
  templateId?: CrisisTemplateId;
};

export type CrisisProtocol = {
  type: CrisisType;
  label: string;
  steps: CrisisProtocolStep[];
};

export const SELF_REPORT_CRISIS_TYPES: CrisisType[] = [
  "account_suspended",
  "payment_hold",
  "supplier_oos",
  "ip_complaint",
  "gst_notice",
  "courier_dispute",
  "review_bombing",
];

export const CRISIS_LABELS: Record<CrisisType, string> = {
  account_suspended: "Account suspended",
  supplier_oos: "Supplier out of stock",
  payment_hold: "Payout held / not received",
  ip_complaint: "IP / brand complaint on listing",
  gst_notice: "GST notice received",
  courier_dispute: "Courier dispute / fake delivery",
  review_bombing: "Review attack on listing",
};
