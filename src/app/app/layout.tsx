import { AppMobileNav } from "@/components/app-mobile-nav";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { JargonProvider } from "@/components/jargon-provider";
import { getStoredActiveProfileId } from "@/lib/active-profile";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserEmail, getCurrentUserId } from "@/lib/current-user";
import { getCurrentPlan } from "@/lib/plan";
import { listSellerProfileSummaries } from "@/lib/seller-profile-store";
import { requireUser } from "@/lib/supauth";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();
  const userId = await getCurrentUserId();
  const [email, hasProfile, profiles, activeProfileId, plan] = await Promise.all([
    getCurrentUserEmail(),
    userHasProfile(userId),
    listSellerProfileSummaries(userId),
    getStoredActiveProfileId(userId),
    getCurrentPlan(),
  ]);

  return (
    <JargonProvider>
      <AuthenticatedShell
        email={email}
        hasProfile={hasProfile}
        profiles={profiles}
        activeProfileId={activeProfileId}
        plan={plan}
      >
        {children}
      </AuthenticatedShell>
      <AppMobileNav hasProfile={hasProfile} />
    </JargonProvider>
  );
}
