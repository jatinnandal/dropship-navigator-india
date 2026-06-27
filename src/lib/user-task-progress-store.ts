import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { TaskState } from "@/lib/tasks/types";

type UserTaskProgressRow = {
  completed: string[];
  answers: Record<string, string>;
};

function parseRow(row: UserTaskProgressRow | null): TaskState {
  if (!row) return { completed: [], answers: {} };
  const completed = Array.isArray(row.completed)
    ? row.completed.filter((item): item is string => typeof item === "string")
    : [];
  const answers: Record<string, string> = {};
  if (row.answers && typeof row.answers === "object") {
    for (const [key, value] of Object.entries(row.answers)) {
      if (typeof value === "string") answers[key] = value;
    }
  }
  return { completed, answers };
}

export async function getUserTaskState(userId: string, taskId: string): Promise<TaskState | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("user_task_progress")
    .select("completed,answers")
    .eq("user_id", userId)
    .eq("task_id", taskId)
    .maybeSingle<UserTaskProgressRow>();

  if (!data) return null;
  return parseRow(data);
}

export async function setUserTaskState(userId: string, taskId: string, state: TaskState) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return;

  await supabase.from("user_task_progress").upsert({
    user_id: userId,
    task_id: taskId,
    completed: state.completed,
    answers: state.answers,
    updated_at: new Date().toISOString(),
  });
}
