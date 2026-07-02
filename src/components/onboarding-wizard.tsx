"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck,
  Package,
  Rocket,
  ShoppingCart,
  Wallet,
  FileText,
  MapPin,
  Building2,
  Store,
  Truck,
  BoxSelect,
} from "lucide-react";
import CountUp from "@/components/CountUp";
import { OnboardingFinishButton, OnboardingFinishOverlay } from "@/components/onboarding-finish";
import { Reveal } from "@/components/motion/reveal";
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
};

const INTRO_MODULES = [
  { icon: FileCheck, label: "Legal & GST" },
  { icon: Package, label: "Product & sourcing" },
  { icon: Rocket, label: "Launch & grow" },
];

const WHY_FIELDS = new Set<OnboardingField>(["experienceLevel", "budgetBand", "hasGstin"]);

/** Short labels and icons for each step in the stepper */
const STEP_META: Record<string, { short: string; icon: typeof FileCheck }> = {
  experience: { short: "Level", icon: Rocket },
  budget: { short: "Budget", icon: Wallet },
  channel: { short: "Channel", icon: ShoppingCart },
  gstin: { short: "GST", icon: FileText },
  product: { short: "Product", icon: Package },
  state: { short: "State", icon: MapPin },
  "business-type": { short: "Entity", icon: Building2 },
  "sales-model": { short: "Model", icon: Store },
  imports: { short: "Import", icon: Truck },
  prepackaged: { short: "Label", icon: BoxSelect },
};

/** Binary yes/no fields that get toggle buttons instead of radio cards */
const BINARY_FIELDS = new Set<OnboardingField>(["hasGstin", "importsProducts", "sellsPrepackagedGoods"]);

/** Channel field gets a 2x2 card grid */
const CHANNEL_FIELD: OnboardingField = "primaryChannel";

/** Budget field gets a visual scale */
const BUDGET_FIELD: OnboardingField = "budgetBand";

/** Channel brand colors for the card accents */
const CHANNEL_COLORS: Record<string, string> = {
  meesho: "#e91e63",
  amazon: "#ff9900",
  flipkart: "#2874f0",
  shopify: "#96bf48",
};

