"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowRight, Lock, RotateCcw, Compass } from "lucide-react";
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

/* ── Descriptions per module for the detail panel ── */
const MODULE_DESCRIPTIONS: Record<string, string> = {
  "common-documentation":
    "Master document folder, GSTIN, bank match, and the GST filing calendar - the paperwork that unlocks every marketplace.",
  "product-selection":
    "Shortlist products with real margin math - marketplace fees, TCS, shipping and RTO weighting included.",
  "supplier-sourcing":
    "Vet suppliers systematically and get terms in writing before any money moves.",
  "compliance-by-product":
    "HSN codes and category certificates for your launch SKUs.",
  "channel-launch":
    "Seller account, first hero SKU live, payout setup, and COD confirmation practice.",
  "ads-growth":
    "Break-even ROAS first, then a controlled ad test. Locked until your listing is live.",
  "tracking-analytics":
    "Weekly P&L, settlement reconciliation, and GSTR-8 / TCS review.",
};

const STATUS_TITLES: Record<string, string> = {
  done: "COMPLETED",
  in_progress: "YOU ARE HERE",
  available: "OPEN",
  locked: "LOCKED",
};

type Props = {
  nodes: JourneyNode[];
  modules?: JourneyModule[];
  hasProfile?: boolean;
  profileLine?: string | null;
  completedStages?: number;
  totalStages?: number;
  doneSteps?: number;
  totalSteps?: number;
  routePercent?: number;
  primaryChannel?: string;
  productType?: string;
  /** State-aware mentor line per module id, computed server-side. */
  mentorNotes?: Record<string, string>;
  /** Module IDs locked behind a paid plan. */
  planLockedModuleIds?: string[];
};

