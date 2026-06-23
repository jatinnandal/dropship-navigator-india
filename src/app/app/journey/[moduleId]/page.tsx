import Link from "next/link";
import { notFound } from "next/navigation";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getTaskTitle } from "@/lib/tasks";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getStepDetail } from "@/lib/step-details";

type Props = {
  params: Promise<{ moduleId: string }>;
};

export default async function JourneyStepPage({ params }: Props) {
  const { moduleId } = await params;
  const profile = await getStoredProfileForCurrentVisitor();
  const modules = buildPersonalizedJourney(profile);
  const moduleIndex = modules.findIndex((item) => item.id === moduleId);
  const stepModule = moduleIndex >= 0 ? modules[moduleIndex] : null;

  if (!stepModule) {
    notFound();
  }

  const detail = getStepDetail(stepModule.id, profile);
  const guidedTaskLabel = getTaskTitle(stepModule.id);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
      <header className="glass-panel rounded-xl p-6">
        <p className="eyebrow inline-block">Step {moduleIndex + 1}</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">{stepModule.title}</h1>
        <p className="text-muted mt-3 text-sm">{stepModule.description}</p>
      </header>

      <section className="glass-panel mt-6 rounded-xl border border-amber-300/30 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-200">Interactive guide</p>
            <h2 className="mt-1 text-lg font-semibold">{guidedTaskLabel}</h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Skip the wall of text. I will walk you through this one action at a time, personalized to
              your profile, with the exact traps that cause rejections, and an &quot;I&apos;m stuck&quot; helper at
              every step. Your answers are remembered across modules.
            </p>
          </div>
          <Link
            href={`/app/tasks/${stepModule.id}`}
            className="btn-primary rounded-md px-5 py-2.5 text-sm font-semibold whitespace-nowrap"
          >
            Start guided walkthrough
          </Link>
        </div>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">Plain-language guide</h2>
        <p className="text-muted mt-3 text-sm leading-6">{detail.plainLanguageSummary}</p>
      </section>

      {detail.requiredInputs.length > 0 ? (
        <section className="glass-panel mt-6 rounded-xl p-6">
          <h2 className="text-lg font-semibold">Why this guide is personalized for you</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {detail.requiredInputs.map((item) => (
              <article key={`${item.factor}-${item.value}`} className="surface-hover rounded-lg border border-slate-700/60 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">{item.factor}</p>
                <p className="mt-1 font-semibold text-slate-100">{item.value}</p>
                <p className="text-muted mt-2 text-sm">{item.impact}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.mustHaveDocuments.length > 0 ? (
        <section className="glass-panel mt-6 rounded-xl p-6">
          <h2 className="text-lg font-semibold">Documents to keep ready</h2>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.mustHaveDocuments.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      {detail.decisionFlow.length > 0 ? (
        <section className="glass-panel mt-6 rounded-xl p-6">
          <h2 className="text-lg font-semibold">Decision flow for this step</h2>
          <ol className="text-muted mt-3 list-decimal space-y-2 pl-5 text-sm">
            {detail.decisionFlow.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
        </section>
      ) : null}

      {detail.executionPlan.length > 0 ? (
        <section className="glass-panel mt-6 rounded-xl p-6">
          <h2 className="text-lg font-semibold">Execution plan</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {detail.executionPlan.map((phase) => (
              <article key={phase.phase} className="surface-hover rounded-lg border border-slate-700/60 p-4">
                <p className="text-xs uppercase tracking-wide text-amber-200">{phase.phase}</p>
                <h3 className="mt-1 font-semibold text-slate-100">{phase.goal}</h3>
                <ul className="text-muted mt-2 list-disc space-y-1 pl-5 text-sm">
                  {phase.tasks.map((task) => (
                    <li key={task}>{task}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {detail.doneCriteria.length > 0 ? (
        <section className="glass-panel mt-6 rounded-xl p-6">
          <h2 className="text-lg font-semibold">How to know this step is done</h2>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.doneCriteria.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="glass-panel rounded-xl p-6">
          <h3 className="text-base font-semibold">What to do (checklist)</h3>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.actionChecklist.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>

        <article className="glass-panel rounded-xl p-6">
          <h3 className="text-base font-semibold">Mistakes to avoid</h3>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.mistakesToAvoid.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </article>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">Third-party help (optional)</h2>
        <p className="text-muted mt-2 text-sm">
          Use these only if you want faster execution. You can still do this step yourself.
        </p>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {detail.partnerOptions.map((partner) => (
            <article key={partner.name} className="surface-hover rounded-lg border border-slate-700/60 p-4">
              <h3 className="font-semibold text-slate-100">{partner.name}</h3>
              <p className="text-muted mt-2 text-sm">{partner.whenToUse}</p>
              <p className="mt-2 text-xs text-amber-200">Ask: {partner.whatToAsk}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="mt-6 flex flex-wrap gap-3">
        <Link href="/app/journey" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
          Back to journey
        </Link>
        <Link href="/onboarding" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
          Update profile inputs
        </Link>
      </footer>
    </main>
  );
}
