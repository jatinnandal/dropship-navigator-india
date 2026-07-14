import { describe, expect, it } from "vitest";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import { parseSettlementCsv } from "@/lib/settlement-recon/adapters";
import { flagThreshold, reconcile } from "@/lib/settlement-recon/reconcile";

const MEESHO_CSV = `Sub Order No,Order Date,Live Order Status,Total Sale Amount (Incl. Commission & GST),Final Settlement Amount,Some Future Column
112233_1,2026-06-02,Delivered,599,560.11,x
112233_2,2026-06-03,Delivered,599,480,x
112233_3,2026-06-04,RTO,599,-80,x
112233_4,2026-06-05,Return,599,0,x
`;

const FLIPKART_CSV = `Order Item ID,Order Date,Event Type,Order Item Value (Rs),Settlement Value (Rs)
FK1,2026-06-01,Sale,800,690
FK2,2026-06-02,Return,800,-120
`;

const AMAZON_CSV = `order-id,posted-date,transaction-type,amount-description,amount
AZ1,2026-06-01,Order,Principal,999
AZ1,2026-06-01,Order,FBA fees,-45
AZ1,2026-06-01,Order,Commission,-30
AZ2,2026-06-02,Refund,Principal,-499
`;

describe("meesho adapter", () => {
  it("maps aliased headers, flags returns, surfaces unknown columns", () => {
    const res = parseSettlementCsv("meesho", MEESHO_CSV);
    expect(res.missingFields).toEqual([]);
    expect(res.rows).toHaveLength(4);
    expect(res.rows[0]).toMatchObject({ orderRef: "112233_1", saleAmount: 599, settledAmount: 560.11, isReturn: false });
    expect(res.rows[2].isReturn).toBe(true); // RTO
    expect(res.rows[3].isReturn).toBe(true); // Return
    expect(res.unmappedHeaders).toContain("Some Future Column");
  });

  it("fails loudly when a required column is missing", () => {
    const res = parseSettlementCsv("meesho", "Sub Order No,Order Date\n1,2026-06-01\n");
    expect(res.missingFields).toContain("saleAmount");
    expect(res.rows).toEqual([]);
  });
});

describe("flipkart adapter", () => {
  it("maps value/settlement columns and return events", () => {
    const res = parseSettlementCsv("flipkart", FLIPKART_CSV);
    expect(res.missingFields).toEqual([]);
    expect(res.rows[0]).toMatchObject({ orderRef: "FK1", saleAmount: 800, settledAmount: 690 });
    expect(res.rows[1].isReturn).toBe(true);
  });
});

describe("amazon adapter", () => {
  it("aggregates transaction rows per order", () => {
    const res = parseSettlementCsv("amazon", AMAZON_CSV);
    expect(res.missingFields).toEqual([]);
    expect(res.rows).toHaveLength(2);
    const az1 = res.rows.find((r) => r.orderRef === "AZ1")!;
    expect(az1.saleAmount).toBe(999); // positive amounts only
    expect(az1.settledAmount).toBeCloseTo(999 - 45 - 30, 2);
    const az2 = res.rows.find((r) => r.orderRef === "AZ2")!;
    expect(az2.isReturn).toBe(true);
  });
});

