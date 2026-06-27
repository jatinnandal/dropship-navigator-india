import { JargonProvider } from "@/components/jargon-provider";
import { AuthenticatedShell } from "@/components/authenticated-shell";
import { AppMobileNav } from "@/components/app-mobile-nav";
import { userHasProfile } from "@/lib/auth-routing";
import { getCurrentUserEmail, getCurrentUserId } from "@/lib/current-user";
import { requireUser } from "@/lib/supauth";

export default async function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireUser();
  const userId = await getCurrentUserId();
  const [email, hasProfile] = await Promise.all([getCurrentUserEmail(), userHasProfile(userId)]);

  return (
    <JargonProvider>
      <AuthenticatedShell email={email} hasProfile={hasProfile}>
        {children}
      </AuthenticatedShell>
      <AppMobileNav hasProfile={hasProfile} />
    </JargonProvider>
  );
}