export function JourneyMap({
  nodes,
  modules = [],
  hasProfile = true,
  profileLine,
  completedStages = 0,
  totalStages = 7,
  doneSteps = 0,
  totalSteps = 22,
  routePercent = 0,
  mentorNotes,
  planLockedModuleIds = [],
}: Props) {
  const planLockedSet = new Set(planLockedModuleIds);
  const router = useRouter();
  const warningsRef = useRef<HTMLDivElement>(null);
  const [selectedId, setSelectedId] = useState<TaskModuleId>(
    () => nodes.find((n) => n.status === "in_progress")?.id ?? nodes[0]?.id ?? "product-selection",
  );
  const [isResetting, startReset] = useTransition();

  const selected = nodes.find((n) => n.id === selectedId) ?? nodes[0];
  const selectedModule = modules.find((m) => m.id === selected?.id);

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

  const isPlanLocked = planLockedSet.has(selected.id);
  const isLocked = selected.status === "locked" || isPlanLocked;
  const nextIncomplete = selected.subTasks.find((st) => !st.done);
  const nextEstimate = nextIncomplete
    ? SUBTASK_TIME_ESTIMATES[nextIncomplete.id] ?? "~30-45 mins"
    : "Stage complete";

  /* Compute selection details. selPct mirrors the guided walkthrough's step
     progress (set on the node upstream) so the ring matches what the seller
     sees inside the module. selDone still drives the milestone checklist. */
  const selDone = selected.subTasks.filter((st) => st.done).length;
  const selPct = selected.progressPercent;

  const statusColor =
    selected.status === "done"
      ? "var(--success-text)"
      : selected.status === "in_progress"
        ? "#ffffff"
        : selected.status === "locked"
          ? "#5a5a5a"
          : "#c9c9c9";

  const borderColor =
    selected.status === "done"
      ? "oklch(0.72 0.13 165 / 0.3)"
      : selected.status === "in_progress"
        ? "rgba(255,255,255,0.28)"
        : "rgba(255,255,255,0.12)";

  const ringBg =
    selected.status === "done"
      ? "conic-gradient(oklch(0.72 0.13 165) 0deg 360deg, rgba(255,255,255,0.07) 0deg)"
      : `conic-gradient(#ffffff 0deg ${selPct * 3.6}deg, rgba(255,255,255,0.08) ${selPct * 3.6}deg 360deg)`;

  const statusLabel =
    selected.status === "in_progress"
      ? `● YOU ARE HERE - STAGE ${nodes.findIndex((n) => n.id === selected.id) + 1}`
      : selected.status === "done"
        ? `✓ ${STATUS_TITLES.done} - STAGE ${nodes.findIndex((n) => n.id === selected.id) + 1}`
        : selected.status === "locked"
          ? `LOCKED - STAGE ${nodes.findIndex((n) => n.id === selected.id) + 1}`
          : `${STATUS_TITLES.available} - STAGE ${nodes.findIndex((n) => n.id === selected.id) + 1}`;

  const description =
    MODULE_DESCRIPTIONS[selected.id] ?? selectedModule?.description ?? "";
  const mentorNote =
    selected.status === "done"
      ? getModuleCompletionMessage(selected.id)
      : mentorNotes?.[selected.id] ??
        "One step at a time - you're building a real business, not chasing a hack.";

  return (
    <div className="space-y-0">
      {/* ── Header ── */}
      <div
        className="flex flex-wrap items-end justify-between gap-5"
        style={{ padding: "0 4px 20px" }}
      >
        <div>
          <p className="eyebrow">The route</p>
          <h1
            className="mt-2.5 text-[27px] font-semibold leading-tight text-white"
            style={{ letterSpacing: "-0.03em" }}
          >
            Your launch{" "}
            <span className="font-serif-accent">route.</span>
          </h1>
          {profileLine ? (
            <p className="font-mono mt-2 text-xs" style={{ color: "#6e6e6e" }}>
              {profileLine}
            </p>
          ) : null}
        </div>

        {/* Stats cluster */}
        <div className="panel flex items-center gap-[18px] px-5 py-3.5">
          <div>
            <p className="mono-label-sm">Stages</p>
            <p className="mono-data mt-[3px] text-[17px] text-white">
              {completedStages}
              <span style={{ color: "#5a5a5a" }}>/{totalStages}</span>
            </p>
          </div>
          <div
            className="h-8"
            style={{ width: "1px", background: "rgba(255,255,255,0.12)" }}
          />
          <div>
            <p className="mono-label-sm">Steps</p>
            <p className="mono-data mt-[3px] text-[17px] text-white">
              {doneSteps}
              <span style={{ color: "#5a5a5a" }}>/{totalSteps}</span>
            </p>
          </div>
          <div
            className="h-8"
            style={{ width: "1px", background: "rgba(255,255,255,0.12)" }}
          />
          <div>
            <p className="mono-label-sm">Route</p>
            <p className="mono-data mt-[3px] text-[17px] text-white">
              {routePercent}%
            </p>
          </div>
        </div>
      </div>

      {/* ── Expedition map ── */}
      <div className="hidden md:block">
        <JourneyGraphView nodes={nodes} selectedId={selectedId} onSelect={handleSelect} planLockedSet={planLockedSet} />
      </div>
      <div className="md:hidden">
        <JourneyTimelineMobile nodes={nodes} selectedId={selectedId} onSelect={handleSelect} planLockedSet={planLockedSet} />
      </div>

      {/* ── Detail + Mentor panels ── */}
      <section className="mt-[18px] grid grid-cols-1 items-start gap-3.5 lg:[grid-template-columns:1.5fr_1fr]">
        {/* Detail panel */}
        <article
          className="panel"
          style={{
            borderRadius: "20px",
            padding: "26px 28px",
            borderColor: borderColor,
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <div>
              <p
                className="font-mono text-[10px] font-medium uppercase"
                style={{ letterSpacing: "0.15em", color: statusColor }}
              >
                {statusLabel}
              </p>
              <h2
                className="mt-2 text-[21px] font-semibold text-white"
                style={{ letterSpacing: "-0.025em" }}
              >
                {selected.title}
              </h2>
            </div>
            {/* Progress ring */}
            <div
              className="flex-shrink-0 grid place-items-center"
              style={{
                width: "52px",
                height: "52px",
                borderRadius: "50%",
                background: ringBg,
              }}
            >
              <div
                className="grid place-items-center font-mono text-[11px]"
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "#060606",
                  color: statusColor,
                }}
              >
                {selPct}%
              </div>
            </div>
          </div>

          <p
            className="mt-3 text-[13.5px] leading-relaxed"
            style={{ color: "#8a8a8a" }}
          >
            {description}
          </p>

          {/* Blocked-by notice */}
          {selected.blockedBy.length > 0 ? (
            <div className="banner-deadline mt-4 px-4 py-3">
              <p className="text-xs font-medium text-white">Locked until:</p>
              <ul className="mt-1 list-disc pl-4 text-xs" style={{ color: "var(--danger-text)" }}>
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

          {/* Warnings */}
          {selected.softWarnings.length > 0 ? (
            <div ref={warningsRef} className="mt-3 space-y-2">
              {selected.softWarnings.map((w) => (
                <p key={w} className="meta-tile text-xs" style={{ color: "#8a8a8a" }}>
                  {w}
                </p>
              ))}
            </div>
          ) : null}

          {/* Sub-tasks */}
          {isPlanLocked ? (
            <div className="mt-[18px] rounded-[13px] border border-white/[0.12] bg-[rgba(255,255,255,0.03)] px-5 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faintest)]">
                Starter plan feature
              </p>
              <p className="mt-2 text-[13.5px] leading-relaxed text-[var(--muted)]">
                This module is part of the full 7-module guided journey. Upgrade to unlock all modules, walkthroughs, and personalized steps.
              </p>
              <Link
                href="/app/plans"
                className="btn-primary mt-4 inline-flex items-center gap-2.5 rounded-[11px] px-5 py-3 text-[13.5px]"
              >
                Upgrade to unlock
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          ) : (
            <div className="mt-[18px] flex flex-col gap-2">
              {selected.subTasks.length > 0 ? (
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--text-faintest)]">
                  Milestones &middot; {selDone}/{selected.subTasks.length} done
                </p>
              ) : null}
              {selected.subTasks.map((st) => {
                const done = st.done;
                const bg = done ? "oklch(0.72 0.13 165 / 0.05)" : "rgba(255,255,255,0.03)";
                const border = done ? "oklch(0.72 0.13 165 / 0.22)" : "rgba(255,255,255,0.09)";

                return (
                  <div
                    key={st.id}
                    className="flex items-start gap-[13px] rounded-[13px] px-4 py-[13px] transition-colors"
                    style={{
                      background: bg,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <div className="mt-0.5">
                      <TaskToggle
                        subTaskId={st.id}
                        label={st.label}
                        hint={st.hint ?? ""}
                        checked={done}
                        disabled={isLocked}
                        onToggled={onToggled}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* CTA button */}
          {isPlanLocked ? null : !isLocked ? (
            <div className="mt-[18px] flex flex-wrap items-center gap-3">
              <Link
                href={`/app/tasks/${selected.id}`}
                className="btn-primary inline-flex items-center gap-2.5 rounded-[11px] px-5 py-3 text-[13.5px]"
              >
                Open guided walkthrough
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              {selected.id === "product-selection" ? (
                <button
                  type="button"
                  onClick={handleProductReset}
                  disabled={isResetting}
                  className="btn-ghost inline-flex items-center gap-1.5 rounded-[11px] px-4 py-3 text-[13px]"
                >
                  <RotateCcw className="h-3 w-3" />
                  Pick new product
                </button>
              ) : null}
            </div>
          ) : (
            <div className="mt-[18px] flex items-center gap-2 text-xs" style={{ color: "#5a5a5a" }}>
              <Lock className="h-3.5 w-3.5" />
              <span>Walkthrough locked</span>
            </div>
          )}
        </article>

        {/* ── Mentor panel ── */}
        <aside
          className="panel"
          style={{
            borderRadius: "20px",
            padding: "24px",
            borderColor: "rgba(255,255,255,0.12)",
          }}
        >
          <div className="flex items-center gap-[11px]">
            <div
              className="grid place-items-center rounded-full bg-white text-black"
              style={{ width: "36px", height: "36px" }}
            >
              <Compass className="h-4 w-4" />
            </div>
            <p
              className="font-mono text-[10.5px] font-semibold uppercase"
              style={{ letterSpacing: "0.16em", color: "#9a9a9a" }}
            >
              Mentor&apos;s read
            </p>
          </div>

          <p
            className="mt-4 text-[13.5px] leading-[1.7]"
            style={{ color: "#b8b8b8" }}
          >
            <span className="font-serif-accent text-[15px] text-white">&ldquo;</span>
            {mentorNote}
            <span className="font-serif-accent text-[15px] text-white">&rdquo;</span>
          </p>

          <div
            className="mt-[18px] border-t pt-4"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
          >
            <p className="mono-label-sm">Next step estimate</p>
            <p className="mono-data mt-1.5 text-[15px] text-white">
              {nextEstimate}
            </p>
          </div>

          {hasProfile ? (
            <div className="mt-3.5">
              <p className="mono-label-sm">Personalized for</p>
              <p
                className="mt-1.5 text-[12.5px] font-medium leading-relaxed"
                style={{ color: "#8a8a8a" }}
              >
                {profileLine ?? "Default profile"}
              </p>
            </div>
          ) : null}
        </aside>
      </section>
    </div>
  );
}