describe("reconcile", () => {
  it("computes deltas against the fee engine and flags outliers only", () => {
    const adapter = parseSettlementCsv("meesho", MEESHO_CSV);
    const report = reconcile("meesho", "fashion", adapter);

    expect(report.rowCount).toBe(4);
    expect(report.deliveredCount).toBe(2);
    expect(report.returnCount).toBe(2);

    const fees = getFeesForProduct("meesho", "fashion", 599, true);
    // Meesho doesn't settle shipping inside the payout - no allowance.
    expect(report.shippingAllowancePerOrder).toBe(0);
    const r1 = report.rows[0];
    // 599 - 560.11 = 38.89 kept; engine expects ≈ 34.85 → delta ~4, unflagged.
    expect(r1.expectedFees).toBeCloseTo(fees.totalFees, 2);
    expect(r1.delta).toBeCloseTo(599 - 560.11 - fees.totalFees, 2);
    expect(r1.flagged).toBe(false);

    // Row 2 kept ₹119 - way past threshold → flagged.
    const r2 = report.rows[1];
    expect(r2.delta).toBeGreaterThan(flagThreshold(599));
    expect(r2.flagged).toBe(true);

    expect(report.flaggedCount).toBe(1);
    // TCS on delivered gross (2 × 599)
    expect(report.tcsEstimate).toBeCloseTo(1198 * 0.005, 2);
    // RTO charged ₹80 - inside the non-refundable + round-trip band → clean.
    expect(report.rows[2].actualDeduction).toBeCloseTo(80, 2);
    expect(report.rows[2].flagged).toBe(false);
    // Return settled at 0 - clean reversal, nothing charged.
    expect(report.rows[3].actualDeduction).toBe(0);
    expect(report.rows[3].flagged).toBe(false);
  });

  it("gross sales excludes returned orders", () => {
    const adapter = parseSettlementCsv("flipkart", FLIPKART_CSV);
    const report = reconcile("flipkart", "general", adapter);
    expect(report.grossSales).toBe(800);
    expect(report.totalSettled).toBeCloseTo(690 - 120, 2);
  });

  it("folds a shipping allowance into expected deductions on amazon/flipkart", () => {
    const adapter = parseSettlementCsv("flipkart", FLIPKART_CSV);
    const report = reconcile("flipkart", "general", adapter);
    const fees = getFeesForProduct("flipkart", "general", 800, true);
    expect(report.shippingAllowancePerOrder).toBe(fees.typicalShipping.light);
    // FK1 kept ₹110; fees + ₹55 shipping ≈ expected → not flagged (previously
    // every delivered flipkart order flagged because shipping wasn't modelled).
    const fk1 = report.rows[0];
    expect(fk1.expectedFees).toBeCloseTo(fees.totalFees + fees.typicalShipping.light, 2);
    expect(fk1.flagged).toBe(false);
  });

  it("routes blank settlement amounts to the pending bucket, not 100%-kept", () => {
    const csv = `Sub Order No,Live Order Status,Total Sale Amount (Incl. Commission & GST),Final Settlement Amount
P1,Delivered,599,
P2,Delivered,599,560.11
`;
    const adapter = parseSettlementCsv("meesho", csv);
    expect(adapter.rows[0].settlementPending).toBe(true);
    expect(adapter.rows[1].settlementPending).toBe(false);

    const report = reconcile("meesho", "fashion", adapter);
    expect(report.pendingCount).toBe(1);
    expect(report.pendingSales).toBe(599);
    expect(report.deliveredCount).toBe(1);
    expect(report.grossSales).toBe(599);
    expect(report.flaggedCount).toBe(0);
    // An explicit 0 is NOT pending - that's a real "kept everything" signal.
    const zeroCsv = `Sub Order No,Live Order Status,Total Sale Amount (Incl. Commission & GST),Final Settlement Amount
Z1,Delivered,599,0
`;
    const zeroReport = reconcile("meesho", "fashion", parseSettlementCsv("meesho", zeroCsv));
    expect(zeroReport.pendingCount).toBe(0);
    expect(zeroReport.flaggedCount).toBe(1);
  });

  it("flags returns charged beyond non-refundable fees + round-trip shipping", () => {
    const csv = `Sub Order No,Live Order Status,Total Sale Amount (Incl. Commission & GST),Final Settlement Amount
R1,Return,999,-599
R2,Return,999,-90
`;
    const report = reconcile("meesho", "fashion", parseSettlementCsv("meesho", csv));
    const fees = getFeesForProduct("meesho", "fashion", 999, true);
    const r1 = report.rows[0];
    expect(r1.actualDeduction).toBeCloseTo(599, 2);
    expect(r1.expectedFees).toBeCloseTo(fees.nonRefundableOnRto + 2 * fees.typicalShipping.light, 2);
    expect(r1.flagged).toBe(true);
    expect(report.rows[1].flagged).toBe(false);
    expect(report.flaggedReturnCount).toBe(1);
  });
});
