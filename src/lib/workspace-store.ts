import { getCurrentUserId } from "@/lib/current-user";
import { getUserWorkspace, patchUserWorkspace, upsertUserWorkspace } from "@/lib/user-workspace-store";
import { emptyWorkspace, type Workspace } from "@/lib/workspace";

export async function getWorkspaceForCurrentVisitor(): Promise<Workspace> {
  const userId = await getCurrentUserId();
  const workspace = await getUserWorkspace(userId);
  return workspace ?? { ...emptyWorkspace };
}

export async function saveWorkspaceForCurrentVisitor(workspace: Workspace) {
  const userId = await getCurrentUserId();
  await upsertUserWorkspace(userId, workspace);
}

export async function patchWorkspaceForCurrentVisitor(patch: Partial<Workspace>): Promise<Workspace> {
  const userId = await getCurrentUserId();
  return patchUserWorkspace(userId, patch);
}

export { emptyWorkspace };
