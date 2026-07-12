import Link from "next/link";
import { ProductScorecard } from "@/components/tools/product-scorecard";

export default function ProductScorecardPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Product Scorecard</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Interactive tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Product Scorecard
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Score any product 0-100 across six weighted axes - margin, competition,
          shipping risk, returns, seasonality, and capital. Compare up to three
          products side by side.
        </p>
      </header>

      <section className="mt-8">
        <ProductScorecard />
      </section>
    </main>
  );
}
