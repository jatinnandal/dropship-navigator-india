import Link from "next/link";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";
import { JourneyMap } from "@/components/journey-map";

export default async function JourneyPage() {
  const profile = await getStoredProfileForCurrentVisitor();
  const completed = await getCompletedModuleIdsForCurrentVisitor();
  const workspace = await getWorkspaceForCurrentVisitor();
  const modules = buildPersonalizedJourney(profile);
  const nodes = getJourneyNodes({
    completedModules: completed,
    subTasks: workspace.subTasks,
    hasGstin: profile.hasGstin || !!workspace.gstin,
  });
  const completedCount = nodes.filter((n) => n.status === "done").length;
  const completionPercent = Math.max(5, Math.round((completedCount / nodes.length) * 100));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="glass-panel rounded-xl p-6 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="headline-gradient text-3xl font-bold">Your skill tree</h1>
            <p className="text-muted mt-2 text-sm">
              Jump to any module — work in parallel. Only sub-tasks with real prerequisites stay locked.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-amber-200">Overall</p>
            <p className="text-xl font-semibold text-emerald-100">
              {completedCount}/{nodes.length} modules done
            </p>
          </div>
        </div>
        <div className="mt-4 max-w-lg">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>Aggregate progress</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-6">
        <JourneyMap nodes={nodes} />
      </section>

      <section className="glass-panel mt-6 rounded-xl p-4">
        <p className="text-xs uppercase tracking-wide text-amber-200">Personalized for you</p>
        <p className="text-muted mt-2 text-sm">
          Channel: {profile.primaryChannel} · Product: {profile.productType} ·{" "}
          {modules.length} modules tailored to your profile.
        </p>
      </section>

      <footer className="mt-6 flex flex-wrap gap-3">
        <Link href="/onboarding" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
          Update profile
        </Link>
        <Link href="/app" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100">
          Back to dashboard
        </Link>
      </footer>
    </main>
  );
}
