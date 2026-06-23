import { notFound } from "next/navigation";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getTaskState } from "@/lib/task-progress-store";
import { resolveTaskId } from "@/lib/tasks";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { TaskRunner } from "./runner";

type Props = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskPage({ params }: Props) {
  const { taskId } = await params;

  if (!resolveTaskId(taskId)) {
    notFound();
  }

  const profile = await getStoredProfileForCurrentVisitor();
  const state = await getTaskState(taskId);
  const workspace = await getWorkspaceForCurrentVisitor();

  return (
    <TaskRunner
      taskId={taskId}
      profile={profile}
      initialCompleted={state.completed}
      initialAnswers={state.answers}
      initialWorkspace={workspace}
    />
  );
}
