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
    <section className="glass-panel-primary hero-reveal rounded-xl p-6 sm:p-8">
      <p className="eyebrow inline-block">Crisis mode</p>
      <h1 className="headline-gradient mt-2 text-2xl font-bold sm:text-3xl">
        {CRISIS_LABELS[crisis.type]} — step {stepNum} of {total}
      </h1>
      <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
        Follow the recovery plan below in order. One step at a time — most sellers quit because they
        panic and skip steps.
      </p>
    </section>
  );
}
