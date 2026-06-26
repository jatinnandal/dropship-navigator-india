import type { TaskModuleId } from "@/lib/tasks";

export type SubTaskGuide = {
  hint: string;
  howToSteps: string[];
  walkthroughHref: string;
};

export const SUBTASK_GUIDES: Record<string, SubTaskGuide> = {
  "docs-folder-ready": {
    hint: "One Google Drive or local folder with PAN, Aadhaar, bank proof.",
    howToSteps: [
      "Create a folder named after your business.",
      "Add PAN card, Aadhaar, cancelled cheque, and address proof scans.",
      "Keep originals ready for marketplace KYC uploads.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "gstin-active": {
    hint: "15-digit GSTIN from gst.gov.in — or start registration.",
    howToSteps: [
      "Open the documentation walkthrough GST track.",
      "Register or validate your GSTIN and save it to workspace.",
      "Wait 24–72h after new registration before marketplace verification.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "bank-matched": {
    hint: "Bank holder name must match GST legal name exactly.",
    howToSteps: [
      "Copy legal name from GST certificate.",
      "Compare character-for-character with bank account name.",
      "Fix mismatch before marketplace onboarding.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "gst-filing-understood": {
    hint: "GSTR-1 + GSTR-3B due monthly or quarterly (QRMP).",
    howToSteps: [
      "Read the GST filing calendar step in documentation.",
      "Set calendar reminders for GSTR-1 and GSTR-3B due dates.",
      "Use ClearTax or a CA if filing feels overwhelming.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "product-shortlist": {
    hint: "3 SKUs that pass the margin calculator.",
    howToSteps: [
      "Run demand check on your target marketplace.",
      "Use the margin calculator — target 15%+ net margin.",
      "Save 3 product names in the product-selection walkthrough.",
    ],
    walkthroughHref: "/app/tasks/product-selection",
  },
  "samples-ordered": {
    hint: "Order 1 sample per shortlisted SKU before listing.",
    howToSteps: [
      "Order from your top supplier candidate.",
      "Do a drop test and check dispatch time.",
      "Only list products where sample quality passes.",
    ],
    walkthroughHref: "/app/tasks/product-selection",
  },
  "hsn-mapped": {
    hint: "Each SKU needs correct HSN + GST rate.",
    howToSteps: [
      "Look up HSN on cbic-gst.gov.in for each product.",
      "Create a one-page HSN mapping sheet.",
      "Enter codes in marketplace tax settings.",
    ],
    walkthroughHref: "/app/tasks/compliance-by-product",
  },
  "category-certs": {
    hint: "FSSAI, BIS, or category approval if required.",
    howToSteps: [
      "Check if your category is gated on your marketplace.",
      "Upload required certificates during category application.",
      "Allow 3–7 days for approval before listing.",
    ],
    walkthroughHref: "/app/tasks/compliance-by-product",
  },
  "supplier-vetted": {
    hint: "Verified manufacturer + written terms.",
    howToSteps: [
      "Complete the sourcing swipe game and red-flag screener.",
      "Order samples and confirm dispatch SLA in writing.",
      "Save supplier name in the walkthrough.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "backup-supplier": {
    hint: "Second supplier for your top SKU.",
    howToSteps: [
      "Identify one alternative on IndiaMART or TradeIndia.",
      "Order one sample from backup supplier.",
      "Keep contact and pricing on file.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "domestic-supplier-confirmed": {
    hint: "Complete sourcing swipe — no AliExpress/CJ.",
    howToSteps: [
      "Play the sourcing origin swipe game.",
      "Confirm supplier ships within 3–5 days in India.",
      "Reject cross-border suppliers for COD.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "seller-account-live": {
    hint: "Marketplace KYC approved, not pending.",
    howToSteps: [
      "Complete channel onboarding in the walkthrough.",
      "Upload GST, PAN, bank, address proof.",
      "Wait for approval email before listing.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "first-listing-live": {
    hint: "3+ listings published and visible.",
    howToSteps: [
      "Create listings with white-bg images and size charts.",
      "Double-check HSN, price, and stock status.",
      "Monitor approval status daily.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "store-linked": {
    hint: "Payout bank linked and verified.",
    howToSteps: [
      "Link bank account matching GST legal name.",
      "Complete payout verification in seller panel.",
      "Check settlement settings are active.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "cod-practice-done": {
    hint: "Complete NDR/COD confirmation simulator.",
    howToSteps: [
      "Open channel-launch or ads walkthrough.",
      "Complete the NDR practice scenarios.",
      "Copy WhatsApp confirmation template.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "first-payout-received": {
    hint: "First settlement hit your bank account.",
    howToSteps: [
      "Download settlement report from marketplace.",
      "Compare expected vs actual bank deposit.",
      "Raise ticket if mismatch > ₹100.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "breakeven-roas-known": {
    hint: "Know your break-even ROAS before spending.",
    howToSteps: [
      "Run margin calculator in product-selection.",
      "Open ads walkthrough for break-even ROAS step.",
      "Save result — only scale above break-even.",
    ],
    walkthroughHref: "/app/tasks/ads-growth",
  },
  "first-ad-test": {
    hint: "One campaign at ₹300–500/day for 7 days.",
    howToSteps: [
      "Start with one product, one ad set.",
      "Run 7 days before judging performance.",
      "Pause if ROAS below break-even.",
    ],
    walkthroughHref: "/app/tasks/ads-growth",
  },
  "pnl-sheet-ready": {
    hint: "Weekly SKU-level profit spreadsheet.",
    howToSteps: [
      "Create columns: SKU, revenue, costs, ad spend, net profit.",
      "Update every Monday from settlement reports.",
      "Flag SKUs below 10% margin.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "settlement-reconcile": {
    hint: "Compare settlement report vs bank deposit.",
    howToSteps: [
      "Download weekly settlement from marketplace.",
      "Match orders, fees, TCS, returns line by line.",
      "Ticket any discrepancy with order IDs.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "appeal-pack-ready": {
    hint: "Folder with GST, bank proof, return policy.",
    howToSteps: [
      "Assemble GST cert, PAN, bank proof, return policy screenshot.",
      "Add sample invoices and settlement reports.",
      "Copy appeal letter template from walkthrough.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "gstr8-reviewed": {
    hint: "Match operator TCS to GSTR-2A monthly.",
    howToSteps: [
      "Download TCS report from marketplace.",
      "Check GSTR-2A on GST portal for credits.",
      "Claim in GSTR-3B filing.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
};

export function getSubTaskGuide(subTaskId: string, moduleId: TaskModuleId): SubTaskGuide {
  const guide = SUBTASK_GUIDES[subTaskId];
  if (guide) return guide;
  return {
    hint: "Open the guided walkthrough for step-by-step help.",
    howToSteps: ["Click Guided walkthrough on this module.", "Work through steps one at a time.", "Mark done when complete."],
    walkthroughHref: `/app/tasks/${moduleId}`,
  };
}
