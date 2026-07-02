import { getStoredActiveProfileId } from "@/lib/active-profile";
import { isLegacyProfileId } from "@/lib/seller-profile-store";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { parseTaskStateRow, type TaskState } from "@/lib/tasks/types";

type UserTaskProgressRow = {
  completed: string[];
  answers: Record<string, string>;
};

export async function getUserTaskState(
  userId: string,
  taskId: string,
  profileId?: string,
): Promise<TaskState | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return null;

  const { data, error } = await supabase
    .from("user_task_progress")
    .select("completed,answers")
    .eq("profile_id", resolvedProfileId)
    .eq("task_id", taskId)
    .maybeSingle<UserTaskProgressRow>();

  if (!error && data) return parseTaskStateRow(data);

  if (isLegacyProfileId(resolvedProfileId)) {
    const legacy = await supabase
      .from("user_task_progress")
      .select("completed,answers")
      .eq("user_id", userId)
      .eq("task_id", taskId)
      .maybeSingle<UserTaskProgressRow>();

    if (!legacy.data) return null;
    return parseTaskStateRow(legacy.data);
  }

  return null;
}

export async function setUserTaskState(
  userId: string,
  taskId: string,
  state: TaskState,
  profileId?: string,
) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return;

  const row = {
    profile_id: resolvedProfileId,
    task_id: taskId,
    completed: state.completed,
    answers: state.answers,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("user_task_progress").upsert(row);

  if (error) {
    await supabase.from("user_task_progress").upsert({
      user_id: userId,
      task_id: taskId,
      completed: state.completed,
      answers: state.answers,
      updated_at: new Date().toISOString(),
    });
  }
}
