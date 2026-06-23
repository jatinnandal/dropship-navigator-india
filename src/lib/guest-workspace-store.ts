import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateVisitorId, getVisitorId } from "@/lib/visitor-store";
import { emptyWorkspace, parseWorkspace, type Workspace } from "@/lib/workspace";

type GuestWorkspaceRow = {
  data: Workspace;
};

export async function getGuestWorkspace(): Promise<Workspace | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const visitorId = await getVisitorId();
  if (!visitorId) return null;

  const { data } = await supabase
    .from("guest_workspace")
    .select("data")
    .eq("visitor_id", visitorId)
    .maybeSingle<GuestWorkspaceRow>();

  if (!data?.data) return null;
  return parseWorkspace(JSON.stringify(data.data));
}

export async function upsertGuestWorkspace(workspace: Workspace) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const visitorId = await getOrCreateVisitorId();
  await supabase.from("guest_workspace").upsert({
    visitor_id: visitorId,
    data: workspace,
    updated_at: new Date().toISOString(),
  });
}

export async function patchGuestWorkspace(patch: Partial<Workspace>): Promise<Workspace> {
  const current = (await getGuestWorkspace()) ?? { ...emptyWorkspace };
  const next: Workspace = { ...current, ...patch };
  await upsertGuestWorkspace(next);
  return next;
}
