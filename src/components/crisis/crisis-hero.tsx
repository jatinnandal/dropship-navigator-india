import type { ActiveCrisis } from "@/lib/workspace";
import { CRISIS_LABELS } from "@/lib/crisis/types";
import { getCrisisProtocol } from "@/lib/crisis/playbooks";
import { AlertTriangle } from "lucide-react";

type Props = {
  crisis: ActiveCrisis;
};

export function CrisisHero({ crisis }: Props) {
  const protocol = getCrisisProtocol(crisis.type);
  const stepNum = crisis.currentStepIndex + 1;
  const total = protocol.steps.length;

  return (
    <section className="dashboard-hero-crisis crisis-pulse hero-reveal rounded-xl p-8 sm:p-10 md:min-h-[240px]">
      <div className="flex items-start gap-3">
        <AlertTriangle className="mt-0.5 h-5 w-5 flex-none text-rose-400" aria-hidden="true" />
        <p className="text-danger text-xs font-semibold uppercase tracking-wide">Crisis mode</p>
      </div>
      <h1 className="mt-3 text-3xl font-bold leading-tight text-rose-100 sm:text-4xl">
        {CRISIS_LABELS[crisis.type]} — step {stepNum} of {total}
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-6 text-rose-200/70">
        Follow the recovery plan below in order. One step at a time — most sellers quit because they
        panic and skip steps.
      </p>
    </section>
  );
}
