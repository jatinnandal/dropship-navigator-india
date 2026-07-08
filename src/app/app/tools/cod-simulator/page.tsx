import Link from "next/link";
import { CodSimulator } from "@/components/tools/cod-simulator";

export default function CodSimulatorPage() {
  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">COD Call Simulator</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Interactive practice</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          COD Call Simulator
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Practice the confirmation call that decides whether an order ships or
          returns. Each scenario is based on a real RTO pattern — wrong address,
          impulse regret, cash not ready, price shock, unreachable buyer.
        </p>
      </header>

      <section className="mt-6">
        <CodSimulator />
      </section>
    </main>
  );
}
