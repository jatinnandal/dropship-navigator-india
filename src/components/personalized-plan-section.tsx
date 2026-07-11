import type { PersonalizedStepDetail } from "@/lib/llm/plan-generator";
import { PersonalizedPlanAutoLoader } from "@/components/personalized-plan-controls";

/**
 * The personalized compliance-plan block: renders the seller's exact ordered
 * steps + watch-outs when a plan is cached, or the auto-loader (which generates
 * it on mount) when it isn't. Server component; used on the guided-walkthrough
 * page for the two personalizable modules. Renders nothing when the module
 * isn't personalizable or the plan isn't available.
 */
export function PersonalizedPlanSection({
  moduleId,
  canPersonalize,
  detail,
}: {
  moduleId: string;
  canPersonalize: boolean;
  detail: PersonalizedStepDetail;
}) {
  if (!canPersonalize) return null;

  return (
    <section className="glass-panel rounded-xl border border-neutral-700 p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-wide text-neutral-400">
            {detail.personalized ? "Your exact steps" : "Personalizing for you"}
          </p>
          <p className="text-muted mt-1 max-w-xl text-sm leading-6">
            A precise, ordered path for your entity type, state, GST status, and product. The
            step-by-step guide and figures below stay from the verified checklist.
          </p>
        </div>
        {!detail.personalized ? <PersonalizedPlanAutoLoader moduleId={moduleId} /> : null}
      </div>

      {detail.personalized && detail.steps.length > 0 ? (
        <ol className="mt-5 space-y-3">
          {detail.steps.map((s, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full border border-white/[0.16] bg-white/[0.03] font-mono text-xs text-white">
                {i + 1}
              </span>
              <div>
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-muted mt-0.5 text-sm leading-6">{s.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      ) : null}

      {detail.personalized && detail.watchOuts.length > 0 ? (
        <div className="mt-5 rounded-lg border border-white/[0.1] bg-white/[0.02] p-4">
          <p className="text-xs font-medium uppercase tracking-wide text-neutral-400">
            Watch-outs for your setup
          </p>
          <ul className="mt-2 space-y-1.5">
            {detail.watchOuts.map((w, i) => (
              <li key={i} className="text-muted flex items-start gap-2 text-sm leading-6">
                <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-white/40" />
                {w}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {detail.personalized ? (
        <p className="mt-4 text-xs leading-5 text-neutral-500">
          AI-generated guidance — verify category-specific compliance and figures with the verified
          checklist below or a CA before acting.
        </p>
      ) : null}
    </section>
  );
}
