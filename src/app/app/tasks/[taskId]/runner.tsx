"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ProfitCalculator } from "@/components/profit-calculator";
import { MentorStepContent } from "@/components/mentor-step-content";
import { JargonText } from "@/components/jargon-text";
import { RtoRealitySlider } from "@/components/simulators/rto-reality-slider";
import { CashflowTimeline } from "@/components/simulators/cashflow-timeline";
import { NdrCallerSimulator } from "@/components/simulators/ndr-caller-simulator";
import { ProductSwipeGame } from "@/components/simulators/product-swipe-game";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { buildTask } from "@/lib/tasks";
import type { TaskStep } from "@/lib/tasks/types";
import { fireMilestoneConfetti } from "@/lib/confetti";
import { workspaceRecapItems, type Workspace } from "@/lib/workspace";
import {
  persistCalculatorResult,
  persistSimulatorComplete,
  persistTaskState,
  persistWorkspaceField,
} from "./actions";

type Props = {
  taskId: string;
  profile: OnboardingProfile;
  initialCompleted: string[];
  initialAnswers: Record<string, string>;
  initialWorkspace: Workspace;
};

function firstIncompleteId(steps: TaskStep[], completed: Set<string>): string | null {
  for (const step of steps) {
    if (!completed.has(step.id)) return step.id;
  }
  return null;
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
      <path
        d="M4 10.5l4 4 8-9"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function TaskRunner({
  taskId,
  profile,
  initialCompleted,
  initialAnswers,
  initialWorkspace,
}: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(initialAnswers ?? {});
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompleted ?? []));
  const [workspace, setWorkspace] = useState<Workspace>(initialWorkspace ?? {});
  const [inputDrafts, setInputDrafts] = useState<Record<string, string>>({});
  const [isSaving, startSaving] = useTransition();
  const [showStuck, setShowStuck] = useState(false);
  const [showRecap, setShowRecap] = useState(true);

  const task = useMemo(
    () => buildTask(taskId, profile, answers, workspace),
    [taskId, profile, answers, workspace],
  );

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
        <p>Task not found.</p>
      </main>
    );
  }

  const steps = task.steps;

  const [currentId, setCurrentId] = useState<string>(() => {
    const target = firstIncompleteId(steps, new Set(initialCompleted ?? []));
    return target ?? steps[0]?.id ?? "";
  });

  const currentIndex = Math.max(0, steps.findIndex((step) => step.id === currentId));
  const currentStep = steps[currentIndex] ?? steps[0];

  const presentCompletedCount = steps.filter((step) => completed.has(step.id)).length;
  const allDone = steps.length > 0 && presentCompletedCount === steps.length;
  const progressPct = steps.length > 0 ? Math.round((presentCompletedCount / steps.length) * 100) : 0;
  const recapItems = workspaceRecapItems(workspace);

  function persist(nextCompleted: Set<string>, nextAnswers: Record<string, string>) {
    startSaving(() => {
      void persistTaskState(taskId, {
        completed: Array.from(nextCompleted),
        answers: nextAnswers,
      });
    });
  }

  function goTo(stepId: string) {
    setShowStuck(false);
    setCurrentId(stepId);
  }

  function advanceFrom(stepId: string, nextCompleted: Set<string>, nextSteps: TaskStep[]) {
    const startAt = nextSteps.findIndex((step) => step.id === stepId);
    for (let i = startAt + 1; i < nextSteps.length; i += 1) {
      if (!nextCompleted.has(nextSteps[i].id)) {
        goTo(nextSteps[i].id);
        return;
      }
    }
    const anyIncomplete = firstIncompleteId(nextSteps, nextCompleted);
    if (anyIncomplete) {
      goTo(anyIncomplete);
    } else {
      goTo(nextSteps[nextSteps.length - 1]?.id ?? stepId);
    }
  }

  function markDone(stepId: string) {
    const nextCompleted = new Set(completed);
    nextCompleted.add(stepId);
    setCompleted(nextCompleted);
    persist(nextCompleted, answers);
    if (nextCompleted.size === steps.length) {
      fireMilestoneConfetti("module-complete");
    }
    advanceFrom(stepId, nextCompleted, steps);
  }

  function answerQuestion(questionId: string, value: string, stepId: string) {
    const nextAnswers = { ...answers, [questionId]: value };
    const nextCompleted = new Set(completed);
    nextCompleted.add(stepId);
    setAnswers(nextAnswers);
    setCompleted(nextCompleted);
    persist(nextCompleted, nextAnswers);
    const nextTask = buildTask(taskId, profile, nextAnswers, workspace);
    if (nextTask) {
      advanceFrom(stepId, nextCompleted, nextTask.steps);
    }
  }

  function submitInput(step: TaskStep) {
    if (!step.input) return;
    const value = inputDrafts[step.id] ?? "";
    if (!value.trim()) return;

    startSaving(async () => {
      const updated = await persistWorkspaceField(
        step.input!.workspaceKey,
        step.input!.inputType === "number" ? Number(value) : value,
        taskId,
        step.id,
        answers,
        Array.from(completed),
      );
      setWorkspace(updated);
      const nextCompleted = new Set(completed);
      nextCompleted.add(step.id);
      setCompleted(nextCompleted);
      if (step.input?.workspaceKey === "gstin") {
        fireMilestoneConfetti("gstin-saved");
      }
      advanceFrom(step.id, nextCompleted, steps);
    });
  }

  function applySimulator(step: TaskStep) {
    startSaving(async () => {
      await persistSimulatorComplete(taskId, step.id, answers, Array.from(completed));
      const nextCompleted = new Set(completed);
      nextCompleted.add(step.id);
      setCompleted(nextCompleted);
      advanceFrom(step.id, nextCompleted, steps);
    });
  }

  function applyCalculator(step: TaskStep, result: Parameters<typeof persistCalculatorResult>[0]) {
    startSaving(async () => {
      const updated = await persistCalculatorResult(
        result,
        taskId,
        step.id,
        answers,
        Array.from(completed),
      );
      setWorkspace(updated);
      const nextCompleted = new Set(completed);
      nextCompleted.add(step.id);
      setCompleted(nextCompleted);
      advanceFrom(step.id, nextCompleted, steps);
    });
  }

  function resetTask() {
    const empty = new Set<string>();
    setCompleted(empty);
    setAnswers({});
    persist(empty, {});
    setShowStuck(false);
    const rebuilt = buildTask(taskId, profile, {}, workspace);
    setCurrentId(rebuilt?.steps[0]?.id ?? "");
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
      <header className="glass-panel rounded-xl p-6">
        <p className="eyebrow inline-block">Guided walkthrough</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">{task.title}</h1>
        <p className="text-muted mt-3 text-sm leading-6">{task.intro}</p>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs text-muted">
            <span>
              {presentCompletedCount} of {steps.length} steps done
            </span>
            <span>
              {progressPct}%{isSaving ? " · saving…" : ""}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-700/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-300 to-orange-400 transition-all"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="space-y-4">
          {recapItems.length > 0 ? (
            <div className="glass-panel rounded-xl p-4">
              <button
                type="button"
                onClick={() => setShowRecap((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <p className="text-xs uppercase tracking-wide text-cyan-200">What you&apos;ve told me</p>
                <span className="text-xs text-muted">{showRecap ? "Hide" : "Show"}</span>
              </button>
              {showRecap ? (
                <ul className="mt-3 space-y-2">
                  {recapItems.map((item) => (
                    <li key={item.label} className="meta-tile text-xs">
                      <span className="text-muted">{item.label}: </span>
                      <span className="text-slate-100">{item.value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <nav className="glass-panel h-fit rounded-xl p-4 lg:sticky lg:top-6">
            <p className="px-2 text-xs uppercase tracking-wide text-amber-200">Your path</p>
            <ol className="mt-3 space-y-1">
              {steps.map((step, index) => {
                const isDone = completed.has(step.id);
                const isCurrent = step.id === currentStep?.id;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => goTo(step.id)}
                      className={`flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm transition ${
                        isCurrent ? "bg-slate-700/50 text-slate-100" : "text-muted hover:bg-slate-700/30"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] ${
                          isDone
                            ? "border-emerald-400 bg-emerald-400/20 text-emerald-300"
                            : isCurrent
                              ? "border-amber-300 text-amber-200"
                              : "border-slate-600 text-slate-400"
                        }`}
                      >
                        {isDone ? <CheckIcon /> : index + 1}
                      </span>
                      <span className={isDone ? "line-through opacity-70" : ""}>{step.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <section>
          {allDone ? (
            <div className="glass-panel rounded-xl p-8 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400 bg-emerald-400/15 text-emerald-300">
                <CheckIcon />
              </div>
              <h2 className="headline-gradient mt-4 text-2xl font-bold">You finished this walkthrough</h2>
              <p className="text-muted mx-auto mt-3 max-w-md text-sm leading-6">
                Every step is saved. Your answers and workspace data carry forward to the next modules.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link href="/app/journey" className="btn-primary rounded-md px-5 py-2 text-sm font-semibold">
                  Back to journey
                </Link>
                <button
                  type="button"
                  onClick={() => goTo(steps[0]?.id ?? "")}
                  className="btn-ghost rounded-md px-5 py-2 text-sm font-semibold"
                >
                  Review steps
                </button>
                <button
                  type="button"
                  onClick={resetTask}
                  className="btn-ghost rounded-md px-5 py-2 text-sm font-semibold"
                >
                  Start over
                </button>
              </div>
            </div>
          ) : currentStep ? (
            <article className="glass-panel rounded-xl p-6">
              <div className="flex items-center justify-between gap-3">
                {completed.has(currentStep.id) ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-400/60 px-3 py-1 text-xs text-emerald-300">
                    <CheckIcon /> Done
                  </span>
                ) : null}
              </div>

              <div className="mt-2">
                <MentorStepContent step={currentStep} stepIndex={currentIndex} totalSteps={steps.length} />
              </div>

              {currentStep.input ? (
                <div className="mt-6 rounded-lg border border-slate-700/60 p-4">
                  <label className="block text-sm font-semibold text-slate-100">
                    {currentStep.input.label}
                  </label>
                  {currentStep.input.hint ? (
                    <p className="text-muted mt-1 text-xs">{currentStep.input.hint}</p>
                  ) : null}
                  {currentStep.input.inputType === "textarea" ? (
                    <textarea
                      value={inputDrafts[currentStep.id] ?? ""}
                      onChange={(e) =>
                        setInputDrafts((prev) => ({ ...prev, [currentStep.id]: e.target.value }))
                      }
                      placeholder={currentStep.input.placeholder}
                      rows={3}
                      className="mt-3 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                    />
                  ) : (
                    <input
                      type={currentStep.input.inputType === "number" ? "number" : "text"}
                      value={inputDrafts[currentStep.id] ?? ""}
                      onChange={(e) =>
                        setInputDrafts((prev) => ({ ...prev, [currentStep.id]: e.target.value }))
                      }
                      placeholder={currentStep.input.placeholder}
                      className="mt-3 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-sm text-slate-100"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => submitInput(currentStep)}
                    disabled={!inputDrafts[currentStep.id]?.trim()}
                    className="btn-primary mt-3 rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
                  >
                    Save & continue
                  </button>
                </div>
              ) : null}

              {currentStep.simulator?.kind === "rto_reality" ? (
                <div className="mt-6">
                  <RtoRealitySlider
                    channel={profile.primaryChannel}
                    sellingPrice={workspace.targetSellingPrice ?? 999}
                    onComplete={() => applySimulator(currentStep)}
                  />
                </div>
              ) : null}

              {currentStep.simulator?.kind === "cashflow_timeline" ? (
                <div className="mt-6">
                  <CashflowTimeline onComplete={() => applySimulator(currentStep)} />
                </div>
              ) : null}

              {currentStep.simulator?.kind === "ndr_caller" ? (
                <div className="mt-6">
                  <NdrCallerSimulator onComplete={() => applySimulator(currentStep)} />
                </div>
              ) : null}

              {currentStep.simulator?.kind === "product_swipe" ? (
                <div className="mt-6">
                  <ProductSwipeGame onComplete={() => applySimulator(currentStep)} />
                </div>
              ) : null}

              {currentStep.calculator ? (
                <ProfitCalculator
                  kind={currentStep.calculator.kind}
                  channel={profile.primaryChannel}
                  initialValues={{
                    sellingPrice: workspace.targetSellingPrice,
                    productCost: workspace.productCost,
                    rtoRatePercent: workspace.estimatedRtoRate,
                  }}
                  onApply={(result) => applyCalculator(currentStep, result)}
                />
              ) : null}

              {currentStep.question ? (
                <div className="mt-6 rounded-lg border border-slate-700/60 p-4">
                  <p className="text-sm font-semibold text-slate-100">
                    <JargonText text={currentStep.question.prompt} />
                  </p>
                  <div className="mt-3 grid gap-2 sm:grid-cols-2">
                    {currentStep.question.options.map((option) => {
                      const selected = answers[currentStep.question!.id] === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            answerQuestion(currentStep.question!.id, option.value, currentStep.id)
                          }
                          className={`surface-hover rounded-lg border px-4 py-3 text-left text-sm transition ${
                            selected
                              ? "border-amber-300 bg-amber-300/10 text-slate-100"
                              : "border-slate-700/60 text-slate-200"
                          }`}
                        >
                          <JargonText text={option.label} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 border-t border-slate-700/50 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStuck((value) => !value)}
                  className="text-sm font-semibold text-amber-200 hover:text-amber-100"
                >
                  {showStuck ? "Hide help" : "I'm stuck on this step"}
                </button>
                {showStuck ? (
                  <div className="mt-3 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
                    {currentStep.stuck && currentStep.stuck.length > 0 ? (
                      <ul className="text-muted list-disc space-y-2 pl-5 text-sm">
                        {currentStep.stuck.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-muted text-sm leading-6">
                        <JargonText text="Re-read the trap above first — it covers the most common blocker. If the official portal looks different from these steps, it usually means a sync delay. Wait a few hours and retry before changing anything." />
                      </p>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                {currentIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => goTo(steps[currentIndex - 1].id)}
                    className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
                  >
                    Back
                  </button>
                ) : null}

                {currentStep.question ? (
                  <span className="text-muted text-xs">Pick an option above to continue.</span>
                ) : currentStep.input ? (
                  <span className="text-muted text-xs">Save your answer above to continue.</span>
                ) : currentStep.calculator ? (
                  <span className="text-muted text-xs">
                    Run the calculator and save results, or mark done if already calculated elsewhere.
                  </span>
                ) : currentStep.simulator ? (
                  <span className="text-muted text-xs">Complete the interactive exercise above to continue.</span>
                ) : (
                  <button
                    type="button"
                    onClick={() => markDone(currentStep.id)}
                    className="btn-primary rounded-md px-5 py-2 text-sm font-semibold"
                  >
                    {completed.has(currentStep.id) ? "Done · next step" : "Mark done & continue"}
                  </button>
                )}

                {currentStep.calculator && !completed.has(currentStep.id) ? (
                  <button
                    type="button"
                    onClick={() => markDone(currentStep.id)}
                    className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
                  >
                    Skip calculator · mark done
                  </button>
                ) : null}

                {currentStep.simulator && !completed.has(currentStep.id) ? (
                  <button
                    type="button"
                    onClick={() => markDone(currentStep.id)}
                    className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
                  >
                    Skip simulator · mark done
                  </button>
                ) : null}
              </div>
            </article>
          ) : null}

          <footer className="mt-6 flex flex-wrap gap-3">
            <Link href="/app/journey" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
              Back to journey
            </Link>
            <Link href="/onboarding" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
              Update profile inputs
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
