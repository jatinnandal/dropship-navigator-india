"use server";

import { revalidatePath } from "next/cache";
import {
  getWorkspaceForCurrentVisitor,
  patchWorkspaceForCurrentVisitor,
} from "@/lib/workspace-store";

/** Toggle a GST filing's done state, persisted to the account (cross-device). */
export async function setGstFilingDone(id: string, done: boolean): Promise<void> {
  if (!id) return;
  const workspace = await getWorkspaceForCurrentVisitor();
  const current = new Set(workspace.gstFilingsDone ?? []);
  if (done) current.add(id);
  else current.delete(id);
  await patchWorkspaceForCurrentVisitor({ gstFilingsDone: [...current] });
  // The GST deadline notification/crisis reads this, so refresh those surfaces.
  revalidatePath("/app");
  revalidatePath("/app/notifications");
  revalidatePath("/app/tools/gst-calendar");
}

/** Persist the user's chosen GST scheme so every surface uses the right dates. */
export async function setGstScheme(scheme: "regular" | "qrmp"): Promise<void> {
  await patchWorkspaceForCurrentVisitor({ gstScheme: scheme });
  revalidatePath("/app");
  revalidatePath("/app/notifications");
  revalidatePath("/app/tools/gst-calendar");
}
