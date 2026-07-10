"use client";

import { useState, type ReactNode } from "react";
import { ExternalLink, AlertTriangle, Lightbulb } from "lucide-react";
import { JargonText } from "@/components/jargon-text";
import type { TaskStep } from "@/lib/tasks/types";

function MentorAvatar() {
  return (
    <div
      className="flex h-12 w-12 flex-none items-center justify-center rounded-full text-sm font-bold text-black"
      style={{
        background: "linear-gradient(135deg, #ffffff, #d6d6d6)",
        boxShadow: "0 0 16px -4px rgba(255, 255, 255, 0.35), 0 0 0 2px rgba(255, 255, 255, 0.14)",
      }}
      aria-hidden="true"
    >
      DN
    </div>
  );
}

type BubbleTone = "default" | "trap" | "tip" | "stuck" | "why";

function MentorBubble({ children, tone = "default" }: { children: ReactNode; tone?: BubbleTone }) {
  const toneClass =
    tone === "trap"
      ? "mentor-bubble-trap"
      : tone === "tip"
        ? "mentor-bubble-tip"
        : tone === "stuck"
          ? "mentor-bubble-stuck"
          : tone === "why"
            ? "mentor-bubble-why"
            : "";

  const baseBg = tone === "default" ? "border-neutral-800 bg-black" : "border-transparent";

  return (
    <div className="flex gap-3">
      <MentorAvatar />
      <div className={`max-w-full rounded-xl rounded-tl-sm border px-4 py-3 text-sm leading-6 text-neutral-200 sm:max-w-[92%] ${baseBg} ${toneClass}`}>
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
          <p className="text-xs uppercase tracking-wide text-neutral-500">Step {index + 1}</p>
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

function SkeletonLoader() {
  return (
    <div className="space-y-4" aria-label="Loading step content">
      <div className="skeleton-line w-1/3" />
      <div className="skeleton-line w-2/3" />
      <div className="flex gap-3">
        <div className="h-12 w-12 flex-none rounded-full skeleton-line" style={{ height: 48, width: 48 }} />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-4/5" />
          <div className="skeleton-line w-3/5" />
        </div>
      </div>
      <div className="flex gap-3">
        <div className="h-12 w-12 flex-none rounded-full skeleton-line" style={{ height: 48, width: 48 }} />
        <div className="flex-1 space-y-2">
          <div className="skeleton-line w-full" />
          <div className="skeleton-line w-2/3" />
        </div>
      </div>
    </div>
  );
}

type Props = {
  step: TaskStep;
  stepIndex: number;
  totalSteps: number;
  isLoading?: boolean;
};

export function MentorStepContent({ step, stepIndex, totalSteps, isLoading }: Props) {
  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="eyebrow inline-block">
          Bite {stepIndex + 1} of {totalSteps}
        </p>
      </div>

      <h2 className="text-xl font-bold text-white sm:text-2xl">
        <JargonText text={step.title} />
      </h2>

      {step.mentorNote ? (
        <MentorBubble tone="tip">
          <div className="flex items-start gap-2">
            <Lightbulb className="mt-0.5 h-4 w-4 flex-none text-cyan-400" aria-hidden="true" />
            <div>
              <p className="text-xs uppercase tracking-wide text-cyan-400/80">Mentor tip</p>
              <p className="mt-1">
                <JargonText text={step.mentorNote} />
              </p>
            </div>
          </div>
        </MentorBubble>
      ) : null}

      <MentorBubble tone="why">
        <p className="text-xs uppercase tracking-wide text-neutral-500">Why this matters</p>
        <p className="mt-1 italic text-neutral-300/90">
          <JargonText text={step.why} />
        </p>
      </MentorBubble>

      {step.needs && step.needs.length > 0 ? (
        <MentorBubble>
          <p className="text-xs uppercase tracking-wide text-neutral-500">Have these ready</p>
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
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 flex-none text-rose-400" aria-hidden="true" />
            <div>
              <p className="text-xs uppercase tracking-wide text-rose-400/80">The trap that fails people here</p>
              <p className="mt-1">
                <JargonText text={step.trap} />
              </p>
            </div>
          </div>
        </MentorBubble>
      ) : null}

      {step.tools && step.tools.length > 0 ? (
        <div className="mt-2">
          <p className="mb-3 text-sm font-semibold text-white">Recommended tools</p>
          <div className="flex flex-wrap gap-2">
            {step.tools.map((tool) => (
              <div
                key={tool.name}
                className="group inline-flex items-center gap-1.5 rounded-full border border-neutral-700 bg-neutral-900/80 px-3 py-1.5 text-xs font-medium text-neutral-200 transition hover:border-neutral-500 hover:bg-neutral-800"
              >
                <span>{tool.name}</span>
                <ExternalLink className="h-3 w-3 flex-none text-neutral-500 transition group-hover:text-neutral-300" aria-hidden="true" />
              </div>
            ))}
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {step.tools.map((tool) => (
              <div key={tool.name} className="rounded-lg border border-neutral-800 bg-neutral-950 p-3">
                <p className="text-xs font-semibold text-white">{tool.name}</p>
                <p className="text-muted mt-1 text-xs">
                  <JargonText text={tool.whenToUse} />
                </p>
                <p className="mt-1 text-xs text-neutral-300">
                  <JargonText text={tool.why} />
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
