"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import type { CrisisType } from "@/lib/crisis/types";
import { CRISIS_LABELS, SELF_REPORT_CRISIS_TYPES } from "@/lib/crisis/types";
import { reportCrisis } from "@/app/app/crisis/actions";

type Props = {
  className?: string;
};

export function CrisisEntryButton({ className }: Props) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<CrisisType | null>(null);

  async function handleReport(type: CrisisType) {
    setPending(type);
    await reportCrisis(type);
    setPending(null);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className ?? "text-muted mt-4 text-xs underline hover:text-amber-200"}
      >
        Something went wrong?
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/70 p-4 sm:items-center"
          role="dialog"
          aria-modal="true"
          aria-labelledby="crisis-picker-title"
        >
          <div className="glass-panel w-full max-w-md rounded-xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
              <div>
                <h2 id="crisis-picker-title" className="text-lg font-bold text-slate-100">
                  What happened?
                </h2>
                <p className="text-muted mt-1 text-sm">
                  We&apos;ll switch to a step-by-step recovery plan — not a document wall.
                </p>
              </div>
            </div>
            <ul className="mt-5 space-y-2">
              {SELF_REPORT_CRISIS_TYPES.map((type) => (
                <li key={type}>
                  <button
                    type="button"
                    disabled={pending !== null}
                    onClick={() => void handleReport(type)}
                    className="btn-ghost w-full min-h-[48px] rounded-md px-4 py-3 text-left text-sm font-medium"
                  >
                    {pending === type ? "Starting protocol…" : CRISIS_LABELS[type]}
                  </button>
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="btn-ghost mt-4 w-full min-h-[44px] rounded-md text-sm font-medium"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
