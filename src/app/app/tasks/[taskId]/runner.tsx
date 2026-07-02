"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ProfitCalculator } from "@/components/profit-calculator";
import { MentorStepContent } from "@/components/mentor-step-content";
import { JargonText } from "@/components/jargon-text";
import { RtoRealitySlider } from "@/components/simulators/rto-reality-slider";
import { CashflowTimeline } from "@/components/simulators/cashflow-timeline";
import { NdrCallerSimulator } from "@/components/simulators/ndr-caller-simulator";
import { ProductSwipeGame } from "@/components/simulators/product-swipe-game";
import { SourcingSwipeGame } from "@/components/simulators/sourcing-swipe-game";
import { CodPrepaidMix } from "@/components/simulators/cod-prepaid-mix";
import { PincodePilotPlanner } from "@/components/simulators/pincode-pilot-planner";
import { CopyTemplate } from "@/components/copy-template";
import { SettlementBreakdown } from "@/components/settlement-breakdown";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { buildTask } from "@/lib/tasks";
import type { TaskStep } from "@/lib/tasks/types";
import { defaultRtoForProductType } from "@/lib/profit-math";
import {
  COURIER_BENCHMARK_CHECKLIST,
  ESCALATION_LETTER,
  MARKETPLACE_APPEAL_TICKET,
  PAOS_APPEAL_TEMPLATE,
  RETURN_POLICY_SNIPPET,
  SIZE_CHART_CHECKLIST,
  SUPPLIER_SLA_TEMPLATE,
} from "@/lib/mentor-templates";
import { fireMilestoneConfetti } from "@/lib/confetti";
import { workspaceRecapItems, type Workspace } from "@/lib/workspace";
import {
  persistCalculatorResult,
  persistSimulatorComplete,
  persistTaskState,
  persistWorkspaceField,
  markSubTaskForStep,
} from "./actions";

