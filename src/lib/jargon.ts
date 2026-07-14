export type JargonEntry = {
  term: string;
  short: string;
  example?: string;
};

export const JARGON_DICTIONARY: JargonEntry[] = [
  {
    term: "ROAS",
    short: "Return on Ad Spend. If you put ₹1 into ads, how many rupees of revenue come back?",
    example: "ROAS 3x = ₹1 ad spend → ₹3 revenue (not necessarily profit).",
  },
  {
    term: "RTO",
    short: "Return to Origin. Customer refused the COD parcel - you lose forward + reverse shipping.",
    example: "COD RTO commonly runs around 20-35% in India (varies by category and region); fashion sits at the high end.",
  },
  {
    term: "NDR",
    short: "Non-Delivery Report. Courier could not deliver - you must call/WhatsApp the customer fast.",
    example: "Follow up within 24 hours or the order returns as RTO.",
  },
  {
    term: "COD",
    short: "Cash on Delivery. Customer pays when the parcel arrives - high conversion, high return risk.",
  },
  {
    term: "ACOS",
    short: "Advertising Cost of Sale. Ad spend divided by revenue from those ads.",
    example: "ACOS 30% on a product with 25% margin = you lose money.",
  },
  {
    term: "GSTIN",
    short: "Your 15-digit GST ID. Mandatory for marketplace sellers from day one.",
  },
  {
    term: "HSN",
    short: "Harmonized System code for your product. Wrong HSN = wrong tax on listings.",
  },
  {
    term: "GST",
    short: "Goods and Services Tax - India's sales tax. Marketplaces charge 18% GST on their fees, and you charge GST on your sales.",
  },
  {
    term: "TCS",
    short: "Tax Collected at Source. Marketplaces deduct a small percentage (0.5% under current GST rules) and credit it to your GSTIN.",
  },
  {
    term: "MOQ",
    short: "Minimum Order Quantity. How many units a supplier requires per order.",
  },
  {
    term: "AOV",
    short: "Average Order Value. Total revenue divided by number of orders.",
  },
  {
    term: "PG",
    short: "Payment Gateway (Razorpay, Cashfree). Needed for prepaid on your own website.",
  },
  {
    term: "SKU",
    short: "Stock Keeping Unit - one specific product variant you sell.",
  },
  {
    term: "COGS",
    short: "Cost of Goods Sold - what you pay the supplier per unit.",
  },
  {
    term: "CTR",
    short: "Click-through rate. % of people who click your ad after seeing it.",
  },
  {
    term: "FSSAI",
    short: "Food safety license required to sell food products in India.",
  },
  {
    term: "BIS",
    short: "Bureau of Indian Standards certification - required for many electronics.",
  },
  {
    term: "GSTR-8",
    short: "Monthly return filed by e-commerce operators showing TCS collected on your sales. Match with your GSTR-2A.",
  },
  {
    term: "GSTR-1",
    short: "Your sales-detail return: every invoice for the period. Monthly (due 11th) or quarterly under QRMP (due 13th).",
    example: "Marketplace sales reports are your source data - reconcile before filing.",
  },
  {
    term: "GSTR-3B",
    short: "Your summary return where tax is actually paid: output tax minus input credit. Monthly (due 20th) or quarterly under QRMP (22nd/24th by state).",
  },
  {
    term: "GSTR-2A",
    short: "Auto-generated statement of purchases where suppliers reported YOU as buyer. Read-only - use it to verify your input tax credit.",
  },
  {
    term: "GSTR-2B",
    short: "Monthly frozen snapshot of the input tax credit you can claim. Reconcile against it before filing GSTR-3B.",
  },
  {
    term: "QRMP",
    short: "Quarterly Return, Monthly Payment scheme for turnover up to ₹5 crore: file GSTR-1/3B quarterly, pay tax monthly via PMT-06.",
    example: "Fewer filings, same tax. Opt in on the GST portal under Services → Returns.",
  },
  {
    term: "ARN",
    short: "Application Reference Number - your GST application's tracking ID. Use it to check registration status on the portal.",
  },
  {
    term: "TRN",
    short: "Temporary Reference Number issued mid-way through GST registration. Lets you resume a saved application for 15 days.",
  },
  {
    term: "REG-03",
    short: "Notice asking for clarification/extra documents on your GST application. Reply within 7 working days or it's rejected.",
  },
  {
    term: "Valmo",
    short: "Meesho's own logistics network. Meesho assigns the courier - you don't pick or negotiate shipping.",
  },
  {
    term: "Enrolment ID",
    short: "Meesho's no-GSTIN path for sellers of GST-exempt goods or intra-state supplies under the threshold - register with just a PAN.",
    example: "Lets you start selling while your GSTIN application is in progress.",
  },
  {
    term: "wardrobing",
    short: "Buying clothes, wearing them once with tags, then returning. A major fashion return fraud pattern.",
  },
  {
    term: "reserve hold",
    short: "Marketplace holds part of your payout as security against returns or policy risk. Common for new sellers.",
  },
  {
    term: "AliExpress",
    short: "China cross-border marketplace. 2-4 week shipping - impractical for India COD dropshipping.",
  },
];

const SORTED_TERMS = [...JARGON_DICTIONARY].sort((a, b) => b.term.length - a.term.length);
const TERM_REGEXES = new Map<JargonEntry, RegExp>(
  SORTED_TERMS.map((entry) => [entry, new RegExp(`\\b${entry.term}\\b`, "i")]),
);

export function lookupJargon(term: string): JargonEntry | undefined {
  const upper = term.toUpperCase();
  return JARGON_DICTIONARY.find((e) => e.term.toUpperCase() === upper);
}

/** Split text into plain + jargon segments for auto-highlight */
export type TextSegment = { type: "text"; value: string } | { type: "jargon"; value: string; entry: JargonEntry };

export function segmentJargon(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    let earliest: { index: number; entry: JargonEntry; match: string } | null = null;

    for (const entry of SORTED_TERMS) {
      const regex = TERM_REGEXES.get(entry)!;
      const match = remaining.match(regex);
      if (match && match.index !== undefined) {
        if (!earliest || match.index < earliest.index) {
          earliest = { index: match.index, entry, match: match[0] };
        }
      }
    }

    if (!earliest) {
      segments.push({ type: "text", value: remaining });
      break;
    }

    if (earliest.index > 0) {
      segments.push({ type: "text", value: remaining.slice(0, earliest.index) });
    }
    segments.push({ type: "jargon", value: earliest.match, entry: earliest.entry });
    remaining = remaining.slice(earliest.index + earliest.match.length);
  }

  return segments;
}
