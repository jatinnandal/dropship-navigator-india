import { LandingPageShell } from "@/components/landing/landing-page-shell";
import { LandingHeader } from "@/components/landing/landing-header";
import { LandingHero } from "@/components/landing/landing-hero";
import { LandingTraps } from "@/components/landing/landing-traps";
import { LandingRouteMap } from "@/components/landing/landing-route-map";
import { LandingToolkit } from "@/components/landing/landing-toolkit";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";

export default function Home() {
  return (
    <LandingPageShell>
      <LandingHeader />
      <LandingHero />
      <LandingTraps />
      <LandingRouteMap />
      <LandingToolkit />
      <LandingCta />
      <LandingFooter />
    </LandingPageShell>
  );
}
