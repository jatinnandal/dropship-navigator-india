import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

export function buildTrackingTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "revenue-vs-profit",
      title: "Revenue is vanity. Net profit is sanity.",
      why: "Most beginners discover they're losing money only at month-end when they finally check their bank account. By then, it's too late.",
      how: [
        "Accept this: the number in your seller dashboard is NOT what hits your bank.",
        "Between that number and your bank: commission, shipping, GST on fees, TCS, returns, ad spend.",
        "A ₹50,000 revenue month can easily be ₹5,000 net profit — or a loss.",
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
        "Update weekly from marketplace settlement reports.",
        "Calculate net margin % per SKU.",
        "Flag any SKU below 10% margin for review.",
      ],
      kind: "calculator",
      calculator: { kind: "margin" },
      tools: [
        {
          name: "eVanik",
          whenToUse: "If manual spreadsheets become too painful.",
          why: "Auto-imports Amazon/Flipkart settlement data into SKU-level P&L views.",
        },
        {
          name: "TrackEcom",
          whenToUse: "For return/RTO tracking across channels.",
          why: "Shows return reasons and channel-wise breakdowns — helps you fix root causes.",
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
        `Download weekly settlement report from ${channelLabel(profile.primaryChannel)}.`,
        "Compare: expected payout (orders × price - fees) vs actual bank deposit.",
        "Check for: missing orders, wrong commission, unprocessed returns, TCS deductions.",
        "If mismatch > ₹100: raise a support ticket with order IDs and expected vs actual.",
        "Track ticket status until resolved.",
      ],
      trap: "Assuming marketplace payouts are always correct. 2-5% error rate is common, especially in first 3 months.",
    },
    {
      id: "tcs-recovery",
      title: "Track TCS and recover it in your ITR",
      why: "Marketplaces deduct 1% TCS on every sale and deposit it against your GSTIN. This is YOUR money — recover it via GST returns and ITR.",
      how: [
        "Download TCS report from marketplace (Amazon: Tax Document Library, Flipkart: Reports section).",
        "Match TCS deducted vs TCS credit in GSTR-2A on GST portal.",
        "Claim input credit in GSTR-3B monthly filing.",
        "Excess TCS beyond GST liability is refundable via ITR.",
        "Keep TCS records for 6 years.",
      ],
      trap: "Ignoring TCS means you're overpaying tax by 1% on every sale. On ₹10L revenue, that's ₹10,000 left on the table.",
      mentorNote: workspace.gstin
        ? `Your GSTIN ${workspace.gstin} is where TCS gets credited. Verify monthly on gst.gov.in.`
        : "Complete GST registration first — TCS recovery requires an active GSTIN.",
    },
    {
      id: "rto-tracking",
      title: "Track RTO reasons and fix root causes",
      why: "RTO is not random. Patterns emerge: certain pincodes, product types, price points, or courier partners cause most returns.",
      how: [
        "Create an RTO log: date, order ID, product, reason (refused/wrong address/quality/cash unavailable).",
        "Weekly: calculate RTO rate = RTO orders / total COD orders.",
        "Target: below 15% for general products, below 25% for fashion.",
        "Fix top 3 reasons: address validation, COD confirmation, product description accuracy.",
      ],
      kind: "calculator",
      calculator: { kind: "rto_impact" },
      trap: "Treating all returns the same. 'Customer refused' on a ₹200 product vs ₹2000 product needs different fixes.",
    },
    {
      id: "weekly-ritual",
      title: "Your weekly 30-minute profit review",
      why: "This 30-minute ritual prevents month-end surprises and tells you exactly what to pause, fix, or scale.",
      how: [
        "Every Monday morning, 30 minutes:",
        "1. Update P&L sheet with last week's data.",
        "2. Check RTO rate and top return reasons.",
        "3. Reconcile settlement vs bank deposit.",
        "4. Flag SKUs with negative or <10% margin.",
        "5. Write 3 actions: one to pause, one to fix, one to scale.",
      ],
      question: {
        id: "tracking-ready",
        prompt: "Will you commit to this weekly review?",
        options: [
          { value: "yes", label: "Yes — I'll do this every Monday" },
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
        "eVanik: auto-imports settlement data, SKU P&L, multi-marketplace.",
        "eCominess: auto-generates GSTR-1 from marketplace reports.",
        "TrackEcom: RTO/return analytics with reason breakdowns.",
        "Start manual, switch to tools when weekly tracking takes >1 hour.",
      ],
      tools: [
        {
          name: "eVanik",
          whenToUse: "When managing 2+ marketplaces or 20+ SKUs.",
          why: "Automates the P&L and reconciliation you're doing manually.",
        },
        {
          name: "eCominess",
          whenToUse: "For GST filing automation from marketplace data.",
          why: "Generates GSTR-1 from Amazon/Flipkart reports — saves CA fees.",
        },
      ],
    });
  }

  steps.push({
    id: "scale-decision",
    title: "Decide: pause, fix, or scale",
    why: "Data without action is useless. Every weekly review must produce a decision.",
    how: [
      "PAUSE: any SKU with negative margin for 2+ consecutive weeks.",
      "FIX: SKUs with 5-15% margin — improve listing, negotiate supplier, or reduce RTO.",
      "SCALE: SKUs with 20%+ margin and stable RTO — increase ad budget, add inventory, expand channels.",
      "Document your decision and revisit next Monday.",
    ],
    mentorNote:
      "The sellers who succeed are not the ones who never fail — they're the ones who catch losses in week 2, not month 6.",
  });

  return {
    id: "tracking-analytics",
    title: "Track real profit, not just sales",
    intro: "We'll set up weekly profit tracking, settlement reconciliation, and RTO monitoring so you always know what's actually making money.",
    steps,
  };
}
