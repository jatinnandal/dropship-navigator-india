import type { OnboardingProfile } from "@/lib/mvp-data";

/** Derived facts from onboarding answers — single source for rule predicates. */
export type ProfileFacts = {
  profile: OnboardingProfile;

  // Experience & readiness
  isBeginner: boolean;
  isExistingSeller: boolean;
  skipBasics: boolean;

  // GST & tax
  hasGstin: boolean;
  needsGstRegistration: boolean;
  gstMandatory: boolean;

  // Channel & sales model
  isMarketplaceChannel: boolean;
  isOwnWebsite: boolean;
  sellsOnMarketplace: boolean;
  sellsOnOwnWebsite: boolean;
  isMultiChannel: boolean;

  // Business entity
  isIndividual: boolean;
  isFormalEntity: boolean;
  pgRejectionRisk: boolean;
  needsPaymentGateway: boolean;

  // Product category
  isFood: boolean;
  isBeauty: boolean;
  isElectronics: boolean;
  isFashion: boolean;
  isGeneralMerchandise: boolean;
  highRtoCategory: boolean;
  needsFssai: boolean;
  needsBis: boolean;
  needsCosmeticLabeling: boolean;

  // Packaging & imports
  needsLegalMetrology: boolean;
  hasImportRisk: boolean;
  needsIec: boolean;

  // Budget & ops
  isLeanBudget: boolean;
  hasComfortableBudget: boolean;
  operatingState: string;
};

export function deriveProfileFacts(profile: OnboardingProfile): ProfileFacts {
  const isBeginner = profile.experienceLevel === "beginner";
  const isExistingSeller = profile.experienceLevel === "existing_seller";
  const hasGstin = profile.hasGstin;

  const isMarketplaceChannel =
    profile.primaryChannel === "amazon" ||
    profile.primaryChannel === "flipkart" ||
    profile.primaryChannel === "meesho";
  const isOwnWebsite = profile.primaryChannel === "shopify";

  const sellsOnMarketplace =
    profile.salesModel === "marketplace_only" || profile.salesModel === "both" || isMarketplaceChannel;
  const sellsOnOwnWebsite =
    profile.salesModel === "own_website_only" || profile.salesModel === "both" || isOwnWebsite;

  const isIndividual = profile.businessType === "individual";
  const isFormalEntity =
    profile.businessType === "llp" ||
    profile.businessType === "private_limited" ||
    profile.businessType === "partnership";

  const gstMandatory =
    profile.primaryChannel === "amazon" ||
    profile.primaryChannel === "flipkart" ||
    (sellsOnMarketplace && profile.primaryChannel !== "meesho");

  const needsPaymentGateway = sellsOnOwnWebsite;
  const pgRejectionRisk = needsPaymentGateway && isIndividual;

  const isFood = profile.productType === "food";
  const isBeauty = profile.productType === "beauty";
  const isElectronics = profile.productType === "electronics";
  const isFashion = profile.productType === "fashion";
  const isGeneralMerchandise = profile.productType === "general";

  return {
    profile,
    isBeginner,
    isExistingSeller,
    skipBasics: isExistingSeller,
    hasGstin,
    needsGstRegistration: !hasGstin,
    gstMandatory,
    isMarketplaceChannel,
    isOwnWebsite,
    sellsOnMarketplace,
    sellsOnOwnWebsite,
    isMultiChannel: profile.salesModel === "both",
    isIndividual,
    isFormalEntity,
    pgRejectionRisk,
    needsPaymentGateway,
    isFood,
    isBeauty,
    isElectronics,
    isFashion,
    isGeneralMerchandise,
    highRtoCategory: isFashion,
    needsFssai: isFood,
    needsBis: isElectronics,
    needsCosmeticLabeling: isBeauty,
    needsLegalMetrology: profile.sellsPrepackagedGoods,
    hasImportRisk: profile.importsProducts,
    needsIec: profile.importsProducts,
    isLeanBudget: profile.budgetBand === "under_20k",
    hasComfortableBudget: profile.budgetBand === "above_1l",
    operatingState: profile.operatingState.trim() || "your state",
  };
}
