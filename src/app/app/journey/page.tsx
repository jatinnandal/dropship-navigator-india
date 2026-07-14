import Link from "next/link";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { channelLabel } from "@/lib/profile-name";
import { getModuleMentorLine } from "@/lib/mentor-voice";
import { buildTask, type TaskModuleId } from "@/lib/tasks";
import { getTaskState } from "@/lib/task-progress-store";
import { getActiveSellerProfileForCurrentVisitor, getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getEditProfileHref } from "@/lib/profile-name";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { JourneyMap } from "@/components/journey-map";
import { MilestoneStamps } from "@/components/milestone-stamps";
import { getCurrentPlan } from "@/lib/plan";
import { canUseJourneyModule } from "@/lib/entitlements";

export default async function JourneyPage() {
  const userId = await getCurrentUserId();
  const hasProfile = await userHasProfile(userId);
  const [profile, completed, workspace, activeSellerProfile] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);
  const plan = await getCurrentPlan();
  const modules = buildPersonalizedJourney(profile);
  const planLockedModuleIds = modules
    .filter((m) => !canUseJourneyModule(plan, m.id))
    .map((m) => m.id);
  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    completedSimulators: workspace.completedSimulators,
    hasGstin: profile.hasGstin || !!workspace.gstin,
    profile,
  });

  // Reconcile module progress with the guided walkthrough: both count completed
  // walkthrough STEPS out of that module's built step list (which flexes with the
  // seller's answers), so the ring on a module matches the % shown inside its
  // walkthrough instead of the old coarse subtask count.
  const taskStates = await Promise.all(nodes.map((n) => getTaskState(n.id)));
  const stepProgress = nodes.map((n, i) => {
    const built = buildTask(n.id, profile, taskStates[i].answers, workspace);
    const stepIds = new Set((built?.steps ?? []).map((s) => s.id));
    const done = taskStates[i].completed.filter((id) => stepIds.has(id)).length;
    return { done, total: stepIds.size };
  });

  const nodes2 = nodes.map((n, i) => {
    const { done, total } = stepProgress[i];
    const percent = total > 0 ? Math.round((done / total) * 100) : 0;
    const status = n.status === "available" && percent > 0 ? ("in_progress" as const) : n.status;
    return { ...n, status, progressPercent: n.status === "done" ? 100 : percent };
  });

  const completedCount = nodes2.filter((n) => n.status === "done").length;
  const totalSteps = stepProgress.reduce((s, p) => s + p.total, 0);
  const doneSteps = nodes2.reduce(
    (s, n, i) => s + (n.status === "done" ? stepProgress[i].total : stepProgress[i].done),
    0,
  );
  const routePercent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const hasGstin = profile.hasGstin || !!workspace.gstin;
  const mentorNotes = Object.fromEntries(
    nodes2.map((n) => [n.id, getModuleMentorLine(n.id as TaskModuleId, profile, n.status, hasGstin)]),
  ) as Record<string, string>;

  // Plan names are auto-generated as "<Channel> · <Category>" - don't repeat the channel token.
  const channel = channelLabel(profile.primaryChannel);
  const nameHasChannel = hasProfile && activeSellerProfile
    ? activeSellerProfile.name.toLowerCase().includes(channel.toLowerCase())
    : false;
  const profileLine = hasProfile && activeSellerProfile
    ? `${activeSellerProfile.name}${nameHasChannel ? "" : ` · ${channel}`}${profile.hasGstin ? " · GST ready" : " · GST pending"}${profile.experienceLevel === "existing_seller" ? " · existing seller" : " · new seller"}`
    : null;

  return (
    <main className="page-reveal mx-auto w-full max-w-[80rem] px-4 py-6 sm:px-8 sm:py-7">
      {!hasProfile ? (
        <section className="banner-deadline mb-6 px-5 py-4">
          <p className="text-sm font-medium text-neutral-100">
            Complete setup to unlock personalized recommendations and progress tracking.
          </p>
          <Link
            href="/onboarding"
            className="btn-primary mt-3 inline-flex items-center px-5 py-3 text-sm"
          >
            Build my launch plan
          </Link>
        </section>
      ) : null}

      {hasProfile ? <MilestoneStamps profile={profile} subTasks={workspace.subTasks} /> : null}

      <JourneyMap
        nodes={nodes2}
        modules={modules}
        hasProfile={hasProfile}
        profileLine={profileLine}
        completedStages={completedCount}
        totalStages={nodes2.length}
        doneSteps={doneSteps}
        totalSteps={totalSteps}
        routePercent={routePercent}
        primaryChannel={profile.primaryChannel}
        productType={profile.productType}
        mentorNotes={mentorNotes}
        planLockedModuleIds={planLockedModuleIds}
      />
    </main>
  );
}
