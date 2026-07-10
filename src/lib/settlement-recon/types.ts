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
};

export type AdapterResult = {
  rows: CanonicalRow[];
  /** Headers present in the file that no alias matched — drift signal. */
  unmappedHeaders: string[];
  /** Required headers we could NOT find; non-empty means the parse failed. */
  missingFields: string[];
  adapterVersion: string;
};

export type ReconciledRow = CanonicalRow & {
  expectedFees: number;
  /** saleAmount − settledAmount: what the marketplace actually kept. */
  actualDeduction: number;
  /** actualDeduction − expectedFees (delivered rows only). */
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
  grossSales: number;
  totalSettled: number;
  totalExpectedFees: number;
  totalActualDeductions: number;
  totalDelta: number;
  flaggedCount: number;
  tcsEstimate: number;
  unmappedHeaders: string[];
  rows: ReconciledRow[];
};
