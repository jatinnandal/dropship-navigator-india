"use server";

import { revalidatePath } from "next/cache";
import {
  getWorkspaceForCurrentVisitor,
  patchWorkspaceForCurrentVisitor,
} from "@/lib/workspace-store";
import { getVisitorNotifications } from "@/lib/notifications-store";

/** Mark one notification read (reuses the dismissedWarnings 7-day snooze store). */
export async function dismissNotification(id: string): Promise<void> {
  if (!id) return;
  const workspace = await getWorkspaceForCurrentVisitor();
  const dismissedWarnings = { ...(workspace.dismissedWarnings ?? {}), [id]: new Date().toISOString() };
  await patchWorkspaceForCurrentVisitor({ dismissedWarnings });
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}

/** Mark every currently-showing notification read at once. */
export async function markAllNotificationsRead(): Promise<void> {
  const [workspace, notifications] = await Promise.all([
    getWorkspaceForCurrentVisitor(),
    getVisitorNotifications(),
  ]);
  if (notifications.length === 0) return;
  const now = new Date().toISOString();
  const dismissedWarnings = { ...(workspace.dismissedWarnings ?? {}) };
  for (const n of notifications) dismissedWarnings[n.id] = now;
  await patchWorkspaceForCurrentVisitor({ dismissedWarnings });
  revalidatePath("/app/notifications");
  revalidatePath("/app");
}
