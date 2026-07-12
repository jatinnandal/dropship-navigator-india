import type { OnboardingProfile } from "@/lib/mvp-data";

function readValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

const REAL_CATEGORIES = ["fashion", "beauty", "electronics", "food", "general"];

export function parseOnboardingFormData(formData: FormData): OnboardingProfile {
  const stateInput = readValue(formData, "operatingState").trim();
  const channel = readValue(formData, "primaryChannel");
  const rawProduct = readValue(formData, "productType");
  return {
    experienceLevel: readValue(formData, "experienceLevel") === "existing_seller"
      ? "existing_seller"
      : "beginner",
    budgetBand:
      readValue(formData, "budgetBand") === "20k_1l" || readValue(formData, "budgetBand") === "above_1l"
        ? (readValue(formData, "budgetBand") as OnboardingProfile["budgetBand"])
        : "under_20k",
    primaryChannel:
      channel === "amazon" || channel === "flipkart" || channel === "shopify"
        ? (channel as OnboardingProfile["primaryChannel"])
        : "meesho",
    hasGstin: readValue(formData, "hasGstin") === "yes",
    operatingState: stateInput.length > 0 ? stateInput : "Maharashtra",
    productType:
      rawProduct === "food" ||
      rawProduct === "beauty" ||
      rawProduct === "electronics" ||
      rawProduct === "fashion"
        ? (rawProduct as OnboardingProfile["productType"])
        : "general",
    // "general" (General merchandise) is a real choice; "not_sure" / blank isn't.
    productDecided: REAL_CATEGORIES.includes(rawProduct),
    businessType:
      readValue(formData, "businessType") === "individual" ||
      readValue(formData, "businessType") === "partnership" ||
      readValue(formData, "businessType") === "llp" ||
      readValue(formData, "businessType") === "private_limited"
        ? (readValue(formData, "businessType") as OnboardingProfile["businessType"])
        : "proprietorship",
    salesModel:
      readValue(formData, "salesModel") === "own_website_only" || readValue(formData, "salesModel") === "both"
        ? (readValue(formData, "salesModel") as OnboardingProfile["salesModel"])
        : "marketplace_only",
    importsProducts: readValue(formData, "importsProducts") === "yes",
    sellsPrepackagedGoods: readValue(formData, "sellsPrepackagedGoods") !== "no",
  };
}
