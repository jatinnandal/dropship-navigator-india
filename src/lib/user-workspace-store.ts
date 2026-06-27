import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emptyWorkspace, parseWorkspace, type Workspace } from "@/lib/workspace";

type UserWorkspaceRow = {
  data: Workspace;
};

export async function getUserWorkspace(userId: string): Promise<Workspace | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("user_workspace")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle<UserWorkspaceRow>();

  if (!data?.data) return null;
  return parseWorkspace(JSON.stringify(data.data));
}

export async function upsertUserWorkspace(userId: string, workspace: Workspace) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  await supabase.from("user_workspace").upsert({
    user_id: userId,
    data: workspace,
    updated_at: new Date().toISOString(),
  });
}

export async function patchUserWorkspace(userId: string, patch: Partial<Workspace>): Promise<Workspace> {
  const current = (await getUserWorkspace(userId)) ?? { ...emptyWorkspace };
  const next: Workspace = { ...current, ...patch };
  await upsertUserWorkspace(userId, next);
  return next;
}