function ChannelLogo({ channel, className }: { channel: string; className?: string }) {
  const color = CHANNEL_COLORS[channel] ?? "#94a3b8";
  return (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-lg text-xs font-bold text-white ${className ?? ""}`}
      style={{ backgroundColor: color }}
      aria-hidden="true"
    >
      {channel[0]?.toUpperCase()}
    </div>
  );
}

function BudgetScale({
  options,
  selected,
  onSelect,
  field,
}: {
  options: NonNullable<OnboardingStep["options"]>;
  selected: string;
  onSelect: (v: string) => void;
  field: string;
}) {
  return (
    <div className="mt-5 space-y-2">
      {options.map((opt, i) => {
        const isSelected = selected === opt.value;
        const widthPercent = ((i + 1) / options.length) * 100;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onSelect(opt.value)}
            className={`group relative flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition ${
              isSelected
                ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]"
                : "border-slate-700/60 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/50"
            }`}
            aria-pressed={isSelected}
          >
            <input
              type="radio"
              name={`wizard-${field}`}
              checked={isSelected}
              onChange={() => onSelect(opt.value)}
              className="sr-only"
              tabIndex={-1}
            />
            <div className="flex-1">
              <span className="block text-sm font-medium text-slate-100">{opt.label}</span>
              {opt.description ? (
                <span className="text-muted mt-0.5 block text-xs leading-5">{opt.description}</span>
              ) : null}
            </div>
            <div className="hidden w-24 sm:block">
              <div className="h-1.5 w-full rounded-full bg-slate-700/60">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${widthPercent}%`,
                    backgroundColor: isSelected ? "#f59e0b" : "#475569",
                  }}
                />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}

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
  const [direction, setDirection] = useState<1 | -1>(1);
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

  function goBack() {
    setDirection(-1);
    setStepIndex((i) => i - 1);
  }

  function advanceStep() {
    const ack = getAckForSelection(step, values[step.field] ?? "");
    if (ack) setAckMessage(ack);
    const prefersReduced =
      typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const delay = ack && !prefersReduced ? 1200 : 0;
    setDirection(1);
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

  /** Render the step-specific input UI */
  function renderStepInput() {
    if (!step) return null;

    // Text input (state field)
    if (step.inputType === "text") {
      return (
        <input
          id={step.field}
          value={values[step.field] ?? ""}
          onChange={(e) => setField(step.field, e.target.value)}
          placeholder={step.placeholder}
          className="auth-input mt-4 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
        />
      );
    }

    const opts = step.options ?? [];
    const currentValue = values[step.field];

    // Channel selection — 2x2 card grid
    if (step.field === CHANNEL_FIELD) {
      return (
        <div className="channel-card-grid mt-5">
          {opts.map((opt) => {
            const selected = currentValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField(step.field, opt.value)}
                className={`relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition ${
                  selected
                    ? "border-amber-400/60 bg-amber-400/10 shadow-[0_0_0_1px_rgba(251,191,36,0.15)]"
                    : "border-slate-700/60 bg-slate-950/40 hover:border-slate-500 hover:bg-slate-900/50"
                }`}
                aria-pressed={selected}
              >
                <input
                  type="radio"
                  name={`wizard-${step.field}`}
                  checked={selected}
                  onChange={() => setField(step.field, opt.value)}
                  className="sr-only"
                  tabIndex={-1}
                />
                <ChannelLogo channel={opt.value} />
                <span className="text-sm font-medium text-slate-100">{opt.label}</span>
                {opt.description ? (
                  <span className="text-muted text-[11px] leading-4">{opt.description}</span>
                ) : null}
                {selected ? (
                  <span className="absolute right-2 top-2">
                    <Check className="h-4 w-4 text-amber-400" />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>
      );
    }

    // Budget — visual scale bars
    if (step.field === BUDGET_FIELD) {
      return (
        <BudgetScale
          options={opts}
          selected={currentValue}
          onSelect={(v) => setField(step.field, v)}
          field={step.field}
        />
      );
    }

    // Binary yes/no — toggle buttons
    if (BINARY_FIELDS.has(step.field) && opts.length === 2) {
      return (
        <div className="mt-5 flex gap-3">
          {opts.map((opt) => {
            const selected = currentValue === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => setField(step.field, opt.value)}
                className={`toggle-btn ${selected ? "toggle-btn-selected" : ""}`}
                aria-pressed={selected}
              >
                <input
                  type="radio"
                  name={`wizard-${step.field}`}
                  checked={selected}
                  onChange={() => setField(step.field, opt.value)}
                  className="sr-only"
                  tabIndex={-1}
                />
                <span className="text-sm font-medium">{opt.label}</span>
                {opt.description ? (
                  <span className="hidden text-[11px] opacity-70 sm:inline"> — {opt.description}</span>
                ) : null}
              </button>
            );
          })}
        </div>
      );
    }

    // Default — standard radio cards
    return (
      <div className="mt-5 space-y-3">
        {opts.map((opt) => {
          const selected = currentValue === opt.value;
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

          {/* --- Progress stepper --- */}
          <div className="mb-6">
            <div className="mb-3 flex items-center justify-between text-xs text-muted">
              <span>
                Question {stepIndex + 1} of {ONBOARDING_STEPS.length}
              </span>
              <span>
                <CountUp to={progress} duration={0.6} />% · ~{minsLeft} min left
              </span>
            </div>

            {/* Connected stepper with icons */}
            <div className="onboarding-stepper mb-3" role="progressbar" aria-valuenow={stepIndex + 1} aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length}>
              {ONBOARDING_STEPS.map((s, i) => {
                const meta = STEP_META[s.id];
                const StepIcon = meta?.icon ?? FileCheck;
                const isCompleted = i < stepIndex;
                const isCurrent = i === stepIndex;
                return (
                  <div key={s.id} className="flex items-center" style={{ flex: i < ONBOARDING_STEPS.length - 1 ? 1 : "none" }}>
                    <div
                      className={`onboarding-step-dot border-2 ${
                        isCompleted
                          ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                          : isCurrent
                            ? "border-amber-400 bg-amber-400/15 text-amber-400"
                            : "border-slate-600 bg-slate-800/50 text-slate-500"
                      }`}
                      title={meta?.short ?? s.id}
                    >
                      {isCompleted ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <StepIcon className="h-3 w-3" />
                      )}
                    </div>
                    {i < ONBOARDING_STEPS.length - 1 ? (
                      <div
                        className={`onboarding-step-connector ${
                          isCompleted ? "bg-emerald-500/50" : "bg-slate-700/60"
                        }`}
                      />
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Step label */}
            <p className="text-xs text-muted text-center">
              {STEP_META[step?.id]?.short ?? step?.id}
            </p>
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

          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={reduced ? false : { opacity: 0, x: direction * 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduced ? undefined : { opacity: 0, x: direction * -20 }}
              transition={{ duration: reduced ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
            >
              {showWhy ? <p className="eyebrow inline-block">Why we&apos;re asking</p> : null}
              <h1 className={`headline-gradient text-2xl font-bold sm:text-3xl ${showWhy ? "mt-2" : ""}`}>
                {step.label}
              </h1>
              <p className="text-muted mt-2 text-sm leading-6">{step.why}</p>

              {renderStepInput()}

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
                    className="auth-input mt-2 w-full min-h-[44px] rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm text-slate-100"
                  />
                </div>
              ) : null}

              <div className="mt-8 flex flex-wrap gap-3">
                {stepIndex > 0 ? (
                  <button
                    type="button"
                    onClick={goBack}
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

      {/* Mentor tip sidebar — visible on all breakpoints */}
      {step.mentorNote ? (
        <aside className="glass-panel rounded-xl p-5 sm:p-6 lg:col-span-2">
          <p className="text-xs uppercase tracking-wide text-amber-200">Tip</p>
          <p className="text-muted mt-3 text-sm leading-6">{step.mentorNote}</p>
        </aside>
      ) : null}
    </div>
  );
}
