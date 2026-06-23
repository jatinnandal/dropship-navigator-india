import Link from "next/link";
import { ArrowRight, ChartSpline, CircleDollarSign, FileCheck } from "lucide-react";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";

export default async function DashboardPage() {
  const [profile, completed] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getCompletedModuleIdsForCurrentVisitor(),
  ]);

  const effectiveProfile = profile;
  const completionCount = completed.size;
  const totalModules = buildPersonalizedJourney(effectiveProfile).length;
  const completionPercent = Math.max(5, Math.round((completionCount / totalModules) * 100));
  const gstReady = effectiveProfile.hasGstin || completed.has("common-documentation");

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <section className="glass-panel rounded-xl p-8">
        <p className="eyebrow inline-block">Account dashboard</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Welcome to your seller control panel
        </h1>
        <p className="text-muted mt-3 max-w-3xl text-sm">
          Complete onboarding once, then progress through your journey modules. Your recommendations
          adjust based on channel, budget, and compliance status.
        </p>
        <div className="mt-5 max-w-md">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>Journey completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <ChartSpline className="h-4 w-4" />
            Primary channel
          </div>
          <p className="mt-2 text-2xl font-semibold capitalize">{effectiveProfile.primaryChannel}</p>
        </article>
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <FileCheck className="h-4 w-4" />
            GST status
          </div>
          <p className="mt-2 text-2xl font-semibold">
            {gstReady ? "Configured" : "Pending"}
          </p>
        </article>
        <article className="glass-panel surface-hover rounded-lg p-5">
          <div className="text-muted flex items-center gap-2 text-sm font-medium">
            <CircleDollarSign className="h-4 w-4" />
            Modules completed
          </div>
          <p className="mt-2 text-2xl font-semibold">{completionCount}</p>
        </article>
      </section>

      <section className="glass-panel mt-6 rounded-xl p-6">
        <h2 className="text-lg font-semibold">Recommended next actions</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="btn-primary inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-semibold"
          >
            Update onboarding profile
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/app/journey"
            className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
          >
            Open guided journey
          </Link>
        </div>
      </section>
    </main>
  );
}
