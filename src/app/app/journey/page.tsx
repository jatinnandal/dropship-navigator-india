import Link from "next/link";
import { CheckCircle2, Sparkles } from "lucide-react";
import { buildPersonalizedJourney } from "@/lib/mvp-data";
import { getCompletedModuleIdsForCurrentVisitor, getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { updateModuleCompletion } from "@/app/app/journey/actions";

export default async function JourneyPage() {
  const profile = await getStoredProfileForCurrentVisitor();
  const completed = await getCompletedModuleIdsForCurrentVisitor();
  const modules = buildPersonalizedJourney(profile);
  const completedCount = modules.filter((module) => completed.has(module.id)).length;
  const completionPercent = Math.max(5, Math.round((completedCount / modules.length) * 100));

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8">
      <header className="glass-panel rounded-xl p-6 text-slate-100">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="headline-gradient text-3xl font-bold">Your guided journey</h1>
            <p className="text-muted mt-2 text-sm">
              Complete each module and keep momentum. This roadmap is personalized to your profile.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3">
            <p className="text-xs uppercase tracking-wider text-amber-200">Progress</p>
            <p className="text-xl font-semibold text-emerald-100">
              {completedCount}/{modules.length} complete
            </p>
          </div>
        </div>
        <div className="mt-4 max-w-lg">
          <div className="mb-2 flex items-center justify-between text-xs text-slate-300">
            <span>Module completion</span>
            <span>{completionPercent}%</span>
          </div>
          <div className="progress-track">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      </header>

      <section className="mt-6 grid gap-4">
        {modules.map((module, index) => {
          const isCompleted = completed.has(module.id);
          return (
            <article key={module.id} className="glass-panel surface-hover rounded-lg p-6 text-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wider text-amber-200">Step {index + 1}</p>
                  <h2 className="mt-1 text-xl font-semibold">{module.title}</h2>
                  <p className="text-muted mt-2 text-sm">{module.description}</p>
                </div>
                <form action={updateModuleCompletion}>
                  <input type="hidden" name="moduleId" value={module.id} />
                  <input type="hidden" name="completed" value={isCompleted ? "false" : "true"} />
                  <button
                    type="submit"
                    className={`cursor-pointer rounded-md px-3 py-1.5 text-sm font-medium transition ${
                      isCompleted
                        ? "border border-cyan-300/40 bg-cyan-500/18 text-cyan-100 hover:bg-cyan-500/28"
                        : "btn-primary"
                    }`}
                  >
                    {isCompleted ? "Mark incomplete" : "Mark complete"}
                  </button>
                </form>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-slate-200">Expected outcomes</h3>
                  <ul className="text-muted mt-2 list-disc space-y-1 pl-5 text-sm">
                    {module.outcomes.map((outcome) => (
                      <li key={outcome}>{outcome}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">Suggested tools</h3>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {module.tools.map((tool) => (
                      <span key={tool} className="meta-tile">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/app/journey/${module.id}`}
                  className="inline-flex items-center rounded-md border border-cyan-300/30 bg-cyan-500/10 px-3 py-1.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-500/20"
                >
                  Open detailed guide
                </Link>
                <Link
                  href={`/app/tasks/${module.id}`}
                  className="inline-flex items-center gap-1.5 rounded-md border border-amber-300/40 bg-amber-300/10 px-3 py-1.5 text-sm font-medium text-amber-100 transition hover:bg-amber-300/20"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  Start guided walkthrough
                </Link>
              </div>

              {isCompleted ? (
                <div className="mt-4 flex items-center gap-2 text-sm text-emerald-200">
                  <CheckCircle2 className="h-4 w-4" />
                  Completed and saved.
                </div>
              ) : (
                <div className="text-muted mt-4 flex items-center gap-2 text-sm">
                  <Sparkles className="h-4 w-4 text-amber-300" />
                  Mark complete when outcomes are done.
                </div>
              )}
            </article>
          );
        })}
      </section>

      <footer className="mt-6 flex flex-wrap gap-3">
        <Link
          href="/onboarding"
          className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100"
        >
          Update profile
        </Link>
        <Link
          href="/app"
          className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100"
        >
          Back to dashboard
        </Link>
      </footer>
    </main>
  );
}
