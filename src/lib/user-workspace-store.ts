import { getStoredActiveProfileId } from "@/lib/active-profile";
import { isLegacyProfileId } from "@/lib/seller-profile-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { emptyWorkspace, parseWorkspace, type Workspace } from "@/lib/workspace";

type UserWorkspaceRow = {
  data: Workspace;
};

export async function getUserWorkspace(userId: string, profileId?: string): Promise<Workspace | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return null;

  const { data, error } = await supabase
    .from("user_workspace")
    .select("data")
    .eq("profile_id", resolvedProfileId)
    .maybeSingle<UserWorkspaceRow>();

  if (!error && data?.data) {
    return parseWorkspace(data.data);
  }

  if (isLegacyProfileId(resolvedProfileId)) {
    const legacy = await supabase
      .from("user_workspace")
      .select("data")
      .eq("user_id", userId)
      .maybeSingle<UserWorkspaceRow>();

    if (legacy.data?.data) {
      return parseWorkspace(legacy.data.data);
    }
  }

  return null;
}

export async function upsertUserWorkspace(userId: string, workspace: Workspace, profileId?: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return;

  const row = {
    profile_id: resolvedProfileId,
    data: workspace,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_workspace").upsert(row);

  if (error) {
    await supabase.from("user_workspace").upsert({
      user_id: userId,
      data: workspace,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function patchUserWorkspace(
  userId: string,
  patch: Partial<Workspace>,
  profileId?: string,
): Promise<Workspace> {
  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  const current = (await getUserWorkspace(userId, resolvedProfileId ?? undefined)) ?? { ...emptyWorkspace };
  const next: Workspace = { ...current, ...patch };
  if (resolvedProfileId) {
    await upsertUserWorkspace(userId, next, resolvedProfileId);
  }
  return next;
}
