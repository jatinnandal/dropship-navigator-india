import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { defaultProfile } from "@/lib/mvp-data";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { requireUser } from "@/lib/supauth";

type SearchParams = Promise<{ mode?: string; returnTo?: string }>;

export default async function OnboardingPage({ searchParams }: { searchParams: SearchParams }) {
  await requireUser();
  const userId = await getCurrentUserId();
  const params = await searchParams;
  const isNewProfile = params.mode === "new";
  const hasProfile = await userHasProfile(userId);
  const returnTo = params.returnTo;

  if (hasProfile && !isNewProfile) {
    redirect("/app/profiles");
  }

  const profile = isNewProfile ? defaultProfile : await getStoredProfileForCurrentVisitor();

  return (
    <main className="min-h-screen">
      <OnboardingWizard
        profile={profile}
        mode="create"
        returnTo={returnTo ?? (isNewProfile ? "/app/profiles" : "/app/journey")}
      />
    </main>
  );
}
