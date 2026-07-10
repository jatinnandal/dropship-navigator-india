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
    const r1 = report.rows[0];
    // 599 − 560.11 = 38.89 kept; engine expects ≈ 34.85 → delta ~4, unflagged.
    expect(r1.expectedFees).toBeCloseTo(fees.totalFees, 2);
    expect(r1.delta).toBeCloseTo(599 - 560.11 - fees.totalFees, 2);
    expect(r1.flagged).toBe(false);

    // Row 2 kept ₹119 — way past threshold → flagged.
    const r2 = report.rows[1];
    expect(r2.delta).toBeGreaterThan(flagThreshold(599));
    expect(r2.flagged).toBe(true);

    expect(report.flaggedCount).toBe(1);
    // TCS on delivered gross (2 × 599)
    expect(report.tcsEstimate).toBeCloseTo(1198 * 0.005, 2);
    // Returns never flagged
    expect(report.rows[2].flagged).toBe(false);
  });

  it("gross sales excludes returned orders", () => {
    const adapter = parseSettlementCsv("flipkart", FLIPKART_CSV);
    const report = reconcile("flipkart", "general", adapter);
    expect(report.grossSales).toBe(800);
    expect(report.totalSettled).toBeCloseTo(690 - 120, 2);
  });
});
