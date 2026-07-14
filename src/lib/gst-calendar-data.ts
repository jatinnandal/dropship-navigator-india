export type GstFiling = {
  id: string;
  name: string;
  form: string;
  frequency: "monthly" | "quarterly";
  description: string;
  dueDay: number;
  lateFeePenalty: string;
  applicableTo: "all" | "qrmp" | "regular";
  prepChecklist: string[];
};

export type GstEvent = {
  id: string;
  filing: GstFiling;
  dueDate: Date;
  status: "done" | "upcoming" | "overdue" | "prep";
  daysUntilDue: number;
};

export const GST_DATA_META = {
  lastVerified: "2026-07-07",
  sources: [
    "gst.gov.in",
    "taxguru.in/goods-and-service-tax",
    "cleartax.in/gst",
  ],
} as const;

/**
 * QRMP quarterly GSTR-3B has two state categories (CBIC notification):
 * Category A (south/west) files by the 22nd, Category B (north/east) by the
 * 24th of the month after the quarter. Everything not in this set is 22nd.
 */
const GSTR3B_DAY24_STATES = new Set<string>([
  "Himachal Pradesh",
  "Punjab",
  "Uttarakhand",
  "Haryana",
  "Rajasthan",
  "Uttar Pradesh",
  "Bihar",
  "Sikkim",
  "Arunachal Pradesh",
  "Nagaland",
  "Manipur",
  "Mizoram",
  "Tripura",
  "Meghalaya",
  "Assam",
  "West Bengal",
  "Jharkhand",
  "Odisha",
  "Jammu and Kashmir",
  "Ladakh",
  "Chandigarh",
  "Delhi",
]);

export function quarterlyGstr3bDueDay(operatingState?: string): 22 | 24 {
  if (operatingState && GSTR3B_DAY24_STATES.has(operatingState)) return 24;
  return 22;
}

/**
 * Whether missing this filing costs money. IFF (optional) and TCS
 * reconciliation (you lose credit, not a fine) carry no late fee, so they must
 * not appear in "file now to avoid late fees" warnings, and they can drop off
 * once past due. Statutory returns (GSTR-1/3B, NIL) do carry a fee and must
 * stay visible while overdue.
 */
export function filingCarriesLateFee(filing: GstFiling): boolean {
  return !/^no\b/i.test(filing.lateFeePenalty.trim());
}

