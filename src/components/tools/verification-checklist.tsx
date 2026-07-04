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

function validateBankAccount(val: string): boolean {
  return /^[0-9]{9,18}$/.test(val.replace(/\s/g, ""));
}

function validateNumeric(val: string): boolean {
  return /^[0-9]+(\.[0-9]{1,2})?$/.test(val.trim());
}

function validateStep(step: VerificationStep, value: string): "valid" | "invalid" | "pending" {
  if (!value.trim()) return "pending";
  switch (step.id) {
    case "gstin":
      return validateGSTIN(value) ? "valid" : "invalid";
    case "pan":
      return validatePAN(value) ? "valid" : "invalid";
    case "bank-account":
      return validateBankAccount(value) ? "valid" : "invalid";
    case "listing-url":
      return validateURL(value) ? "valid" : "invalid";
    case "tcs-amount":
      return validateNumeric(value) ? "valid" : "invalid";
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
    ? "border-emerald-500/40"
    : state.status === "invalid"
    ? "border-rose-500/40"
    : "border-slate-700/50";

  const handleInputChange = (val: string) => {
    const status = validateStep(step, val);
    onChange(step.id, { value: val, status });
  };

  const handleConfirm = (checked: boolean) => {
    onChange(step.id, { confirmed: checked, status: checked ? "valid" : "pending" });
  };

  return (
    <div className={`rounded-xl border ${borderColor} bg-slate-900/30 p-5 transition-colors`}>
      <div className="flex items-start gap-3">
        {/* Status indicator */}
        <div
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
            isComplete
              ? "bg-emerald-500/20 text-emerald-400"
              : state.status === "invalid"
              ? "bg-rose-500/20 text-rose-400"
              : "bg-slate-700/50 text-slate-500"
          }`}
        >
          {isComplete ? (
            <Check className="h-3 w-3" />
          ) : state.status === "invalid" ? (
            <AlertCircle className="h-3 w-3" />
          ) : (
            <span className="h-2 w-2 rounded-full bg-amber-400/60" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-slate-200">{step.label}</label>

          {/* Input field */}
          {(step.verificationType === "text-input" || step.verificationType === "url-input") && (
            <div className="mt-2">
              <input
                type={step.verificationType === "url-input" ? "url" : "text"}
                value={state.value}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder={step.placeholder}
                className={`w-full rounded-lg border bg-slate-900/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 transition-colors ${
                  state.status === "invalid"
                    ? "border-rose-500/50 focus:ring-rose-500/50"
                    : state.status === "valid"
                    ? "border-emerald-500/50 focus:ring-emerald-500/50"
                    : "border-slate-700 focus:ring-amber-500/50"
                }`}
              />
              {state.status === "invalid" && step.validationHint && (
                <p className="mt-1.5 text-xs text-rose-400">{step.validationHint}</p>
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
                className="h-4 w-4 rounded border-slate-600 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
              />
              <span className="text-sm text-slate-400">I confirm this is done</span>
            </label>
          )}

          {/* Why this matters */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="mt-2 inline-flex items-center gap-1 text-xs text-amber-400/80 hover:text-amber-300 transition-colors"
          >
            Why this matters
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expanded && (
            <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
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
      <div className="rounded-lg border border-slate-700/50 bg-slate-900/30 p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-300 font-medium">
            {completedSteps} of {totalSteps} verified
          </span>
          <span
            className={`font-semibold ${
              progressPercent === 100
                ? "text-emerald-400"
                : progressPercent > 50
                ? "text-amber-400"
                : "text-slate-400"
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
            <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
