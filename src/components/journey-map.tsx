"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import {
  FileText,
  Package,
  Shield,
  Truck,
  Store,
  Megaphone,
  LineChart,
  Lock,
  RotateCcw,
} from "lucide-react";
import type { JourneyNode } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";
import { TaskToggle } from "@/components/task-toggle";
import { fireMilestoneConfetti } from "@/lib/confetti";
import { milestoneForSubTask } from "@/lib/milestones";
import { resetProductWorkspace } from "@/app/app/journey/actions";
import { JargonText } from "@/components/jargon-text";

const ICONS: Record<TaskModuleId, typeof FileText> = {
  "common-documentation": FileText,
  "product-selection": Package,
  "compliance-by-product": Shield,
  "supplier-sourcing": Truck,
  "channel-launch": Store,
  "ads-growth": Megaphone,
  "tracking-analytics": LineChart,
};

const STATUS_STYLES: Record<JourneyNode["status"], string> = {
  locked: "border-slate-600/50 opacity-75",
  available: "border-cyan-300/30",
  in_progress: "border-amber-300/40",
  done: "border-emerald-400/40",
};

type Props = {
  nodes: JourneyNode[];
};

export function JourneyMap({ nodes }: Props) {
  const router = useRouter();
  const [isResetting, startReset] = useTransition();

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

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {nodes.map((node) => {
        const Icon = ICONS[node.id];
        const isLocked = node.status === "locked";

        return (
          <article
            key={node.id}
            className={`glass-panel surface-hover rounded-xl p-5 ${STATUS_STYLES[node.status]}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-600/50 bg-slate-800/50 text-amber-200">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="font-semibold text-slate-100">{node.title}</h2>
                  <p className="text-muted text-xs capitalize">{node.status.replace("_", " ")}</p>
                </div>
              </div>
              {isLocked ? <Lock className="h-4 w-4 text-rose-300" aria-hidden="true" /> : null}
            </div>

            <div className="mt-3">
              <div className="progress-track h-1.5">
                <div className="progress-fill" style={{ width: `${node.progressPercent}%` }} />
              </div>
              <p className="text-muted mt-1 text-xs">{node.progressPercent}% sub-tasks done</p>
            </div>

            {node.blockedBy.length > 0 ? (
              <div className="mt-3 rounded-lg border border-rose-400/30 bg-rose-400/5 p-3 text-xs text-rose-200">
                <p className="font-semibold">Locked until:</p>
                <ul className="mt-1 list-disc pl-4">
                  {node.blockedBy.map((b) => (
                    <li key={b.subTaskId}>
                      <Link href={`/app/journey/${b.moduleId}`} className="underline">
                        {b.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {node.softWarnings.map((w) => (
              <p key={w} className="text-muted mt-2 text-xs text-amber-200">
                <JargonText text={w} />
              </p>
            ))}

            <ul className="mt-4 space-y-2">
              {node.subTasks.map((st) => (
                <li key={st.id}>
                  <TaskToggle
                    subTaskId={st.id}
                    label={st.label}
                    hint={st.hint}
                    checked={st.done}
                    disabled={isLocked}
                    onToggled={onToggled}
                  />
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={`/app/journey/${node.id}`}
                className="btn-ghost rounded-md px-3 py-1.5 text-xs font-semibold"
              >
                Overview
              </Link>
              {isLocked ? (
                <span className="text-muted px-3 py-1.5 text-xs">Walkthrough locked</span>
              ) : (
                <Link
                  href={`/app/tasks/${node.id}`}
                  className="btn-primary rounded-md px-3 py-1.5 text-xs font-semibold"
                >
                  Guided walkthrough
                </Link>
              )}
              {node.id === "product-selection" ? (
                <button
                  type="button"
                  onClick={handleProductReset}
                  disabled={isResetting}
                  className="btn-ghost inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-xs font-semibold"
                >
                  <RotateCcw className="h-3 w-3" />
                  Pick new product
                </button>
              ) : null}
            </div>
          </article>
        );
      })}
    </div>
  );
}
