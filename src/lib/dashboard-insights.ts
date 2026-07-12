import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import { CHANNEL_LABELS } from "@/lib/profile-name";

export type InsightAccent = "info" | "safe" | "warn" | "neutral";

export type DashboardInsight = {
  id: string;
  label: string;
  value: string;
  consequence: string;
  accent: InsightAccent;
  /** When set, the tile animates this number with CountUp instead of plain value text */
  countUp?: number;
  countUpSuffix?: string;
};

function channelConsequence(channel: PrimaryChannel, hasGstin: boolean): string {
  switch (channel) {
    case "meesho":
      return hasGstin
        ? "Zero-commission path - scale listings while keeping GST filings current."
        : "Easy to start here - but Amazon/Flipkart will block you until GSTIN is active.";
    case "amazon":
      return hasGstin
        ? "Strict dispatch SLA from day one - one bad week can suspend the account."
        : "Seller approval blocked until GSTIN is verified. Register before applying.";
    case "flipkart":
      return hasGstin
        ? "Flipkart onboarding needs brand + GST docs - keep dispatch rate above 90%."
        : "Account approval stalls without GSTIN - most rejections happen at verification.";
    case "shopify":
      return hasGstin
        ? "Own store = full margin control - payment gateway still needs business proof."
        : "Razorpay/PayU needs GST or business registration before you can collect payments.";
    default:
      return "Your channel choice shapes compliance order and ad timing.";
  }
}

function modulesConsequence(completed: number, total: number): string {
  if (total === 0) return "Complete setup to generate your launch plan.";
  if (completed === 0) {
    return "First sub-task unlocks the rest - most sellers quit before this step.";
  }
  if (completed >= total) {
    return "All modules done - refine listings, ads, and settlement tracking.";
  }
  const left = total - completed;
  return `${left} module${left === 1 ? "" : "s"} left - focus on the next action above, not everything at once.`;
}

export function buildDashboardInsights(input: {
  profile: OnboardingProfile;
  hasGstin: boolean;
  modulesCompleted: number;
  modulesTotal: number;
}): DashboardInsight[] {
  const { profile, hasGstin, modulesCompleted, modulesTotal } = input;
  const channel = profile.primaryChannel;

  return [
    {
      id: "channel",
      label: "Launch channel",
      value: CHANNEL_LABELS[channel],
      consequence: channelConsequence(channel, hasGstin),
      accent: "info",
    },
    {
      id: "gst",
      label: "GST readiness",
      value: hasGstin ? "Active" : "Not registered",
      consequence: hasGstin
        ? "Marketplace onboarding unblocked - missing GSTR filings still suspend your GSTIN."
        : "Amazon & Flipkart listing blocked until active. Meesho may work short-term - don't scale blind.",
      accent: hasGstin ? "safe" : "warn",
    },
    {
      id: "progress",
      label: "Journey progress",
      value:
        modulesTotal > 0 ? `${modulesCompleted} of ${modulesTotal} modules` : "Not started",
      countUp: modulesTotal > 0 ? modulesCompleted : undefined,
      countUpSuffix: modulesTotal > 0 ? ` of ${modulesTotal} modules` : undefined,
      consequence: modulesConsequence(modulesCompleted, modulesTotal),
      accent: modulesCompleted > 0 ? "safe" : "neutral",
    },
  ];
}