const GST_FILINGS: GstFiling[] = [
  {
    id: "gstr1-monthly",
    name: "GSTR-1 (Monthly)",
    form: "GSTR-1",
    frequency: "monthly",
    description:
      "Details of outward supplies - all B2B and B2C invoices for the month.",
    dueDay: 11,
    lateFeePenalty: "₹50/day (₹25 CGST + ₹25 SGST) - capped ₹2,000 if turnover ≤ ₹1.5cr (₹10,000 only above ₹5cr)",
    applicableTo: "regular",
    prepChecklist: [
      "Compile all sales invoices for the period",
      "Prepare credit and debit notes",
      "Verify HSN-wise summary",
      "Reconcile e-invoices (if applicable)",
      "Cross-check with marketplace sales reports",
    ],
  },
  {
    id: "gstr1-quarterly",
    name: "GSTR-1 (Quarterly)",
    form: "GSTR-1",
    frequency: "quarterly",
    description:
      "Quarterly return of outward supplies for QRMP filers. Due 13th of the month following the quarter.",
    dueDay: 13,
    lateFeePenalty: "₹50/day (₹25 CGST + ₹25 SGST) - capped ₹2,000 if turnover ≤ ₹1.5cr (₹10,000 only above ₹5cr)",
    applicableTo: "qrmp",
    prepChecklist: [
      "Compile all sales invoices for the quarter",
      "Prepare credit and debit notes",
      "Verify HSN-wise summary for all 3 months",
      "Reconcile e-invoices (if applicable)",
      "Cross-check with marketplace sales reports",
    ],
  },
  {
    id: "gstr3b-monthly",
    name: "GSTR-3B (Monthly)",
    form: "GSTR-3B",
    frequency: "monthly",
    description:
      "Summary return with tax payment - ITC claimed, output tax, and net tax payable.",
    dueDay: 20,
    lateFeePenalty: "₹50/day (₹25 CGST + ₹25 SGST) - capped ₹2,000 if turnover ≤ ₹1.5cr - plus 18% interest on tax due",
    applicableTo: "regular",
    prepChecklist: [
      "Reconcile input tax credit (ITC) from GSTR-2B",
      "Verify TCS deducted by marketplaces (GSTR-8)",
      "Calculate net tax payable",
      "Ensure sufficient balance in cash/credit ledger",
      "Keep payment ready before due date",
    ],
  },
  {
    id: "gstr3b-quarterly",
    name: "GSTR-3B (Quarterly)",
    form: "GSTR-3B",
    frequency: "quarterly",
    description:
      "Quarterly summary return with tax payment for QRMP filers. Due 22nd or 24th based on state category.",
    dueDay: 22, // 22nd or 24th depending on state category
    lateFeePenalty: "₹50/day (₹25 CGST + ₹25 SGST) - capped ₹2,000 if turnover ≤ ₹1.5cr - plus 18% interest on tax due",
    applicableTo: "qrmp",
    prepChecklist: [
      "Reconcile input tax credit (ITC) from GSTR-2B",
      "Verify TCS deducted by marketplaces (GSTR-8)",
      "Calculate net tax payable for all 3 months",
      "Ensure sufficient balance in cash/credit ledger",
      "Keep payment ready before due date",
    ],
  },
  {
    id: "iff",
    name: "IFF (Invoice Furnishing Facility)",
    form: "IFF",
    frequency: "monthly",
    description:
      "Optional monthly invoice upload for QRMP filers - lets your buyers claim ITC without waiting for quarterly GSTR-1.",
    dueDay: 13,
    lateFeePenalty: "No penalty (optional), but buyers lose ITC visibility",
    applicableTo: "qrmp",
    prepChecklist: [
      "Identify B2B invoices for the month",
      "Upload on IFF portal before 13th",
      "Confirm uploaded invoices reflect in buyer's GSTR-2A",
    ],
  },
  {
    id: "tcs-reconciliation",
    name: "TCS Reconciliation",
    form: "TDS/TCS credit received statement",
    frequency: "monthly",
    description:
      "Marketplaces deposit 0.5% TCS (rate since July 2024) against your GSTIN. Accept it via the 'TDS and TCS credit received' statement on the GST portal - the credit reaches your cash ledger only after you accept it.",
    dueDay: 28,
    lateFeePenalty: "No direct penalty, but unaccepted TCS = lost money",
    applicableTo: "all",
    prepChecklist: [
      "Open Returns → TDS and TCS credit received on the GST portal",
      "Download TCS certificates from each marketplace",
      "Accept matching entries so the credit moves to your cash ledger",
      "Flag and dispute mismatches with marketplace support",
    ],
  },
  {
    id: "nil-return",
    name: "NIL Return (only if zero sales)",
    form: "GSTR-1 / GSTR-3B",
    frequency: "monthly",
    description:
      "Applies only when you had ZERO sales this period - and then it's mandatory: file NIL GSTR-1/GSTR-3B or pay ₹20/day. If you had sales, your normal returns cover this.",
    dueDay: 11,
    lateFeePenalty: "₹20/day (₹10 CGST + ₹10 SGST) for NIL returns - capped ₹500",
    applicableTo: "all",
    prepChecklist: [
      "Confirm zero transactions for the period",
      "File NIL GSTR-1 and GSTR-3B on portal",
      "Takes ~2 minutes - just do it",
    ],
  },
];

function isQuarterEndMonth(month: number): boolean {
  // Quarters end in March (3), June (6), September (9), December (12)
  // month is 0-indexed: 2=Mar, 5=Jun, 8=Sep, 11=Dec
  return month === 2 || month === 5 || month === 8 || month === 11;
}

function getMonthAfterQuarterEnd(year: number, month: number): { year: number; month: number } | null {
  // Return the month after the current quarter ends
  // If we're in Jan (0), Feb (1), Mar (2) -> quarter ends Mar, filing due in Apr (3)
  // If we're in Apr (3), May (4), Jun (5) -> quarter ends Jun, filing due in Jul (6)
  const quarterEndMonths = [2, 5, 8, 11];
  for (const qEnd of quarterEndMonths) {
    if (month <= qEnd) {
      const nextMonth = qEnd + 1;
      if (nextMonth > 11) {
        return { year: year + 1, month: 0 };
      }
      return { year, month: nextMonth };
    }
  }
  return { year: year + 1, month: 0 };
}

