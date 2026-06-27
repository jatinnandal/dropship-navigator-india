import { LandingChallenges } from "@/components/landing/landing-challenges";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingHowItWorks } from "@/components/landing/landing-how-it-works";
import { LandingJourneyPreview } from "@/components/landing/landing-journey-preview";
import { LandingSolution } from "@/components/landing/landing-solution";

export default function Home() {
  return (
    <main className="app-shell-bg min-h-screen text-slate-100">
      <LandingHeader />
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 py-10 md:px-10 md:py-16">
        <LandingHero />
        <LandingChallenges />
        <LandingSolution />
        <LandingHowItWorks />
        <LandingJourneyPreview />
        <LandingCta />
      </div>
      <LandingFooter />
    </main>
  );
}
