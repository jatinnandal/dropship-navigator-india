import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, FileCheck, Package, Rocket } from "lucide-react";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserEmail, getCurrentUserId } from "@/lib/current-user";

function greetingFromEmail(email: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  const name = local.split(/[._-]/)[0];
  if (!name) return "there";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

const MODULE_PREVIEW = [
  {
    icon: FileCheck,
    title: "Legal & GST",
    description: "Documents, registration, and compliance for your product category.",
  },
  {
    icon: Package,
    title: "Product & sourcing",
    description: "Pick a viable niche and vet suppliers before you list.",
  },
  {
    icon: Rocket,
    title: "Launch & grow",
    description: "Marketplace setup, listings, ads, and payout tracking.",
  },
];

const SETUP_CHECKLIST = [
  "Your selling experience and budget",
  "Primary marketplace or channel",
  "GST status and business type",
  "Product category and operating state",
];

export default async function WelcomePage() {
  const userId = await getCurrentUserId();
  if (await userHasProfile(userId)) {
    redirect("/app");
  }

  const email = await getCurrentUserEmail();
  const greeting = greetingFromEmail(email);

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
      <section className="glass-panel-primary hero-reveal rounded-xl p-8 sm:p-10">
        <p className="eyebrow inline-block">Your workspace</p>
        <h1 className="headline-gradient mt-3 text-3xl font-bold sm:text-4xl">Welcome, {greeting}</h1>
        <p className="text-muted mt-4 max-w-2xl text-base leading-7">
          Dropship Navigator builds a step-by-step India launch plan around your situation — GST, channel choice,
          sourcing, and growth. About five minutes of setup unlocks a personalized journey map.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/onboarding"
            className="btn-primary inline-flex min-h-[44px] items-center gap-2 rounded-md px-5 py-2.5 text-sm font-medium"
          >
            Build my launch plan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
          <Link
            href="/app/journey"
            className="btn-ghost inline-flex min-h-[44px] items-center rounded-md px-5 py-2.5 text-sm font-medium"
          >
            Preview the journey map
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {MODULE_PREVIEW.map((item) => {
          const Icon = item.icon;
          return (
            <article key={item.title} className="glass-panel rounded-xl p-5">
              <Icon className="h-5 w-5 text-amber-300" aria-hidden="true" />
              <h2 className="mt-3 text-sm font-semibold text-slate-100">{item.title}</h2>
              <p className="text-muted mt-2 text-sm leading-6">{item.description}</p>
            </article>
          );
        })}
      </section>

      <section className="glass-panel mt-8 rounded-xl p-6 sm:p-8">
        <h2 className="text-lg font-bold text-slate-100">What you&apos;ll answer</h2>
        <p className="text-muted mt-2 text-sm leading-6">
          Ten quick questions — one at a time. We use them to order modules, surface compliance first, and skip what
          you already know.
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {SETUP_CHECKLIST.map((item) => (
            <li key={item} className="meta-tile flex items-start gap-2 px-3 py-2.5 text-sm text-slate-200">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-400" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
        <p className="text-muted mt-6 text-xs">You can revisit answers later from your profile settings.</p>
      </section>
    </main>
  );
}
