import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function LandingCta() {
  return (
    <section className="glass-panel-primary rounded-2xl p-8 text-center md:p-12">
      <h2 className="headline-gradient text-2xl font-bold md:text-3xl">Ready to launch the right way?</h2>
      <p className="text-muted mx-auto mt-3 max-w-xl text-sm leading-6 md:text-base">
        Join sellers building real businesses in India — with a co-pilot that tells you what to do next, not what to
        Google.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link
          href="/signup"
          className="btn-emerald inline-flex min-h-[44px] items-center gap-2 rounded-md px-6 py-3 font-medium"
        >
          Get started free
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/login" className="btn-ghost min-h-[44px] rounded-md px-6 py-3 font-medium">
          Log in
        </Link>
      </div>
    </section>
  );
}
