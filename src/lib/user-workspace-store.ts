import { getStoredActiveProfileId } from "@/lib/active-profile";
import { createSupabaseDataClient } from "@/lib/supabase/server";
import { emptyWorkspace, parseWorkspace, type Workspace } from "@/lib/workspace";

type UserWorkspaceRow = {
  data: Workspace;
};

export async function getUserWorkspace(userId: string, profileId?: string): Promise<Workspace | null> {
  const supabase = await createSupabaseDataClient();
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

  // Fall back to the user_id-keyed row for ANY profile id: databases where
  // migration 002's column swap didn't complete still key rows by user_id
  // (writes land there via the upsert fallback below).
  const legacy = await supabase
    .from("user_workspace")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle<UserWorkspaceRow>();

  if (legacy.data?.data) {
    return parseWorkspace(legacy.data.data);
  }

  return null;
}

export async function upsertUserWorkspace(userId: string, workspace: Workspace, profileId?: string) {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return;

  const updatedAt = new Date().toISOString();

  // Post-migration schema: profile_id is the primary key.
  const { error } = await supabase
    .from("user_workspace")
    .upsert({ profile_id: resolvedProfileId, data: workspace, updated_at: updatedAt });

  if (error) {
    // Pre-migration schema: user_id is the primary key (profile_id column may
    // or may not exist). Write both so the row stays linkable either way.
    const withBoth = await supabase.from("user_workspace").upsert({
      user_id: userId,
      profile_id: resolvedProfileId,
      data: workspace,
      updated_at: updatedAt,
    });

    if (withBoth.error) {
      await supabase.from("user_workspace").upsert({
        user_id: userId,
        data: workspace,
        updated_at: updatedAt,
      });
    }
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
