import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, LifeBuoy, Lock } from "lucide-react";
import { getCurrentUserId } from "@/lib/current-user";
import { CRISIS_PROTOCOLS } from "@/lib/crisis/playbooks";
import { CRISIS_LABELS, SELF_REPORT_CRISIS_TYPES, type CrisisType } from "@/lib/crisis/types";
import { canUseCrisisProtocol, PLAN_LABELS, requiredPlanForCrisis } from "@/lib/entitlements";
import { getCurrentPlan } from "@/lib/plan";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { reportCrisis, resolveCrisis } from "@/app/app/crisis/actions";

const CRISIS_BLURBS: Record<CrisisType, string> = {
  account_suspended:
    "Marketplace suspended or blocked your seller account. First rule: don't argue in the first ticket.",
  supplier_oos:
    "Your supplier can't fulfil and orders are pending. The first hour decides how much this costs you.",
  payment_hold:
    "Settlement date passed, bank account empty. Find the hold reason before the ticket — and protect cashflow meanwhile.",
  ip_complaint:
    "Brand or IP complaint on a listing. What you do before replying decides whether it's one strike or a suspension.",
  gst_notice:
    "A notice from the GST department. Usually a mechanical mismatch — deadly only if ignored or answered carelessly.",
  courier_dispute:
    "Marked delivered but customer never got it, RTO never returned, or weight overcharge. Evidence expires — move fast.",
  review_bombing:
    "A burst of 1-star reviews tanking your listing. Separate real quality signal from an attack, then respond in order.",
};

export default async function CrisisPage() {
  await getCurrentUserId();
  const [workspace, plan] = await Promise.all([
    getWorkspaceForCurrentVisitor(),
    getCurrentPlan(),
  ]);
  const active = workspace.activeCrisis;

  async function startCrisis(formData: FormData) {
    "use server";
    const type = formData.get("type") as CrisisType;
    if (!SELF_REPORT_CRISIS_TYPES.includes(type)) return;
    const currentPlan = await getCurrentPlan();
    if (!canUseCrisisProtocol(currentPlan, type)) {
      redirect("/pricing");
    }
    await reportCrisis(type);
    redirect("/app");
  }

  async function markResolved() {
    "use server";
    await resolveCrisis();
    redirect("/app/crisis");
  }

  return (
    <main className="relative z-[1] mx-auto w-full max-w-3xl flex-1 px-4 py-6 sm:px-8 sm:py-7">
      <p className="eyebrow">Crisis mode</p>
      <h1 className="mt-2.5 text-[27px] font-semibold leading-tight tracking-[-0.03em] text-white">
        What went <span className="font-serif-accent">wrong?</span>
      </h1>
      <p className="mt-3 max-w-xl text-[14.5px] leading-[1.65] text-[var(--body-text)]">
        Take a breath. Pick the situation below — you&apos;ll get a step-by-step protocol with
        timers and templates, not a lecture.
      </p>

      {active ? (
        <section className="banner-deadline mt-6 rounded-[16px] p-5">
          <p className="mono-label">Active crisis</p>
          <p className="mt-2 text-[16px] font-semibold text-white">{CRISIS_LABELS[active.type]}</p>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            Started {new Date(active.startedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long" })} · step{" "}
            {active.currentStepIndex + 1} of {CRISIS_PROTOCOLS[active.type].steps.length}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/app" className="btn-primary inline-flex min-h-[42px] items-center gap-2 rounded-[11px] px-5 text-[13.5px]">
              Continue protocol
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
            <form action={markResolved}>
              <button type="submit" className="btn-ghost min-h-[42px] rounded-[11px] px-4 text-[13px]">
                Mark resolved
              </button>
            </form>
          </div>
        </section>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-3.5">
          {SELF_REPORT_CRISIS_TYPES.map((type) => {
            const protocol = CRISIS_PROTOCOLS[type];
            const locked = !canUseCrisisProtocol(plan, type);

            if (locked) {
              const required = requiredPlanForCrisis(type);
              return (
                <Link
                  key={type}
                  href="/pricing"
                  className="panel block w-full rounded-[18px] p-5 no-underline transition-colors hover:border-white/[0.28] sm:p-6"
                >
                  <span className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-10 w-10 flex-shrink-0 place-items-center rounded-[11px] border border-white/[0.16] bg-[#111]">
                      <Lock className="h-4 w-4 text-white/70" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="flex flex-wrap items-center gap-2.5">
                        <span className="block text-[16px] font-semibold text-white/80">
                          {protocol.label}
                        </span>
                        <span
                          className="rounded-full border border-white/[0.18] px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-[var(--text-faint)]"
                        >
                          {PLAN_LABELS[required]}
                        </span>
                      </span>
                      <span className="mt-1 block text-[13px] leading-[1.6] text-[var(--text-faint)]">
                        {CRISIS_BLURBS[type]}
                      </span>
                      <span className="mono-label-sm mt-3 block text-[var(--text-faint)]">
                        {protocol.steps.length}-step protocol · unlock with {PLAN_LABELS[required]} — 2 minutes
                      </span>
                    </span>
                  </span>
                </Link>
              );
            }

            return (
              <form key={type} action={startCrisis}>
                <input type="hidden" name="type" value={type} />
                <button
                  type="submit"
                  className="panel w-full cursor-pointer rounded-[18px] p-5 text-left transition-colors hover:border-white/[0.28] sm:p-6"
                >
                  <span className="flex items-start gap-4">
                    <span className="mt-0.5 grid h-10 w-10 flex-shrink-0 place-items-center rounded-[11px] border border-white/[0.16] bg-[#111]">
                      <LifeBuoy className="h-4.5 w-4.5 text-white" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-[16px] font-semibold text-white">
                        {protocol.label}
                      </span>
                      <span className="mt-1 block text-[13px] leading-[1.6] text-[var(--muted)]">
                        {CRISIS_BLURBS[type]}
                      </span>
                      <span className="mono-label-sm mt-3 block text-[var(--text-faint)]">
                        {protocol.steps.length}-step protocol · starts immediately
                      </span>
                    </span>
                  </span>
                </button>
              </form>
            );
          })}
        </div>
      )}

      <p className="mt-6 text-[12.5px] text-[var(--text-faint)]">
        Something else on fire? The{" "}
        <Link href="/app/tools" className="text-white underline underline-offset-2 hover:text-white/70">
          toolkit
        </Link>{" "}
        covers RTO spikes, payout math, and document rejections.
      </p>
    </main>
  );
}
