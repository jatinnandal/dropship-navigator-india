import type { OnboardingProfile } from "@/lib/mvp-data";
import {
  getGuestCompletedModuleIds,
  getGuestStoredProfile,
  setGuestModuleCompletion,
  upsertGuestProfile,
} from "@/lib/guest-supabase-store";
import {
  getLocalCompletedModuleIds,
  getLocalProfile,
  saveLocalProfile,
  setLocalModuleCompletion,
} from "@/lib/local-progress-store";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function getStoredProfileForCurrentVisitor(): Promise<OnboardingProfile> {
  if (isSupabaseConfigured()) {
    const profile = await getGuestStoredProfile();
    if (profile) {
      return profile;
    }
  }
  return getLocalProfile();
}

export async function upsertProfileForCurrentVisitor(profile: OnboardingProfile) {
  await saveLocalProfile(profile);
  if (isSupabaseConfigured()) {
    await upsertGuestProfile(profile);
  }
}

export async function getCompletedModuleIdsForCurrentVisitor(): Promise<Set<string>> {
  if (isSupabaseConfigured()) {
    const supabaseCompleted = await getGuestCompletedModuleIds();
    if (supabaseCompleted.size > 0) {
      return supabaseCompleted;
    }
  }
  return getLocalCompletedModuleIds();
}

export async function setModuleCompletionForCurrentVisitor(moduleId: string, completed: boolean) {
  await setLocalModuleCompletion(moduleId, completed);
  if (isSupabaseConfigured()) {
    await setGuestModuleCompletion(moduleId, completed);
  }
}
