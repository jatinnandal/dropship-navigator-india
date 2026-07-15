import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

/**
 * Channel-exact copy. The profile tells us WHERE the seller sells, so every
 * step names that marketplace's actual screens, reports and columns - never
 * "download your settlement report" homework.
 */

/** The dashboard number that lies vs the number that hits the bank. */
const VANITY_VS_REAL: Record<PrimaryChannel, string> = {
  meesho:
    "On Meesho: the sales figure on the Supplier Panel home screen is gross order value. The real number is the 'Final Settlement Amount' column in Payments → Previous Payments - that is what reaches your bank.",
  amazon:
    "On Amazon: the Seller Central home dashboard shows ordered product sales. The real number is the net proceeds in Payments → Payments Dashboard - after referral fee, closing fee, shipping and any reserve.",
  flipkart:
    "On Flipkart: the Seller Hub dashboard shows gross sales. The real number is the 'Settlement Value' in the Payments section - after commission, collection fee, shipping and returns.",
  shopify:
    "On your own store: Shopify Analytics shows gross sales. The real number is your Razorpay/Cashfree settlement (net of PG fees + GST on fees) minus COD remittance gaps, RTO shipping and ad spend - spread across three places, which is exactly why own-store sellers miss it.",
};

/** Where the weekly P&L data comes from, per channel. */
const PNL_SOURCE: Record<PrimaryChannel, string> = {
  meesho:
    "Weekly data source: the Previous Payments file from the Supplier Panel - per-suborder sale amount and 'Final Settlement Amount' in one download, so revenue and fees come from the same file.",
  amazon:
    "Weekly data source: the settlement report from Seller Central → Payments → Reports Repository - sale, fees and reserves per order in one file.",
  flipkart:
    "Weekly data source: the settlement report in Seller Hub → Payments - order item value and 'Settlement Value' per order.",
  shopify:
    "Weekly data sources: Shopify Analytics for orders, the Razorpay/Cashfree settlement export for PG fees, and your courier's COD remittance sheet. Own-store sellers reconcile three files - budget the time.",
};

/**
 * Exact download path + columns + how this app's Payout Reconciliation tool
 * consumes the file (Meesho/Flipkart/Amazon settlements; own-store is manual).
 */
const SETTLEMENT_DOWNLOAD: Record<PrimaryChannel, string[]> = {
  meesho: [
    "Download: Meesho Supplier Panel (supplier.meesho.com) → Payments → Previous Payments → pick the last completed cycle → download the order-level payments file.",
    "Columns that matter: 'Sub Order No', total sale amount, and 'Final Settlement Amount'. Sale minus settlement is what Meesho kept - commission, shipping, GST on fees, TCS.",
    "Upload that file to Tools → Payout Reconciliation in this app (CSV, one cycle at a time, max 2MB - if Meesho hands you an Excel workbook, save the order-level sheet as CSV first). It checks every suborder against the verified fee card and flags over-deductions.",
  ],
  amazon: [
    "Download: Seller Central → Payments → Reports Repository → request the settlement report (flat file) for the last closed period, then download it once generated.",
    "The file is transaction-level: one order becomes several rows (Principal, fees, tax). Don't try to eyeball it row by row - that is what the tool is for.",
    "Upload it to Tools → Payout Reconciliation in this app (CSV, one settlement, max 2MB). It aggregates the rows per order, compares total deductions against the verified fee card, and flags over-charges.",
  ],
  flipkart: [
    "Download: Flipkart Seller Hub → Payments → the reports/statements area → the settlement report for the last completed cycle (the order-level file, not the summary).",
    "Columns that matter: 'Order Item ID', order item value, and 'Settlement Value'. Value minus settlement is Flipkart's total deduction for that order.",
    "Upload it to Tools → Payout Reconciliation in this app (CSV, one cycle, max 2MB). It compares each order's deduction against the verified fee card and flags the ones worth a ticket.",
  ],
  shopify: [
    "Own store = two settlement streams. PG: Razorpay/Cashfree dashboard → Settlements shows gross captured, fees + GST on fees, and net deposited per settlement.",
    "COD: your courier/aggregator's COD remittance report (e.g. Shiprocket's COD reconciliation) - match remitted amounts to delivered orders.",
    "This app's Payout Reconciliation tool reads Meesho/Flipkart/Amazon settlement files. For your own store, reconcile manually: every delivered order must appear in either a PG settlement or a COD remittance. An order in neither = money you haven't been paid - follow up with the PG or courier.",
  ],
};

