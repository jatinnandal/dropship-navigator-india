"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Compass } from "lucide-react";
import CountUp from "@/components/CountUp";
import { OnboardingFinishButton, OnboardingFinishOverlay } from "@/components/onboarding-finish";
import {
  defaultValueForField,
  getAckForSelection,
  ONBOARDING_STEPS,
  type OnboardingField,
  type OnboardingStep,
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
  /** Fields locked read-only this edit cycle (material change cap reached). */
  lockedFields?: OnboardingField[];
};

/* Core steps shown in the onboarding quiz UI (rest are confirmed on the final screen). */
const QUIZ_STEP_IDS = ["experience", "budget", "channel", "gstin", "product", "state"];

export function OnboardingWizard({
  profile,
  mode = "create",
  profileId,
  profileName: initialProfileName,
  originalChannel,
  returnTo,
  skipIntroOnEdit = false,
  lockedFields = [],
}: Props) {
  const isLocked = (field: OnboardingField) => lockedFields.includes(field);
  const reduced = useReducedMotion();
  const [stepIndex, setStepIndex] = useState(0);
  const [ackMessage, setAckMessage] = useState<string | null>(null);
  const [channelWarningAcked, setChannelWarningAcked] = useState(false);
  const [profileName, setProfileName] = useState(initialProfileName ?? "");
  const [direction, setDirection] = useState<1 | -1>(1);

  // Filter to the 5 quiz steps
  const quizSteps = ONBOARDING_STEPS.filter((s) => QUIZ_STEP_IDS.includes(s.id));
  const totalSteps = quizSteps.length;

  const [values, setValues] = useState<Record<OnboardingField, string>>(() => {
    const init = {} as Record<OnboardingField, string>;
    for (const step of ONBOARDING_STEPS) {
      init[step.field] = defaultValueForField(step.field, profile);
    }
    // Operating state is now an explicit question - don't pre-assume one on a fresh setup.
    if (mode === "create") init.operatingState = "";
    return init;
  });
  // In create mode, defaults don't count as answers - the user must pick each one.
  const [touched, setTouched] = useState<Set<OnboardingField>>(() =>
    mode === "edit" ? new Set(ONBOARDING_STEPS.map((s) => s.field)) : new Set(),
  );

  // Final screen: confirm the fields we assumed instead of asking (state,
  // business type, sales model, imports, prepackaged).
  const assumedSteps = ONBOARDING_STEPS.filter((s) => !QUIZ_STEP_IDS.includes(s.id));
  const onConfirm = stepIndex === totalSteps;
  const step = quizSteps[Math.min(stepIndex, totalSteps - 1)];
  const isLast = onConfirm;

  const answeredCount = quizSteps.filter((s) => touched.has(s.field)).length;
  const percentDone = Math.round((answeredCount / totalSteps) * 100);

  const channelChanged =
    mode === "edit" &&
    originalChannel &&
    values.primaryChannel !== originalChannel &&
    !channelWarningAcked;

  useEffect(() => {
    if (!ackMessage) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const t = setTimeout(() => setAckMessage(null), 3500);
    return () => clearTimeout(t);
  }, [ackMessage, stepIndex]);

  function setField(field: OnboardingField, value: string) {
    if (isLocked(field)) return; // read-only this cycle (change cap reached)
    setValues((prev) => ({ ...prev, [field]: value }));
    setTouched((prev) => new Set(prev).add(field));
    // Show ack immediately on selection
    const currentStep = quizSteps[stepIndex];
    if (currentStep) {
      const ack = getAckForSelection(currentStep, value);
      if (ack) setAckMessage(ack);
      else setAckMessage(null);
    }
    if (field === "primaryChannel" && value === originalChannel) {
      setChannelWarningAcked(false);
    }
  }

  function canContinue(): boolean {
    if (onConfirm) return true;
    return Boolean(step && touched.has(step.field) && values[step.field]?.trim());
  }

  function goBack() {
    setDirection(-1);
    setAckMessage(null);
    setStepIndex((i) => Math.max(0, i - 1));
  }

  function advanceStep() {
    setDirection(1);
    setAckMessage(null);
    setStepIndex((i) => i + 1);
  }

  const routeSummary =
    answeredCount === 0
      ? "Answer to start shaping your route"
      : `${answeredCount} of ${totalSteps} answers shaping your launch plan`;

  return (
    <div className="mx-auto w-full max-w-[62rem] px-4 sm:px-8">
      {/* Header */}
      <header className="flex items-center justify-between py-6">
        <div className="inline-flex items-center gap-2.5">
          <span className="grid h-[30px] w-[30px] place-items-center rounded-lg border border-white/[0.18] bg-[#0c0c0c]"
            style={{ boxShadow: "0 0 18px -4px rgba(255,255,255,0.2)" }}>
            <svg width="13" height="13" viewBox="0 0 16 16"><path d="M8 1 L14 14 L8 10.5 L2 14 Z" fill="#ffffff" /></svg>
          </span>
          <span className="text-sm font-semibold tracking-tight text-white">Navigator</span>
        </div>
        <Link
          href={returnTo ?? "/"}
          className="text-[13px] font-medium text-[var(--text-faintest)] hover:text-white transition-colors"
        >
          Exit setup
        </Link>
      </header>

      {/* Two-column layout - rail stacks below the quiz on mobile */}
      <main className="grid grid-cols-1 items-start gap-[18px] pb-20 lg:[grid-template-columns:1.55fr_1fr]">
        {/* Quiz card */}
        <section
          className="panel-raised"
          style={{ padding: "34px 36px" }}
        >
          <form action={saveOnboardingProfile}>
            <OnboardingFinishOverlay />
            <input type="hidden" name="mode" value={mode} />
            {profileId ? <input type="hidden" name="profileId" value={profileId} /> : null}
            {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
            <input type="hidden" name="profileName" value={profileName} />
            {ONBOARDING_STEPS.map((s) => (
              <input key={s.field} type="hidden" name={s.field} value={values[s.field] ?? ""} />
            ))}

            {/* Segment progress bar (quiz steps + confirm) */}
            <div className="flex items-center gap-1.5">
              {[...quizSteps.map((s) => s.id), "confirm"].map((id, i) => (
                <div
                  key={id}
                  className="h-[3px] flex-1 rounded-full transition-colors duration-200"
                  style={{
                    background:
                      i < stepIndex
                        ? "var(--success)"
                        : i === stepIndex
                          ? "#ffffff"
                          : "rgba(255,255,255,0.1)",
                  }}
                />
              ))}
            </div>

            {/* Step counter */}
            <p className="mono-label mt-4" style={{ color: "var(--text-faint)", letterSpacing: "0.16em" }}>
              Charting your route &middot; {stepIndex + 1} / {totalSteps + 1}
            </p>

            <AnimatePresence mode="wait" custom={direction}>
              <motion.div
                key={onConfirm ? "confirm" : step.id}
                custom={direction}
                initial={reduced ? false : { opacity: 0, x: direction * 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={reduced ? undefined : { opacity: 0, x: direction * -20 }}
                transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
              >
                {onConfirm ? (
                  <>
                    <h1
                      className="mt-3.5 text-[27px] font-semibold leading-[1.2] text-white"
                      style={{ letterSpacing: "-0.03em", textWrap: "balance" }}
                    >
                      Confirm what we assumed.
                    </h1>
                    <p className="mt-2.5 text-[14px] leading-[1.65] text-[var(--muted)]">
                      These shape your compliance steps and calculators. Change anything that&apos;s off - takes ten seconds.
                    </p>
                    <div className="mt-6 flex flex-col gap-4">
                      {assumedSteps.map((s) => (
                        <div key={s.id}>
                          <div className="flex items-center gap-2">
                            <p className="text-[13.5px] font-semibold text-white">{s.label}</p>
                            {!touched.has(s.field) ? (
                              <span
                                className="font-mono text-[9.5px] uppercase tracking-[0.12em] rounded-full px-2 py-0.5"
                                style={{ color: "var(--text-faint)", border: "1px solid rgba(255,255,255,0.14)" }}
                              >
                                assumed
                              </span>
                            ) : (
                              <span
                                className="font-mono text-[9.5px] uppercase tracking-[0.12em] rounded-full px-2 py-0.5"
                                style={{ color: "oklch(0.78 0.12 165)", border: "1px solid oklch(0.72 0.13 165 / 0.3)" }}
                              >
                                set by you
                              </span>
                            )}
                          </div>
                          {isLocked(s.field) ? (
                            <p className="text-[var(--text-faint)] mt-1 text-[11px]">
                              🔒 Locked this month - renaming is still free.
                            </p>
                          ) : null}
                          {s.inputType === "text" ? (
                            <input
                              value={values[s.field] ?? ""}
                              onChange={(e) => setField(s.field, e.target.value)}
                              placeholder={s.placeholder}
                              className="auth-input mt-2 w-full min-h-[42px] px-3 py-2 text-sm"
                              style={isLocked(s.field) ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                            />
                          ) : (
                            <div
                              className="mt-2 flex flex-wrap gap-1.5"
                              style={isLocked(s.field) ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                            >
                              {s.options?.map((opt) => {
                                const selected = values[s.field] === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => setField(s.field, opt.value)}
                                    className="rounded-[10px] px-3 py-2 text-[12.5px] font-medium transition-colors"
                                    style={{
                                      background: selected ? "rgba(255,255,255,0.09)" : "rgba(255,255,255,0.02)",
                                      border: `1px solid ${selected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                                      color: selected ? "#ffffff" : "#b8b8b8",
                                      cursor: "pointer",
                                    }}
                                    aria-pressed={selected}
                                  >
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                <>
                {/* Question */}
                <h1
                  className="mt-3.5 text-[27px] font-semibold leading-[1.2] text-white"
                  style={{ letterSpacing: "-0.03em", textWrap: "balance" }}
                >
                  {step.label}
                </h1>

                {isLocked(step.field) ? (
                  <p className="mt-3 rounded-lg border border-white/[0.12] bg-white/[0.03] px-3 py-2 text-xs leading-5 text-[var(--muted)]">
                    🔒 Locked this month - you&apos;ve used all your profile-answer changes. This shows
                    your current answer; it&apos;ll be editable again next month. You can still rename
                    the profile on the last step.
                  </p>
                ) : null}

                {/* Options */}
                <div
                  className="mt-6 flex flex-col gap-2.5"
                  style={isLocked(step.field) ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                  aria-disabled={isLocked(step.field)}
                >
                  {step.inputType === "dropdown" ? (
                    <select
                      id={step.field}
                      value={values[step.field] ?? ""}
                      onChange={(e) => setField(step.field, e.target.value)}
                      className="auth-input w-full min-h-[48px] px-4 py-3 text-[15px] cursor-pointer"
                      style={{ appearance: "auto" }}
                    >
                      <option value="" disabled>
                        {step.placeholder ?? "Select an option"}
                      </option>
                      {step.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  ) : step.inputType === "text" ? (
                    <input
                      id={step.field}
                      value={values[step.field] ?? ""}
                      onChange={(e) => setField(step.field, e.target.value)}
                      placeholder={step.placeholder}
                      className="auth-input w-full min-h-[48px] px-4 py-3 text-[15px]"
                    />
                  ) : (
                    step.options?.map((opt) => {
                      const selected = touched.has(step.field) && values[step.field] === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setField(step.field, opt.value)}
                          className="text-left rounded-[14px] px-[18px] py-4 transition-[border-color,background] duration-[160ms]"
                          style={{
                            background: selected ? "rgba(255,255,255,0.07)" : "rgba(255,255,255,0.02)",
                            border: `1px solid ${selected ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.1)"}`,
                            fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
                            cursor: "pointer",
                          }}
                          aria-pressed={selected}
                        >
                          <span className="flex items-center gap-[13px]">
                            {/* Radio dot */}
                            <span
                              className="flex-shrink-0 grid place-items-center w-5 h-5 rounded-full"
                              style={{
                                border: `2px solid ${selected ? "#ffffff" : "rgba(255,255,255,0.25)"}`,
                              }}
                            >
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{
                                  background: selected ? "#ffffff" : "transparent",
                                }}
                              />
                            </span>
                            <span>
                              <span
                                className="block text-[15px] font-semibold"
                                style={{ color: selected ? "#ffffff" : "#d6d6d6" }}
                              >
                                {opt.label}
                              </span>
                              {opt.description ? (
                                <span className="block mt-0.5 text-[12.5px] font-normal text-[var(--text-faint)]">
                                  {opt.description}
                                </span>
                              ) : null}
                            </span>
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>

                {/* Contextual acknowledgment callout */}
                {ackMessage ? (
                  <div
                    className="mt-4 flex gap-[11px] rounded-xl px-4 py-[13px]"
                    style={{
                      background: "oklch(0.72 0.13 165 / 0.06)",
                      border: "1px solid oklch(0.72 0.13 165 / 0.25)",
                    }}
                  >
                    <Check
                      className="h-[14px] w-[14px] mt-0.5 flex-shrink-0"
                      style={{ color: "oklch(0.78 0.12 165)" }}
                    />
                    <p
                      className="text-[13px] leading-[1.55] font-medium"
                      style={{ color: "oklch(0.82 0.1 165)" }}
                    >
                      {ackMessage}
                    </p>
                  </div>
                ) : null}

                {/* Channel change warning */}
                {channelChanged && step?.field === "primaryChannel" ? (
                  <div
                    className="mt-4 rounded-xl p-4"
                    style={{
                      background: "var(--danger-bg)",
                      border: "1px solid var(--danger-border)",
                    }}
                  >
                    <p className="text-sm font-medium text-[var(--danger-text)]">Marketplace change</p>
                    <p className="text-[var(--muted)] mt-1 text-sm leading-6">
                      Channel launch and ads modules will use the new marketplace copy. Your completed checkmarks stay.
                    </p>
                    <button
                      type="button"
                      onClick={() => setChannelWarningAcked(true)}
                      className="btn-ghost mt-3 min-h-[38px] rounded-[10px] px-3 py-1.5 text-xs font-medium"
                    >
                      I understand
                    </button>
                  </div>
                ) : null}
                </>
                )}

                {/* Plan name on confirm screen - editable in both create and edit
                    (renaming is always free, even when answers are locked). */}
                {isLast ? (
                  <div className="mt-6">
                    <label htmlFor="profileName" className="text-sm font-medium text-white">
                      Plan name {mode === "edit" ? "" : "(optional)"}
                    </label>
                    <input
                      id="profileName"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      placeholder="e.g. Meesho fashion"
                      className="auth-input mt-2 w-full min-h-[44px] px-3 py-2 text-sm"
                    />
                    {mode === "edit" ? (
                      <p className="text-[var(--text-faint)] mt-1.5 text-xs">
                        Renaming is always free - it doesn&apos;t count toward your monthly change
                        limit.
                      </p>
                    ) : null}
                  </div>
                ) : null}
              </motion.div>
            </AnimatePresence>

            {/* Navigation buttons */}
            <div className="mt-[26px] flex items-center justify-between">
              {stepIndex > 0 ? (
                <button
                  type="button"
                  onClick={goBack}
                  className="bg-transparent border-none text-[13.5px] font-medium py-2.5 px-0 cursor-pointer"
                  style={{ color: "var(--muted)", fontFamily: "var(--font-instrument-sans), system-ui, sans-serif" }}
                >
                  <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                  Back
                </button>
              ) : skipIntroOnEdit ? (
                <Link
                  href={returnTo ?? "/app/profiles"}
                  className="text-[13.5px] font-medium text-[var(--text-faintest)] hover:text-[var(--muted)]"
                >
                  <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                  Back
                </Link>
              ) : (
                <span className="text-[13.5px] font-medium" style={{ color: "#2e2e2e" }}>
                  <ArrowLeft className="inline h-3.5 w-3.5 mr-1" />
                  Back
                </span>
              )}
              {!isLast ? (
                <button
                  type="button"
                  disabled={!canContinue() || (!!channelChanged && step?.field === "primaryChannel")}
                  onClick={advanceStep}
                  className="inline-flex items-center gap-[9px] min-h-[46px] px-[26px] rounded-[11px] text-[14.5px] font-semibold border-none transition-transform duration-[160ms] cursor-pointer disabled:cursor-default"
                  style={{
                    fontFamily: "var(--font-instrument-sans), system-ui, sans-serif",
                    color: canContinue() ? "#000000" : "#5a5a5a",
                    background: canContinue() ? "#ffffff" : "rgba(255,255,255,0.06)",
                    boxShadow: canContinue()
                      ? "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)"
                      : "none",
                  }}
                >
                  Continue &rarr;
                </button>
              ) : (
                <OnboardingFinishButton
                  disabled={!canContinue() || Boolean(channelChanged && !channelWarningAcked)}
                  label={mode === "edit" ? "Save changes" : "Chart my route →"}
                />
              )}
            </div>
          </form>
        </section>

        {/* Mentor sidebar */}
        <aside className="sticky top-6 flex flex-col gap-3.5">
          {/* Why we ask card */}
          <div
            className="rounded-[20px] p-6"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(255,255,255,0.12)",
              boxShadow: "var(--inner-light)",
            }}
          >
            <div className="flex items-center gap-[11px]">
              <div className="grid place-items-center w-9 h-9 rounded-full bg-white text-black">
                <Compass className="h-4 w-4" />
              </div>
              <p
                className="text-[10.5px] font-semibold uppercase text-[#9a9a9a]"
                style={{ letterSpacing: "0.16em" }}
              >
                Why we ask
              </p>
            </div>
            <p className="mt-[15px] text-[13.5px] leading-[1.7] text-[var(--body-text)]">
              {onConfirm
                ? "We assumed sensible defaults for these so the quiz stayed short. They drive your compliance checklist (state codes, entity documents, FSSAI/labelling), so a ten-second review here saves wrong guidance later."
                : step.why}
            </p>
            {!onConfirm && step.mentorNote ? (
              <p
                className="mt-3.5 pt-3.5 font-serif-accent text-[14.5px] leading-[1.65] text-[#d6d6d6]"
                style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
              >
                &ldquo;{step.mentorNote}&rdquo;
              </p>
            ) : null}
          </div>

          {/* Route progress card */}
          <div
            className="rounded-[20px] px-6 py-5"
            style={{
              background: "var(--card)",
              border: "1px solid rgba(255,255,255,0.1)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <p className="mono-label-sm" style={{ color: "var(--text-faintest)" }}>Route so far</p>
            <p className="mt-2 font-mono text-xl font-medium text-white">
              <CountUp to={percentDone} duration={0.6} />%
            </p>
            <p className="mt-1 text-xs font-medium text-[var(--text-faint)]">{routeSummary}</p>
          </div>
        </aside>
      </main>
    </div>
  );
}
