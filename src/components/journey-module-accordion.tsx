"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { JargonText } from "@/components/jargon-text";
import type { StepDetail } from "@/lib/step-details";

type Section = {
  id: string;
  title: string;
  content: React.ReactNode;
};

type Props = {
  detail: StepDetail;
  doNowBullets: string[];
};

export function JourneyModuleAccordion({ detail, doNowBullets }: Props) {
  const [openId, setOpenId] = useState<string | null>(null);

  const sections: Section[] = [
    {
      id: "guide",
      title: "Read full guide",
      content: <JargonText text={detail.plainLanguageSummary} className="text-sm leading-6 text-slate-200" />,
    },
  ];

  if (detail.requiredInputs.length > 0) {
    sections.push({
      id: "personalized",
      title: "Why this is personalized for you",
      content: (
        <div className="grid gap-3 md:grid-cols-2">
          {detail.requiredInputs.map((item) => (
            <article key={`${item.factor}-${item.value}`} className="surface-hover rounded-lg border border-slate-700/60 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-200">{item.factor}</p>
              <p className="mt-1 font-semibold text-slate-100">{item.value}</p>
              <p className="text-muted mt-2 text-sm">
                <JargonText text={item.impact} />
              </p>
            </article>
          ))}
        </div>
      ),
    });
  }

  if (detail.mustHaveDocuments.length > 0) {
    sections.push({
      id: "docs",
      title: "Documents to keep ready",
      content: (
        <ul className="text-muted list-disc space-y-2 pl-5 text-sm">
          {detail.mustHaveDocuments.map((item) => (
            <li key={item}>
              <JargonText text={item} />
            </li>
          ))}
        </ul>
      ),
    });
  }

  if (detail.decisionFlow.length > 0) {
    sections.push({
      id: "decisions",
      title: "Decision flow",
      content: (
        <ol className="text-muted list-decimal space-y-2 pl-5 text-sm">
          {detail.decisionFlow.map((item) => (
            <li key={item}>
              <JargonText text={item} />
            </li>
          ))}
        </ol>
      ),
    });
  }

  if (detail.executionPlan.length > 0) {
    sections.push({
      id: "execution",
      title: "Execution plan",
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          {detail.executionPlan.map((phase) => (
            <article key={phase.phase} className="surface-hover rounded-lg border border-slate-700/60 p-4">
              <p className="text-xs uppercase tracking-wide text-amber-200">{phase.phase}</p>
              <h3 className="mt-1 font-semibold text-slate-100">{phase.goal}</h3>
              <ul className="text-muted mt-2 list-disc space-y-1 pl-5 text-sm">
                {phase.tasks.map((task) => (
                  <li key={task}>
                    <JargonText text={task} />
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      ),
    });
  }

  if (detail.doneCriteria.length > 0) {
    sections.push({
      id: "done",
      title: "How to know this step is done",
      content: (
        <ul className="text-muted list-disc space-y-2 pl-5 text-sm">
          {detail.doneCriteria.map((item) => (
            <li key={item}>
              <JargonText text={item} />
            </li>
          ))}
        </ul>
      ),
    });
  }

  sections.push({
    id: "checklist",
    title: "Full checklist & mistakes",
    content: (
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="text-base font-semibold text-slate-100">What to do</h3>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.actionChecklist.map((item) => (
              <li key={item}>
                <JargonText text={item} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="text-base font-semibold text-slate-100">Mistakes to avoid</h3>
          <ul className="text-muted mt-3 list-disc space-y-2 pl-5 text-sm">
            {detail.mistakesToAvoid.map((item) => (
              <li key={item}>
                <JargonText text={item} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    ),
  });

  if (detail.partnerOptions.length > 0) {
    sections.push({
      id: "partners",
      title: "Third-party help (optional)",
      content: (
        <>
          <p className="text-muted text-sm">Use these only if you want faster execution. You can still do this step yourself.</p>
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {detail.partnerOptions.map((partner) => (
              <article key={partner.name} className="surface-hover rounded-lg border border-slate-700/60 p-4">
                <h3 className="font-semibold text-slate-100">{partner.name}</h3>
                <p className="text-muted mt-2 text-sm">
                  <JargonText text={partner.whenToUse} />
                </p>
                <p className="mt-2 text-xs text-amber-200">
                  Ask: <JargonText text={partner.whatToAsk} />
                </p>
              </article>
            ))}
          </div>
        </>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <section className="glass-panel rounded-xl p-6">
        <p className="text-xs uppercase tracking-wide text-amber-200">Do this now</p>
        <ul className="mt-3 space-y-2">
          {doNowBullets.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-slate-200">
              <span className="text-amber-300">→</span>
              <JargonText text={item} />
            </li>
          ))}
        </ul>
      </section>

      {sections.map((section) => {
        const isOpen = openId === section.id;
        return (
          <section key={section.id} className="glass-panel overflow-hidden rounded-xl">
            <button
              type="button"
              onClick={() => setOpenId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between gap-3 p-5 text-left"
              aria-expanded={isOpen}
            >
              <h2 className="text-base font-semibold text-slate-100">{section.title}</h2>
              <ChevronDown
                className={`h-4 w-4 flex-none text-muted transition ${isOpen ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            {isOpen ? <div className="border-t border-slate-700/50 px-5 pb-5 pt-4">{section.content}</div> : null}
          </section>
        );
      })}
    </div>
  );
}
