"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, Lock, RotateCcw } from "lucide-react";
import type { JourneyNode } from "@/lib/journey-graph";
import type { JourneyModule } from "@/lib/mvp-data";
import type { TaskModuleId } from "@/lib/tasks";
import { getSubTaskGuide, SUBTASK_TIME_ESTIMATES } from "@/lib/subtask-guides";
import { getModuleCompletionMessage } from "@/lib/mentor-voice";
import { TaskToggle } from "@/components/task-toggle";
import { JourneyGraphView, JourneyTimelineMobile } from "@/components/journey-graph-view";
import { fireMilestoneConfetti } from "@/lib/confetti";
import { milestoneForSubTask } from "@/lib/milestones";
import { resetProductWorkspace } from "@/app/app/journey/actions";
import { JargonText } from "@/components/jargon-text";

type Props = {
  nodes: JourneyNode[];
  modules?: JourneyModule[];
};

export function JourneyMap({ nodes, modules = [] }: Props) {
  const router = useRouter();
  const warningsRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<TaskModuleId>(nodes[0]?.id ?? "common-documentation");
  const [isResetting, startReset] = useTransition();

  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];
  const selectedModule = modules.find((m) => m.id === selected?.id);
  const totalProgress = nodes.reduce((sum, n) => sum + n.progressPercent, 0);
  const allAvailable = nodes.every((n) => n.status === "available" || n.status === "done");
  const isFreshJourney = totalProgress === 0 && allAvailable;

  function handleSelect(id: TaskModuleId) {
    setSelectedId(id);
    const node = nodes.find((n) => n.id === id);
    if (node?.softWarnings.length) {
      requestAnimationFrame(() => {
        warningsRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });
    }
  }

  function onToggled(subTaskId: string, checked: boolean) {
    if (checked) {
      const milestone = milestoneForSubTask(subTaskId);
      if (milestone) fireMilestoneConfetti(milestone);
    }
    router.refresh();
  }

  function handleProductReset() {
    startReset(async () => {
      await resetProductWorkspace();
      router.refresh();
    });
  }

  if (!selected) return null;

  const isLocked = selected.status === "locked";
  const nextIncomplete = selected.subTasks.find((st) => !st.done);
  const nextEstimate = nextIncomplete
    ? SUBTASK_TIME_ESTIMATES[nextIncomplete.id] ?? "~30 mins"
    : null;

  return (
    <div className="space-y-6">
      {isFreshJourney ? (
        <p className="text-muted text-center text-sm">
          Tap a module below to see sub-tasks. Start with Documentation — it unlocks everything else.
        </p>
      ) : null}

      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <JourneyGraphView nodes={nodes} selectedId={selectedId} onSelect={handleSelect} />
        <JourneyTimelineMobile nodes={nodes} selectedId={selectedId} onSelect={handleSelect} />
      </div>

      <article
        className="rounded-xl p-5 sm:p-6"
        style={{
          background: selected.status === "in_progress" ? "rgba(245,158,11,0.05)" : "rgba(8,18,32,0.75)",
          border: selected.status === "in_progress"
            ? "1px solid rgba(245,158,11,0.2)"
            : selected.status === "done"
              ? "1px solid rgba(52,211,153,0.2)"
              : "1px solid rgba(148,180,214,0.1)",
        }}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className={`text-xl font-bold ${selected.status === "done" ? "text-emerald-300" : selected.status === "in_progress" ? "text-amber-200" : "text-white"}`}>
              {selected.title}
            </h2>
            <p className={`text-xs capitalize ${selected.status === "done" ? "text-emerald-400" : selected.status === "in_progress" ? "text-amber-400" : "text-muted"}`}>
              {selected.status.replace("_", " ")}
            </p>
          </div>
          {isLocked ? <Lock className="h-5 w-5 text-slate-600" aria-hidden="true" /> : null}
        </div>

        {selectedModule?.description ? (
          <p className="text-muted mt-3 text-sm leading-6">{selectedModule.description}</p>
        ) : null}

        {selected.status === "done" ? (
          <p className="meta-tile mt-3 text-sm text-neutral-300">{getModuleCompletionMessage(selected.id)}</p>
        ) : null}

        {selected.deprioritized ? (
          <p className="meta-tile mt-3 text-xs text-neutral-400">
            Deprioritized for your budget — complete launch and first payout before scaling ads.
          </p>
        ) : null}

        <div className="mt-3">
          <div className="progress-track h-1.5">
            <div
              className="h-full rounded-full transition-[width] duration-300 ease-out"
              style={{
                width: `${selected.progressPercent}%`,
                background: selected.progressPercent === 100
                  ? "linear-gradient(90deg, #34d399, #6ee7b7)"
                  : "linear-gradient(90deg, #f59e0b, #fbbf24)",
              }}
            />
          </div>
          <p className="text-muted mt-1 text-xs">{selected.progressPercent}% sub-tasks done</p>
        </div>

        {selected.blockedBy.length > 0 ? (
          <div className="mt-3 rounded-lg border border-neutral-700 bg-neutral-900 p-3 text-xs text-neutral-300">
            <p className="font-medium text-white">Locked until:</p>
            <ul className="mt-1 list-disc pl-4">
              {selected.blockedBy.map((b) => (
                <li key={b.subTaskId}>
                  <Link href={`/app/tasks/${b.moduleId}`} className="underline hover:text-white">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {nextIncomplete && !isLocked ? (
          <div className="mt-4 rounded-lg border border-white/15 bg-black p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-neutral-500">Next step here</p>
            <p className="mt-1 text-sm font-medium text-white">{nextIncomplete.label}</p>
            <p className="text-muted mt-1 text-xs">Estimated time: {nextEstimate}</p>
            <Link
              href={`/app/tasks/${selected.id}`}
              className="btn-primary mt-3 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-md px-4 py-2 text-xs font-medium"
            >
              Start this step
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}

        {selected.softWarnings.length > 0 ? (
          <div ref={warningsRef} className="mt-3 space-y-2">
            {selected.softWarnings.map((w) => (
              <p key={w} className="meta-tile text-xs text-neutral-400">
                <JargonText text={w} />
              </p>
            ))}
          </div>
        ) : null}

        <ul className="mt-4 space-y-2">
          {selected.subTasks.map((st) => {
            const guide = getSubTaskGuide(st.id, selected.id);
            const severityLabel = st.severity === "required" ? "Required" : "Recommended";
            return (
              <li key={st.id}>
                <div className="mb-1 flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium uppercase tracking-wide ${
                      st.severity === "required" ? "text-neutral-300" : "text-neutral-500"
                    }`}
                  >
                    {severityLabel}
                  </span>
                </div>
                <TaskToggle
                  subTaskId={st.id}
                  label={st.label}
                  hint={st.hint ?? guide.hint}
                  howToSteps={guide.howToSteps}
                  walkthroughHref={guide.walkthroughHref}
                  checked={st.done}
                  disabled={isLocked}
                  onToggled={onToggled}
                />
              </li>
            );
          })}
        </ul>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <Link
            href={`/app/journey/${selected.id}`}
            className="btn-ghost inline-flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-xs font-medium"
          >
            Overview
          </Link>
          {isLocked ? (
            <span className="text-muted px-3 py-2 text-xs">Walkthrough locked</span>
          ) : (
            <Link
              href={`/app/tasks/${selected.id}`}
              className="btn-primary inline-flex min-h-[44px] items-center justify-center rounded-md px-3 py-2 text-xs font-medium"
            >
              Guided walkthrough
            </Link>
          )}
          {selected.id === "product-selection" ? (
            <button
              type="button"
              onClick={handleProductReset}
              disabled={isResetting}
              className="btn-ghost inline-flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-xs font-medium"
            >
              <RotateCcw className="h-3 w-3" />
              Pick new product
            </button>
          ) : null}
        </div>
      </article>
    </div>
  );
}
