"use server";

import { redirect } from "next/navigation";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { upsertProfileForCurrentVisitor } from "@/lib/progress-store";

function readValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

export async function saveOnboardingProfile(formData: FormData) {
  const stateInput = readValue(formData, "operatingState").trim();
  const profile: OnboardingProfile = {
    experienceLevel: readValue(formData, "experienceLevel") === "existing_seller"
      ? "existing_seller"
      : "beginner",
    budgetBand:
      readValue(formData, "budgetBand") === "20k_1l" || readValue(formData, "budgetBand") === "above_1l"
        ? (readValue(formData, "budgetBand") as OnboardingProfile["budgetBand"])
        : "under_20k",
    primaryChannel:
      readValue(formData, "primaryChannel") === "amazon" ||
      readValue(formData, "primaryChannel") === "flipkart" ||
      readValue(formData, "primaryChannel") === "shopify"
        ? (readValue(formData, "primaryChannel") as OnboardingProfile["primaryChannel"])
        : "meesho",
    hasGstin: readValue(formData, "hasGstin") === "yes",
    operatingState: stateInput.length > 0 ? stateInput : "Maharashtra",
    productType:
      readValue(formData, "productType") === "food" ||
      readValue(formData, "productType") === "beauty" ||
      readValue(formData, "productType") === "electronics" ||
      readValue(formData, "productType") === "fashion"
        ? (readValue(formData, "productType") as OnboardingProfile["productType"])
        : "general",
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

  await upsertProfileForCurrentVisitor(profile);
  redirect("/app/journey");
}
