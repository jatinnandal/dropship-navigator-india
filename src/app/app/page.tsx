import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, Zap } from "lucide-react";
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
import { getCurrentUserId, getDisplayName } from "@/lib/current-user";
import { getModuleMentorLine } from "@/lib/mentor-voice";
import { STAGE_TOOLS } from "@/lib/stage-tools";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getNextAction } from "@/lib/next-action";
import { getActiveSellerProfileForCurrentVisitor, getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { formatDateIN } from "@/lib/format";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

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

  const displayName = await getDisplayName();
  const mentorLine = nextAction
    ? getModuleMentorLine(
        nextAction.moduleId,
        profile,
        nodes.find((n) => n.id === nextAction.moduleId)?.status ?? "available",
        hasGstin,
      )
    : "One step at a time — you're building a real business, not chasing a hack.";
  const stageTools = nextAction ? STAGE_TOOLS[nextAction.moduleId] ?? [] : [];

  const showRtoSlider = dashboardState.warnings.some((w) => w.id === "rto-shock");
  const listingLive = isSubTaskDone(workspace.subTasks, "first-listing-live");
  const hasSnapshot = Boolean(
    workspace.calculatorSnapshot && Object.keys(workspace.calculatorSnapshot).length > 0,
  );

  return (
    <main className="relative z-[1] flex-1 mx-auto w-full px-4 py-6 sm:px-8 sm:py-7" style={{ maxWidth: "var(--app-max-width)" }}>
      <div className="flex flex-wrap gap-5 items-start">
        {/* Main content column */}
        <div className="flex-[1_1_560px] min-w-0">

          {/* Top row: date + greeting + crisis CTA */}
          <div className="flex items-center justify-between gap-4 px-1 pb-5">
            <div>
              <p className="font-mono text-[11.5px] text-[var(--text-faintest)]">{formatDateIN()}</p>
              <h1 className="mt-1 text-[23px] font-semibold tracking-[-0.03em] text-white">
                {getGreeting()}, <span className="font-serif-accent">{displayName}.</span>
              </h1>
            </div>
            <Link href="/app/crisis" className="btn-danger">
              <Zap className="h-3.5 w-3.5" aria-hidden="true" />
              Order gone wrong?
            </Link>
          </div>

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
            /* Command deck */
            <section className="panel-raised-lg grid-texture rounded-[22px] p-8 sm:p-[32px_34px]">
              <div className="relative flex flex-wrap gap-[30px] items-center">
                {/* Corner radial light */}
                <div className="absolute top-[-60%] right-[-10%] w-[60%] h-[140%] bg-[radial-gradient(circle,rgba(255,255,255,0.08),transparent_65%)] pointer-events-none" aria-hidden="true" />

                <div className="relative flex flex-col items-center gap-2 shrink-0">
                  <ProgressRing
                    completed={progressStats.completedSubTasks}
                    total={progressStats.totalSubTasks}
                  />
                  <p className="font-mono text-[11px] text-[var(--muted)]">
                    {progressStats.subTaskPercent}% of your route
                  </p>
                </div>

                <div className="relative min-w-[min(100%,300px)] flex-1">
                  <p className="flex items-center gap-[9px] text-[11px] font-semibold tracking-[0.2em] uppercase text-[#9a9a9a]">
                    <span className="w-[7px] h-[7px] rounded-full bg-white pulse-glow" />
                    Do this now · Stage {Math.ceil((progressStats.completedSubTasks + 1) / 4)}
                  </p>
                  <h2 className="mt-3 text-[27px] font-bold tracking-[-0.03em] leading-[1.15] text-white">
                    {nextAction.title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-[1.6] text-[var(--body-text)]">{heroWhy}</p>
                  <div className="mt-6 flex flex-wrap items-center gap-4">
                    <Link
                      href={nextAction.href}
                      className="btn-primary min-h-[44px] gap-2 text-[14px]"
                    >
                      {nextAction.isLocked ? "Complete prerequisite" : "Start this step"}
                      <ArrowRight className="h-4 w-4" aria-hidden="true" />
                    </Link>
                    <span className="font-mono text-[11px] text-[var(--text-faint)]">
                      ⏱ {nextAction.timeEstimate}
                    </span>
                  </div>
                </div>
              </div>
            </section>
          ) : null}

          {dashboardState.mode === "normal"
            ? banners.map((banner) => (
                <section
                  key={banner.id}
                  className={`mt-5 rounded-[14px] p-4 ${banner.variant === "deadline" ? "banner-deadline" : "banner-deadline"}`}
                >
                  <p className="text-sm font-medium text-white">{banner.message}</p>
                  <Link href={banner.href} className="mt-2 inline-block text-sm font-medium text-white underline underline-offset-2 hover:text-white/70">
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
            <section className="panel mt-5 rounded-[18px] p-4 sm:p-5">
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

          {/* Route strip */}
          <section className="panel mt-5 rounded-[18px] px-5 py-4">
            <div className="flex items-center justify-between">
              <p className="mono-label">Your route</p>
              <Link href="/app/journey" className="text-[13px] font-medium text-white hover:text-white/70 transition-colors">
                Open full map →
              </Link>
            </div>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${progressStats.subTaskPercent}%` }} />
                </div>
              </div>
              <p className="font-mono text-[11px] text-[var(--muted)]">
                {progressStats.completedSubTasks}/{progressStats.totalSubTasks}
              </p>
            </div>
          </section>

          {/* Insight tiles */}
          <StaggerGrid className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {insights.map((insight) => (
              <StaggerItem key={insight.id}>
                <DashboardInsightTile insight={insight} />
              </StaggerItem>
            ))}
          </StaggerGrid>
        </div>

        {/* Right rail */}
        <div className="flex-[1_1_300px] max-w-[360px] flex flex-col gap-4 sticky top-7">
          {/* Deadline card */}
          {banners.filter((b) => b.variant === "deadline").map((banner) => (
            <div key={banner.id} className="banner-deadline rounded-[14px] p-4">
              <p className="text-sm font-medium text-[var(--danger-text)]">{banner.message}</p>
              <Link href={banner.href} className="mt-2 inline-block text-sm font-medium text-white underline underline-offset-2">
                {banner.ctaLabel}
              </Link>
            </div>
          ))}

          {/* Mentor card */}
          <div className="panel rounded-[18px] p-5">
            <p className="mono-label">Mentor&apos;s read</p>
            <p className="mt-3 text-[15px] leading-[1.65] text-[var(--body-text)]">
              <span className="font-serif-accent">&ldquo;</span>
              {mentorLine}
              <span className="font-serif-accent">&rdquo;</span>
            </p>
          </div>

          {/* Tools for this stage */}
          <div className="panel rounded-[18px] p-5">
            <p className="mono-label">Tools for this stage</p>
            <div className="mt-3 flex flex-col gap-1">
              {stageTools.map((tool) => (
                <Link key={tool.href} href={tool.href} className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-[var(--body-text)] hover:text-white hover:bg-white/[0.04] transition-colors">
                  {tool.emoji} {tool.label}
                </Link>
              ))}
              <Link href="/app/tools" className="flex items-center gap-2 rounded-lg px-2 py-2 text-[13px] text-[var(--body-text)] hover:text-white hover:bg-white/[0.04] transition-colors">
                → All tools
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
