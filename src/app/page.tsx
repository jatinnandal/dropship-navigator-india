import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck, Workflow } from "lucide-react";
import { AppLogo } from "@/components/app-logo";

export default function Home() {
  return (
    <main className="app-shell-bg min-h-screen text-slate-100">
      <div className="relative mx-auto flex w-full max-w-6xl flex-col gap-16 px-6 py-14 md:px-10">
        <div className="page-reveal flex items-center justify-between">
          <AppLogo href="/" subtitle="Seller operating system for India" />
          <Link href="/login" className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
            Login
          </Link>
        </div>
        <div className="pointer-events-none absolute left-6 top-28 h-24 w-24 rounded-full bg-cyan-400/20 blur-2xl ambient-orb" />
        <div className="pointer-events-none absolute right-16 top-44 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl ambient-orb" />
        <section className="glass-panel page-reveal rounded-2xl p-8 md:p-12">
          <p className="eyebrow mb-5 inline-block">India-first seller co-pilot MVP</p>
          <h1 className="headline-gradient max-w-3xl text-4xl font-bold leading-tight md:text-5xl">
            Build your dropshipping journey step by step, from GST to profitable scale.
          </h1>
          <p className="text-muted mt-5 max-w-3xl text-base md:text-lg">
            This MVP guides absolute beginners through legal setup, product selection,
            sourcing, marketplace launch, ads, and performance tracking - with
            curated tool recommendations at every step.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/login"
              className="btn-emerald inline-flex items-center gap-2 rounded-md px-5 py-3 font-semibold"
            >
              Start with login
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app"
              className="btn-ghost rounded-md px-5 py-3 font-semibold"
            >
              Open app dashboard
            </Link>
          </div>
        </section>

        <section className="page-reveal grid gap-4 md:grid-cols-3">
          {[
            {
              icon: <Workflow className="h-5 w-5" />,
              title: "Personalized roadmap",
              description:
                "Onboarding quiz configures a practical path based on budget, category preference, and selling channel.",
            },
            {
              icon: <ShieldCheck className="h-5 w-5" />,
              title: "Compliance-first",
              description:
                "Clear checklist for GST, KYC docs, and category approvals before users attempt marketplace launch.",
            },
            {
              icon: <CheckCircle2 className="h-5 w-5" />,
              title: "Tool orchestration",
              description:
                "Recommend the right product research, sourcing, analytics, and ads tools for each step.",
            },
          ].map((feature) => (
            <article
              key={feature.title}
              className="glass-panel surface-hover rounded-lg p-5"
            >
              <div className="mb-3 text-amber-300">{feature.icon}</div>
              <h2 className="text-lg font-semibold">{feature.title}</h2>
              <p className="text-muted mt-2 text-sm leading-6">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="glass-panel page-reveal rounded-lg p-6">
          <h2 className="text-xl font-semibold">MVP Scope (Phase 1)</h2>
          <ul className="text-muted mt-4 grid gap-2 text-sm md:grid-cols-2">
            <li>Onboarding quiz with path personalization</li>
            <li>Guided journey modules with completion tracking</li>
            <li>Affiliate-ready tool recommendations by step</li>
            <li>Freemium-ready structure for Pro upgrade</li>
            <li>India-specific legal and GST starter guidance</li>
            <li>Foundation for Supabase auth + content data model</li>
          </ul>
        </section>
      </div>
    </main>
  );
}
