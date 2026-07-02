import type { ActiveCrisis } from "@/lib/workspace";
import { CRISIS_LABELS } from "@/lib/crisis/types";
import { getCrisisProtocol } from "@/lib/crisis/playbooks";

type Props = {
  crisis: ActiveCrisis;
};

export function CrisisHero({ crisis }: Props) {
  const protocol = getCrisisProtocol(crisis.type);
  const stepNum = crisis.currentStepIndex + 1;
  const total = protocol.steps.length;

  return (
    <section className="dashboard-hero hero-reveal rounded-xl p-8 sm:p-10">
      <p className="eyebrow inline-block">Crisis mode</p>
      <h1 className="headline-gradient mt-3 text-3xl font-bold leading-tight sm:text-4xl">
        {CRISIS_LABELS[crisis.type]} — step {stepNum} of {total}
      </h1>
      <p className="text-muted mt-4 max-w-2xl text-sm leading-6">
        Follow the recovery plan below in order. One step at a time — most sellers quit because they
        panic and skip steps.
      </p>
    </section>
  );
}
