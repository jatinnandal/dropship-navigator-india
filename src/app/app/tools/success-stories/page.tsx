import Link from "next/link";
import { SuccessStoriesGrid } from "@/components/social-proof/success-stories";

export default function SuccessStoriesPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Success Stories</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Community</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Seller Success Stories
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Real Indian sellers, real numbers, real journeys
        </p>
      </header>

      <section className="mt-8">
        <SuccessStoriesGrid />
      </section>
    </main>
  );
}
