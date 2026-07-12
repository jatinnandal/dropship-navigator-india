import type { OnboardingProfile } from "@/lib/mvp-data";
import { getStoredActiveProfileId } from "@/lib/active-profile";
import type { SellerProfile } from "@/lib/seller-profile-types";
import {
  createSellerProfile,
  getSellerProfileById,
  isLegacyProfileId,
  legacyProfileId,
  listSellerProfiles,
  updateSellerProfile,
  upsertLegacyProfile,
} from "@/lib/seller-profile-store";
import { createSupabaseDataClient } from "@/lib/supabase/server";

type ProgressRow = {
  module_id: string;
};

export async function getActiveSellerProfile(userId: string): Promise<SellerProfile | null> {
  const profileId = await getStoredActiveProfileId(userId);
  if (profileId) {
    const profile = await getSellerProfileById(userId, profileId);
    if (profile) return profile;
  }
  const profiles = await listSellerProfiles(userId);
  return profiles[0] ?? null;
}

export async function getStoredProfile(userId: string): Promise<OnboardingProfile | null> {
  const profile = await getActiveSellerProfile(userId);
  if (!profile) return null;
  return {
    experienceLevel: profile.experienceLevel,
    budgetBand: profile.budgetBand,
    primaryChannel: profile.primaryChannel,
    hasGstin: profile.hasGstin,
    operatingState: profile.operatingState,
    productType: profile.productType,
    productDecided: profile.productDecided,
    businessType: profile.businessType,
    salesModel: profile.salesModel,
    importsProducts: profile.importsProducts,
    sellsPrepackagedGoods: profile.sellsPrepackagedGoods,
  };
}

export async function upsertProfile(userId: string, profile: OnboardingProfile) {
  const active = await getActiveSellerProfile(userId);
  if (active && !isLegacyProfileId(active.id)) {
    await updateSellerProfile(userId, active.id, profile);
    await upsertLegacyProfile(userId, profile);
    return;
  }

  const created = await createSellerProfile(userId, profile);
  if (created) {
    const { setActiveProfileId } = await import("@/lib/active-profile");
    await setActiveProfileId(userId, created.id);
    await upsertLegacyProfile(userId, profile);
    return;
  }

  await upsertLegacyProfile(userId, profile);
  const { setActiveProfileId } = await import("@/lib/active-profile");
  await setActiveProfileId(userId, legacyProfileId(userId));
}

export async function upsertProfileById(userId: string, profileId: string, profile: OnboardingProfile) {
  await updateSellerProfile(userId, profileId, profile);
}

export async function getCompletedModuleIds(userId: string, profileId?: string): Promise<Set<string>> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return new Set();

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return new Set();

  const { data, error } = await supabase
    .from("journey_progress")
    .select("module_id")
    .eq("profile_id", resolvedProfileId)
    .eq("completed", true)
    .returns<ProgressRow[]>();

  if (!error) {
    return new Set((data ?? []).map((item) => item.module_id));
  }

  if (isLegacyProfileId(resolvedProfileId)) {
    const legacy = await supabase
      .from("journey_progress")
      .select("module_id")
      .eq("user_id", userId)
      .eq("completed", true)
      .returns<ProgressRow[]>();
    return new Set((legacy.data ?? []).map((item) => item.module_id));
  }

  return new Set();
}

export async function setModuleCompletion(
  userId: string,
  moduleId: string,
  completed: boolean,
  profileId?: string,
) {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return;

  const resolvedProfileId = profileId ?? (await getStoredActiveProfileId(userId));
  if (!resolvedProfileId) return;

  const row = {
    profile_id: resolvedProfileId,
    module_id: moduleId,
    completed,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("journey_progress").upsert(row);

  if (error) {
    await supabase.from("journey_progress").upsert({
      user_id: userId,
      module_id: moduleId,
      completed,
      updated_at: new Date().toISOString(),
    });
  }
}

export async function getCompletedModuleIdsForProfile(profileId: string): Promise<Set<string>> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return new Set();

  const { data } = await supabase
    .from("journey_progress")
    .select("module_id")
    .eq("profile_id", profileId)
    .eq("completed", true)
    .returns<ProgressRow[]>();

  return new Set((data ?? []).map((item) => item.module_id));
}
