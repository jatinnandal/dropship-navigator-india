import { buildCrisisWarnings, type CrisisDetectorInput } from "@/lib/crisis/detectors";
import { computeRatesImpact } from "@/lib/rates-impact";
import { CURRENT_RATES } from "@/data/rates";

/**
 * In-app notifications are DERIVED from current profile/workspace state each
 * request - not a stored event log. "Read" state reuses workspace.dismissedWarnings
 * (a dismiss snoozes for 7 days), so buildCrisisWarnings already returns only the
 * unread, still-relevant signals. We just add the rate-card change on top.
 */
export type AppNotification = {
  id: string;
  severity: "critical" | "high" | "medium";
  title: string;
  message: string;
  href: string;
  ctaLabel: string;
};

export type NotificationInput = CrisisDetectorInput & {
  /** Rate-change alerts are a Growth entitlement. */
  rateAlertsEntitled: boolean;
};

export function rateChangeNotificationId(): string {
  return `rate-change-${CURRENT_RATES.meta.version}`;
}

export function buildNotifications(input: NotificationInput): AppNotification[] {
  const list: AppNotification[] = buildCrisisWarnings(input).map((w) => ({
    id: w.id,
    severity: w.severity,
    title: w.title,
    message: w.message,
    href: w.href,
    ctaLabel: w.ctaLabel,
  }));

  // Rate-card change: only for Growth, only while the new version is unseen and
  // undismissed, and only when the user has saved numbers so the impact is real.
  const rateId = rateChangeNotificationId();
  const dismissed = input.workspace.dismissedWarnings?.[rateId];
  if (
    input.rateAlertsEntitled &&
    input.workspace.seenRatesVersion !== CURRENT_RATES.meta.version &&
    !dismissed
  ) {
    const impact = computeRatesImpact({ profile: input.profile, workspace: input.workspace });
    if (impact) {
      const dir = impact.deltaPoints >= 0 ? "up" : "down";
      const abs = Math.abs(impact.deltaPoints).toFixed(1);
      list.push({
        id: rateId,
        severity: "medium",
        title: "Marketplace rates updated",
        message: `The ${CURRENT_RATES.meta.version} rate card moved your saved margin ${dir} by ${abs} points. Re-check your numbers before your next order.`,
        href: "/app/tools/margin-calculator",
        ctaLabel: "See the impact",
      });
    }
  }

  const order = { critical: 0, high: 1, medium: 2 } as const;
  return list.sort((a, b) => order[a.severity] - order[b.severity]);
}
