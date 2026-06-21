"use server";

import { redirect } from "next/navigation";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { upsertProfile } from "@/lib/profile-store";
import { requireUser } from "@/lib/supauth";

function readValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

export async function saveOnboardingProfile(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return;
  }

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
  };

  await upsertProfile(user.id, profile);
  redirect("/app/journey");
}