/** Where holds/reserves are visible + what healthy vs alarming looks like. */
const HOLDS_SCREEN: Record<PrimaryChannel, string[]> = {
  meesho: [
    "Where to look: Meesho Supplier Panel → Payments - next payment date and amount, plus any recovery/outstanding line where Meesho claws back earlier over-payments or claims.",
    "Healthy: next payment date always populated, roughly on the 7-15 day cycle. Alarming: a recovery line you can't map to a specific suborder, or a payment date that passes with no bank deposit - ticket with the suborder IDs.",
  ],
  amazon: [
    "Where to look: Seller Central → Payments → Payments Dashboard. The 'Account level reserve' line is money Amazon is holding - on new accounts a delivery-based reserve is standard, not a punishment.",
    "Healthy: the reserve roughly tracks your undelivered orders and releases as parcels deliver. Alarming: a reserve that keeps growing after deliveries complete, or a funds-withheld notice - open a payments case from Seller Central Help with your settlement IDs.",
  ],
  flipkart: [
    "Where to look: Flipkart Seller Hub → Payments overview - next settlement date, amount, and any hold reason sit on this screen.",
    "Healthy: the settlement date advances every cycle and the amount tracks your delivered orders. Alarming: a hold reason you don't recognise, or a settlement stuck past its date - raise it via Seller Hub support quoting the settlement ID.",
  ],
  shopify: [
    "Where to look: the Razorpay/Cashfree dashboard - settlement schedule plus any on-hold flag. PG holds usually mean pending KYC or a risk review, and the reason arrives by email.",
    "Healthy: settlements land on the T+2 to T+3 cycle. Alarming: settlements paused with a risk-review email - reply with the requested documents the same day; PG holds compound fast for COD-heavy stores.",
  ],
};

/** Where the marketplace's TCS report lives, per channel. */
const TCS_REPORT_PATH: Record<PrimaryChannel, string> = {
  meesho:
    "Download: Meesho Supplier Panel → Payments - the tax/TCS reports for the month.",
  amazon:
    "Download: Seller Central → Reports → Tax Document Library → the monthly GST Merchant Tax Report (MTR) - it lists tax collected per order.",
  flipkart:
    "Download: Flipkart Seller Hub → Reports → the tax reports section - the monthly TCS report.",
  shopify:
    "Own website: no e-commerce operator means no TCS on those sales - this applies only to marketplace channels. If you also sell on a marketplace, run this step for that channel.",
};

/** Where RTO/return reasons live, per channel - and what levers actually exist. */
const RETURN_REASON_SOURCE: Record<PrimaryChannel, string[]> = {
  meesho: [
    "Where reasons live: Meesho Supplier Panel → Orders → the returns/RTO view - each suborder shows courier status and the return reason.",
    "Meesho masks buyer phone numbers - you cannot call or WhatsApp buyers to rescue a delivery. Your levers are address-quality patterns by pincode, product-page accuracy (real photos, correct size chart), and Meesho's own buyer notifications.",
  ],
  amazon: [
    "Where reasons live: Seller Central → Reports → the returns reports (FBA returns report if you use FBA; Manage Returns for Easy Ship/self-ship) - reason codes per order.",
  ],
  flipkart: [
    "Where reasons live: Flipkart Seller Hub → Returns - courier-returned (RTO) vs customer-returned, with a reason per order.",
  ],
  shopify: [
    "Where reasons live: your courier/aggregator's NDR and returns panel (e.g. Shiprocket → NDR) - export it weekly; for your own store it is the only reason source you get.",
  ],
};

function settlementTimelineForChannel(channel: OnboardingProfile["primaryChannel"]): string[] {
  switch (channel) {
    case "amazon":
      return [
        "Amazon payment cycle: typically T+7 to T+14 from order delivery (varies by category/account age). The next payout date shows at the top of Payments → Payments Dashboard.",
        "New seller reserve: first 7-14 days may have hold on portion of settlement.",
      ];
    case "flipkart":
      return [
        "Flipkart settlement: usually weekly cycle, 7-10 business days after order completion.",
        "Seller Hub → Payments shows the next settlement date and hold reasons - check it before assuming a payment is missing.",
      ];
    case "meesho":
      return [
        "Meesho payment cycle: typically 7-15 days after delivery confirmation - the expected payment date shows against each suborder in the Payments section.",
        "COD remittance may lag prepaid - track both separately in your sheet.",
      ];
    default:
      return [
        "Shopify/own store: PG settlement T+2 to T+3 (Razorpay/Cashfree).",
        "COD via courier: remittance cycle 7-14 days depending on aggregator.",
      ];
  }
}

