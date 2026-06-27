import Link from "next/link";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { JourneyMap } from "@/components/journey-map";

export default async function JourneyPage() {
  const userId = await getCurrentUserId();
  const hasProfile = await userHasProfile(userId);
  const profile = await getStoredProfileForCurrentVisitor();
  const completed = await getCompletedModuleIdsForCurrentVisitor();
  const workspace = await getWorkspaceForCurrentVisitor();
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

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {!hasProfile ? (
        <section className="banner-deadline mb-6 rounded-xl px-4 py-4 sm:px-5">
          <p className="text-sm font-medium text-rose-50">
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

      <header className="glass-panel rounded-xl p-6 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="headline-gradient text-3xl font-bold">
              {hasProfile ? "Your launch plan" : "Journey preview"}
            </h1>
            <p className="text-muted mt-2 text-sm">
              {hasProfile
                ? "Work modules in parallel where it makes sense. One hard lock: ads need live listings."
                : "Sample path for a new seller — complete setup to tailor this map to your channel, budget, and GST status."}
            </p>
          </div>
          {hasProfile ? (
            <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
              <p className="text-xs uppercase tracking-wider text-amber-200">Overall</p>
              <p className="text-xl font-semibold text-emerald-100">
                {completedCount}/{nodes.length} modules done
              </p>
            </div>
          ) : null}
        </div>
        {hasProfile ? (
          <div className="mt-4 max-w-lg">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
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
        <JourneyMap nodes={nodes} />
      </section>

      <section className="glass-panel mt-6 rounded-xl p-4">
        <p className="text-xs uppercase tracking-wide text-amber-200">
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
            <Link href="/onboarding" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
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
