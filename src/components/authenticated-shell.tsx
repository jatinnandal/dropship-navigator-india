import { AppShellClient } from "@/components/app-shell-client";
import type { Plan } from "@/lib/entitlements";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles?: SellerProfileSummary[];
  activeProfileId?: string | null;
  plan?: Plan;
  children: React.ReactNode;
};

export function AuthenticatedShell({
  email,
  hasProfile,
  profiles = [],
  activeProfileId = null,
  plan = "free",
  children,
}: Props) {
  return (
    <AppShellClient
      email={email}
      hasProfile={hasProfile}
      profiles={profiles}
      activeProfileId={activeProfileId}
      plan={plan}
    >
      {children}
    </AppShellClient>
  );
}
