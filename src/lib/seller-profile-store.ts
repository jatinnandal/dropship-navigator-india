import type { OnboardingProfile } from "@/lib/mvp-data";
import { defaultProfileName } from "@/lib/profile-name";
import type { SellerProfile, SellerProfileSummary } from "@/lib/seller-profile-types";
import { createSupabaseDataClient } from "@/lib/supabase/server";

type SellerProfileRow = {
  id: string;
  user_id: string;
  name: string;
  experience_level: OnboardingProfile["experienceLevel"];
  budget_band: OnboardingProfile["budgetBand"];
  primary_channel: OnboardingProfile["primaryChannel"];
  has_gstin: boolean;
  operating_state: string;
  product_type: OnboardingProfile["productType"];
  product_decided?: boolean | null;
  business_type: OnboardingProfile["businessType"];
  sales_model: OnboardingProfile["salesModel"];
  imports_products: boolean;
  sells_prepackaged_goods: boolean;
  created_at?: string;
  updated_at?: string;
};

type LegacyProfileRow = {
  experience_level: OnboardingProfile["experienceLevel"];
  budget_band: OnboardingProfile["budgetBand"];
  primary_channel: OnboardingProfile["primaryChannel"];
  has_gstin: boolean;
  operating_state?: string;
  product_type?: OnboardingProfile["productType"];
  business_type?: OnboardingProfile["businessType"];
  sales_model?: OnboardingProfile["salesModel"];
  imports_products?: boolean;
  sells_prepackaged_goods?: boolean;
};

function rowToSellerProfile(row: SellerProfileRow): SellerProfile {
  return {
    id: row.id,
    userId: row.user_id,
    name: row.name,
    experienceLevel: row.experience_level,
    budgetBand: row.budget_band,
    primaryChannel: row.primary_channel,
    hasGstin: row.has_gstin,
    operatingState: row.operating_state,
    productType: row.product_type,
    // Default true so pre-existing rows (column added later) aren't blocked.
    productDecided: row.product_decided ?? true,
    businessType: row.business_type,
    salesModel: row.sales_model,
    importsProducts: row.imports_products,
    sellsPrepackagedGoods: row.sells_prepackaged_goods,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function profileToRow(userId: string, profile: OnboardingProfile, name: string) {
  return {
    user_id: userId,
    name,
    experience_level: profile.experienceLevel,
    budget_band: profile.budgetBand,
    primary_channel: profile.primaryChannel,
    has_gstin: profile.hasGstin,
    operating_state: profile.operatingState,
    product_type: profile.productType,
    product_decided: profile.productDecided,
    business_type: profile.businessType,
    sales_model: profile.salesModel,
    imports_products: profile.importsProducts,
    sells_prepackaged_goods: profile.sellsPrepackagedGoods,
    updated_at: new Date().toISOString(),
  };
}

const PROFILE_SELECT =
  "id,user_id,name,experience_level,budget_band,primary_channel,has_gstin,operating_state,product_type,product_decided,business_type,sales_model,imports_products,sells_prepackaged_goods,created_at,updated_at";

export function legacyProfileId(userId: string): string {
  return `legacy-${userId}`;
}

export function isLegacyProfileId(profileId: string): boolean {
  return profileId.startsWith("legacy-");
}

function legacyToSellerProfile(userId: string, profile: OnboardingProfile, name?: string): SellerProfile {
  return {
    id: legacyProfileId(userId),
    userId,
    name: name?.trim() || defaultProfileName(profile),
    ...profile,
  };
}

export async function upsertLegacyProfile(userId: string, profile: OnboardingProfile) {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return;

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

async function querySellerProfiles(userId: string): Promise<SellerProfile[]> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("seller_profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .order("updated_at", { ascending: false })
    .returns<SellerProfileRow[]>();

  if (error || !data) return [];
  return data.map(rowToSellerProfile);
}

export async function listSellerProfiles(userId: string): Promise<SellerProfile[]> {
  const profiles = await querySellerProfiles(userId);
  if (profiles.length > 0) return profiles;

  const migrated = await ensureLegacyProfileMigrated(userId);
  if (migrated) return [migrated];

  const legacy = await getLegacyProfile(userId);
  return legacy ? [legacyToSellerProfile(userId, legacy)] : [];
}

export async function listSellerProfileSummaries(userId: string): Promise<SellerProfileSummary[]> {
  const profiles = await listSellerProfiles(userId);
  return profiles.map(({ id, name, primaryChannel, productType }) => ({
    id,
    name,
    primaryChannel,
    productType,
  }));
}

export async function getSellerProfileById(userId: string, profileId: string): Promise<SellerProfile | null> {
  if (isLegacyProfileId(profileId)) {
    const legacyUserId = profileId.slice("legacy-".length);
    if (legacyUserId !== userId) return null;
    const legacy = await getLegacyProfile(userId);
    return legacy ? legacyToSellerProfile(userId, legacy) : null;
  }

  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("seller_profiles")
    .select(PROFILE_SELECT)
    .eq("user_id", userId)
    .eq("id", profileId)
    .maybeSingle<SellerProfileRow>();

  return data ? rowToSellerProfile(data) : null;
}

export async function createSellerProfile(
  userId: string,
  profile: OnboardingProfile,
  name?: string,
): Promise<SellerProfile | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const profileName = name?.trim() || defaultProfileName(profile);
  const { data, error } = await supabase
    .from("seller_profiles")
    .insert(profileToRow(userId, profile, profileName))
    .select(PROFILE_SELECT)
    .single<SellerProfileRow>();

  if (error || !data) return null;
  return rowToSellerProfile(data);
}

export async function updateSellerProfile(
  userId: string,
  profileId: string,
  profile: OnboardingProfile,
  name?: string,
): Promise<SellerProfile | null> {
  if (isLegacyProfileId(profileId)) {
    await upsertLegacyProfile(userId, profile);
    return legacyToSellerProfile(userId, profile, name);
  }

  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const profileName = name?.trim() || defaultProfileName(profile);
  const { data, error } = await supabase
    .from("seller_profiles")
    .update(profileToRow(userId, profile, profileName))
    .eq("user_id", userId)
    .eq("id", profileId)
    .select(PROFILE_SELECT)
    .single<SellerProfileRow>();

  if (error || !data) return null;
  return rowToSellerProfile(data);
}

export async function deleteSellerProfile(userId: string, profileId: string): Promise<boolean> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return false;

  const profiles = await listSellerProfiles(userId);
  if (profiles.length <= 1) return false;

  const { error } = await supabase.from("seller_profiles").delete().eq("user_id", userId).eq("id", profileId);

  return !error;
}

export async function countSellerProfiles(userId: string): Promise<number> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return 0;

  const { count, error } = await supabase
    .from("seller_profiles")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId);

  if (error) return 0;
  return count ?? 0;
}

