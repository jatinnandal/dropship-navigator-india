"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, Lock, RotateCcw } from "lucide-react";
import type { JourneyNode } from "@/lib/journey-graph";
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
};

export function JourneyMap({ nodes }: Props) {
  const router = useRouter();
  const warningsRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<TaskModuleId>(nodes[0]?.id ?? "common-documentation");
  const [isResetting, startReset] = useTransition();

  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];
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

      <article className="glass-panel rounded-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-100">{selected.title}</h2>
            <p className="text-muted text-xs capitalize">{selected.status.replace("_", " ")}</p>
          </div>
          {isLocked ? <Lock className="h-5 w-5 text-rose-300" aria-hidden="true" /> : null}
        </div>

        {selected.status === "done" ? (
          <p className="meta-tile mt-3 text-sm text-emerald-200">
            {getModuleCompletionMessage(selected.id)}
          </p>
        ) : null}

        <div className="mt-3">
          <div className="progress-track h-1.5">
            <div className="progress-fill" style={{ width: `${selected.progressPercent}%` }} />
          </div>
          <p className="text-muted mt-1 text-xs">{selected.progressPercent}% sub-tasks done</p>
        </div>

        {selected.blockedBy.length > 0 ? (
          <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200">
            <p className="font-medium">Locked until:</p>
            <ul className="mt-1 list-disc pl-4">
              {selected.blockedBy.map((b) => (
                <li key={b.subTaskId}>
                  <Link href={`/app/tasks/${b.moduleId}`} className="underline">
                    {b.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {nextIncomplete && !isLocked ? (
          <div className="glass-panel-primary mt-4 rounded-lg p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-amber-200">Next step here</p>
            <p className="mt-1 text-sm font-medium text-slate-100">{nextIncomplete.label}</p>
            <p className="text-muted mt-1 text-xs">Estimated time: {nextEstimate}</p>
            <Link
              href={`/app/tasks/${selected.id}`}
              className="btn-primary mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-xs font-medium"
            >
              Start this step
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        ) : null}

        {selected.softWarnings.length > 0 ? (
          <div ref={warningsRef} className="mt-3 space-y-2">
            {selected.softWarnings.map((w) => (
              <p key={w} className="meta-tile text-xs text-amber-200">
                <JargonText text={w} />
              </p>
            ))}
          </div>
        ) : null}

        <ul className="mt-4 space-y-2">
          {selected.subTasks.map((st) => {
            const guide = getSubTaskGuide(st.id, selected.id);
            return (
              <li key={st.id}>
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

        <div className="mt-4 flex flex-wrap gap-2">
          <Link
            href={`/app/journey/${selected.id}`}
            className="btn-ghost min-h-[44px] rounded-md px-3 py-2 text-xs font-medium"
          >
            Overview
          </Link>
          {isLocked ? (
            <span className="text-muted px-3 py-2 text-xs">Walkthrough locked</span>
          ) : (
            <Link
              href={`/app/tasks/${selected.id}`}
              className="btn-primary min-h-[44px] rounded-md px-3 py-2 text-xs font-medium"
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
