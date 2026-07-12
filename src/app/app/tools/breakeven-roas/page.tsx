import Link from "next/link";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { MARKETPLACE_FEES_META } from "@/lib/marketplace-fees";
import { BreakevenRoas } from "@/components/tools/breakeven-roas";

export default function BreakevenRoasPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Break-even ROAS</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Interactive tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Break-even ROAS Calculator
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Your ad-spend floor - the minimum ROAS needed to not lose money,
          computed from real marketplace fees, shipping, and RTO losses.
        </p>
        <EstimateDisclaimer meta={MARKETPLACE_FEES_META} />
      </header>

      <section className="mt-8">
        <BreakevenRoas />
      </section>
    </main>
  );
}
