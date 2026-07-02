import { notFound } from "next/navigation";
import { getActiveSellerProfileForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getEditProfileHref } from "@/lib/profile-name";
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

  const [profile, state, workspace, activeSellerProfile] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getTaskState(taskId),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);

  const editProfileHref = activeSellerProfile
    ? getEditProfileHref(activeSellerProfile.id, `/app/tasks/${taskId}`)
    : "/onboarding";

  return (
    <TaskRunner
      taskId={taskId}
      profile={profile}
      initialCompleted={state.completed}
      initialAnswers={state.answers}
      initialWorkspace={workspace}
      editProfileHref={editProfileHref}
    />
  );
}
