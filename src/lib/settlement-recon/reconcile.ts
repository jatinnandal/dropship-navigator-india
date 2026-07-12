import { getFeesForProduct } from "@/lib/marketplace-fees";
import type { ProductType } from "@/lib/mvp-data";
import type {
  AdapterResult,
  ReconChannel,
  ReconciledRow,
  ReconReport,
} from "@/lib/settlement-recon/types";

/**
 * Delta threshold before a delivered order is flagged. Shipping / weight
 * handling is deliberately NOT modelled (we can't know per-order weight from
 * the CSV), so small positive deltas are normal - the threshold absorbs them
 * and the report says so explicitly.
 */
export function flagThreshold(saleAmount: number): number {
  return Math.max(15, saleAmount * 0.03);
}

export function reconcile(
  channel: ReconChannel,
  category: ProductType,
  adapter: AdapterResult,
  { codAssumed = true }: { codAssumed?: boolean } = {},
): ReconReport {
  const rows: ReconciledRow[] = adapter.rows.map((r) => {
    const fees = getFeesForProduct(channel, category, r.saleAmount, codAssumed);
    const actualDeduction = r.saleAmount - r.settledAmount;

    if (r.isReturn) {
      // Returns: the whole sale is reversed; we only report the deduction.
      return {
        ...r,
        expectedFees: fees.nonRefundableOnRto,
        actualDeduction,
        delta: 0,
        flagged: false,
      };
    }

    const delta = actualDeduction - fees.totalFees;
    return {
      ...r,
      expectedFees: fees.totalFees,
      actualDeduction,
      delta,
      flagged: delta > flagThreshold(r.saleAmount),
    };
  });

  const delivered = rows.filter((r) => !r.isReturn);
  const returns = rows.filter((r) => r.isReturn);

  const grossSales = delivered.reduce((s, r) => s + r.saleAmount, 0);
  const totalSettled = rows.reduce((s, r) => s + r.settledAmount, 0);
  const totalExpectedFees = delivered.reduce((s, r) => s + r.expectedFees, 0);
  const totalActualDeductions = delivered.reduce((s, r) => s + r.actualDeduction, 0);

  return {
    channel,
    category,
    adapterVersion: adapter.adapterVersion,
    rowCount: rows.length,
    deliveredCount: delivered.length,
    returnCount: returns.length,
    grossSales,
    totalSettled,
    totalExpectedFees,
    totalActualDeductions,
    totalDelta: totalActualDeductions - totalExpectedFees,
    flaggedCount: rows.filter((r) => r.flagged).length,
    // TCS (0.5%) the marketplace collected on delivered sales - claimable via
    // the "TDS/TCS credit received" statement on the GST portal.
    tcsEstimate: grossSales * 0.005,
    unmappedHeaders: adapter.unmappedHeaders,
    rows,
  };
}
