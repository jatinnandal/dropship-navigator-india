import Link from "next/link";
import { Compass, Sparkles } from "lucide-react";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { OnboardingWizard } from "@/components/onboarding-wizard";

export default async function OnboardingPage() {
  const profile = await getStoredProfileForCurrentVisitor();
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 text-slate-100">
      <div className="page-reveal grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <OnboardingWizard profile={profile} />
        </div>

        <aside className="glass-panel rounded-xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">Why one question at a time?</h2>
          <p className="text-muted mt-2 text-sm leading-6">
            Each answer shapes your launch plan, tool picks, and compliance path. We explain why we ask — so
            nothing feels like random form-filling.
          </p>
          <ul className="text-muted mt-4 space-y-2 text-sm">
            <li className="glass-panel surface-hover flex items-start gap-2 rounded-md p-3">
              <Compass className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Prioritizes modules based on readiness.</span>
            </li>
            <li className="glass-panel surface-hover flex items-start gap-2 rounded-md p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Highlights compliance first when GST is missing.</span>
            </li>
          </ul>
          <Link href="/app" className="btn-ghost mt-4 inline-block rounded-md px-4 py-2 text-sm font-semibold">
            Back to dashboard
          </Link>
        </aside>
      </div>
    </main>
  );
}
