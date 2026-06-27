import { redirect } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserId } from "@/lib/current-user";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { requireUser } from "@/lib/supauth";

export default async function OnboardingPage() {
  await requireUser();
  const userId = await getCurrentUserId();
  const hasProfile = await userHasProfile(userId);

  if (hasProfile) {
    redirect("/app");
  }

  const profile = await getStoredProfileForCurrentVisitor();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <OnboardingWizard profile={profile} />
    </main>
  );
}
