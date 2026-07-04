import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { ProgressRing } from "@/components/progress-ring";
import { StaggerGrid, StaggerItem } from "@/components/dashboard-stagger";
import { SeasonNotice } from "@/components/season-notice";
import { DashboardInsightTile } from "@/components/dashboard-insight-tile";
import { RtoScenarioSlider } from "@/components/crisis/rto-scenario-slider";
import { AtRiskPanel } from "@/components/crisis/at-risk-panel";
import { CrisisEntryButton } from "@/components/crisis/crisis-entry-button";
import { CrisisHero } from "@/components/crisis/crisis-hero";
import { CrisisProtocol } from "@/components/crisis/crisis-protocol";
import { userHasProfile } from "@/lib/auth-routing";
import { getDashboardBanners } from "@/lib/crisis/banners";
import { getDashboardState } from "@/lib/crisis/dashboard-state";
import { buildDashboardInsights } from "@/lib/dashboard-insights";
import { isSubTaskDone } from "@/lib/journey-graph";
import { getJourneyProgressStats } from "@/lib/journey-engine";
import { getCurrentUserId } from "@/lib/current-user";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getNextAction } from "@/lib/next-action";
import { getActiveSellerProfileForCurrentVisitor, getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";

export default async function DashboardPage() {
  const userId = await getCurrentUserId();
  if (!(await userHasProfile(userId))) {
    redirect("/app/welcome");
  }

  const [profile, completed, workspace, activeSellerProfile] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);

  const hasGstin = profile.hasGstin || !!workspace.gstin;
  const detectorInput = { profile, workspace, hasGstin };
  const dashboardState = getDashboardState(detectorInput);
  const banners = getDashboardBanners(detectorInput);

  const progressStats = getJourneyProgressStats(profile, completed, workspace.subTasks);

  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    completedSimulators: workspace.completedSimulators,
    hasGstin,
    profile,
  });

  const nextAction = getNextAction({ profile, nodes, subTasks: workspace.subTasks });
  const completionCount = progressStats.completedModules;
  const totalModules = progressStats.totalModules;
  const insights = buildDashboardInsights({
    profile,
    hasGstin,
    modulesCompleted: completionCount,
    modulesTotal: totalModules,
  });

  const heroWhy =
    nextAction?.isFreshStart && nextAction.subTaskId === "docs-folder-ready"
      ? "Every expert was once exactly here. Let's get your first task done — it takes about 30 minutes and unlocks the rest of the journey."
      : nextAction?.why;

  const showRtoSlider = dashboardState.warnings.some((w) => w.id === "rto-shock");
  const listingLive = isSubTaskDone(workspace.subTasks, "first-listing-live");
  const hasSnapshot = Boolean(
    workspace.calculatorSnapshot && Object.keys(workspace.calculatorSnapshot).length > 0,
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      {dashboardState.mode === "crisis" && workspace.activeCrisis ? (
        <>
          <CrisisHero crisis={workspace.activeCrisis} />
          <CrisisProtocol
            crisis={workspace.activeCrisis}
            profile={profile}
            legalBusinessName={workspace.legalBusinessName}
            gstin={workspace.gstin}
          />
        </>
      ) : nextAction ? (
        <section className="dashboard-hero hero-reveal rounded-xl p-6 sm:p-8 md:p-10 md:min-h-[280px]">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:gap-10">
            <div className="flex flex-col items-center md:flex-shrink-0">
              <ProgressRing
                completed={progressStats.completedSubTasks}
                total={progressStats.totalSubTasks}
                size={112}
              />
              <p className="text-muted mt-2 text-center text-[11px]">
                {progressStats.subTaskPercent}% complete
              </p>
            </div>
            <div className="min-w-0 flex-1">
              {activeSellerProfile ? (
                <p className="text-muted mb-3 text-xs">
                  Active plan:{" "}
                  <span className="font-medium text-neutral-200">{activeSellerProfile.name}</span>
                  {" · "}
                  <Link href="/app/profiles" className="underline hover:text-white">
                    Switch plan
                  </Link>
                </p>
              ) : null}
              <p className="eyebrow inline-block">Do this now</p>
              <h1 className="mt-3 text-2xl font-bold leading-tight text-white sm:text-3xl">
                {nextAction.title}
              </h1>
              <p className="text-muted mt-4 max-w-2xl text-sm leading-6">{heroWhy}</p>
              <p className="text-mentor mt-3 text-xs">Estimated time: {nextAction.timeEstimate}</p>
              <div className="mt-6 flex w-full flex-col items-stretch gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={nextAction.href}
                  className="btn-primary min-h-[44px] gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
                >
                  {nextAction.isLocked ? "Complete prerequisite" : "Start this step"}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
                <CrisisEntryButton className="text-muted text-left text-sm underline hover:text-white sm:py-2" />
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {dashboardState.mode === "normal"
        ? banners.map((banner) => (
            <section
              key={banner.id}
              className={`mt-5 rounded-xl p-4 ${banner.variant === "deadline" ? "banner-deadline" : "banner-at-risk"}`}
            >
              <p className="text-sm font-medium text-slate-100">{banner.message}</p>
              <Link href={banner.href} className="link-info mt-2 inline-block text-sm font-medium">
                {banner.ctaLabel}
              </Link>
            </section>
          ))
        : null}

      {dashboardState.mode === "at_risk" ? (
        <AtRiskPanel
          warnings={dashboardState.warnings}
          profile={profile}
          showRtoSlider={showRtoSlider}
          defaultSellingPrice={workspace.targetSellingPrice}
          defaultProductCost={workspace.productCost}
          defaultShippingCost={workspace.shippingCost}
          defaultRtoRate={workspace.estimatedRtoRate}
        />
      ) : null}

      {listingLive && dashboardState.mode !== "crisis" && !showRtoSlider && !hasSnapshot ? (
        <section className="glass-panel-receded mt-5 rounded-xl p-4 sm:p-5">
          <RtoScenarioSlider
            profile={profile}
            defaultSellingPrice={workspace.targetSellingPrice}
            defaultProductCost={workspace.productCost}
            defaultShippingCost={workspace.shippingCost}
            defaultRtoRate={workspace.estimatedRtoRate}
          />
        </section>
      ) : null}

      <SeasonNotice productType={profile.productType} />

      <section className="glass-panel-receded mt-5 rounded-lg px-5 py-4">
        <div className="flex items-center gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <p className="text-muted text-xs uppercase tracking-wide">Progress</p>
              <p className="text-sm font-semibold text-slate-200">
                {progressStats.completedSubTasks}/{progressStats.totalSubTasks} steps
              </p>
            </div>
            <p className="text-muted mt-1 text-xs leading-5">
              {progressStats.completedSubTasks === 0
                ? "Your launch plan is personalized — start with the first step."
                : `${completionCount}/${totalModules} modules done · ${progressStats.subTaskPercent}% of your plan.`}
            </p>
            {dashboardState.mode === "at_risk" ? (
              <Link href="/app/journey" className="link-info mt-2 inline-block text-xs">
                View launch plan — risks flagged on dashboard
              </Link>
            ) : null}
          </div>
        </div>
      </section>

      <StaggerGrid className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {insights.map((insight) => (
          <StaggerItem key={insight.id}>
            <DashboardInsightTile insight={insight} />
          </StaggerItem>
        ))}
      </StaggerGrid>

      <section className="glass-panel-receded mt-5 rounded-lg px-5 py-4">
        <Link
          href="/app/journey"
          className="btn-ghost inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          View full launch plan
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </main>
  );
}
