"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import {
  VERIFICATION_STEPS,
  CATEGORY_LABELS,
  type VerificationStep,
} from "@/lib/verification-checklist-data";

const STORAGE_KEY = "dni-verification";

type StepState = {
  value: string;
  confirmed: boolean;
  status: "pending" | "valid" | "invalid";
};

type ChecklistState = Record<string, StepState>;

function getInitialState(): ChecklistState {
  if (typeof window === "undefined") return {};
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  const state: ChecklistState = {};
  for (const step of VERIFICATION_STEPS) {
    state[step.id] = { value: "", confirmed: false, status: "pending" };
  }
  return state;
}

function validateGSTIN(val: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[A-Z0-9]{1}[Z]{1}[A-Z0-9]{1}$/.test(
    val.toUpperCase()
  );
}

function validatePAN(val: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(val.toUpperCase());
}

function validateURL(val: string): boolean {
  try {
    const url = new URL(val);
    return /amazon\.in|flipkart\.com|meesho\.com/.test(url.hostname);
  } catch {
    return false;
  }
}

function validateStep(step: VerificationStep, value: string): "valid" | "invalid" | "pending" {
  if (!value.trim()) return "pending";
  switch (step.id) {
    case "gstin":
      return validateGSTIN(value) ? "valid" : "invalid";
    case "pan":
      return validatePAN(value) ? "valid" : "invalid";
    case "listing-url":
      return validateURL(value) ? "valid" : "invalid";
    default:
      return "valid";
  }
}

function StepCard({
  step,
  state,
  onChange,
}: {
  step: VerificationStep;
  state: StepState;
  onChange: (id: string, update: Partial<StepState>) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const isComplete =
    step.verificationType === "confirmation" || step.verificationType === "upload-confirm"
      ? state.confirmed
      : state.status === "valid";

  const borderColor = isComplete
    ? "border-[var(--success)]/40"
    : state.status === "invalid"
    ? "border-[var(--danger)]/40"
    : "border-white/10";

  const handleInputChange = (val: string) => {
    const status = validateStep(step, val);
    onChange(step.id, { value: val, status });
  };

  const handleConfirm = (checked: boolean) => {
    onChange(step.id, { confirmed: checked, status: checked ? "valid" : "pending" });
  };

  return (
    <div className={`rounded-xl border ${borderColor} bg-white/[0.03] p-5 transition-colors`}>
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isComplete
              ? "bg-[var(--success)]/20 text-[var(--success)]"
              : state.status === "invalid"
              ? "bg-[var(--danger)]/20 text-[var(--danger)]"
              : "bg-white/[0.06] text-[var(--text-faint)]"
          }`}
        >
          {isComplete ? (
            <Check className="h-3 w-3" />
          ) : state.status === "invalid" ? (
            <AlertCircle className="h-3 w-3" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-white/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-[var(--body-text)]">{step.label}</label>

          {/* Input field */}
          {(step.verificationType === "text-input" || step.verificationType === "url-input") && (
            <div className="mt-2">
              <input
                type={step.verificationType === "url-input" ? "url" : "text"}
                value={state.value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={step.placeholder}
                className={`w-full rounded-lg border bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[var(--text-faint)] focus:outline-none focus:ring-1 transition-colors ${
                  state.status === "invalid"
                    ? "border-[var(--danger)]/40 focus:ring-[var(--danger)]/40"
                    : state.status === "valid"
                    ? "border-[var(--success)]/40 focus:ring-[var(--success)]/40"
                    : "border-white/10 focus:ring-white/25"
                }`}
              />
              {state.status === "invalid" && step.validationHint && (
                <p className="mt-1.5 text-xs text-[var(--danger)]">{step.validationHint}</p>
              )}
            </div>
          )}

          {/* Confirmation checkbox */}
          {(step.verificationType === "confirmation" ||
            step.verificationType === "upload-confirm") && (
            <label className="mt-2 flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={state.confirmed}
                onChange={(e) => handleConfirm(e.target.checked)}
                className="h-4 w-4 rounded border-white/10 bg-white/[0.03] text-[var(--success)] focus:ring-[var(--success)]/30"
              />
              <span className="text-sm text-[var(--muted)]">I confirm this is done</span>
            </label>
          )}

          {/* Why this matters */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-white/80 hover:text-white transition-colors"
          >
            Why this matters
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expanded && (
            <p className="mt-1.5 text-xs leading-relaxed text-[var(--muted)]">
              {step.whyItMatters}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export function VerificationChecklist() {
  const [state, setState] = useState<ChecklistState>(getInitialState);

  // Hydrate from localStorage after mount
  useEffect(() => {
    setState(getInitialState());
  }, []);

  // Persist to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {}
  }, [state]);

  const handleChange = useCallback((id: string, update: Partial<StepState>) => {
    setState((prev) => ({
      ...prev,
      [id]: { ...prev[id], ...update },
    }));
  }, []);

  const totalSteps = VERIFICATION_STEPS.length;
  const completedSteps = VERIFICATION_STEPS.filter((s) => {
    const st = state[s.id];
    if (!st) return false;
    if (s.verificationType === "confirmation" || s.verificationType === "upload-confirm") {
      return st.confirmed;
    }
    return st.status === "valid";
  }).length;

  const progressPercent = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  // Group by category
  const categories = Array.from(new Set(VERIFICATION_STEPS.map((s) => s.category)));

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-[var(--body-text)] font-medium">
            {completedSteps} of {totalSteps} verified
          </span>
          <span
            className={`font-semibold ${
              progressPercent === 100
                ? "text-[var(--success)]"
                : progressPercent > 50
                ? "text-white"
                : "text-[var(--muted)]"
            }`}
          >
            {Math.round(progressPercent)}%
          </span>
        </div>
        <div className="progress-track mt-2 h-2 rounded-full">
          <div
            className="progress-fill h-full rounded-full transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Steps grouped by category */}
      {categories.map((category) => {
        const steps = VERIFICATION_STEPS.filter((s) => s.category === category);
        return (
          <div key={category}>
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--muted)]">
              {CATEGORY_LABELS[category]}
            </h3>
            <div className="space-y-3">
              {steps.map((step) => (
                <StepCard
                  key={step.id}
                  step={step}
                  state={state[step.id] ?? { value: "", confirmed: false, status: "pending" }}
                  onChange={handleChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
