import { afterEach, describe, expect, it, vi } from "vitest";
import { CRISIS_PROTOCOLS } from "@/lib/crisis/playbooks";
import {
  detectGstrDeadline,
  detectPayoutStale,
  type CrisisDetectorInput,
} from "@/lib/crisis/detectors";
import {
  CRISIS_LABELS,
  SELF_REPORT_CRISIS_TYPES,
  type CrisisTemplateId,
  type CrisisType,
} from "@/lib/crisis/types";
import { defaultProfile } from "@/lib/mvp-data";
import { emptyWorkspace } from "@/lib/workspace";

const ALL_TYPES = Object.keys(CRISIS_PROTOCOLS) as CrisisType[];

const KNOWN_TEMPLATES: CrisisTemplateId[] = [
  "paos",
  "supplier_eta",
  "customer_whatsapp",
  "settlement_ticket",
  "settlement_escalation",
  "ip_response",
  "gst_scn_reply",
  "courier_dispute",
  "review_response",
];

describe("crisis pack completeness", () => {
  it("every crisis type has a label, protocol, and self-report entry", () => {
    for (const type of ALL_TYPES) {
      expect(CRISIS_LABELS[type], type).toBeTruthy();
      expect(SELF_REPORT_CRISIS_TYPES).toContain(type);
      expect(CRISIS_PROTOCOLS[type].type).toBe(type);
    }
    expect(ALL_TYPES.length).toBe(7);
  });

  it("every protocol has 3+ steps with title and body", () => {
    for (const type of ALL_TYPES) {
      const steps = CRISIS_PROTOCOLS[type].steps;
      expect(steps.length, type).toBeGreaterThanOrEqual(3);
      for (const s of steps) {
        expect(s.title.length).toBeGreaterThan(4);
        expect(s.body.length).toBeGreaterThan(40);
      }
    }
  });

  it("every referenced template id is known", () => {
    for (const type of ALL_TYPES) {
      for (const s of CRISIS_PROTOCOLS[type].steps) {
        if (s.templateId) {
          expect(KNOWN_TEMPLATES, `${type}: ${s.templateId}`).toContain(s.templateId);
        }
      }
    }
  });

  it("new protocols carry actionable templates", () => {
    const templateIds = (type: CrisisType) =>
      CRISIS_PROTOCOLS[type].steps.map((s) => s.templateId).filter(Boolean);
    expect(templateIds("payment_hold")).toContain("settlement_escalation");
    expect(templateIds("ip_complaint")).toContain("ip_response");
    expect(templateIds("gst_notice")).toContain("gst_scn_reply");
    expect(templateIds("courier_dispute")).toContain("courier_dispute");
    expect(templateIds("review_bombing")).toContain("review_response");
  });
});

function detectorInput(overrides: Partial<CrisisDetectorInput> = {}): CrisisDetectorInput {
  return {
    profile: defaultProfile,
    workspace: { ...emptyWorkspace },
    hasGstin: false,
    ...overrides,
  };
}

describe("detectGstrDeadline", () => {
  afterEach(() => vi.useRealTimers());

  it("silent without GSTIN", () => {
    vi.useFakeTimers({ now: new Date("2026-07-10T10:00:00+05:30") });
    expect(detectGstrDeadline(detectorInput({ hasGstin: false }))).toBeNull();
  });

  it("fires within 48h of GSTR-1 (11th)", () => {
    vi.useFakeTimers({ now: new Date("2026-07-10T10:00:00+05:30") });
    const w = detectGstrDeadline(detectorInput({ hasGstin: true }));
    expect(w).not.toBeNull();
    expect(w!.title).toMatch(/GSTR-1/);
    expect(w!.href).toBe("/app/tools/gst-calendar");
  });

  it("silent mid-cycle", () => {
    vi.useFakeTimers({ now: new Date("2026-07-15T10:00:00+05:30") });
    expect(detectGstrDeadline(detectorInput({ hasGstin: true }))).toBeNull();
  });
});

describe("detectPayoutStale", () => {
  const payoutReceived = () => ({
    ...emptyWorkspace,
    subTasks: { "first-payout-received": true },
  });

  it("silent before first payout", () => {
    expect(
      detectPayoutStale(detectorInput({ latestSettlementUploadAt: null })),
    ).toBeNull();
  });

  it("silent when caller did not fetch uploads", () => {
    expect(detectPayoutStale(detectorInput({ workspace: payoutReceived() }))).toBeNull();
  });

  it("fires when payouts flow but nothing ever reconciled", () => {
    const w = detectPayoutStale(
      detectorInput({ workspace: payoutReceived(), latestSettlementUploadAt: null }),
    );
    expect(w).not.toBeNull();
    expect(w!.title).toMatch(/never reconciled/);
  });

  it("fires when the last reconciliation is >30 days old", () => {
    const old = new Date(Date.now() - 45 * 86_400_000).toISOString();
    const w = detectPayoutStale(
      detectorInput({ workspace: payoutReceived(), latestSettlementUploadAt: old }),
    );
    expect(w).not.toBeNull();
    expect(w!.title).toMatch(/45 days/);
  });

  it("silent when reconciled recently", () => {
    const recent = new Date(Date.now() - 5 * 86_400_000).toISOString();
    expect(
      detectPayoutStale(
        detectorInput({ workspace: payoutReceived(), latestSettlementUploadAt: recent }),
      ),
    ).toBeNull();
  });
});
