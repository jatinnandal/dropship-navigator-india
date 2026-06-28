import { buildCrisisWarnings, type CrisisDetectorInput } from "@/lib/crisis/detectors";
import type { DashboardBanner } from "@/lib/crisis/types";

export function getGstFilingBanner(input: {
  hasGstin: boolean;
  subTasks?: Record<string, boolean>;
}): DashboardBanner | null {
  if (!input.hasGstin) return null;
  if (input.subTasks?.["gst-filing-understood"]) return null;
  return {
    id: "gst-filing",
    severity: "deadline",
    message:
      "GST FILING DUE — GSTR-1 and GSTR-3B are monthly or quarterly obligations. Missing filings suspends your GSTIN and blocks marketplaces.",
    href: "/app/tasks/common-documentation",
    ctaLabel: "View GST filing calendar",
    variant: "deadline",
  };
}

const SEVERITY_RANK: Record<string, number> = {
  critical: 0,
  deadline: 1,
  high: 2,
  medium: 3,
};

export function getDashboardBanners(input: CrisisDetectorInput): DashboardBanner[] {
  const banners: DashboardBanner[] = [];

  for (const warning of buildCrisisWarnings(input)) {
    banners.push({
      id: warning.id,
      severity: warning.severity,
      message: `${warning.title} — ${warning.message}`,
      href: warning.href,
      ctaLabel: warning.ctaLabel,
      variant: "at-risk",
    });
  }

  const gst = getGstFilingBanner({ hasGstin: input.hasGstin, subTasks: input.workspace.subTasks });
  if (gst) banners.push(gst);

  return banners
    .sort((a, b) => (SEVERITY_RANK[a.severity] ?? 9) - (SEVERITY_RANK[b.severity] ?? 9))
    .slice(0, 2);
}