function daysBetween(a: Date, b: Date): number {
  const msPerDay = 86400000;
  const utcA = Date.UTC(a.getFullYear(), a.getMonth(), a.getDate());
  const utcB = Date.UTC(b.getFullYear(), b.getMonth(), b.getDate());
  return Math.floor((utcB - utcA) / msPerDay);
}

function computeStatus(dueDate: Date, today: Date): GstEvent["status"] {
  const days = daysBetween(today, dueDate);
  if (days < 0) return "overdue";
  if (days <= 3) return "prep";
  if (days <= 30) return "upcoming";
  return "upcoming";
}

export function getGstEventsForMonth(
  year: number,
  month: number, // 0-indexed
  isQrmp: boolean,
  operatingState?: string,
): GstEvent[] {
  const today = new Date();
  const events: GstEvent[] = [];

  for (const filing of GST_FILINGS) {
    // Filter by filing scheme
    if (filing.applicableTo === "qrmp" && !isQrmp) continue;
    if (filing.applicableTo === "regular" && isQrmp) continue;

    // For quarterly filings, only show in the month after quarter end
    if (filing.frequency === "quarterly" && filing.applicableTo === "qrmp") {
      const afterQuarter = getMonthAfterQuarterEnd(year, month);
      if (!afterQuarter || afterQuarter.month !== month || afterQuarter.year !== year) {
        // Check if the current viewing month is actually the filing month
        // The month after quarter-end months: 3 (Apr), 6 (Jul), 9 (Oct), 0 (Jan)
        const filingMonths = [0, 3, 6, 9];
        if (!filingMonths.includes(month)) continue;
      }
    }

    // NIL return: skip if other filings cover this period
    if (filing.id === "nil-return") {
      // Always show as a reminder
    }

    // Quarterly GSTR-3B due day is state-dependent (22nd vs 24th).
    const dueDay =
      filing.id === "gstr3b-quarterly"
        ? quarterlyGstr3bDueDay(operatingState)
        : filing.dueDay;
    const dueDate = new Date(year, month, dueDay);
    const daysUntilDue = daysBetween(today, dueDate);
    const status = computeStatus(dueDate, today);

    events.push({
      id: `${filing.id}-${year}-${month}`,
      filing,
      dueDate,
      status,
      daysUntilDue,
    });
  }

  return events.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function getUpcomingGstEvents(
  isQrmp: boolean,
  completedIds: Set<string> = new Set(),
  operatingState?: string,
): GstEvent[] {
  const today = new Date();
  const events: GstEvent[] = [];

  // Look across next 90 days
  for (let i = 0; i < 3; i++) {
    const targetDate = new Date(today.getFullYear(), today.getMonth() + i, 1);
    const monthEvents = getGstEventsForMonth(
      targetDate.getFullYear(),
      targetDate.getMonth(),
      isQrmp,
      operatingState,
    );

    for (const evt of monthEvents) {
      // Penalty-bearing returns stay visible up to 45 days overdue (the fee is
      // still accruing and must not disappear); no-penalty items drop after a
      // week since nothing is at stake once the window passes.
      const overdueFloor = filingCarriesLateFee(evt.filing) ? -45 : -7;
      if (evt.daysUntilDue >= overdueFloor && evt.daysUntilDue <= 90) {
        // Mark completed events
        if (completedIds.has(evt.id)) {
          evt.status = "done";
        }
        events.push(evt);
      }
    }
  }

  // Deduplicate by id
  const seen = new Set<string>();
  const unique: GstEvent[] = [];
  for (const evt of events) {
    if (!seen.has(evt.id)) {
      seen.add(evt.id);
      unique.push(evt);
    }
  }

  return unique.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
}

export function getEventsForDate(
  year: number,
  month: number,
  day: number,
  isQrmp: boolean,
  operatingState?: string,
): GstEvent[] {
  const monthEvents = getGstEventsForMonth(year, month, isQrmp, operatingState);
  return monthEvents.filter((e) => e.dueDate.getDate() === day);
}
