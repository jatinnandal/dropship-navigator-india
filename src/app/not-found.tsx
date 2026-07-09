import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-black px-6 text-center">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[#6e6e6e]">404</p>
        <h1 className="mt-4 text-[clamp(2rem,5vw,3rem)] font-bold tracking-[-0.04em] text-white">
          This route doesn&apos;t exist —{" "}
          <span className="font-serif-accent">but your launch plan does.</span>
        </h1>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/app"
            className="inline-flex min-h-[46px] items-center rounded-[11px] bg-white px-6 text-[14.5px] font-semibold text-black shadow-[0_0_30px_-6px_rgba(255,255,255,0.4)]"
          >
            Back to dashboard
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[46px] items-center rounded-[11px] border border-white/[0.16] px-5 text-[13.5px] font-medium text-[#d6d6d6] hover:border-white/[0.35] hover:text-white"
          >
            Home
          </Link>
        </div>
      </div>
    </main>
  );
}
