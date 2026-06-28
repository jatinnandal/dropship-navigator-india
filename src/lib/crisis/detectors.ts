import type { OnboardingProfile } from "@/lib/mvp-data";
import { isSubTaskDone } from "@/lib/journey-graph";
import { calculateProfit, defaultRtoForProductType } from "@/lib/profit-math";
import type { CrisisWarning } from "@/lib/crisis/types";
import type { Workspace } from "@/lib/workspace";

const SNOOZE_MS = 7 * 24 * 60 * 60 * 1000;

export type CrisisDetectorInput = {
  profile: OnboardingProfile;
  workspace: Workspace;
  hasGstin: boolean;
};

function isDismissed(warningId: string, dismissed?: Record<string, string>): boolean {
  if (!dismissed?.[warningId]) return false;
  const dismissedAt = new Date(dismissed[warningId]).getTime();
  return Date.now() - dismissedAt < SNOOZE_MS;
}

function hasCalculatorSnapshot(workspace: Workspace): boolean {
  const snap = workspace.calculatorSnapshot;
  return Boolean(snap && Object.keys(snap).length > 0);
}

function estimateRtoLoss(profile: OnboardingProfile, workspace: Workspace, orders = 20): number {
  const rtoRate = workspace.estimatedRtoRate ?? defaultRtoForProductType(profile.productType);
  const sellingPrice = workspace.targetSellingPrice ?? 499;
  const productCost = workspace.productCost ?? 180;
  const shippingCost = workspace.shippingCost ?? 65;

  const unit = calculateProfit({
    sellingPrice,
    productCost,
    shippingCost,
    adCostPerOrder: 0,
    rtoRatePercent: rtoRate,
    channel: profile.primaryChannel,
  });

  const rtoOrders = Math.round(orders * (rtoRate / 100));
  const lossPerRto = unit.rtoLoss / Math.max(rtoRate / 100, 0.01);
  return Math.round(rtoOrders * Math.max(lossPerRto, 80));
}

export function detectRtoShock(input: CrisisDetectorInput): CrisisWarning | null {
  const { profile, workspace } = input;
  const subTasks = workspace.subTasks;

  if (!isSubTaskDone(subTasks, "first-listing-live")) return null;
  if (!isSubTaskDone(subTasks, "product-shortlist")) return null;
  if (hasCalculatorSnapshot(workspace)) return null;

  const loss = estimateRtoLoss(profile, workspace);

  return {
    id: "rto-shock",
    severity: "critical",
    title: "Live listing with no margin math saved",
    message: `You listed without running the margin calculator. RTO on your first 20 COD orders could cost you ₹${loss.toLocaleString("en-IN")}–₹${Math.round(loss * 1.5).toLocaleString("en-IN")}. Run the calculator before scaling.`,
    href: "/app/tasks/product-selection",
    ctaLabel: "Run margin calculator",
  };
}

export function detectNdrSpiral(input: CrisisDetectorInput): CrisisWarning | null {
  const { workspace } = input;
  const subTasks = workspace.subTasks;

  if (!isSubTaskDone(subTasks, "first-payout-received")) return null;
  if (isSubTaskDone(subTasks, "cod-practice-done")) return null;

  return {
    id: "ndr-spiral",
    severity: "high",
    title: "COD payouts without NDR practice",
    message:
      "You're receiving COD orders but haven't practiced NDR follow-up. At 25% RTO, each unhandled return costs you ~₹110 in round-trip shipping. Takes 15 minutes to learn.",
    href: "/app/tasks/channel-launch",
    ctaLabel: "Practice NDR calls",
  };
}

export function detectAdBurn(input: CrisisDetectorInput): CrisisWarning | null {
  const { workspace } = input;
  const subTasks = workspace.subTasks;

  const ranAds = isSubTaskDone(subTasks, "first-ad-test");
  const knowsRoas = isSubTaskDone(subTasks, "breakeven-roas-known");
  const hasSnapshot = hasCalculatorSnapshot(workspace);

  if (!ranAds && !(knowsRoas && !hasSnapshot)) return null;
  if (knowsRoas && hasSnapshot) return null;

  if (ranAds && !knowsRoas) {
    return {
      id: "ad-burn",
      severity: "high",
      title: "Ads running without break-even ROAS",
      message:
        "You started ad tests before calculating break-even ROAS. ₹500/day for 5 days at 0.4 ROAS burns ₹2,500 with no learning. Calculate your floor before spending more.",
      href: "/app/tasks/ads-growth",
      ctaLabel: "Calculate break-even ROAS",
    };
  }

  return {
    id: "ad-burn-guess",
    severity: "high",
    title: "Break-even ROAS not backed by calculator",
    message:
      "You marked ROAS as known but have no saved margin calculation. Guessing ROAS leads to turning off ads that could work — or scaling ads that lose money.",
    href: "/app/tasks/ads-growth",
    ctaLabel: "Run break-even calculator",
  };
}

export function detectSupplierOosPreventive(input: CrisisDetectorInput): CrisisWarning | null {
  const { workspace } = input;
  const subTasks = workspace.subTasks;

  if (!isSubTaskDone(subTasks, "first-listing-live")) return null;
  if (isSubTaskDone(subTasks, "backup-supplier")) return null;

  return {
    id: "supplier-oos-preventive",
    severity: "medium",
    title: "No backup supplier with live listings",
    message:
      "You have live listings but no backup supplier. When stock runs out, sellers freeze — pause listings, cancel orders, or lie to customers. All three hurt. Identify a backup now.",
    href: "/app/tasks/supplier-sourcing",
    ctaLabel: "Add backup supplier",
  };
}

export function detectGstTrap(input: CrisisDetectorInput): CrisisWarning | null {
  const { profile, workspace, hasGstin } = input;
  const subTasks = workspace.subTasks;

  if (hasGstin) return null;

  const listingLive =
    isSubTaskDone(subTasks, "seller-account-live") || isSubTaskDone(subTasks, "first-listing-live");

  if (!listingLive) return null;

  const onMeesho = profile.primaryChannel === "meesho";

  return {
    id: "gst-trap",
    severity: "high",
    title: onMeesho ? "Selling without GSTIN — Amazon will block you later" : "Selling without GSTIN",
    message: onMeesho
      ? "Meesho may let you start without GST, but Amazon and Flipkart require GSTIN for seller approval. Get 10–20 orders, then hit a wall when you try to expand. Register GST before scaling."
      : "You're live or approved on a marketplace without GSTIN saved. Most channels require it for full seller access and TCS reconciliation.",
    href: "/app/tasks/compliance-by-product",
    ctaLabel: "Start GST compliance",
  };
}

export function buildCrisisWarnings(input: CrisisDetectorInput): CrisisWarning[] {
  const dismissed = input.workspace.dismissedWarnings;
  const detectors = [
    detectRtoShock,
    detectNdrSpiral,
    detectAdBurn,
    detectGstTrap,
    detectSupplierOosPreventive,
  ];

  const warnings: CrisisWarning[] = [];
  for (const detect of detectors) {
    const warning = detect(input);
    if (warning && !isDismissed(warning.id, dismissed)) {
      warnings.push(warning);
    }
  }

  const severityOrder = { critical: 0, high: 1, medium: 2 };
  return warnings.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);
}

export function getNdrBanner(input: CrisisDetectorInput): { message: string; href: string } | null {
  const warning = detectNdrSpiral(input);
  if (!warning || isDismissed(warning.id, input.workspace.dismissedWarnings)) return null;
  return { message: warning.message, href: warning.href };
}
