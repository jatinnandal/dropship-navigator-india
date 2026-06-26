"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Lock, RotateCcw } from "lucide-react";
import type { JourneyNode } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";
import { getSubTaskGuide } from "@/lib/subtask-guides";
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
  const [selectedId, setSelectedId] = useState<TaskModuleId>(nodes[0]?.id ?? "common-documentation");
  const [isResetting, startReset] = useTransition();

  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];

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

  return (
    <div className="space-y-6">
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        <JourneyGraphView nodes={nodes} selectedId={selectedId} onSelect={setSelectedId} />
        <JourneyTimelineMobile nodes={nodes} selectedId={selectedId} onSelect={setSelectedId} />
      </div>

      <article className="glass-panel rounded-xl p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold text-slate-100">{selected.title}</h2>
            <p className="text-muted text-xs capitalize">{selected.status.replace("_", " ")}</p>
          </div>
          {isLocked ? <Lock className="h-5 w-5 text-rose-300" aria-hidden="true" /> : null}
        </div>

        <div className="mt-3">
          <div className="progress-track h-1.5">
            <div className="progress-fill" style={{ width: `${selected.progressPercent}%` }} />
          </div>
          <p className="text-muted mt-1 text-xs">{selected.progressPercent}% sub-tasks done</p>
        </div>

        {selected.blockedBy.length > 0 ? (
          <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200">
            <p className="font-semibold">Locked until:</p>
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

        {selected.softWarnings.length > 0 ? (
          <div className="mt-3 space-y-2">
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
            className="btn-ghost min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold"
          >
            Overview
          </Link>
          {isLocked ? (
            <span className="text-muted px-3 py-2 text-xs">Walkthrough locked</span>
          ) : (
            <Link
              href={`/app/tasks/${selected.id}`}
              className="btn-primary min-h-[44px] rounded-md px-3 py-2 text-xs font-semibold"
            >
              Guided walkthrough
            </Link>
          )}
          {selected.id === "product-selection" ? (
            <button
              type="button"
              onClick={handleProductReset}
              disabled={isResetting}
              className="btn-ghost inline-flex min-h-[44px] items-center gap-1 rounded-md px-3 py-2 text-xs font-semibold"
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
