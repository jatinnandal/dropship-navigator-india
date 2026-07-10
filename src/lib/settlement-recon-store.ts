import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { ProductType } from "@/lib/mvp-data";
import type { ReconChannel, ReconciledRow, ReconReport } from "@/lib/settlement-recon/types";

/** Hard cap on stored per-order rows per upload (summary is always full). */
export const MAX_STORED_ROWS = 2000;

/** Free tier: one reconciliation per calendar month (Pro will lift this). */
export const FREE_UPLOADS_PER_MONTH = 1;

export type UploadSummaryRow = {
  id: string;
  channel: ReconChannel;
  category: ProductType;
  filename: string | null;
  adapterVersion: string;
  rowCount: number;
  uploadedAt: string;
  summary: StoredSummary;
};

export type StoredSummary = {
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
  rowsTruncated: boolean;
};

export async function countUploadsThisMonth(profileId: string): Promise<number> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("user_settlement_uploads")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gte("uploaded_at", monthStart.toISOString());

  return count ?? 0;
}

export async function insertUpload(
  profileId: string,
  filename: string | null,
  report: ReconReport,
): Promise<string | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const summary: StoredSummary = {
    deliveredCount: report.deliveredCount,
    returnCount: report.returnCount,
    grossSales: report.grossSales,
    totalSettled: report.totalSettled,
    totalExpectedFees: report.totalExpectedFees,
    totalActualDeductions: report.totalActualDeductions,
    totalDelta: report.totalDelta,
    flaggedCount: report.flaggedCount,
    tcsEstimate: report.tcsEstimate,
    unmappedHeaders: report.unmappedHeaders,
    rowsTruncated: report.rows.length > MAX_STORED_ROWS,
  };

  const { data, error } = await supabase
    .from("user_settlement_uploads")
    .insert({
      profile_id: profileId,
      channel: report.channel,
      category: report.category,
      filename,
      adapter_version: report.adapterVersion,
      row_count: report.rowCount,
      matched_count: report.rowCount,
      summary,
    })
    .select("id")
    .single<{ id: string }>();

  if (error || !data) return null;

  const rows = report.rows.slice(0, MAX_STORED_ROWS);
  // Dedupe on orderRef (composite PK) — keep the first occurrence.
  const seen = new Set<string>();
  const payload = rows
    .filter((r) => (seen.has(r.orderRef) ? false : (seen.add(r.orderRef), true)))
    .map((r) => ({
      upload_id: data.id,
      order_ref: r.orderRef,
      order_date: r.orderDate ? toIsoDate(r.orderDate) : null,
      sale_amount: r.saleAmount,
      settled_amount: r.settledAmount,
      status: r.status ?? null,
      is_return: r.isReturn,
      expected_fees: round2(r.expectedFees),
      actual_deduction: round2(r.actualDeduction),
      delta: round2(r.delta),
      flagged: r.flagged,
    }));

  if (payload.length > 0) {
    const { error: rowsError } = await supabase.from("user_settlement_rows").insert(payload);
    if (rowsError) {
      await supabase.from("user_settlement_uploads").delete().eq("id", data.id);
      return null;
    }
  }

  return data.id;
}

export async function listUploads(profileId: string): Promise<UploadSummaryRow[]> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return [];

  const { data } = await supabase
    .from("user_settlement_uploads")
    .select("id,channel,category,filename,adapter_version,row_count,uploaded_at,summary")
    .eq("profile_id", profileId)
    .order("uploaded_at", { ascending: false })
    .limit(24);

  return (data ?? []).map((d) => ({
    id: d.id,
    channel: d.channel,
    category: d.category,
    filename: d.filename,
    adapterVersion: d.adapter_version,
    rowCount: d.row_count,
    uploadedAt: d.uploaded_at,
    summary: d.summary as StoredSummary,
  }));
}

export type StoredUpload = UploadSummaryRow & { rows: ReconciledRow[] };

export async function getUpload(profileId: string, uploadId: string): Promise<StoredUpload | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const { data: upload } = await supabase
    .from("user_settlement_uploads")
    .select("id,channel,category,filename,adapter_version,row_count,uploaded_at,summary")
    .eq("profile_id", profileId)
    .eq("id", uploadId)
    .maybeSingle();

  if (!upload) return null;

  const { data: rows } = await supabase
    .from("user_settlement_rows")
    .select("order_ref,order_date,sale_amount,settled_amount,status,is_return,expected_fees,actual_deduction,delta,flagged")
    .eq("upload_id", uploadId)
    .order("flagged", { ascending: false })
    .order("delta", { ascending: false })
    .limit(MAX_STORED_ROWS);

  return {
    id: upload.id,
    channel: upload.channel,
    category: upload.category,
    filename: upload.filename,
    adapterVersion: upload.adapter_version,
    rowCount: upload.row_count,
    uploadedAt: upload.uploaded_at,
    summary: upload.summary as StoredSummary,
    rows: (rows ?? []).map((r) => ({
      orderRef: r.order_ref,
      orderDate: r.order_date ?? undefined,
      saleAmount: Number(r.sale_amount),
      settledAmount: Number(r.settled_amount),
      status: r.status ?? undefined,
      isReturn: r.is_return,
      expectedFees: Number(r.expected_fees),
      actualDeduction: Number(r.actual_deduction),
      delta: Number(r.delta),
      flagged: r.flagged,
    })),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Accepts "2026-06-02", "02/06/2026", "02-06-2026"; returns ISO or null. */
function toIsoDate(input: string): string | null {
  const trimmed = input.trim().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const dmy = trimmed.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  return null;
}
