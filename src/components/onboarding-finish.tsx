"use client";

import CountUp from "@/components/CountUp";
import { useFormStatus } from "react-dom";

export function OnboardingFinishOverlay() {
  const { pending } = useFormStatus();

  if (!pending) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm"
      role="status"
      aria-live="polite"
      aria-label="Saving your launch plan"
    >
      <section className="glass-panel-primary grain max-w-xl rounded-xl p-10 text-center">
        <p className="eyebrow inline-block">All set</p>
        <h2 className="headline-gradient mt-3 text-2xl font-bold">Plan ready</h2>
        <p className="text-muted mt-3 text-sm">
          Your launch plan is{" "}
          <span className="font-display text-info font-bold">
            <CountUp to={100} duration={1.2} />%
          </span>{" "}
          personalized - opening your journey map…
        </p>
      </section>
    </div>
  );
}

export function OnboardingFinishButton({ disabled, label }: { disabled: boolean; label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="btn-primary min-h-[44px] rounded-md px-5 py-2 text-sm font-medium disabled:opacity-50"
    >
      {pending ? "Saving…" : (label ?? "Finish setup")}
    </button>
  );
}
