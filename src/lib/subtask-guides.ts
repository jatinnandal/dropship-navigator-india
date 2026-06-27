import type { OnboardingProfile } from "@/lib/mvp-data";
import type { TaskModuleId } from "@/lib/tasks";

export type SubTaskGuide = {
  hint: string;
  why: string;
  howToSteps: string[];
  walkthroughHref: string;
};

export const SUBTASK_TIME_ESTIMATES: Record<string, string> = {
  "docs-folder-ready": "~30 mins",
  "gstin-active": "~2–5 days",
  "bank-matched": "~15 mins",
  "gst-filing-understood": "~15 mins",
  "product-shortlist": "~45 mins",
  "samples-ordered": "~3–5 days",
  "hsn-mapped": "~20 mins",
  "category-certs": "~1–7 days",
  "supplier-vetted": "~2–3 days",
  "backup-supplier": "~1 day",
  "domestic-supplier-confirmed": "~15 mins",
  "seller-account-live": "~3–7 days",
  "first-listing-live": "~1–2 days",
  "store-linked": "~30 mins",
  "cod-practice-done": "~15 mins",
  "first-payout-received": "~7–14 days",
  "breakeven-roas-known": "~20 mins",
  "first-ad-test": "~1 day",
  "pnl-sheet-ready": "~30 mins",
  "settlement-reconcile": "~45 mins",
  "appeal-pack-ready": "~20 mins",
  "gstr8-reviewed": "~30 mins",
};

