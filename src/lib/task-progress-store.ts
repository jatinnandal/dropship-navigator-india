import { cookies } from "next/headers";
import { getGuestTaskState, setGuestTaskState } from "@/lib/guest-task-progress-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { TaskState } from "@/lib/tasks/types";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
};

function cookieName(taskId: string): string {
  return `dsi_task_${taskId.replace(/[^a-z0-9_-]/gi, "")}`;
}

function parseState(raw: string | undefined): TaskState {
  const empty: TaskState = { completed: [], answers: {} };
  if (!raw) return empty;
  try {
    const parsed = JSON.parse(raw) as Partial<TaskState>;
    const completed = Array.isArray(parsed.completed)
      ? parsed.completed.filter((item): item is string => typeof item === "string" && item.length > 0)
      : [];
    const answers: Record<string, string> = {};
    if (parsed.answers && typeof parsed.answers === "object") {
      for (const [key, value] of Object.entries(parsed.answers)) {
        if (typeof value === "string") answers[key] = value;
      }
    }
    return { completed, answers };
  } catch {
    return empty;
  }
}

export async function getTaskState(taskId: string): Promise<TaskState> {
  if (isSupabaseConfigured()) {
    const guest = await getGuestTaskState(taskId);
    if (guest && (guest.completed.length > 0 || Object.keys(guest.answers).length > 0)) {
      return guest;
    }
  }
  const store = await cookies();
  return parseState(store.get(cookieName(taskId))?.value);
}

export async function setTaskState(taskId: string, state: TaskState) {
  const store = await cookies();
  store.set(cookieName(taskId), JSON.stringify(state), COOKIE_OPTIONS);
  if (isSupabaseConfigured()) {
    await setGuestTaskState(taskId, state);
  }
}
