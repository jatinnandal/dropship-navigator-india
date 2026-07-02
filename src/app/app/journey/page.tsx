import Link from "next/link";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { channelLabel } from "@/lib/profile-name";
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
  const completionPercent = Math.max(5, Math.round((completedCount / nodes.length) * 100));

  const editProfileHref = activeSellerProfile
    ? getEditProfileHref(activeSellerProfile.id, "/app/journey")
    : "/onboarding";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {!hasProfile ? (
        <section className="banner-deadline mb-6 rounded-xl px-4 py-4 sm:px-5">
          <p className="text-sm font-medium text-neutral-100">
            Complete setup to unlock personalized recommendations and progress tracking.
          </p>
          <Link
            href="/onboarding"
            className="btn-primary mt-3 inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            Build my launch plan
          </Link>
        </section>
      ) : null}

      <header className="rounded-xl border border-neutral-800 bg-neutral-950 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">
              {hasProfile ? "Your launch plan" : "Journey preview"}
            </h1>
            {hasProfile && activeSellerProfile ? (
              <p className="mt-2 text-sm font-medium text-neutral-200">
                {activeSellerProfile.name} · {channelLabel(profile.primaryChannel)}
                {profile.hasGstin ? " · GST ready" : " · GST pending"}
                {profile.experienceLevel === "existing_seller" ? " · Existing seller" : " · New seller"}
              </p>
            ) : null}
            <p className="text-muted mt-2 text-sm">
              {hasProfile
                ? "Work modules in parallel where it makes sense. One hard lock: ads need live listings."
                : "Sample path for a new seller — complete setup to tailor this map to your channel, budget, and GST status."}
            </p>
          </div>
          {hasProfile ? (
            <div className="rounded-xl border border-neutral-700 bg-neutral-900 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-neutral-400">Overall</p>
              <p className="text-xl font-semibold text-white">
                {completedCount}/{nodes.length} modules done
              </p>
            </div>
          ) : null}
        </div>
        {hasProfile ? (
          <div className="mt-4 max-w-lg">
            <div className="mb-2 flex items-center justify-between text-xs text-neutral-400">
              <span>Aggregate progress</span>
              <span>{completionPercent}%</span>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
            </div>
          </div>
        ) : null}
      </header>

      <section className="mt-6">
        <JourneyMap nodes={nodes} modules={modules} />
      </section>

      <section className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <p className="text-xs uppercase tracking-wide text-neutral-400">
          {hasProfile ? "Personalized for you" : "Preview uses default profile"}
        </p>
        <p className="text-muted mt-2 text-sm">
          Channel: {profile.primaryChannel} · Product: {profile.productType} · {modules.length} modules
          {hasProfile ? " tailored to your profile." : " shown until you complete setup."}
        </p>
      </section>

      <footer className="mt-6 flex flex-wrap gap-3">
        {hasProfile ? (
          <>
            <Link href={editProfileHref} className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
              Update profile
            </Link>
            <Link href="/app" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
              Back to dashboard
            </Link>
          </>
        ) : (
          <>
            <Link href="/onboarding" className="btn-primary rounded-md px-4 py-2 text-sm font-semibold">
              Complete setup
            </Link>
            <Link href="/app/welcome" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
              Back to home
            </Link>
          </>
        )}
      </footer>
    </main>
  );
}
