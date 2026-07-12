import Link from "next/link";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { SHIPPING_DATA_META } from "@/lib/shipping-data";
import { ShippingEstimator } from "@/components/tools/shipping-estimator";

export default function ShippingEstimatorPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Shipping Estimator</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">LOGISTICS TOOL</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Shipping Cost Estimator
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Compare REAL carrier costs - not advertised rates
        </p>
        <EstimateDisclaimer meta={SHIPPING_DATA_META} />
      </header>

      <section className="mt-8">
        <ShippingEstimator />
      </section>
    </main>
  );
}
