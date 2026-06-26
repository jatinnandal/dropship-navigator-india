"use client";

import Link from "next/link";
import { useState } from "react";
import {
  defaultValueForField,
  ONBOARDING_STEPS,
  type OnboardingField,
} from "@/lib/onboarding-steps";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { saveOnboardingProfile } from "@/app/onboarding/actions";

type Props = {
  profile: OnboardingProfile;
};

export function OnboardingWizard({ profile }: Props) {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<OnboardingField, string>>(() => {
    const init = {} as Record<OnboardingField, string>;
    for (const step of ONBOARDING_STEPS) {
      init[step.field] = defaultValueForField(step.field, profile);
    }
    return init;
  });

  const step = ONBOARDING_STEPS[stepIndex];
  const progress = Math.round(((stepIndex + 1) / ONBOARDING_STEPS.length) * 100);
  const isLast = stepIndex === ONBOARDING_STEPS.length - 1;

  function setField(field: OnboardingField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
  }

  function canContinue(): boolean {
    const val = values[step.field]?.trim();
    if (!val) return false;
    return true;
  }

  return (
    <section className="glass-panel rounded-xl p-6 sm:p-8">
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>
            Step {stepIndex + 1} of {ONBOARDING_STEPS.length}
          </span>
          <span>{progress}%</span>
        </div>
        <div className="progress-track h-1.5">
          <div className="progress-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <h1 className="headline-gradient text-2xl font-bold sm:text-3xl">{step.label}</h1>
      <p className="text-muted mt-2 text-sm leading-6">{step.why}</p>
      {step.mentorNote ? (
        <p className="meta-tile mt-3 text-sm text-amber-200">{step.mentorNote}</p>
      ) : null}

      <form action={saveOnboardingProfile} className="mt-6">
        {ONBOARDING_STEPS.map((s) => (
          <input key={s.field} type="hidden" name={s.field} value={values[s.field] ?? ""} />
        ))}

        {step.inputType === "text" ? (
          <input
            id={step.field}
            value={values[step.field] ?? ""}
            onChange={(e) => setField(step.field, e.target.value)}
            placeholder={step.placeholder}
            className="mt-4 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm"
          />
        ) : (
          <div className="mt-4 space-y-2">
            {step.options?.map((opt) => {
              const selected = values[step.field] === opt.value;
              return (
                <label
                  key={opt.value}
                  className={`flex min-h-[44px] cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 transition ${
                    selected
                      ? "border-amber-300/50 bg-amber-400/10"
                      : "border-slate-700/60 bg-slate-900/20 hover:border-slate-600"
                  }`}
                >
                  <input
                    type="radio"
                    name={`wizard-${step.field}`}
                    checked={selected}
                    onChange={() => setField(step.field, opt.value)}
                    className="mt-1 accent-amber-400"
                  />
                  <span>
                    <span className="block text-sm font-medium text-slate-100">{opt.label}</span>
                    {opt.description ? (
                      <span className="text-muted mt-0.5 block text-xs">{opt.description}</span>
                    ) : null}
                  </span>
                </label>
              );
            })}
          </div>
        )}

        <div className="mt-8 flex flex-wrap gap-3">
          {stepIndex > 0 ? (
            <button
              type="button"
              onClick={() => setStepIndex((i) => i - 1)}
              className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-semibold"
            >
              Back
            </button>
          ) : null}
          {!isLast ? (
            <button
              type="button"
              disabled={!canContinue()}
              onClick={() => setStepIndex((i) => i + 1)}
              className="btn-primary min-h-[44px] rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Continue
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canContinue()}
              className="btn-primary min-h-[44px] rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-50"
            >
              Save and start journey
            </button>
          )}
          <Link href="/app" className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-semibold">
            Skip for now
          </Link>
        </div>
      </form>
    </section>
  );
}
