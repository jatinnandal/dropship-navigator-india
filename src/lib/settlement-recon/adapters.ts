import Papa from "papaparse";
import type { AdapterResult, CanonicalRow, ReconChannel } from "@/lib/settlement-recon/types";

export const RECON_ADAPTERS_META = {
  lastVerified: "2026-07-09",
  note: "Column names drift across marketplace report versions. Aliases are matched on lowercased alphanumerics; unmapped headers are surfaced in the report so drift is visible, not silent.",
} as const;

/** lowercase + strip everything but letters/digits, for tolerant header match */
function norm(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function toNumber(v: unknown): number {
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  if (typeof v !== "string") return 0;
  const n = Number(v.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Like toNumber but null for blank/unparseable - distinguishes "payout not
 * posted yet" from an explicit 0. A typed 0 stays 0 (suspicious, in scope).
 */
function toNumberOrNull(v: unknown): number | null {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v !== "string") return null;
  const trimmed = v.trim();
  if (trimmed === "") return null;
  const n = Number(trimmed.replace(/[₹,\s]/g, ""));
  return Number.isFinite(n) ? n : null;
}

type FieldSpec = {
  field: "orderRef" | "orderDate" | "saleAmount" | "settledAmount" | "status";
  aliases: string[];
  required: boolean;
};

type ChannelSpec = {
  version: string;
  fields: FieldSpec[];
  /** Decide return/RTO from the mapped row. */
  isReturn: (row: Record<string, string>, mapped: Partial<CanonicalRow>) => boolean;
};

const MEESHO_SPEC: ChannelSpec = {
  version: "meesho-v1",
  fields: [
    { field: "orderRef", required: true, aliases: ["suborderno", "subordernumber", "suborderid", "orderid"] },
    { field: "orderDate", required: false, aliases: ["orderdate"] },
    {
      field: "saleAmount",
      required: true,
      aliases: [
        "totalsaleamountinclcommissiongst",
        "totalsaleamountinclshippinggst",
        "totalsaleamount",
        "supplierlistedpriceinclgstcommission",
        "listingpriceincltaxes",
      ],
    },
    { field: "settledAmount", required: true, aliases: ["finalsettlementamount", "settlementamount", "payables"] },
    { field: "status", required: false, aliases: ["liveorderstatus", "orderstatus", "suborderstatus"] },
  ],
  isReturn: (_row, mapped) => {
    const s = (mapped.status ?? "").toLowerCase();
    return s.includes("rto") || s.includes("return") || s.includes("cancel");
  },
};

const FLIPKART_SPEC: ChannelSpec = {
  version: "flipkart-v1",
  fields: [
    { field: "orderRef", required: true, aliases: ["orderitemid", "orderid"] },
    { field: "orderDate", required: false, aliases: ["orderdate", "dispatchdate"] },
    {
      field: "saleAmount",
      required: true,
      aliases: ["orderitemvaluers", "orderitemvalue", "saleamountrs", "saleamount", "sellingprice"],
    },
    {
      field: "settledAmount",
      required: true,
      aliases: ["settlementvaluers", "settlementvalue", "banksettlementvaluers", "banksettlementvalue", "netamount"],
    },
    { field: "status", required: false, aliases: ["eventtype", "eventsubtype", "orderstatus"] },
  ],
  isReturn: (_row, mapped) => {
    const s = (mapped.status ?? "").toLowerCase();
    return s.includes("return") || s.includes("rto") || s.includes("refund") || s.includes("cancel");
  },
};

/**
 * Amazon settlement reports are transaction-level (many rows per order:
 * Principal, Fees, Tax...). We map the columns, then aggregate per order-id:
 * sale = sum of ItemPrice Principal amounts, settled = sum of ALL amounts.
 */
const AMAZON_SPEC: ChannelSpec = {
  version: "amazon-v1",
  fields: [
    { field: "orderRef", required: true, aliases: ["orderid", "amazonorderid", "merchantorderid"] },
    { field: "orderDate", required: false, aliases: ["posteddate", "posteddatetime"] },
    { field: "saleAmount", required: true, aliases: ["amount"] },
    { field: "settledAmount", required: true, aliases: ["amount"] },
    { field: "status", required: false, aliases: ["transactiontype"] },
  ],
  isReturn: (_row, mapped) => (mapped.status ?? "").toLowerCase().includes("refund"),
};

const SPECS: Record<ReconChannel, ChannelSpec> = {
  meesho: MEESHO_SPEC,
  flipkart: FLIPKART_SPEC,
  amazon: AMAZON_SPEC,
};

function buildHeaderMap(headers: string[], spec: ChannelSpec) {
  const normalized = headers.map((h) => ({ raw: h, norm: norm(h) }));
  const map = new Map<FieldSpec["field"], string>();
  const used = new Set<string>();

  for (const f of spec.fields) {
    for (const alias of f.aliases) {
      const hit = normalized.find((h) => h.norm === alias) ?? normalized.find((h) => h.norm.includes(alias));
      if (hit) {
        map.set(f.field, hit.raw);
        used.add(hit.raw);
        break;
      }
    }
  }

  const missingFields = spec.fields.filter((f) => f.required && !map.has(f.field)).map((f) => f.field);
  const unmappedHeaders = headers.filter((h) => !used.has(h) && h.trim() !== "");
  return { map, missingFields, unmappedHeaders };
}

export function parseSettlementCsv(channel: ReconChannel, csvText: string): AdapterResult {
  const spec = SPECS[channel];
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: "greedy",
    transformHeader: (h) => h.trim(),
  });

  const headers = parsed.meta.fields ?? [];
  const { map, missingFields, unmappedHeaders } = buildHeaderMap(headers, spec);

  if (missingFields.length > 0) {
    return { rows: [], unmappedHeaders, missingFields, adapterVersion: spec.version };
  }

  const get = (row: Record<string, string>, field: FieldSpec["field"]) => {
    const col = map.get(field);
    return col ? row[col] : undefined;
  };

  const raw: CanonicalRow[] = [];
  for (const row of parsed.data) {
    const orderRef = (get(row, "orderRef") ?? "").trim();
    if (!orderRef) continue;
    const settledRaw = toNumberOrNull(get(row, "settledAmount"));
    const mapped: CanonicalRow = {
      orderRef,
      orderDate: get(row, "orderDate")?.trim() || undefined,
      saleAmount: toNumber(get(row, "saleAmount")),
      settledAmount: settledRaw ?? 0,
      status: get(row, "status")?.trim() || undefined,
      isReturn: false,
      settlementPending: settledRaw === null,
    };
    mapped.isReturn = spec.isReturn(row, mapped);
    raw.push(mapped);
  }

  const rows = channel === "amazon" ? aggregateAmazon(raw) : raw;
  return { rows, unmappedHeaders, missingFields: [], adapterVersion: spec.version };
}

function aggregateAmazon(rows: CanonicalRow[]): CanonicalRow[] {
  const byOrder = new Map<string, CanonicalRow>();
  for (const r of rows) {
    const existing = byOrder.get(r.orderRef);
    if (!existing) {
      byOrder.set(r.orderRef, {
        ...r,
        // For amazon, saleAmount per transaction row is just "amount";
        // positive Order amounts approximate the sale, everything sums to net.
        saleAmount: r.saleAmount > 0 ? r.saleAmount : 0,
        settledAmount: r.settledAmount,
      });
      continue;
    }
    existing.saleAmount += r.saleAmount > 0 ? r.saleAmount : 0;
    existing.settledAmount += r.settledAmount;
    existing.isReturn = existing.isReturn || r.isReturn;
    // An order is only pending if every one of its transaction rows was blank.
    existing.settlementPending = existing.settlementPending && r.settlementPending;
    if (!existing.status && r.status) existing.status = r.status;
  }
  return Array.from(byOrder.values());
}
