import Link from "next/link";
import { ArrowRight, ChartSpline, CircleDollarSign, FileCheck } from "lucide-react";
import { SeasonNotice } from "@/components/season-notice";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getNextAction, getGstFilingBanner } from "@/lib/next-action";
import { getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";

export default async function DashboardPage() {
  const [profile, completed, workspace] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
  ]);

  const hasGstin = profile.hasGstin || !!workspace.gstin;
  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    completedSimulators: workspace.completedSimulators,
    hasGstin,
    profile,
  });

  const nextAction = getNextAction({ profile, nodes });
  const gstBanner = getGstFilingBanner({ hasGstin, subTasks: workspace.subTasks });
  const completionCount = nodes.filter((n) => n.status === "done").length;
  const totalModules = buildPersonalizedJourney(profile).length;
  const completionPercent = Math.max(5, Math.round((completionCount / totalModules) * 100));

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {nextAction ? (
        <section className="glass-panel rounded-xl border border-amber-300/30 p-6 sm:p-8">
          <p className="eyebrow inline-block">Do this now</p>
          <h1 className="headline-gradient mt-2 text-2xl font-bold sm:text-3xl">{nextAction.title}</h1>
          <p className="text-muted mt-3 max-w-2xl text-sm leading-6">{nextAction.why}</p>
          <p className="mt-2 text-xs text-amber-200">Estimated time: {nextAction.timeEstimate}</p>
          <Link
            href={nextAction.href}
            className="btn-primary mt-5 inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold"
          >
            {nextAction.isLocked ? "Complete prerequisite" : "Start this step"}
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </section>
      ) : null}

      {gstBanner ? (
        <section className="glass-panel mt-4 rounded-xl border border-rose-400/30 bg-rose-400/5 p-4">
          <p className="text-sm text-rose-100">{gstBanner.message}</p>
          <Link href={gstBanner.href} className="mt-2 inline-block text-sm font-semibold text-amber-200 underline">
            View GST filing calendar
          </Link>
        </section>
      ) : null}

      <SeasonNotice productType={profile.productType} />

      <section className="glass-panel mt-6 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted">Overall progress</p>
            <p className="mt-1 text-lg font-semibold">
              {completionCount}/{totalModules} modules complete
            </p>
          </div>
          <span className="text-sm text-muted">{completionPercent}%</span>
        </div>
        <div className="progress-track mt-3">
          <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-3">
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <ChartSpline className="h-4 w-4" />
            Primary channel
          </div>
          <p className="mt-2 text-2xl font-semibold capitalize">{profile.primaryChannel}</p>
        </article>
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <FileCheck className="h-4 w-4" />
            GST status
          </div>
          <p className="mt-2 text-2xl font-semibold">{hasGstin ? "Configured" : "Pending"}</p>
        </article>
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <CircleDollarSign className="h-4 w-4" />
            Modules done
          </div>
          <p className="mt-2 text-2xl font-semibold">{completionCount}</p>
        </article>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-6">
        <Link
          href="/app/journey"
          className="btn-ghost inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
        >
          View full launch plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
