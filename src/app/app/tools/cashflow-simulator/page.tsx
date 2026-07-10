import Link from "next/link";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { SETTLEMENT_DATA_META } from "@/lib/settlement-data";
import { CashflowSimulator } from "@/components/tools/cashflow-simulator";

export default function CashflowSimulatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Cash Flow Simulator</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">PLANNING TOOL</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          90-Day Cash Flow Simulator
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Model your working capital needs with settlement delays, ad spend &amp; festival surges
        </p>
        <EstimateDisclaimer meta={SETTLEMENT_DATA_META} />
      </header>

      <section className="mt-8">
        <CashflowSimulator />
      </section>
    </main>
  );
}
