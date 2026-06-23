"use client";

import { useTransition } from "react";
import { toggleSubTask } from "@/app/app/journey/actions";

type Props = {
  subTaskId: string;
  label: string;
  hint?: string;
  checked: boolean;
  disabled?: boolean;
  onToggled?: (subTaskId: string, checked: boolean) => void;
};

export function TaskToggle({ subTaskId, label, hint, checked, disabled, onToggled }: Props) {
  const [isPending, startTransition] = useTransition();

  function handleChange() {
    if (disabled || isPending) return;
    const next = !checked;
    startTransition(async () => {
      await toggleSubTask(subTaskId, next);
      onToggled?.(subTaskId, next);
    });
  }

  return (
    <label
      className={`flex cursor-pointer items-start gap-3 rounded-lg border px-3 py-2.5 transition ${
        checked
          ? "border-emerald-400/40 bg-emerald-400/10"
          : "border-slate-700/60 bg-slate-900/20 hover:border-slate-600"
      } ${disabled ? "cursor-not-allowed opacity-50" : ""}`}
    >
      <input
        type="checkbox"
        checked={checked}
        onChange={handleChange}
        disabled={disabled || isPending}
        className="mt-1 h-4 w-4 rounded border-slate-600 accent-amber-400"
      />
      <span className="min-w-0 flex-1">
        <span className="block text-sm text-slate-100">{label}</span>
        {hint ? <span className="text-muted mt-0.5 block text-xs">{hint}</span> : null}
      </span>
    </label>
  );
}
