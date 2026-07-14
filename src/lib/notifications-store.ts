import { buildNotifications, type AppNotification } from "@/lib/notifications";
import {
  getActiveSellerProfileForCurrentVisitor,
  getStoredProfileForCurrentVisitor,
} from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { listUploads } from "@/lib/settlement-recon-store";
import { getCurrentEntitlements } from "@/lib/plan";

/**
 * Resolve every signal source and compute the current visitor's live
 * notifications. Shared by the app layout (badge count) and the notifications
 * page (full list) so the two never disagree.
 */
export async function getVisitorNotifications(): Promise<AppNotification[]> {
  const [profile, workspace, activeProfile, entitlements] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
    getCurrentEntitlements(),
  ]);

  const latestUpload = activeProfile ? (await listUploads(activeProfile.id))[0] : undefined;
  const hasGstin = profile.hasGstin || Boolean(workspace.gstin);

  return buildNotifications({
    profile,
    workspace,
    hasGstin,
    latestSettlementUploadAt: latestUpload?.uploadedAt ?? null,
    rateAlertsEntitled: entitlements.rateAlerts,
  });
}
