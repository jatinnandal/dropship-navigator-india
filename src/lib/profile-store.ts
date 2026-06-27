import type { OnboardingProfile } from "@/lib/mvp-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

type ProfileRow = {
  experience_level: OnboardingProfile["experienceLevel"];
  budget_band: OnboardingProfile["budgetBand"];
  primary_channel: OnboardingProfile["primaryChannel"];
  has_gstin: boolean;
  operating_state: string;
  product_type: OnboardingProfile["productType"];
  business_type: OnboardingProfile["businessType"];
  sales_model: OnboardingProfile["salesModel"];
  imports_products: boolean;
  sells_prepackaged_goods: boolean;
};

type ProgressRow = {
  module_id: string;
};

export async function getStoredProfile(userId: string): Promise<OnboardingProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const fullSelect =
    "experience_level,budget_band,primary_channel,has_gstin,operating_state,product_type,business_type,sales_model,imports_products,sells_prepackaged_goods";

  const { data: profileData, error } = await supabase
    .from("profiles")
    .select(fullSelect)
    .eq("user_id", userId)
    .maybeSingle<ProfileRow>();

  let data = profileData;

  if (error) {
    const fallback = await supabase
      .from("profiles")
      .select("experience_level,budget_band,primary_channel,has_gstin")
      .eq("user_id", userId)
      .maybeSingle<Pick<ProfileRow, "experience_level" | "budget_band" | "primary_channel" | "has_gstin">>();

    if (fallback.error || !fallback.data) {
      return null;
    }

    data = {
      ...fallback.data,
      operating_state: "Maharashtra",
      product_type: "general",
      business_type: "proprietorship",
      sales_model: "marketplace_only",
      imports_products: false,
      sells_prepackaged_goods: true,
    };
  }

  if (!data) {
    return null;
  }

  return {
    experienceLevel: data.experience_level,
    budgetBand: data.budget_band,
    primaryChannel: data.primary_channel,
    hasGstin: data.has_gstin,
    operatingState: data.operating_state,
    productType: data.product_type,
    businessType: data.business_type,
    salesModel: data.sales_model,
    importsProducts: data.imports_products,
    sellsPrepackagedGoods: data.sells_prepackaged_goods,
  };
}

export async function upsertProfile(userId: string, profile: OnboardingProfile) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  const fullRow = {
    user_id: userId,
    experience_level: profile.experienceLevel,
    budget_band: profile.budgetBand,
    primary_channel: profile.primaryChannel,
    has_gstin: profile.hasGstin,
    operating_state: profile.operatingState,
    product_type: profile.productType,
    business_type: profile.businessType,
    sales_model: profile.salesModel,
    imports_products: profile.importsProducts,
    sells_prepackaged_goods: profile.sellsPrepackagedGoods,
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("profiles").upsert(fullRow, { onConflict: "user_id" });

  if (error) {
    await supabase.from("profiles").upsert(
      {
        user_id: userId,
        experience_level: profile.experienceLevel,
        budget_band: profile.budgetBand,
        primary_channel: profile.primaryChannel,
        has_gstin: profile.hasGstin,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id" },
    );
  }
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
    updated_at: new Date().toISOString(),
  });
}
