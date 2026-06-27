import type { OnboardingProfile } from "@/lib/mvp-data";
import { defaultProfile } from "@/lib/mvp-data";
import { getCurrentUserId } from "@/lib/current-user";
import {
  getCompletedModuleIds,
  getStoredProfile,
  setModuleCompletion,
  upsertProfile,
} from "@/lib/profile-store";

export async function getStoredProfileForCurrentVisitor(): Promise<OnboardingProfile> {
  const userId = await getCurrentUserId();
  const profile = await getStoredProfile(userId);
  return profile ?? defaultProfile;
}

export async function upsertProfileForCurrentVisitor(profile: OnboardingProfile) {
  const userId = await getCurrentUserId();
  await upsertProfile(userId, profile);
}

export async function getCompletedModuleIdsForCurrentVisitor(): Promise<Set<string>> {
  const userId = await getCurrentUserId();
  return getCompletedModuleIds(userId);
}

export async function setModuleCompletionForCurrentVisitor(moduleId: string, completed: boolean) {
  const userId = await getCurrentUserId();
  await setModuleCompletion(userId, moduleId, completed);
}

export async function hasStoredProfileForCurrentUser(): Promise<boolean> {
  const userId = await getCurrentUserId();
  const profile = await getStoredProfile(userId);
  return profile !== null;
}