export const SUBTASK_GUIDES: Record<string, SubTaskGuide> = {
  "docs-folder-ready": {
    hint: "One Google Drive or local folder with PAN, Aadhaar, bank proof.",
    why: "Marketplaces ask for the same documents repeatedly — one folder saves hours of hunting during KYC.",
    howToSteps: [
      "Create a folder named after your business.",
      "Add PAN card, Aadhaar, cancelled cheque, and address proof scans.",
      "Keep originals ready for marketplace KYC uploads.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "gstin-active": {
    hint: "15-digit GSTIN from gst.gov.in — or start registration.",
    why: "Amazon and Flipkart reject listings without GSTIN — registration takes 3–5 working days, so start now.",
    howToSteps: [
      "Open the documentation walkthrough GST track.",
      "Register or validate your GSTIN and save it to workspace.",
      "Wait 24–72h after new registration before marketplace verification.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "bank-matched": {
    hint: "Bank holder name must match GST legal name exactly.",
    why: "A single character mismatch between bank name and GST legal name is the #1 marketplace payout rejection.",
    howToSteps: [
      "Copy legal name from GST certificate.",
      "Compare character-for-character with bank account name.",
      "Fix mismatch before marketplace onboarding.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "gst-filing-understood": {
    hint: "GSTR-1 + GSTR-3B due monthly or quarterly (QRMP).",
    why: "Missed GST filings suspend your GSTIN — and marketplaces block suspended GSTINs within days.",
    howToSteps: [
      "Read the GST filing calendar step in documentation.",
      "Set calendar reminders for GSTR-1 and GSTR-3B due dates.",
      "Use ClearTax or a CA if filing feels overwhelming.",
    ],
    walkthroughHref: "/app/tasks/common-documentation",
  },
  "product-shortlist": {
    hint: "3 SKUs that pass the margin calculator.",
    why: "Don't fall in love with a product before the margin calculator says yes — 15%+ net margin is the survival gate.",
    howToSteps: [
      "Run demand check on your target marketplace.",
      "Use the margin calculator — target 15%+ net margin.",
      "Save 3 product names in the product-selection walkthrough.",
    ],
    walkthroughHref: "/app/tasks/product-selection",
  },
  "samples-ordered": {
    hint: "Order 1 sample per shortlisted SKU before listing.",
    why: "₹200 on a sample saves you from a ₹20,000 inventory mistake — catalogue photos lie.",
    howToSteps: [
      "Order from your top supplier candidate.",
      "Do a drop test and check dispatch time.",
      "Only list products where sample quality passes.",
    ],
    walkthroughHref: "/app/tasks/product-selection",
  },
  "hsn-mapped": {
    hint: "Each SKU needs correct HSN + GST rate.",
    why: "Wrong HSN triggers listing suppression and GST notices — fix at listing time, not after sales start.",
    howToSteps: [
      "Look up HSN on cbic-gst.gov.in for each product.",
      "Create a one-page HSN mapping sheet.",
      "Enter codes in marketplace tax settings.",
    ],
    walkthroughHref: "/app/tasks/compliance-by-product",
  },
  "category-certs": {
    hint: "FSSAI, BIS, or category approval if required.",
    why: "Gated categories block listings until certificates are approved — allow 3–7 days before you can go live.",
    howToSteps: [
      "Check if your category is gated on your marketplace.",
      "Upload required certificates during category application.",
      "Allow 3–7 days for approval before listing.",
    ],
    walkthroughHref: "/app/tasks/compliance-by-product",
  },
  "supplier-vetted": {
    hint: "Verified manufacturer + written terms.",
    why: "Your supplier IS your business — one bad batch becomes your negative reviews and account suspension.",
    howToSteps: [
      "Complete the sourcing swipe game and red-flag screener.",
      "Order samples and confirm dispatch SLA in writing.",
      "Save supplier name in the walkthrough.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "backup-supplier": {
    hint: "Second supplier for your top SKU.",
    why: "Single-source dependency is how sellers go from 50 orders/day to zero overnight when stock runs out.",
    howToSteps: [
      "Identify one alternative on IndiaMART or TradeIndia.",
      "Order one sample from backup supplier.",
      "Keep contact and pricing on file.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "domestic-supplier-confirmed": {
    hint: "Complete sourcing swipe — no AliExpress/CJ.",
    why: "Cross-border suppliers mean 2–3 week delivery — near 100% RTO on COD in India.",
    howToSteps: [
      "Play the sourcing origin swipe game.",
      "Confirm supplier ships within 3–5 days in India.",
      "Reject cross-border suppliers for COD.",
    ],
    walkthroughHref: "/app/tasks/supplier-sourcing",
  },
  "seller-account-live": {
    hint: "Marketplace KYC approved, not pending.",
    why: "KYC rejection from name mismatch costs weeks — get approval before investing in listings or ads.",
    howToSteps: [
      "Complete channel onboarding in the walkthrough.",
      "Upload GST, PAN, bank, address proof.",
      "Wait for approval email before listing.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "first-listing-live": {
    hint: "One hero listing published and visible — test before you expand.",
    why: "One listing lets you learn onboarding, dispatch, and COD without multiplying mistakes across a catalog.",
    howToSteps: [
      "Pick your single best SKU from the shortlist — the one with the strongest margin.",
      "Create one listing with white-bg images, size chart, and correct HSN.",
      "Get 5–10 real orders on that SKU before adding a second listing.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "store-linked": {
    hint: "Payout bank linked and verified.",
    why: "Sales without a verified payout account mean revenue stuck in marketplace limbo.",
    howToSteps: [
      "Link bank account matching GST legal name.",
      "Complete payout verification in seller panel.",
      "Check settlement settings are active.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "cod-practice-done": {
    hint: "Complete NDR/COD confirmation simulator.",
    why: "One unconfirmed COD order costs 2× shipping — practice the script before your first real order.",
    howToSteps: [
      "Open channel-launch or ads walkthrough.",
      "Complete the NDR practice scenarios.",
      "Copy WhatsApp confirmation template.",
    ],
    walkthroughHref: "/app/tasks/channel-launch",
  },
  "first-payout-received": {
    hint: "First settlement hit your bank account.",
    why: "Dashboard revenue ≠ bank deposit — confirming your first payout proves the money flow is real.",
    howToSteps: [
      "Download settlement report from marketplace.",
      "Compare expected vs actual bank deposit.",
      "Raise ticket if mismatch > ₹100.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "breakeven-roas-known": {
    hint: "Know your break-even ROAS before spending.",
    why: "Ads amplify what's already working — if unit economics are red, ads make you lose faster.",
    howToSteps: [
      "Run margin calculator in product-selection.",
      "Open ads walkthrough for break-even ROAS step.",
      "Save result — only scale above break-even.",
    ],
    walkthroughHref: "/app/tasks/ads-growth",
  },
  "first-ad-test": {
    hint: "One campaign at ₹300–500/day for 7 days.",
    why: "Judging ads before 7 days leads to killing winners early — give data time to stabilize.",
    howToSteps: [
      "Start with one product, one ad set.",
      "Run 7 days before judging performance.",
      "Pause if ROAS below break-even.",
    ],
    walkthroughHref: "/app/tasks/ads-growth",
  },
  "pnl-sheet-ready": {
    hint: "Weekly SKU-level profit spreadsheet.",
    why: "Aggregate revenue hides losing SKUs — weekly P&L catches silent bleed before month-end.",
    howToSteps: [
      "Create columns: SKU, revenue, costs, ad spend, net profit.",
      "Update every Monday from settlement reports.",
      "Flag SKUs below 10% margin.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "settlement-reconcile": {
    hint: "Compare settlement report vs bank deposit.",
    why: "Marketplaces short-pay 2–5% silently — reconciliation is how you catch it.",
    howToSteps: [
      "Download weekly settlement from marketplace.",
      "Match orders, fees, TCS, returns line by line.",
      "Ticket any discrepancy with order IDs.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "appeal-pack-ready": {
    hint: "Folder with GST, bank proof, return policy.",
    why: "When account is suspended, speed matters — having docs ready cuts resolution from weeks to days.",
    howToSteps: [
      "Assemble GST cert, PAN, bank proof, return policy screenshot.",
      "Add sample invoices and settlement reports.",
      "Copy appeal letter template from walkthrough.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
  "gstr8-reviewed": {
    hint: "Match operator TCS to GSTR-2A monthly.",
    why: "Ignoring TCS mismatches means you overpay tax by 1% on every sale — silent margin bleed.",
    howToSteps: [
      "Download TCS report from marketplace.",
      "Check GSTR-2A on GST portal for credits.",
      "Claim in GSTR-3B filing.",
    ],
    walkthroughHref: "/app/tasks/tracking-analytics",
  },
};

const UNLOCK_WHY: Partial<Record<string, string>> = {
  "first-listing-live":
    "Ads need live listings — complete this before spending on traffic or you'll burn budget on nothing.",
};

export function personalizeSubTaskWhy(
  subTaskId: string,
  why: string,
  profile: OnboardingProfile,
): string {
  if (subTaskId === "product-shortlist" && profile.productType === "fashion") {
    return `${why} Fashion on COD often sees 35% RTO — run the calculator with realistic defaults.`;
  }
  if (subTaskId === "seller-account-live" && profile.primaryChannel === "meesho") {
    return `${why} Meesho rejects instantly if your mobile was used on another seller account.`;
  }
  return why;
}

export function getSubTaskGuide(subTaskId: string, moduleId: TaskModuleId): SubTaskGuide {
  const guide = SUBTASK_GUIDES[subTaskId];
  if (guide) return guide;
  return {
    hint: "Open the guided walkthrough for step-by-step help.",
    why: "This step unlocks the next part of your launch — one action at a time.",
    howToSteps: [
      "Click Guided walkthrough on this module.",
      "Work through steps one at a time.",
      "Mark done when complete.",
    ],
    walkthroughHref: `/app/tasks/${moduleId}`,
  };
}

export function getUnlockWhy(subTaskId: string, blockLabel: string): string {
  return (
    UNLOCK_WHY[subTaskId] ??
    `You can't proceed until "${blockLabel}" is done — skipping this causes rejections or rework later.`
  );
}

export function countSubTasksStarted(subTasks?: Record<string, boolean>): number {
  if (!subTasks) return 0;
  return Object.values(subTasks).filter(Boolean).length;
}