type Props = {
  taskId: string;
  profile: OnboardingProfile;
  initialCompleted: string[];
  initialAnswers: Record<string, string>;
  initialWorkspace: Workspace;
  editProfileHref?: string;
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
  editProfileHref = "/onboarding",
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

  const steps = task?.steps ?? [];

  const [currentId, setCurrentId] = useState<string>(() => {
    const target = firstIncompleteId(steps, new Set(initialCompleted ?? []));
    return target ?? steps[0]?.id ?? "";
  });

  if (!task) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
        <p>Task not found.</p>
      </main>
    );
  }

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
    startSaving(() => {
      void markSubTaskForStep(stepId);
    });
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
    const kind = step.simulator?.kind;
    if (!kind) return;
    startSaving(async () => {
      const updated = await persistSimulatorComplete(
        kind,
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
    <main className="mx-auto w-full max-w-6xl px-4 py-6 text-neutral-100 sm:px-6 sm:py-8">
      <header className="rounded-xl border border-neutral-800 bg-neutral-950 p-5 sm:p-6">
        <p className="eyebrow inline-block">Guided walkthrough</p>
        <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">{task.title}</h1>
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
          <div className="progress-track mt-2 h-2">
            <div className="progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </header>

      <div className="mt-6 flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,260px)_1fr]">
        <aside className="order-2 space-y-4 lg:order-1">
          {recapItems.length > 0 ? (
            <div className="rounded-xl border border-neutral-800 bg-neutral-950 p-4">
              <button
                type="button"
                onClick={() => setShowRecap((v) => !v)}
                className="flex w-full items-center justify-between text-left"
              >
                <p className="text-xs uppercase tracking-wide text-neutral-500">What you&apos;ve told me</p>
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

          <nav className="h-fit rounded-xl border border-neutral-800 bg-neutral-950 p-4 lg:sticky lg:top-6">
            <div className="flex items-center justify-between px-2">
              <p className="text-xs uppercase tracking-wide text-neutral-500">Your path</p>
              <span className="text-xs text-neutral-500">{progressPct}%</span>
            </div>
            <div className="progress-track mx-2 mt-2 h-1">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${progressPct}%`,
                  background: allDone
                    ? "linear-gradient(90deg, #34d399, #059669)"
                    : "linear-gradient(90deg, #f59e0b, #d97706)",
                }}
              />
            </div>
            <ol className="mt-3 max-h-[50vh] space-y-1 overflow-y-auto lg:max-h-none">
              {steps.map((step, index) => {
                const isDone = completed.has(step.id);
                const isCurrent = step.id === currentStep?.id;
                return (
                  <li key={step.id}>
                    <button
                      type="button"
                      onClick={() => goTo(step.id)}
                      className={`flex w-full items-start gap-3 rounded-lg px-2 py-2 text-left text-sm transition ${
                        isCurrent
                          ? "bg-neutral-800 text-white"
                          : isDone
                            ? "text-emerald-400/70 hover:bg-neutral-900"
                            : "text-neutral-500 hover:bg-neutral-900 hover:text-neutral-300"
                      }`}
                    >
                      <span
                        className={`mt-0.5 flex h-5 w-5 flex-none items-center justify-center rounded-full border text-[11px] ${
                          isDone
                            ? "border-emerald-500 bg-emerald-500 text-black"
                            : isCurrent
                              ? "border-amber-500 text-amber-500"
                              : "border-neutral-600 text-neutral-500"
                        }`}
                      >
                        {isDone ? <CheckIcon /> : index + 1}
                      </span>
                      <span className={isDone ? "line-through" : ""}>{step.title}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </nav>
        </aside>

        <section className="order-1 min-w-0 lg:order-2">
          {allDone ? (
            <div className="relative overflow-hidden rounded-xl border border-emerald-500/30 bg-neutral-950 p-6 text-center sm:p-8">
              {/* Celebration particles */}
              <div className="pointer-events-none absolute inset-0" aria-hidden="true">
                {[
                  { left: "15%", top: "20%", bg: "#34d399", delay: "0s" },
                  { left: "30%", top: "60%", bg: "#f59e0b", delay: "0.4s" },
                  { left: "50%", top: "30%", bg: "#22d3ee", delay: "0.8s" },
                  { left: "70%", top: "50%", bg: "#34d399", delay: "1.2s" },
                  { left: "85%", top: "25%", bg: "#f59e0b", delay: "1.6s" },
                  { left: "40%", top: "70%", bg: "#22d3ee", delay: "2.0s" },
                ].map((dot) => (
                  <span
                    key={dot.left + dot.delay}
                    className="celebration-dot"
                    style={{
                      left: dot.left,
                      top: dot.top,
                      background: dot.bg,
                      animationDelay: dot.delay,
                    }}
                  />
                ))}
              </div>

              <div
                className="mx-auto flex h-14 w-14 items-center justify-center rounded-full text-black"
                style={{ background: "linear-gradient(135deg, #34d399, #059669)" }}
              >
                <CheckIcon />
              </div>
              <h2 className="mt-4 text-2xl font-bold text-white">Task Complete!</h2>
              <p className="text-muted mx-auto mt-3 max-w-md text-sm leading-6">
                Every step is saved. Your answers and workspace data carry forward to the next modules.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-3">
                <Link
                  href="/app/journey"
                  className="btn-emerald inline-flex items-center gap-2 rounded-md px-5 py-2 text-sm font-semibold"
                >
                  Continue to next task <ArrowRight className="h-4 w-4" />
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
            <article className="rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                {completed.has(currentStep.id) ? (
                  <span className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-400">
                    <CheckIcon /> Done
                  </span>
                ) : null}
              </div>

              <div className="mt-2">
                <MentorStepContent step={currentStep} stepIndex={currentIndex} totalSteps={steps.length} />
              </div>

              {currentStep.input ? (
                <div className="mt-6 rounded-lg border border-neutral-800 p-4">
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
                      className="mt-3 w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
                    />
                  ) : (
                    <input
                      type={currentStep.input.inputType === "number" ? "number" : "text"}
                      value={inputDrafts[currentStep.id] ?? ""}
                      onChange={(e) =>
                        setInputDrafts((prev) => ({ ...prev, [currentStep.id]: e.target.value }))
                      }
                      placeholder={currentStep.input.placeholder}
                      className="mt-3 w-full rounded-md border border-neutral-700 bg-black px-3 py-2 text-sm text-white"
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
                    defaultRtoPercent={
                      workspace.estimatedRtoRate ?? defaultRtoForProductType(profile.productType)
                    }
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

              {currentStep.simulator?.kind === "sourcing_swipe" ? (
                <div className="mt-6">
                  <SourcingSwipeGame onComplete={() => applySimulator(currentStep)} />
                </div>
              ) : null}

              {currentStep.simulator?.kind === "cod_prepaid_mix" ? (
                <div className="mt-6">
                  <CodPrepaidMix
                    channel={profile.primaryChannel}
                    sellingPrice={workspace.targetSellingPrice ?? 899}
                    onComplete={() => applySimulator(currentStep)}
                  />
                </div>
              ) : null}

              {currentStep.simulator?.kind === "pincode_pilot" ? (
                <div className="mt-6">
                  <PincodePilotPlanner
                    defaultState={profile.operatingState}
                    defaultOrderTarget={profile.budgetBand === "under_20k" ? 50 : 100}
                    onComplete={() => applySimulator(currentStep)}
                  />
                </div>
              ) : null}

              {currentStep.id === "fashion-size-chart" ? (
                <CopyTemplate title="Size chart template" text={SIZE_CHART_CHECKLIST} className="mt-4" />
              ) : null}
              {currentStep.id === "fashion-return-policy" ? (
                <CopyTemplate title="Return policy snippet" text={RETURN_POLICY_SNIPPET} className="mt-4" />
              ) : null}
              {currentStep.id === "negotiate-terms" ? (
                <CopyTemplate title="Supplier SLA template" text={SUPPLIER_SLA_TEMPLATE} className="mt-4" />
              ) : null}
              {currentStep.id === "courier-benchmark" ? (
                <CopyTemplate title="Courier benchmark template" text={COURIER_BENCHMARK_CHECKLIST} className="mt-4" />
              ) : null}
              {currentStep.id === "appeal-pack" ? (
                <div className="mt-4 space-y-4">
                  <CopyTemplate title="Marketplace support ticket" text={MARKETPLACE_APPEAL_TICKET} />
                  <CopyTemplate title="Formal escalation letter" text={ESCALATION_LETTER} />
                </div>
              ) : null}
              {currentStep.id === "paos-appeal" ? (
                <CopyTemplate title="Plan of Action (POA) template" text={PAOS_APPEAL_TEMPLATE} className="mt-4" />
              ) : null}
              {currentStep.id === "tcs-recovery" || currentStep.id === "settlement-reconciliation" ? (
                <SettlementBreakdown channel={profile.primaryChannel} />
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
                <div className="mt-6 rounded-lg border border-neutral-800 p-4">
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
                              ? "border-white bg-neutral-900 text-white"
                              : "border-neutral-800 text-neutral-200"
                          }`}
                        >
                          <JargonText text={option.label} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 border-t border-neutral-800 pt-4">
                <button
                  type="button"
                  onClick={() => setShowStuck((value) => !value)}
                  className="text-sm font-semibold text-neutral-400 underline hover:text-white"
                >
                  {showStuck ? "Hide help" : "I'm stuck on this step"}
                </button>
                {showStuck ? (
                  <div className="mentor-bubble-stuck mt-3 rounded-lg border border-neutral-800 p-4">
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
            <Link href={editProfileHref} className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
              Update profile inputs
            </Link>
          </footer>
        </section>
      </div>
    </main>
  );
}
