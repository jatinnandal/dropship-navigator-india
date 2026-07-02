"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  resolveActiveProfileIdAfterDelete,
  setActiveProfileId,
} from "@/lib/active-profile";
import { getCurrentUserId } from "@/lib/current-user";
import { parseOnboardingFormData } from "@/lib/parse-onboarding-form";
import { ensureProfileWorkspace } from "@/lib/profile-workspace";
import {
  createSellerProfile,
  deleteSellerProfile,
  getSellerProfileById,
  isLegacyProfileId,
  legacyProfileId,
  updateSellerProfile,
  upsertLegacyProfile,
} from "@/lib/seller-profile-store";

function readValue(formData: FormData, key: string): string {
  return String(formData.get(key) ?? "");
}

function redirectAfterSave(returnTo: string | undefined) {
  if (returnTo === "/app" || returnTo === "/app/journey" || returnTo === "/app/profiles") {
    redirect(returnTo);
  }
  redirect("/app/journey");
}

function revalidateAppShell() {
  revalidatePath("/app", "layout");
  revalidatePath("/onboarding", "layout");
  revalidatePath("/app/journey");
  revalidatePath("/app/profiles");
}

export async function saveOnboardingProfile(formData: FormData) {
  const userId = await getCurrentUserId();
  const profile = parseOnboardingFormData(formData);
  const mode = readValue(formData, "mode");
  const profileId = readValue(formData, "profileId");
  const returnTo = readValue(formData, "returnTo") || undefined;
  const profileName = readValue(formData, "profileName").trim() || undefined;

  if (mode === "edit" && profileId) {
    const existing = await getSellerProfileById(userId, profileId);
    if (!existing) redirect("/app/profiles");
    await updateSellerProfile(userId, profileId, profile, profileName);
    if (!isLegacyProfileId(profileId)) {
      await upsertLegacyProfile(userId, profile);
    }
    await ensureMigratedIfPossible(userId);
    revalidateAppShell();
    redirectAfterSave(returnTo);
    return;
  }

  const created = await createSellerProfile(userId, profile, profileName);
  if (created) {
    await setActiveProfileId(userId, created.id);
    await upsertLegacyProfile(userId, profile);
    await ensureProfileWorkspace(userId, created.id, profile);
  } else {
    await upsertLegacyProfile(userId, profile);
    await setActiveProfileId(userId, legacyProfileId(userId));
    await ensureProfileWorkspace(userId, legacyProfileId(userId), profile);
  }

  revalidateAppShell();
  redirectAfterSave(returnTo);
}

async function ensureMigratedIfPossible(userId: string) {
  const { ensureLegacyProfileMigrated } = await import("@/lib/seller-profile-store");
  await ensureLegacyProfileMigrated(userId);
}

export async function switchActiveProfile(profileId: string) {
  const userId = await getCurrentUserId();
  const ok = await setActiveProfileId(userId, profileId);
  if (!ok) return;

  const profileRow = await getSellerProfileById(userId, profileId);
  if (profileRow) {
    await ensureProfileWorkspace(userId, profileId, profileRow);
  }

  revalidateAppShell();
}

export async function deleteProfile(profileId: string) {
  const userId = await getCurrentUserId();
  if (isLegacyProfileId(profileId)) return;
  const ok = await deleteSellerProfile(userId, profileId);
  if (!ok) return;
  await resolveActiveProfileIdAfterDelete(userId, profileId);
  revalidateAppShell();
  redirect("/app/profiles");
}
