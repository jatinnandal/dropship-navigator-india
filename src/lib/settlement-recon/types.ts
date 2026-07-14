import type { ProductType } from "@/lib/mvp-data";

export type ReconChannel = "amazon" | "flipkart" | "meesho";

/** One order after adapter normalisation (transaction rows are aggregated). */
export type CanonicalRow = {
  orderRef: string;
  orderDate?: string;
  saleAmount: number;
  settledAmount: number;
  status?: string;
  isReturn: boolean;
  /**
   * The settled-amount cell was blank/unparseable - payout not posted yet.
   * These rows are excluded from delta math instead of being treated as
   * "marketplace kept 100%" (an explicit 0 is NOT pending - that's suspicious
   * and stays in scope).
   */
  settlementPending: boolean;
};

export type AdapterResult = {
  rows: CanonicalRow[];
  /** Headers present in the file that no alias matched - drift signal. */
  unmappedHeaders: string[];
  /** Required headers we could NOT find; non-empty means the parse failed. */
  missingFields: string[];
  adapterVersion: string;
};

export type ReconciledRow = CanonicalRow & {
  expectedFees: number;
  /** saleAmount - settledAmount: what the marketplace actually kept. */
  actualDeduction: number;
  /** actualDeduction - expectedFees (delivered rows only). */
  delta: number;
  flagged: boolean;
};

export type ReconReport = {
  channel: ReconChannel;
  category: ProductType;
  adapterVersion: string;
  rowCount: number;
  deliveredCount: number;
  returnCount: number;
  /** Orders whose payout hasn't posted yet - excluded from all money math. */
  pendingCount: number;
  pendingSales: number;
  /**
   * Per-order shipping folded into the expected deduction where the channel
   * settles shipping inside the payout (amazon/flipkart). Lightest-bracket
   * rate - a conservative floor, so heavier parcels can still show small
   * positive deltas. 0 where shipping is billed outside the settlement.
   */
  shippingAllowancePerOrder: number;
  grossSales: number;
  totalSettled: number;
  totalExpectedFees: number;
  totalActualDeductions: number;
  totalDelta: number;
  flaggedCount: number;
  /** Returns whose deduction exceeded non-refundable fees + shipping allowance. */
  flaggedReturnCount: number;
  tcsEstimate: number;
  unmappedHeaders: string[];
  rows: ReconciledRow[];
};
