import Link from "next/link";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { SETTLEMENT_DATA_META } from "@/lib/settlement-data";
import { SettlementTimeline } from "@/components/tools/settlement-timeline";

export default function SettlementTimelinePage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Settlement Timeline</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">CASH FLOW TOOL</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Settlement Timeline
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          See when marketplaces actually pay you — plan your working capital
        </p>
        <EstimateDisclaimer meta={SETTLEMENT_DATA_META} />
      </header>

      <section className="mt-8">
        <SettlementTimeline />
      </section>
    </main>
  );
}