/**
 * True if any onboarding ANSWER differs between old and new. Every answer is
 * capped - only the profile name is freely editable (it isn't an answer field).
 */
export function hasMaterialProfileChange(a: OnboardingProfile, b: OnboardingProfile): boolean {
  return (
    a.experienceLevel !== b.experienceLevel ||
    a.budgetBand !== b.budgetBand ||
    a.primaryChannel !== b.primaryChannel ||
    a.operatingState !== b.operatingState ||
    a.businessType !== b.businessType ||
    a.hasGstin !== b.hasGstin ||
    a.salesModel !== b.salesModel ||
    a.productType !== b.productType ||
    a.productDecided !== b.productDecided ||
    a.importsProducts !== b.importsProducts ||
    a.sellsPrepackagedGoods !== b.sellsPrepackagedGoods
  );
}

export async function countMaterialChangesThisMonth(profileId: string): Promise<number> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("profile_material_changes")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gte("changed_at", monthStart.toISOString());

  return count ?? 0;
}

export async function recordMaterialChange(profileId: string): Promise<void> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return;
  await supabase.from("profile_material_changes").insert({ profile_id: profileId });
}

async function getLegacyProfile(userId: string): Promise<OnboardingProfile | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const fullSelect =
    "experience_level,budget_band,primary_channel,has_gstin,operating_state,product_type,business_type,sales_model,imports_products,sells_prepackaged_goods";

  const { data, error } = await supabase
    .from("profiles")
    .select(fullSelect)
    .eq("user_id", userId)
    .maybeSingle<LegacyProfileRow>();

  if (error || !data) return null;

  return {
    experienceLevel: data.experience_level,
    budgetBand: data.budget_band,
    primaryChannel: data.primary_channel,
    hasGstin: data.has_gstin,
    operatingState: data.operating_state ?? "Maharashtra",
    productType: data.product_type ?? "general",
    // Legacy table doesn't track this; treat pre-migration profiles as decided.
    productDecided: true,
    businessType: data.business_type ?? "proprietorship",
    salesModel: data.sales_model ?? "marketplace_only",
    importsProducts: data.imports_products ?? false,
    sellsPrepackagedGoods: data.sells_prepackaged_goods ?? true,
  };
}

/** Migrate legacy single profile to seller_profiles when multi-profile tables exist but user has no rows yet. */
export async function ensureLegacyProfileMigrated(userId: string): Promise<SellerProfile | null> {
  const existing = await querySellerProfiles(userId);
  if (existing.length > 0) return existing[0];

  const legacy = await getLegacyProfile(userId);
  if (!legacy) return null;

  const created = await createSellerProfile(userId, legacy);
  if (!created) return null;

  const supabase = await createSupabaseDataClient();
  if (supabase) {
    await supabase.from("user_preferences").upsert({
      user_id: userId,
      active_profile_id: created.id,
      updated_at: new Date().toISOString(),
    });
  }

  return created;
}

export async function userHasAnySellerProfile(userId: string): Promise<boolean> {
  const count = await countSellerProfiles(userId);
  if (count > 0) return true;

  const legacy = await getLegacyProfile(userId);
  return legacy !== null;
}
