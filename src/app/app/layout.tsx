import { AppMobileNav } from "@/components/app-mobile-nav";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { JargonProvider } from "@/components/jargon-provider";
import { resolveActiveProfileIdFromIds } from "@/lib/active-profile";
import { getCurrentUserEmail, getCurrentUserId } from "@/lib/current-user";
import { getCurrentPlan } from "@/lib/plan";
import { listSellerProfileSummaries } from "@/lib/seller-profile-store";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth is enforced by the middleware (proxy.ts) before this renders;
  // getCurrentUserId redirects to /login if somehow unauthenticated.
  const userId = await getCurrentUserId();

  // One profile query drives everything: hasProfile is derived from it, and the
  // active id is resolved against the same list (no extra ownership round-trips).
  const [email, profiles, plan] = await Promise.all([
    getCurrentUserEmail(),
    listSellerProfileSummaries(userId),
    getCurrentPlan(),
  ]);
  const hasProfile = profiles.length > 0;
  const activeProfileId = await resolveActiveProfileIdFromIds(
    userId,
    profiles.map((p) => p.id),
  );

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
