import Link from "next/link";
import { ClipboardCheck, Compass, Sparkles } from "lucide-react";
import { SetupRequired } from "@/components/setup-required";
import { defaultProfile } from "@/lib/mvp-data";
import { getStoredProfile } from "@/lib/profile-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { requireUser } from "@/lib/supauth";
import { saveOnboardingProfile } from "@/app/onboarding/actions";

export default async function OnboardingPage() {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  const user = await requireUser();
  if (!user) {
    return null;
  }

  const profile = (await getStoredProfile(user.id)) ?? defaultProfile;
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-8 text-slate-100">
      <div className="page-reveal grid gap-6 lg:grid-cols-5">
        <section className="glass-panel rounded-xl p-6 lg:col-span-3">
          <h1 className="headline-gradient text-3xl font-bold">Onboarding profile</h1>
          <p className="text-muted mt-2 text-sm">
            This profile controls your journey sequencing, tool recommendations, and action plan.
          </p>

          <form action={saveOnboardingProfile} className="mt-8 space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="experienceLevel">
                Your current stage
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                defaultValue={profile.experienceLevel}
                className="w-full rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm"
              >
                <option value="beginner">Absolute beginner</option>
                <option value="existing_seller">Already selling online</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="budgetBand">
                Starting budget
              </label>
              <select
                id="budgetBand"
                name="budgetBand"
                defaultValue={profile.budgetBand}
                className="w-full rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm"
              >
                <option value="under_20k">Under Rs 20,000</option>
                <option value="20k_1l">Rs 20,000 - 1 lakh</option>
                <option value="above_1l">Above Rs 1 lakh</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="primaryChannel">
                First selling channel
              </label>
              <select
                id="primaryChannel"
                name="primaryChannel"
                defaultValue={profile.primaryChannel}
                className="w-full rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm"
              >
                <option value="meesho">Meesho</option>
                <option value="amazon">Amazon India</option>
                <option value="flipkart">Flipkart</option>
                <option value="shopify">Shopify (own store)</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium" htmlFor="hasGstin">
                Do you already have GSTIN?
              </label>
              <select
                id="hasGstin"
                name="hasGstin"
                defaultValue={profile.hasGstin ? "yes" : "no"}
                className="w-full rounded-md border border-slate-600 bg-slate-950/80 px-3 py-2 text-sm"
              >
                <option value="no">No, not yet</option>
                <option value="yes">Yes, available</option>
              </select>
            </div>

            <div className="mt-8 flex gap-3">
              <button
                type="submit"
                className="btn-primary cursor-pointer rounded-md px-4 py-2 text-sm font-semibold"
              >
                Save and continue
              </button>
              <Link
                href="/app"
                className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold text-slate-100"
              >
                Back
              </Link>
            </div>
          </form>
        </section>

        <aside className="glass-panel rounded-xl p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold">How this profile is used</h2>
          <ul className="text-muted mt-4 space-y-2 text-sm">
            <li className="glass-panel surface-hover flex items-start gap-2 rounded-md p-3">
              <Compass className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Prioritizes modules based on readiness.</span>
            </li>
            <li className="glass-panel surface-hover flex items-start gap-2 rounded-md p-3">
              <ClipboardCheck className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Suggests channel-specific tools and playbooks.</span>
            </li>
            <li className="glass-panel surface-hover flex items-start gap-2 rounded-md p-3">
              <Sparkles className="mt-0.5 h-4 w-4 text-amber-300" />
              <span>Highlights compliance actions first when GST is missing.</span>
            </li>
          </ul>
          <p className="text-muted mt-4 text-xs">
            Your answers are saved to your account and can be updated any time.
          </p>
        </aside>
      </div>
    </main>
  );
}
