import Link from "next/link";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { channelLabel } from "@/lib/profile-name";
import { getModuleMentorLine } from "@/lib/mentor-voice";
import type { TaskModuleId } from "@/lib/tasks";
import { getActiveSellerProfileForCurrentVisitor, getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getEditProfileHref } from "@/lib/profile-name";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { JourneyMap } from "@/components/journey-map";

export default async function JourneyPage() {
  const userId = await getCurrentUserId();
  const hasProfile = await userHasProfile(userId);
  const [profile, completed, workspace, activeSellerProfile] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);
  const modules = buildPersonalizedJourney(profile);
  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    completedSimulators: workspace.completedSimulators,
    hasGstin: profile.hasGstin || !!workspace.gstin,
    profile,
  });

  const completedCount = nodes.filter((n) => n.status === "done").length;
  const totalSteps = nodes.reduce((s, n) => s + n.subTasks.length, 0);
  const doneSteps = nodes.reduce(
    (s, n) => s + n.subTasks.filter((st) => st.done).length,
    0,
  );
  const routePercent = totalSteps > 0 ? Math.round((doneSteps / totalSteps) * 100) : 0;

  const hasGstin = profile.hasGstin || !!workspace.gstin;
  const mentorNotes = Object.fromEntries(
    nodes.map((n) => [n.id, getModuleMentorLine(n.id as TaskModuleId, profile, n.status, hasGstin)]),
  ) as Record<string, string>;

  // Plan names are auto-generated as "<Channel> · <Category>" — don't repeat the channel token.
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

      <JourneyMap
        nodes={nodes}
        modules={modules}
        hasProfile={hasProfile}
        profileLine={profileLine}
        completedStages={completedCount}
        totalStages={nodes.length}
        doneSteps={doneSteps}
        totalSteps={totalSteps}
        routePercent={routePercent}
        primaryChannel={profile.primaryChannel}
        productType={profile.productType}
        mentorNotes={mentorNotes}
      />
    </main>
  );
}