export function buildTrackingTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const channel = profile.primaryChannel;

  const steps: TaskStep[] = [
    {
      id: "revenue-vs-profit",
      title: "Revenue is vanity. Net profit is sanity.",
      why: "Most beginners discover they're losing money only at month-end when they finally check their bank account. By then, it's too late.",
      how: [
        "Accept this: the number in your seller dashboard is NOT what hits your bank.",
        VANITY_VS_REAL[channel],
        "Between that number and your bank: commission, shipping, GST on fees, TCS, returns, ad spend.",
        "A ₹50,000 revenue month can easily be ₹5,000 net profit - or a loss.",
      ],
      mentorNote:
        "An experienced seller checks profit weekly, not monthly. We'll set that up now.",
      trap: "Celebrating sales volume while ignoring net margin is how sellers go bankrupt slowly.",
    },
    {
      id: "pnl-setup",
      title: "Set up your SKU-level P&L tracker",
      why: "You need to know which products make money and which lose money. Aggregate revenue hides losing SKUs.",
      how: [
        "Create a spreadsheet with columns: SKU, units sold, revenue, product cost, shipping, commission, ad spend, returns, net profit.",
        PNL_SOURCE[channel],
        "Calculate net margin % per SKU.",
        "Flag any SKU below 10% margin for review.",
        "Run your hero product through the calculator below and save the numbers - the Weekly review card on your app home screen turns them into a Monday profit check-in with a verdict (Excellent / Healthy / Tight / Loss-making).",
      ],
      trap: "Building the sheet from the orders screen instead of the settlement file counts cancelled and RTO orders as income. Revenue comes from settlement data, always.",
      kind: "calculator",
      calculator: { kind: "margin" },
      tools: [
        {
          name: "eVanik",
          whenToUse: "If manual spreadsheets become too painful.",
          why: "Auto-imports Amazon/Flipkart settlement data into SKU-level P&L views.",
        },
      ],
    },
    {
      id: "cashflow-review",
      title: "Plan for the cashflow dead zone",
      why: "Even profitable sellers go broke in month 1 because ad cash leaves today but COD remittance arrives next week.",
      how: ["Model your starting budget against a 14-day timeline."],
      kind: "simulator",
      simulator: { kind: "cashflow_timeline" },
    },
    {
      id: "settlement-reconciliation",
      title: "Reconcile marketplace settlements weekly",
      why: "Marketplaces sometimes short-pay, miss TCS credits, or deduct wrong fees. Without reconciliation, you lose 2-5% silently.",
      how: [
        ...SETTLEMENT_DOWNLOAD[channel],
        "What healthy looks like: every delivered order accounted for, and only small gaps between expected and actual (per-order shipping weight isn't modelled, so small deltas are normal). What's alarming: repeated same-size over-deductions - a wrong commission slab or a doubled fee - or delivered orders missing from the payout entirely.",
        "If the flagged gaps add up to more than ₹100: raise ONE support ticket with ALL the order IDs, the settlement file, and your expected-vs-actual math per order - not one ticket per order.",
        "Track the ticket weekly until the credit appears in a later settlement - marketplaces fix these as adjustments, not apologies.",
        ...settlementTimelineForChannel(channel),
        "Common deduction glossary: commission, fixed closing fee, shipping chargeback, TCS 0.5%, pick-pack fee, storage (FBA), ad spend offset.",
      ],
      trap: "Assuming marketplace payouts are always correct. 2-5% error rate is common, especially in first 3 months.",
    },
    {
      id: "payout-holds",
      title: "Understand payout holds and reserves",
      why: `New sellers on ${channelLabel(channel)} often face held settlements, performance reserves, or return deductions. This can be existential for micro-sellers.`,
      how: [
        ...HOLDS_SCREEN[channel],
        "New seller hold: often 7-14 days on first payouts - plan cashflow accordingly.",
        "Performance hold: triggered by high returns/RTO or policy violations - the trigger metric is named in the hold notice, so read it before writing to support.",
        "Compare expected vs actual weekly - ticket if mismatch > ₹100.",
      ],
      trap: "Panicking and creating duplicate tickets slows resolution. One detailed ticket with order IDs works better.",
    },
    {
      id: "appeal-pack",
      title: "Build your appeal pack (keep ready)",
      why: "When account is suspended or payout held, speed matters. Having docs ready cuts resolution from weeks to days.",
      how: [
        "Folder with: GST certificate, PAN, bank proof (account name = GST legal name), return policy screenshot.",
        "Sample invoices or order screenshots showing fulfillment.",
        "Settlement reports for the disputed period - the same files you download in the reconciliation step above, so keep each cycle's download.",
        "Below this step are two ready templates: 'Marketplace support ticket' for first contact, and 'Formal escalation letter' for when a ticket stalls. Copy both, fill the {{blanks}} with your seller ID and order IDs, and save them in the folder.",
        "Mark done when the folder is assembled and both templates are saved with your details filled in.",
      ],
      mentorNote: workspace.legalBusinessName
        ? `Your saved legal name is "${workspace.legalBusinessName}" - every document in this folder must show exactly that name. One mismatch is all a rejection needs.`
        : undefined,
    },
    {
      id: "gstr8-reconcile",
      title: "GSTR-8 and TCS reconciliation",
      why: "E-commerce operators file GSTR-8 monthly with TCS collected on your sales. Mismatches block credits and cash.",
      how: [
        "GSTR-8 is filed by the marketplace (the e-commerce operator), not by you. It declares the TCS collected on your sales against your GSTIN.",
        "Your monthly match is three numbers: (1) TCS in your marketplace tax report, (2) the TCS estimate on your latest Payout Reconciliation report in this app, (3) the credit showing on the GST portal.",
        "GST portal path: gst.gov.in → Returns Dashboard → 'TDS and TCS credit received' → accept the entries. The credit reaches your cash ledger only after you accept it - unaccepted TCS is your money parked with the government.",
        "Use the cash ledger balance to pay your GSTR-3B liability - that is how the credit turns back into cash.",
        "Match = done in minutes. Mismatch for 2+ months in a row = involve a CA with your settlement files and TCS reports - that reconciliation sheet is exactly what a GST notice would demand anyway.",
      ],
      trap: "Ignoring GSTR-8 mismatches means you overpay tax and leave credit unclaimed - a silent bleed on every order.",
      tools: [
        {
          name: "eCominess",
          whenToUse: "To auto-generate GSTR-1 from marketplace reports.",
          why: "Reduces manual errors in TCS reconciliation.",
        },
      ],
    },
    {
      id: "tcs-recovery",
      title: "Track TCS and get it back via the GST portal",
      why: "Marketplaces collect 0.5% TCS on your sales and deposit it against your GSTIN. This is YOUR money - it just needs accepting on the GST portal.",
      how: [
        TCS_REPORT_PATH[channel],
        "Cross-check: the TCS estimate on your Payout Reconciliation report - carried onto your Weekly review card as 'TCS to claim' - should be in the same range as the marketplace's own tax report. A big gap means missing orders in one of the two.",
        "Accept it: gst.gov.in → Returns Dashboard → 'TDS and TCS credit received'. Accepted TCS lands in your cash ledger and pays down your next GSTR-3B liability.",
        "If the cash ledger builds up beyond your GST liability, the excess is claimable as a GST refund. Separate thing: the income-tax TDS a marketplace deducts shows in your 26AS and settles through your ITR - don't mix the two.",
        "Keep TCS records for 6 years.",
      ],
      trap: "Unaccepted TCS is you overpaying tax by 0.5% on every sale. On ₹10L of marketplace revenue, that's ₹5,000 parked with the government until you claim it.",
      mentorNote: workspace.gstin
        ? `Your GSTIN ${workspace.gstin} is where TCS gets credited. Verify monthly on gst.gov.in.`
        : "Complete GST registration first - TCS recovery requires an active GSTIN.",
    },
    {
      id: "rto-tracking",
      title: "Track RTO reasons and fix root causes",
      why: "RTO is not random. Patterns emerge: certain pincodes, product types, price points, or courier partners cause most returns.",
      how: [
        ...RETURN_REASON_SOURCE[channel],
        "Build a simple RTO/returns log (template below this step) - separate columns for RTO reasons vs return reasons, because the fixes are different.",
        "Weekly: RTO rate = RTO orders / total COD orders. Return rate = returns / delivered orders.",
        "Target: RTO below 15% general, below 25% fashion. Returns below 15% general, below 30% fashion.",
        "Fix the top reason in EACH column separately - an address problem and a size problem need different fixes.",
      ],
      trap: "Treating all returns the same. 'Customer refused' on a ₹200 product vs ₹2,000 product needs different fixes.",
    },
    {
      id: "weekly-ritual",
      title: "Your weekly 30-minute profit review",
      why: "This 30-minute ritual prevents month-end surprises and tells you exactly what to pause, fix, or scale.",
      how: [
        "Your anchor: the Weekly review card on your app home screen. It shows per-order profit at your saved RTO rate, your last payout check, and upcoming GST deadlines - fresh each Monday-anchored week.",
        "Every Monday morning, 30 minutes:",
        "1. Update the SKU P&L sheet from last week's settlement data.",
        channel === "shopify"
          ? "2. Reconcile last week's PG settlements and COD remittance against delivered orders - every order accounted for."
          : "2. Upload the newest settlement CSV to Tools → Payout Reconciliation - the card then shows your unexplained delta and TCS to claim.",
        "3. Check last week's RTO rate and top return reasons against the targets in your RTO log.",
        profile.hasGstin
          ? "4. Glance at the GST deadlines on the card - anything due this week goes on today's list."
          : "4. Reconcile settlement vs bank deposit - the amounts must match, line by line.",
        "5. Write 3 actions: one to pause, one to fix, one to scale - the next step turns these into standing rules.",
      ],
      trap: "Skipping one Monday feels harmless. Two skipped Mondays is a month-end surprise - the exact thing this module exists to prevent.",
      question: {
        id: "tracking-ready",
        prompt: "Will you commit to this weekly review?",
        options: [
          { value: "yes", label: "Yes - I'll do this every Monday" },
          { value: "help", label: "Yes, but I want a tool to automate it" },
        ],
      },
    },
  ];

  if (answers["tracking-ready"] === "help") {
    steps.push({
      id: "automation-tools",
      title: "Tools that automate tracking",
      why: "Manual spreadsheets work for 1-2 channels and <50 SKUs. Beyond that, automation saves hours and catches errors.",
      how: [
        "Already built into this app - don't pay another tool for these: settlement checking (Tools → Payout Reconciliation), the Monday summary (Weekly review card), margin and break-even math (margin calculator).",
        "eVanik: multi-marketplace SKU-level P&L auto-import - the layer this app doesn't automate. Worth it at 2+ channels or 20+ SKUs.",
        "eCominess: generates GSTR-1 from marketplace reports - saves CA hours at filing time.",
        "Rule of thumb: stay manual plus the built-in tools until the Monday ritual takes over an hour - then automate the slowest piece first.",
      ],
      tools: [
        {
          name: "eVanik",
          whenToUse: "When managing 2+ marketplaces or 20+ SKUs.",
          why: "Automates multi-marketplace SKU-level P&L - the layer beyond this app's per-settlement reconciliation.",
        },
        {
          name: "eCominess",
          whenToUse: "For GST filing automation from marketplace data.",
          why: "Generates GSTR-1 from Amazon/Flipkart reports - saves CA fees.",
        },
      ],
    });
  }

  steps.push({
    id: "scale-decision",
    title: "Decide: pause, fix, or scale",
    why: "Data without action is useless. Every weekly review must produce a decision.",
    how: [
      "Where the numbers come from: net margin % per SKU is in your P&L sheet; for your hero product, the Weekly review card's verdict (Excellent / Healthy / Tight / Loss-making) is the same math already done for you.",
      "PAUSE: any SKU with negative margin for 2+ consecutive weeks.",
      "FIX: SKUs with 5-15% margin - improve listing, negotiate supplier, or reduce RTO.",
      "SCALE: SKUs with 20%+ margin and stable RTO - increase ad budget, add inventory, expand channels.",
      "Document your decision and revisit next Monday.",
    ],
    mentorNote:
      "The sellers who succeed are not the ones who never fail - they're the ones who catch losses in week 2, not month 6.",
  });

  return {
    id: "tracking-analytics",
    title: "Track real profit, not just sales",
    intro: "We'll set up weekly profit tracking, settlement reconciliation, and RTO monitoring so you always know what's actually making money.",
    steps,
  };
}
