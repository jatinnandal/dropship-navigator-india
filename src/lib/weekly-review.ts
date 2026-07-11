import { getUpcomingGstEvents, type GstEvent } from "@/lib/gst-calendar-data";
import type { JourneyNodeStatus } from "@/lib/journey-graph";
import { getModuleMentorLine } from "@/lib/mentor-voice";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { calculateProfit, defaultRtoForProductType } from "@/lib/profit-math";
import type { TaskModuleId } from "@/lib/tasks";
import type { Workspace } from "@/lib/workspace";

export type WeeklyUnitEconomics = {
  sellingPrice: number;
  netProfitPerOrder: number;
  netMarginPercent: number;
  breakEvenRoas: number;
  rtoRatePercent: number;
  verdict: "excellent" | "healthy" | "tight" | "loss";
  /** Weekly profit at reference volumes (orders/week → ₹). */
  projections: { orders: number; weeklyProfit: number }[];
};

export type WeeklyReconSnapshot = {
  uploadedAt: string;
  totalDelta: number;
  flaggedCount: number;
  tcsEstimate: number;
};

export type WeeklyReview = {
  weekLabel: string;
  unit: WeeklyUnitEconomics | null;
  recon: WeeklyReconSnapshot | null;
  gstEvents: GstEvent[];
  mentorLine: string;
  progress: { completedSubTasks: number; totalSubTasks: number };
};

const REFERENCE_VOLUMES = [10, 30, 70];

export function buildWeeklyReview(input: {
  profile: OnboardingProfile;
  workspace: Workspace;
  hasGstin: boolean;
  currentModuleId: TaskModuleId;
  moduleStatus: JourneyNodeStatus;
  progress: { completedSubTasks: number; totalSubTasks: number };
  recon?: WeeklyReconSnapshot | null;
  now?: Date;
}): WeeklyReview {
  const { profile, workspace, hasGstin, recon = null, now = new Date() } = input;

  let unit: WeeklyUnitEconomics | null = null;
  if (workspace.targetSellingPrice && workspace.productCost !== undefined) {
    const rto = workspace.estimatedRtoRate ?? defaultRtoForProductType(profile.productType);
    const p = calculateProfit({
      sellingPrice: workspace.targetSellingPrice,
      productCost: workspace.productCost,
      shippingCost: workspace.shippingCost ?? 70,
      adCostPerOrder: 0,
      rtoRatePercent: rto,
      channel: profile.primaryChannel,
      category: profile.productType,
      isCod: true,
    });
    unit = {
      sellingPrice: p.revenue,
      netProfitPerOrder: p.netProfit,
      netMarginPercent: p.netMarginPercent,
      breakEvenRoas: p.breakEvenRoas,
      rtoRatePercent: rto,
      verdict: p.verdict,
      projections: REFERENCE_VOLUMES.map((orders) => ({
        orders,
        weeklyProfit: p.netProfit * orders,
      })),
    };
  }

  // Next two relevant GST deadlines. New sellers without GSTIN have none —
  // the card says so instead of showing an empty list.
  const gstEvents = hasGstin ? getUpcomingGstEvents(false).filter((e) => e.daysUntilDue >= 0).slice(0, 2) : [];

  return {
    weekLabel: formatWeekLabel(now),
    unit,
    recon,
    gstEvents,
    mentorLine: getModuleMentorLine(input.currentModuleId, profile, input.moduleStatus, hasGstin),
    progress: input.progress,
  };
}

function formatWeekLabel(now: Date): string {
  // Monday-anchored week containing `now`.
  const day = now.getDay(); // 0 Sun … 6 Sat
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
  return `Week of ${fmt.format(monday)} – ${fmt.format(sunday)}`;
}
