import Link from "next/link";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { MARKETPLACE_FEES_META } from "@/lib/marketplace-fees";
import { Store, Warehouse, Package, Banknote } from "lucide-react";
import { DECISION_TREES } from "@/lib/decision-trees-data";

const ICON_MAP: Record<string, typeof Store> = {
  Store,
  Warehouse,
  Package,
  Banknote,
};

export default function DecisionTreesPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-200">Decision Trees</span>
        </nav>

        <p className="eyebrow inline-block">Decision tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Decision Tree Wizards
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Stop overthinking - answer a few questions and get a clear,
          data-backed recommendation for your situation.
        </p>
        <EstimateDisclaimer meta={MARKETPLACE_FEES_META} />
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {DECISION_TREES.map((tree) => {
          const Icon = ICON_MAP[tree.icon] ?? Package;
          return (
            <Link
              key={tree.id}
              href={`/app/tools/decision-trees/${tree.id}`}
              className="glass-panel grain group rounded-xl border p-5 transition-colors hover:border-amber-500/30"
            >
              <div className="inline-flex rounded-lg border border-cyan-500/30 bg-cyan-500/5 p-2.5 text-cyan-400">
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-display text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                {tree.title}
              </h2>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {tree.description}
              </p>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
