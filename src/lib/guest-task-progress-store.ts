import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateVisitorId, getVisitorId } from "@/lib/visitor-store";
import type { TaskState } from "@/lib/tasks/types";

type GuestTaskProgressRow = {
  completed: string[];
  answers: Record<string, string>;
};

function parseRow(row: GuestTaskProgressRow | null): TaskState {
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

export async function getGuestTaskState(taskId: string): Promise<TaskState | null> {
  const supabase = await createSupabaseServerClient();
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
  return parseRow(data);
}

export async function setGuestTaskState(taskId: string, state: TaskState) {
  const supabase = await createSupabaseServerClient();
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
