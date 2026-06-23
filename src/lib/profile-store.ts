import type { OnboardingProfile } from "@/lib/mvp-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  experience_level: OnboardingProfile["experienceLevel"];
  budget_band: OnboardingProfile["budgetBand"];
  primary_channel: OnboardingProfile["primaryChannel"];
  has_gstin: boolean;
};

type ProgressRow = {
  module_id: string;
};

export async function getStoredProfile(userId: string): Promise<OnboardingProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("profiles")
    .select("experience_level,budget_band,primary_channel,has_gstin")
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  if (!data) {
    return null;
  }

  return {
    experienceLevel: data.experience_level,
    budgetBand: data.budget_band,
    primaryChannel: data.primary_channel,
    hasGstin: data.has_gstin,
    operatingState: "Maharashtra",
    productType: "general",
    businessType: "proprietorship",
    salesModel: "marketplace_only",
    importsProducts: false,
    sellsPrepackagedGoods: true,
  };
}

export async function upsertProfile(userId: string, profile: OnboardingProfile) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  await supabase.from("profiles").upsert({
    user_id: userId,
    experience_level: profile.experienceLevel,
    budget_band: profile.budgetBand,
    primary_channel: profile.primaryChannel,
    has_gstin: profile.hasGstin,
  });
}

export async function getCompletedModuleIds(userId: string): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return new Set();
  }

  const { data } = await supabase
    .from("journey_progress")
    .select("module_id")
    .eq("user_id", userId)
    .eq("completed", true)
    .returns<ProgressRow[]>();

  return new Set((data ?? []).map((item) => item.module_id));
}

export async function setModuleCompletion(userId: string, moduleId: string, completed: boolean) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  await supabase.from("journey_progress").upsert({
    user_id: userId,
    module_id: moduleId,
    completed,
  });
}
