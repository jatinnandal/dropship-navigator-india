"use client";

import { useState, type ReactNode } from "react";
import { ExternalLink } from "lucide-react";
import { JargonText } from "@/components/jargon-text";
import type { TaskStep } from "@/lib/tasks/types";

function MentorAvatar() {
  return (
    <div
      className="flex h-9 w-9 flex-none items-center justify-center rounded-full border border-cyan-400/50 bg-cyan-400/10 text-xs font-bold text-cyan-200"
      aria-hidden="true"
    >
      DN
    </div>
  );
}

function MentorBubble({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "trap" | "tip" }) {
  const toneClass =
    tone === "trap"
      ? "border-rose-400/30 bg-rose-400/5"
      : tone === "tip"
        ? "border-cyan-400/30 bg-cyan-400/5"
        : "border-slate-700/60 bg-slate-800/40";

  return (
    <div className="flex gap-3">
      <MentorAvatar />
      <div className={`max-w-[92%] rounded-xl rounded-tl-sm border px-4 py-3 text-sm leading-6 text-slate-200 ${toneClass}`}>
        {children}
      </div>
    </div>
  );
}

function ProgressiveHow({ items }: { items: string[] }) {
  const [visible, setVisible] = useState(1);

  if (items.length === 0) return null;

  return (
    <div className="space-y-3">
      {items.slice(0, visible).map((item, index) => (
        <MentorBubble key={item}>
          <p className="text-xs uppercase tracking-wide text-amber-200">Step {index + 1}</p>
          <p className="mt-1">
            <JargonText text={item} />
          </p>
        </MentorBubble>
      ))}
      {visible < items.length ? (
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setVisible((v) => Math.min(v + 1, items.length))}
            className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
          >
            Continue ({visible}/{items.length})
          </button>
        </div>
      ) : null}
    </div>
  );
}

type Props = {
  step: TaskStep;
  stepIndex: number;
  totalSteps: number;
};

export function MentorStepContent({ step, stepIndex, totalSteps }: Props) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow inline-block">
          Bite {stepIndex + 1} of {totalSteps}
        </p>
      </div>

      <h2 className="text-2xl font-bold text-slate-100">
        <JargonText text={step.title} />
      </h2>

      {step.mentorNote ? (
        <MentorBubble tone="tip">
          <p className="text-xs uppercase tracking-wide text-cyan-200">Mentor tip</p>
          <p className="mt-1">
            <JargonText text={step.mentorNote} />
          </p>
        </MentorBubble>
      ) : null}

      <MentorBubble>
        <p className="text-xs uppercase tracking-wide text-amber-200">Why this matters</p>
        <p className="mt-1">
          <JargonText text={step.why} />
        </p>
      </MentorBubble>

      {step.needs && step.needs.length > 0 ? (
        <MentorBubble>
          <p className="text-xs uppercase tracking-wide text-slate-400">Have these ready</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {step.needs.map((item) => (
              <li key={item}>
                <JargonText text={item} />
              </li>
            ))}
          </ul>
        </MentorBubble>
      ) : null}

      <ProgressiveHow items={step.how} />

      {step.trap ? (
        <MentorBubble tone="trap">
          <p className="text-xs uppercase tracking-wide text-rose-300">The trap that fails people here</p>
          <p className="mt-1">
            <JargonText text={step.trap} />
          </p>
        </MentorBubble>
      ) : null}

      {step.tools && step.tools.length > 0 ? (
        <div className="mt-2">
          <p className="mb-3 text-sm font-semibold text-slate-100">Recommended tools (when you need help)</p>
          <div className="grid gap-3 sm:grid-cols-2">
            {step.tools.map((tool) => (
              <article key={tool.name} className="surface-hover rounded-lg border border-slate-700/60 p-4">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-slate-100">{tool.name}</h4>
                  <ExternalLink className="h-3.5 w-3.5 flex-none text-muted" aria-hidden="true" />
                </div>
                <p className="text-muted mt-2 text-xs">
                  <JargonText text={tool.whenToUse} />
                </p>
                <p className="mt-2 text-sm text-slate-200">
                  <JargonText text={tool.why} />
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
