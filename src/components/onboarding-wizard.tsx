"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, FileCheck, Package, Rocket } from "lucide-react";
import CountUp from "@/components/CountUp";
import { OnboardingFinishButton, OnboardingFinishOverlay } from "@/components/onboarding-finish";
import { Reveal } from "@/components/motion/reveal";
import {
  defaultValueForField,
  getAckForSelection,
  ONBOARDING_STEPS,
  type OnboardingField,
} from "@/lib/onboarding-steps";
import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import { saveOnboardingProfile } from "@/app/onboarding/actions";

type Props = {
  profile: OnboardingProfile;
  mode?: "create" | "edit";
  profileId?: string;
  profileName?: string;
  originalChannel?: PrimaryChannel;
  returnTo?: string;
  title?: string;
  introDescription?: string;
  skipIntroOnEdit?: boolean;
};

const INTRO_MODULES = [
  { icon: FileCheck, label: "Legal & GST" },
  { icon: Package, label: "Product & sourcing" },
  { icon: Rocket, label: "Launch & grow" },
];

const WHY_FIELDS = new Set<OnboardingField>(["experienceLevel", "budgetBand", "hasGstin"]);

export function OnboardingWizard({
  profile,
  mode = "create",
  profileId,
  profileName: initialProfileName,
  originalChannel,
  returnTo,
  title = "Build your launch plan",
  introDescription = "One focus at a time — your answers shape module order, compliance priority, and tool picks.",
  skipIntroOnEdit = false,
}: Props) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState<"intro" | "quiz">(skipIntroOnEdit ? "quiz" : "intro");
  const [stepIndex, setStepIndex] = useState(0);
  const [ackMessage, setAckMessage] = useState<string | null>(null);
  const [channelWarningAcked, setChannelWarningAcked] = useState(false);
  const [profileName, setProfileName] = useState(initialProfileName ?? "");
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
  const minsLeft = Math.max(1, Math.ceil(((ONBOARDING_STEPS.length - stepIndex - 1) * 30) / 60));
  const showWhy = WHY_FIELDS.has(step?.field);

  const channelChanged =
    mode === "edit" &&
    originalChannel &&
    values.primaryChannel !== originalChannel &&
    !channelWarningAcked;

  useEffect(() => {
    if (!ackMessage) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const t = setTimeout(() => setAckMessage(null), 2400);
    return () => clearTimeout(t);
  }, [ackMessage, stepIndex]);

  function setField(field: OnboardingField, value: string) {
    setValues((prev) => ({ ...prev, [field]: value }));
    if (field === "primaryChannel" && value === originalChannel) {
      setChannelWarningAcked(false);
    }
  }

  function canContinue(): boolean {
    return Boolean(step && values[step.field]?.trim());
  }

  function advanceStep() {
    const ack = getAckForSelection(step, values[step.field] ?? "");
    if (ack) setAckMessage(ack);
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = ack && !prefersReduced ? 1200 : 0;
    window.setTimeout(() => setStepIndex((i) => i + 1), delay);
  }

  if (phase === "intro") {
    return (
      <Reveal>
        <section className="glass-panel-primary grain mx-auto max-w-2xl rounded-xl p-8 sm:p-10">
          <p className="eyebrow inline-block">{mode === "edit" ? "Edit plan" : "Quick setup"}</p>
          <h1 className="headline-gradient mt-3 text-3xl font-bold">{title}</h1>
          <p className="text-muted mt-4 text-sm leading-6">
            {ONBOARDING_STEPS.length} questions · about 5 minutes. {introDescription}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {INTRO_MODULES.map((item) => {
              const Icon = item.icon;
              return (
                <span key={item.label} className="meta-tile inline-flex items-center gap-2 px-3 py-2 text-sm">
                  <Icon className="h-4 w-4 text-neutral-300" aria-hidden="true" />
                  {item.label}
                </span>
              );
            })}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setPhase("quiz")}
              className="btn-primary inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
            >
              {mode === "edit" ? "Edit answers" : "Start setup"}
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </button>
            <Link
              href={mode === "edit" ? returnTo ?? "/app/profiles" : "/app/welcome"}
              className="btn-ghost inline-flex min-h-[44px] items-center rounded-md px-5 py-2.5 text-sm font-medium"
            >
              Back
            </Link>
          </div>
        </section>
      </Reveal>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <section className="glass-panel grain rounded-xl p-6 sm:p-8 lg:col-span-3">
        <form action={saveOnboardingProfile}>
          <OnboardingFinishOverlay />
          <input type="hidden" name="mode" value={mode} />
          {profileId ? <input type="hidden" name="profileId" value={profileId} /> : null}
          {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
          <input type="hidden" name="profileName" value={profileName} />
          {ONBOARDING_STEPS.map((s) => (
            <input key={s.field} type="hidden" name={s.field} value={values[s.field] ?? ""} />
          ))}

          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>
                Question {stepIndex + 1} of {ONBOARDING_STEPS.length}
              </span>
              <span>
                <CountUp to={progress} duration={0.6} />% · ~{minsLeft} min left
              </span>
            </div>
            <div className="mb-3 flex gap-1">
              {ONBOARDING_STEPS.map((s, i) => (
                <span
                  key={s.id}
                  className={`h-1.5 flex-1 rounded-full transition-colors ${
                    i <= stepIndex ? "bg-amber-400" : "bg-slate-700/80"
                  }`}
                  aria-hidden="true"
                />
              ))}
            </div>
            <div className="progress-track h-1">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>

          {ackMessage ? <p className="meta-tile mb-4 text-sm text-emerald-200">{ackMessage}</p> : null}

          {channelChanged && step?.field === "primaryChannel" ? (
            <div className="mb-4 rounded-lg border border-amber-500/40 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-100">Marketplace change</p>
              <p className="text-muted mt-1 text-sm leading-6">
                Channel launch and ads modules will use the new marketplace copy. Your completed checkmarks stay
                unless you reset those modules manually.
              </p>
              <button
                type="button"
                onClick={() => setChannelWarningAcked(true)}
                className="btn-ghost mt-3 min-h-[40px] rounded-md px-3 py-1.5 text-xs font-medium"
              >
                I understand
              </button>
            </div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={step.id}
              initial={reduced ? false : { opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: -12 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {showWhy ? <p className="eyebrow inline-block">Why we&apos;re asking</p> : null}
              <h1 className={`headline-gradient text-2xl font-bold sm:text-3xl ${showWhy ? "mt-2" : ""}`}>
                {step.label}
              </h1>
              <p className="text-muted mt-2 text-sm leading-6">{step.why}</p>

              {step.inputType === "text" ? (
                <input
                  id={step.field}
                  value={values[step.field] ?? ""}
                  onChange={(e) => setField(step.field, e.target.value)}
                  placeholder={step.placeholder}
                  className="mt-4 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
                />
              ) : (
                <div className="mt-5 space-y-3">
                  {step.options?.map((opt) => {
                    const selected = values[step.field] === opt.value;
                    return (
                      <label
                        key={opt.value}
                        className={`flex min-h-[52px] cursor-pointer items-start gap-3 rounded-lg border px-4 py-3.5 transition ${
                          selected
                            ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]"
                            : "border-slate-700/60 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/50"
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
                            <span className="text-muted mt-0.5 block text-xs leading-5">{opt.description}</span>
                          ) : null}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              {isLast && mode === "create" ? (
                <div className="mt-6">
                  <label htmlFor="profileName" className="text-sm font-medium text-slate-100">
                    Plan name (optional)
                  </label>
                  <input
                    id="profileName"
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    placeholder="e.g. Meesho fashion"
                    className="mt-2 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={() => setStepIndex((i) => i - 1)}
                    className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Back
                  </button>
                ) : skipIntroOnEdit ? (
                  <Link
                    href={returnTo ?? "/app/profiles"}
                    className="btn-ghost inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Back
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setPhase("intro")}
                    className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-medium"
                  >
                    Back
                  </button>
                )}
                {!isLast ? (
                  <button
                    type="button"
                    disabled={!canContinue() || (channelChanged && step?.field === "primaryChannel")}
                    onClick={advanceStep}
                    className="btn-primary min-h-[44px] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
                  >
                    Continue
                  </button>
                ) : (
                  <OnboardingFinishButton
                    disabled={!canContinue() || Boolean(channelChanged && !channelWarningAcked)}
                    label={mode === "edit" ? "Save changes" : undefined}
                  />
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </form>
      </section>

      {step.mentorNote ? (
        <aside className="glass-panel hidden rounded-xl p-6 lg:col-span-2 lg:block">
          <p className="text-xs uppercase tracking-wide text-amber-200">Tip</p>
          <p className="text-muted mt-3 text-sm leading-6">{step.mentorNote}</p>
        </aside>
      ) : null}
    </div>
  );
}
