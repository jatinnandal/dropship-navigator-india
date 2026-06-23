import Link from "next/link";
import { notFound } from "next/navigation";
import { JourneyModuleAccordion } from "@/components/journey-module-accordion";
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
  const doNowBullets = detail.actionChecklist.slice(0, 3);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
      <header className="glass-panel rounded-xl p-6">
        <p className="eyebrow inline-block">Journey module</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">{stepModule.title}</h1>
        <p className="text-muted mt-3 text-sm">{stepModule.description}</p>
      </header>

      <section className="glass-panel mt-6 rounded-xl border border-amber-300/30 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-amber-200">Interactive guide</p>
            <h2 className="mt-1 text-lg font-semibold">{guidedTaskLabel}</h2>
            <p className="text-muted mt-2 text-sm leading-6">
              Start here — one bite at a time, with simulators, traps, and saved progress. The full playbook
              is below if you want to read ahead.
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

      <div className="mt-6">
        <JourneyModuleAccordion detail={detail} doNowBullets={doNowBullets} />
      </div>

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
