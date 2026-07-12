import Link from "next/link";
import { SourcingGame } from "@/components/tools/sourcing-game";

export default function SourcingGamePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      <nav className="text-muted mb-4 text-sm">
        <Link href="/app/tools" className="hover:text-slate-200 transition-colors">
          Tools
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-slate-200">Sourcing Swipe Game</span>
      </nav>

      <header className="glass-panel grain rounded-xl p-6">
        <p className="eyebrow inline-block">Interactive practice</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Sourcing Swipe Game
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Real supplier conversations from IndiaMART and Alibaba - can you
          spot the traps before your money disappears? Each card teaches a
          pattern that cost real sellers real money.
        </p>
      </header>

      <section className="mt-6">
        <SourcingGame />
      </section>
    </main>
  );
}
