import Link from "next/link";
import { notFound } from "next/navigation";
import { JourneyModuleAccordion } from "@/components/journey-module-accordion";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getModuleMentorLine } from "@/lib/mentor-voice";
import { getTaskTitle } from "@/lib/tasks";
import type { TaskModuleId } from "@/lib/tasks";
import { getCompletedModuleIdsForCurrentVisitor, getActiveSellerProfileForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getEditProfileHref } from "@/lib/profile-name";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { getStepDetail } from "@/lib/step-details";
import { getCurrentPlan } from "@/lib/plan";
import { canUseJourneyModule, entitlementsFor, PLAN_LABELS } from "@/lib/entitlements";
import { UpgradePanel } from "@/components/plan/upgrade-panel";
import { getModulePlan } from "@/lib/journey-plan-store";
import { applyPersonalizedPlan, isPersonalizableModule, profileHash } from "@/lib/llm/plan-generator";
import { PersonalizedPlanAutoLoader } from "@/components/personalized-plan-controls";

type Props = {
  params: Promise<{ moduleId: string }>;
};

export default async function JourneyStepPage({ params }: Props) {
  const { moduleId } = await params;
  const plan = await getCurrentPlan();

  if (!canUseJourneyModule(plan, moduleId)) {
    return (
      <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
        <p className="eyebrow">{PLAN_LABELS.starter} feature</p>
        <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
          {moduleId.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
        </h1>
        <div className="mt-6">
          <UpgradePanel
            requiredPlan="starter"
            title="Unlock the full 7-module journey"
            bullets={[
              "Personalized launch roadmap with guided walkthroughs",
              "Every module from supplier sourcing to payout tracking",
              "₹49/month — less than one RTO'd parcel",
            ]}
          />
        </div>
      </main>
    );
  }
  const [profile, completed, workspace, activeSellerProfile] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
    getActiveSellerProfileForCurrentVisitor(),
  ]);
  const modules = buildPersonalizedJourney(profile);
  const moduleIndex = modules.findIndex((item) => item.id === moduleId);
  const stepModule = moduleIndex >= 0 ? modules[moduleIndex] : null;

  if (!stepModule) {
    notFound();
  }

  const hasGstin = profile.hasGstin || !!workspace.gstin;
  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    completedSimulators: workspace.completedSimulators,
    hasGstin,
    profile,
  });
  const node = nodes.find((n) => n.id === (moduleId as TaskModuleId));
  const mentorLine = getModuleMentorLine(
    moduleId as TaskModuleId,
    profile,
    node?.status ?? "available",
    hasGstin,
  );

  const entitlements = entitlementsFor(plan);
  const canPersonalize =
    entitlements.personalizedPlan &&
    isPersonalizableModule(stepModule.id) &&
    !!activeSellerProfile;
  const modulePlan =
    canPersonalize && activeSellerProfile
      ? await getModulePlan(activeSellerProfile.id, stepModule.id, profileHash(profile))
      : null;
  const detail = applyPersonalizedPlan(getStepDetail(stepModule.id, profile), modulePlan ?? undefined);
  const guidedTaskLabel = getTaskTitle(stepModule.id);
  const doNowBullets = detail.actionChecklist.slice(0, 3);

  const editProfileHref = activeSellerProfile
    ? getEditProfileHref(activeSellerProfile.id, `/app/journey/${moduleId}`)
    : "/onboarding";

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 text-slate-100">
      <header className="glass-panel rounded-xl p-6">
        <p className="eyebrow inline-block">Journey module</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">{stepModule.title}</h1>
        <p className="text-muted mt-3 text-sm">{stepModule.description}</p>
        <p className="meta-tile mt-4 text-sm">{mentorLine}</p>
      </header>

      {canPersonalize ? (
        <section className="glass-panel mt-6 rounded-xl border border-neutral-700 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wide text-neutral-400">
                {detail.personalized ? "Your exact steps" : "Personalizing for you"}
              </p>
              <p className="text-muted mt-1 max-w-xl text-sm leading-6">
                A precise, ordered path for your entity type, state, GST status, and product.
                Documents and figures below stay from the verified checklist.
              </p>
            </div>
            {!detail.personalized ? <PersonalizedPlanAutoLoader moduleId={stepModule.id} /> : null}
          </div>

          {detail.personalized && detail.steps.length > 0 ? (
            <ol className="mt-5 space-y-3">
              {detail.steps.map((s, i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/[0.16] bg-white/[0.03] font-mono text-xs text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-muted mt-0.5 text-sm leading-6">{s.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          ) : null}

          {detail.personalized && detail.watchOuts.length > 0 ? (
            <div className="mt-5 rounded-lg border border-white/[0.1] bg-white/[0.02] p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Watch-outs for your setup
              </p>
              <ul className="mt-2 space-y-1.5">
                {detail.watchOuts.map((w, i) => (
                  <li key={i} className="text-muted flex items-start gap-2 text-sm leading-6">
                    <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.personalized ? (
            <p className="mt-4 text-xs leading-5 text-neutral-500">
              AI-generated guidance — verify category-specific compliance and figures with the
              verified checklist below or a CA before acting.
            </p>
          ) : null}
        </section>
      ) : null}

      <section className="glass-panel mt-6 rounded-xl border border-neutral-700 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-neutral-400">Interactive guide</p>
            <h2 className="mt-1 text-lg font-semibold">{guidedTaskLabel}</h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Start here — one bite at a time, with simulators, traps, and saved progress. The full playbook
              is below if you want to read ahead.
            </p>
          </div>
          <Link
            href={`/app/tasks/${stepModule.id}`}
            className="btn-primary min-h-[44px] rounded-md px-4 py-2.5 text-sm font-semibold whitespace-nowrap"
          >
            Start guided walkthrough
          </Link>
        </div>
      </section>

      <div className="mt-6">
        <JourneyModuleAccordion detail={detail} doNowBullets={doNowBullets} />
      </div>

      <footer className="mt-6 flex flex-wrap gap-3">
        <Link href="/app/journey" className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-semibold">
          Back to journey
        </Link>
        <Link href={editProfileHref} className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-semibold">
          Update profile inputs
        </Link>
      </footer>
    </main>
  );
}
