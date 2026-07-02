import { AppShellClient } from "@/components/app-shell-client";
import type { SellerProfileSummary } from "@/lib/seller-profile-types";

type Props = {
  email: string | null;
  hasProfile: boolean;
  profiles?: SellerProfileSummary[];
  activeProfileId?: string | null;
  children: React.ReactNode;
};

export function AuthenticatedShell({
  email,
  hasProfile,
  profiles = [],
  activeProfileId = null,
  children,
}: Props) {
  return (
    <AppShellClient
      email={email}
      hasProfile={hasProfile}
      profiles={profiles}
      activeProfileId={activeProfileId}
    >
      {children}
    </AppShellClient>
  );
}
