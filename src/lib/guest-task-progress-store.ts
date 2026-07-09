import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getOrCreateVisitorId, getVisitorId } from "@/lib/visitor-store";
import { parseTaskStateRow, type TaskState } from "@/lib/tasks/types";

type GuestTaskProgressRow = {
  completed: string[];
  answers: Record<string, string>;
};

export async function getGuestTaskState(taskId: string): Promise<TaskState | null> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return null;

  const visitorId = await getVisitorId();
  if (!visitorId) return null;

  const { data } = await supabase
    .from("guest_task_progress")
    .select("completed,answers")
    .eq("visitor_id", visitorId)
    .eq("task_id", taskId)
    .maybeSingle<GuestTaskProgressRow>();

  if (!data) return null;
  return parseTaskStateRow(data);
}

export async function setGuestTaskState(taskId: string, state: TaskState) {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return;

  const visitorId = await getOrCreateVisitorId();
  await supabase.from("guest_task_progress").upsert({
    visitor_id: visitorId,
    task_id: taskId,
    completed: state.completed,
    answers: state.answers,
    updated_at: new Date().toISOString(),
  });
}
