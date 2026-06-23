import { cookies } from "next/headers";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { defaultProfile } from "@/lib/mvp-data";

const PROFILE_COOKIE = "dsi_profile";
const COMPLETED_COOKIE = "dsi_completed_modules";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
};

function parseProfile(raw: string | undefined): OnboardingProfile | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<OnboardingProfile>;
    return {
      experienceLevel: parsed.experienceLevel === "existing_seller" ? "existing_seller" : "beginner",
      budgetBand:
        parsed.budgetBand === "20k_1l" || parsed.budgetBand === "above_1l" ? parsed.budgetBand : "under_20k",
      primaryChannel:
        parsed.primaryChannel === "amazon" ||
        parsed.primaryChannel === "flipkart" ||
        parsed.primaryChannel === "shopify"
          ? parsed.primaryChannel
          : "meesho",
      hasGstin: parsed.hasGstin === true,
      operatingState: typeof parsed.operatingState === "string" && parsed.operatingState.trim().length > 0
        ? parsed.operatingState
        : defaultProfile.operatingState,
      productType:
        parsed.productType === "food" ||
        parsed.productType === "beauty" ||
        parsed.productType === "electronics" ||
        parsed.productType === "fashion"
          ? parsed.productType
          : "general",
      businessType:
        parsed.businessType === "individual" ||
        parsed.businessType === "partnership" ||
        parsed.businessType === "llp" ||
        parsed.businessType === "private_limited"
          ? parsed.businessType
          : "proprietorship",
      salesModel:
        parsed.salesModel === "own_website_only" || parsed.salesModel === "both"
          ? parsed.salesModel
          : "marketplace_only",
      importsProducts: parsed.importsProducts === true,
      sellsPrepackagedGoods: parsed.sellsPrepackagedGoods !== false,
    };
  } catch {
    return null;
  }
}

function parseCompleted(raw: string | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === "string" && item.length > 0);
  } catch {
    return [];
  }
}

export async function getLocalProfile(): Promise<OnboardingProfile> {
  const store = await cookies();
  const parsed = parseProfile(store.get(PROFILE_COOKIE)?.value);
  return parsed ?? defaultProfile;
}

export async function saveLocalProfile(profile: OnboardingProfile) {
  const store = await cookies();
  store.set(PROFILE_COOKIE, JSON.stringify(profile), COOKIE_OPTIONS);
}

export async function getLocalCompletedModuleIds(): Promise<Set<string>> {
  const store = await cookies();
  return new Set(parseCompleted(store.get(COMPLETED_COOKIE)?.value));
}

export async function setLocalModuleCompletion(moduleId: string, completed: boolean) {
  const store = await cookies();
  const current = parseCompleted(store.get(COMPLETED_COOKIE)?.value);
  const next = new Set(current);

  if (completed) {
    next.add(moduleId);
  } else {
    next.delete(moduleId);
  }

  store.set(COMPLETED_COOKIE, JSON.stringify(Array.from(next)), COOKIE_OPTIONS);
}
