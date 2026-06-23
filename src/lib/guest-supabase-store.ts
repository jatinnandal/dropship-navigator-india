import type { OnboardingProfile } from "@/lib/mvp-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getOrCreateVisitorId, getVisitorId } from "@/lib/visitor-store";

type GuestProfileRow = {
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

type GuestProgressRow = {
  module_id: string;
};

export async function getGuestStoredProfile(): Promise<OnboardingProfile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const visitorId = await getVisitorId();
  if (!visitorId) {
    return null;
  }
  const { data } = await supabase
    .from("guest_profiles")
    .select(
      "experience_level,budget_band,primary_channel,has_gstin,operating_state,product_type,business_type,sales_model,imports_products,sells_prepackaged_goods",
    )
    .eq("visitor_id", visitorId)
    .maybeSingle<GuestProfileRow>();

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

export async function upsertGuestProfile(profile: OnboardingProfile) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  const visitorId = await getOrCreateVisitorId();
  await supabase.from("guest_profiles").upsert({
    visitor_id: visitorId,
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
  });
}

export async function getGuestCompletedModuleIds(): Promise<Set<string>> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return new Set();
  }

  const visitorId = await getVisitorId();
  if (!visitorId) {
    return new Set();
  }
  const { data } = await supabase
    .from("guest_journey_progress")
    .select("module_id")
    .eq("visitor_id", visitorId)
    .eq("completed", true)
    .returns<GuestProgressRow[]>();

  return new Set((data ?? []).map((item) => item.module_id));
}

export async function setGuestModuleCompletion(moduleId: string, completed: boolean) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return;
  }

  const visitorId = await getOrCreateVisitorId();
  await supabase.from("guest_journey_progress").upsert({
    visitor_id: visitorId,
    module_id: moduleId,
    completed,
  });
}
