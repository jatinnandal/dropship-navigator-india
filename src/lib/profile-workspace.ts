import type { OnboardingProfile } from "@/lib/mvp-data";
import { emptyWorkspace, type Workspace } from "@/lib/workspace";
import { getUserWorkspace, upsertUserWorkspace } from "@/lib/user-workspace-store";

/** Fresh workspace for a new seller profile, seeded from onboarding answers. */
export function buildInitialWorkspace(profile: OnboardingProfile): Workspace {
  const subTasks: Record<string, boolean> = {};

  if (profile.hasGstin) {
    subTasks["gstin-active"] = true;
  }

  if (profile.experienceLevel === "existing_seller") {
    subTasks["docs-folder-ready"] = true;
  }

  return {
    ...emptyWorkspace,
    subTasks,
    pickupState: profile.operatingState,
  };
}

export async function ensureProfileWorkspace(
  userId: string,
  profileId: string,
  profile: OnboardingProfile,
): Promise<void> {
  const existing = await getUserWorkspace(userId, profileId);
  if (existing) return;
  await upsertUserWorkspace(userId, buildInitialWorkspace(profile), profileId);
}
