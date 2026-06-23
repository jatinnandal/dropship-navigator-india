import { getGuestWorkspace, patchGuestWorkspace, upsertGuestWorkspace } from "@/lib/guest-workspace-store";
import {
  emptyWorkspace,
  getLocalWorkspace,
  patchLocalWorkspace,
  saveLocalWorkspace,
} from "@/lib/local-workspace-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Workspace } from "@/lib/workspace";

export async function getWorkspaceForCurrentVisitor(): Promise<Workspace> {
  if (isSupabaseConfigured()) {
    const guest = await getGuestWorkspace();
    if (guest) return guest;
  }
  return getLocalWorkspace();
}

export async function saveWorkspaceForCurrentVisitor(workspace: Workspace) {
  await saveLocalWorkspace(workspace);
  if (isSupabaseConfigured()) {
    await upsertGuestWorkspace(workspace);
  }
}

export async function patchWorkspaceForCurrentVisitor(patch: Partial<Workspace>): Promise<Workspace> {
  const local = await patchLocalWorkspace(patch);
  if (isSupabaseConfigured()) {
    return patchGuestWorkspace(local);
  }
  return local;
}

export { emptyWorkspace };
