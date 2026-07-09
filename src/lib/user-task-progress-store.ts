import { getStoredActiveProfileId } from "@/lib/active-profile";
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

  // Fall back to the user_id-keyed row for ANY profile id: databases where
  // migration 002's column swap didn't complete still key rows by user_id
  // (writes land there via the upsert fallback below).
  const legacy = await supabase
    .from("user_task_progress")
    .select("completed,answers")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .maybeSingle<UserTaskProgressRow>();

  if (!legacy.data) return null;
  return parseTaskStateRow(legacy.data);
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

  const updatedAt = new Date().toISOString();
  const base = {
    task_id: taskId,
    completed: state.completed,
    answers: state.answers,
    updated_at: updatedAt,
  };

  // Post-migration schema: (profile_id, task_id) is the primary key.
  const { error } = await supabase
    .from("user_task_progress")
    .upsert({ profile_id: resolvedProfileId, ...base });

  if (error) {
    // Pre-migration schema: (user_id, task_id) is the primary key. Write both
    // ids so the row stays linkable either way.
    const withBoth = await supabase
      .from("user_task_progress")
      .upsert({ user_id: userId, profile_id: resolvedProfileId, ...base });

    if (withBoth.error) {
      await supabase.from("user_task_progress").upsert({ user_id: userId, ...base });
    }
  }
}
