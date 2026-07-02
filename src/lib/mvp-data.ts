import { buildJourneyPlan } from "@/lib/journey-engine";

export type ExperienceLevel = "beginner" | "existing_seller";
export type BudgetBand = "under_20k" | "20k_1l" | "above_1l";
export type PrimaryChannel = "meesho" | "amazon" | "flipkart" | "shopify";
export type ProductType = "general" | "food" | "beauty" | "electronics" | "fashion";
export type BusinessType = "individual" | "proprietorship" | "partnership" | "llp" | "private_limited";
export type SalesModel = "marketplace_only" | "own_website_only" | "both";

export type OnboardingProfile = {
  experienceLevel: ExperienceLevel;
  budgetBand: BudgetBand;
  primaryChannel: PrimaryChannel;
  hasGstin: boolean;
  operatingState: string;
  productType: ProductType;
  businessType: BusinessType;
  salesModel: SalesModel;
  importsProducts: boolean;
  sellsPrepackagedGoods: boolean;
};

export type JourneyModule = {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  tools: string[];
  isPriority: boolean;
  deprioritized?: boolean;
};

export function buildPersonalizedJourney(profile: OnboardingProfile): JourneyModule[] {
  const plan = buildJourneyPlan(profile);
  return plan.modules.map((m) => ({
    id: m.id,
    title: m.title,
    description: m.description,
    outcomes: m.outcomes,
    tools: m.tools,
    isPriority: m.isPriority,
    deprioritized: m.deprioritized,
  }));
}

export const defaultProfile: OnboardingProfile = {
  experienceLevel: "beginner",
  budgetBand: "under_20k",
  primaryChannel: "meesho",
  hasGstin: false,
  operatingState: "Maharashtra",
  productType: "general",
  businessType: "proprietorship",
  salesModel: "marketplace_only",
  importsProducts: false,
  sellsPrepackagedGoods: true,
};

export { buildJourneyPlan } from "@/lib/journey-engine";
