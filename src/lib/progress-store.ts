import type { OnboardingProfile } from "@/lib/mvp-data";
import { defaultProfile } from "@/lib/mvp-data";
import { getCurrentUserId } from "@/lib/current-user";
import { getActiveSellerProfile } from "@/lib/profile-store";
import {
  getCompletedModuleIds,
  getCompletedModuleIdsForProfile,
  getStoredProfile,
  setModuleCompletion,
  upsertProfile,
  upsertProfileById,
} from "@/lib/profile-store";
import type { SellerProfile } from "@/lib/seller-profile-types";

export async function getActiveSellerProfileForCurrentVisitor(): Promise<SellerProfile | null> {
  const userId = await getCurrentUserId();
  return getActiveSellerProfile(userId);
}

export async function getStoredProfileForCurrentVisitor(): Promise<OnboardingProfile> {
  const userId = await getCurrentUserId();
  const profile = await getStoredProfile(userId);
  return profile ?? defaultProfile;
}

export async function upsertProfileForCurrentVisitor(profile: OnboardingProfile) {
  const userId = await getCurrentUserId();
  await upsertProfile(userId, profile);
}

export async function upsertProfileForCurrentVisitorById(profileId: string, profile: OnboardingProfile) {
  const userId = await getCurrentUserId();
  await upsertProfileById(userId, profileId, profile);
}

export async function getCompletedModuleIdsForCurrentVisitor(): Promise<Set<string>> {
  const userId = await getCurrentUserId();
  return getCompletedModuleIds(userId);
}

export async function getCompletedModuleIdsForProfileId(profileId: string): Promise<Set<string>> {
  return getCompletedModuleIdsForProfile(profileId);
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
