import { LandingChallenges } from "@/components/landing/landing-challenges";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { AppShowcase } from "@/components/landing/app-showcase";
import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { LandingSolution } from "@/components/landing/landing-solution";

export default function Home() {
  return (
    <LandingPageShell>
      <main className="relative text-neutral-100">
        <LandingHeader />

        <section className="section-dark full-bleed">
          <div className="section-inner">
            <LandingHero />
          </div>
        </section>

        <section className="section-light full-bleed">
          <div className="section-inner">
            <LandingChallenges />
          </div>
        </section>

        <section className="section-dark full-bleed">
          <div className="section-inner">
            <LandingSolution />
          </div>
        </section>

        <section className="section-dark full-bleed">
          <div className="section-inner !pt-0">
            <AppShowcase />
          </div>
        </section>

        <section className="section-light full-bleed">
          <div className="section-inner">
            <LandingHowItWorks />
          </div>
        </section>

        <section className="cta-band full-bleed">
          <div className="section-inner">
            <LandingCta />
          </div>
        </section>

        <LandingFooter />
      </main>
    </LandingPageShell>
  );
}
