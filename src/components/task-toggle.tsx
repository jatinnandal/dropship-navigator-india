"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";
import { toggleSubTask } from "@/app/app/journey/actions";

type Props = {
  subTaskId: string;
  label: string;
  hint?: string;
  howToSteps?: string[];
  walkthroughHref?: string;
  checked: boolean;
  disabled?: boolean;
  onToggled?: (subTaskId: string, checked: boolean) => void;
};

export function TaskToggle({
  subTaskId,
  label,
  hint,
  howToSteps,
  walkthroughHref,
  checked,
  disabled,
  onToggled,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    if (disabled || isPending) return;
    const next = !checked;
    startTransition(async () => {
      await toggleSubTask(subTaskId, next);
      onToggled?.(subTaskId, next);
    });
  }

  const hasGuide = (howToSteps?.length ?? 0) > 0;

  return (
    <div
      className={`rounded-lg border transition ${
        checked
          ? "border-emerald-400/40 bg-emerald-400/10"
          : "border-slate-700/60 bg-slate-900/20 hover:border-slate-600"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-2 px-3 py-2.5">
        <label className="flex min-h-[44px] min-w-0 flex-1 cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={handleChange}
            disabled={disabled || isPending}
            className="mt-2.5 h-5 w-5 flex-none rounded border-slate-600 accent-amber-400"
          />
          <span className="min-w-0 flex-1 py-1">
            <span className="block text-sm text-slate-100">{label}</span>
            {hint ? <span className="text-muted mt-0.5 block text-xs">{hint}</span> : null}
          </span>
        </label>
        {hasGuide ? (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="flex min-h-[44px] min-w-[44px] flex-none items-center justify-center rounded-md text-muted hover:text-amber-200"
            aria-expanded={expanded}
            aria-label="How to complete"
          >
            <ChevronDown className={`h-4 w-4 transition ${expanded ? "rotate-180" : ""}`} />
          </button>
        ) : null}
      </div>
      {expanded && hasGuide ? (
        <div className="border-t border-slate-700/50 px-3 pb-3 pt-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-200">How to complete</p>
          <ol className="text-muted mt-2 list-decimal space-y-1 pl-5 text-xs">
            {howToSteps!.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          {walkthroughHref ? (
            <Link href={walkthroughHref} className="mt-2 inline-block text-xs font-semibold text-amber-200 underline">
              Open guided walkthrough
            </Link>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
