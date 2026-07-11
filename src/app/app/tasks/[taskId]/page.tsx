import { notFound } from "next/navigation";
import { canUseJourneyModule } from "@/lib/entitlements";
import { getCurrentPlan } from "@/lib/plan";
import { getActiveSellerProfileForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getEditProfileHref } from "@/lib/profile-name";
import { getTaskState } from "@/lib/task-progress-store";
import { resolveTaskId } from "@/lib/tasks";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { UpgradePanel } from "@/components/plan/upgrade-panel";
import { TaskRunner } from "./runner";

type Props = {
  params: Promise<{ taskId: string }>;
};

export default async function TaskPage({ params }: Props) {
  const { taskId } = await params;

  if (!resolveTaskId(taskId)) {
    notFound();
  }

  const plan = await getCurrentPlan();
  if (!canUseJourneyModule(plan, taskId)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="eyebrow">Starter module</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
          The route continues on Starter
        </h1>
        <p className="mt-3 max-w-xl text-[14px] leading-[1.65] text-[var(--muted)]">
          Module 1 (product selection) is free — you&apos;ve seen how the mentor works. The remaining
          six modules walk you from supplier sourcing to profit tracking.
        </p>
        <div className="mt-6">
          <UpgradePanel
            requiredPlan="starter"
            title="Unlock the full 7-module launch route"
            bullets={[
              "Supplier vetting, docs + GST, compliance, channel launch",
              "Every calculator and simulator, personalized to your answers",
              "Crisis protocols and the weekly profit ritual",
            ]}
          />
        </div>
      </main>
    );
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
