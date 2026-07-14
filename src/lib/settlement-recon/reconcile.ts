import { getFeesForProduct } from "@/lib/marketplace-fees";
import type { ProductType } from "@/lib/mvp-data";
import type {
  AdapterResult,
  ReconChannel,
  ReconciledRow,
  ReconReport,
} from "@/lib/settlement-recon/types";

/**
 * Delta threshold before an order is flagged. Per-order weight isn't in the
 * CSV, so the expected deduction uses the LIGHTEST shipping bracket where the
 * channel settles shipping inside the payout - the threshold absorbs the rest
 * and the report says so explicitly.
 */
export function flagThreshold(saleAmount: number): number {
  return Math.max(15, saleAmount * 0.03);
}

/**
 * Whether the channel's settlement file nets shipping out of the payout.
 * Amazon/Flipkart deduct forward shipping inside the settlement, so without
 * an allowance every delivered order flags. Meesho's Valmo logistics are
 * netted differently and the fee card already reflects the payable maths.
 */
const SHIPPING_IN_SETTLEMENT: Record<ReconChannel, boolean> = {
  amazon: true,
  flipkart: true,
  meesho: false,
};

export function reconcile(
  channel: ReconChannel,
  category: ProductType,
  adapter: AdapterResult,
  { codAssumed = true }: { codAssumed?: boolean } = {},
): ReconReport {
  const shippingAllowancePerOrder = SHIPPING_IN_SETTLEMENT[channel]
    ? getFeesForProduct(channel, category, 1000, codAssumed).typicalShipping.light
    : 0;

  const rows: ReconciledRow[] = adapter.rows.map((r) => {
    const fees = getFeesForProduct(channel, category, r.saleAmount, codAssumed);
    const actualDeduction = r.saleAmount - r.settledAmount;

    if (r.settlementPending) {
      // Payout not posted yet - nothing to reconcile; never a flag.
      return {
        ...r,
        expectedFees: fees.totalFees + shippingAllowancePerOrder,
        actualDeduction: 0,
        delta: 0,
        flagged: false,
      };
    }

    if (r.isReturn) {
      // A reversed sale never sticks, so the baseline isn't sale-settled: what
      // matters is the charge ON TOP of the reversal (negative settlement).
      // You should lose at most the non-refundable fees plus round-trip
      // shipping - beyond that is an overcharge worth a Seller Support ticket.
      const returnCharge = Math.max(0, -r.settledAmount);
      const expectedReturnDeduction =
        fees.nonRefundableOnRto + 2 * fees.typicalShipping.light;
      const delta = returnCharge - expectedReturnDeduction;
      return {
        ...r,
        expectedFees: expectedReturnDeduction,
        actualDeduction: returnCharge,
        delta,
        flagged: delta > flagThreshold(r.saleAmount),
      };
    }

    const expected = fees.totalFees + shippingAllowancePerOrder;
    const delta = actualDeduction - expected;
    return {
      ...r,
      expectedFees: expected,
      actualDeduction,
      delta,
      flagged: delta > flagThreshold(r.saleAmount),
    };
  });

  const pending = rows.filter((r) => r.settlementPending);
  const settled = rows.filter((r) => !r.settlementPending);
  const delivered = settled.filter((r) => !r.isReturn);
  const returns = settled.filter((r) => r.isReturn);

  const grossSales = delivered.reduce((s, r) => s + r.saleAmount, 0);
  const totalSettled = settled.reduce((s, r) => s + r.settledAmount, 0);
  const totalExpectedFees = delivered.reduce((s, r) => s + r.expectedFees, 0);
  const totalActualDeductions = delivered.reduce((s, r) => s + r.actualDeduction, 0);

  return {
    channel,
    category,
    adapterVersion: adapter.adapterVersion,
    rowCount: rows.length,
    deliveredCount: delivered.length,
    returnCount: returns.length,
    pendingCount: pending.length,
    pendingSales: pending.reduce((s, r) => s + r.saleAmount, 0),
    shippingAllowancePerOrder,
    grossSales,
    totalSettled,
    totalExpectedFees,
    totalActualDeductions,
    totalDelta: totalActualDeductions - totalExpectedFees,
    flaggedCount: rows.filter((r) => r.flagged).length,
    flaggedReturnCount: returns.filter((r) => r.flagged).length,
    // TCS (0.5%) the marketplace collected on delivered sales - claimable via
    // the "TDS/TCS credit received" statement on the GST portal.
    tcsEstimate: grossSales * 0.005,
    unmappedHeaders: adapter.unmappedHeaders,
    rows,
  };
}
