import { getCurrentUserId } from "@/lib/current-user";
import { getUserTaskState, setUserTaskState } from "@/lib/user-task-progress-store";
import type { TaskState } from "@/lib/tasks/types";

const emptyState: TaskState = { completed: [], answers: {} };

export async function getTaskState(taskId: string): Promise<TaskState> {
  const userId = await getCurrentUserId();
  const state = await getUserTaskState(userId, taskId);
  return state ?? emptyState;
}

export async function setTaskState(taskId: string, state: TaskState) {
  const userId = await getCurrentUserId();
  await setUserTaskState(userId, taskId, state);
}
