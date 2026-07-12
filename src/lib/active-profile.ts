import { cookies } from "next/headers";
import {
  ensureLegacyProfileMigrated,
  getSellerProfileById,
  listSellerProfiles,
} from "@/lib/seller-profile-store";
import { createSupabaseDataClient } from "@/lib/supabase/server";

export const ACTIVE_PROFILE_COOKIE = "dni_active_profile_id";

/**
 * Resolve the active profile id from a list the caller already has, doing at
 * most one extra query (user_preferences). Avoids the per-candidate ownership
 * round-trips that getStoredActiveProfileId makes — the ids are validated by
 * membership in the caller's own profile list. Used on the hot app-layout path.
 */
export async function resolveActiveProfileIdFromIds(
  userId: string,
  ownedIds: string[],
): Promise<string | null> {
  if (ownedIds.length === 0) return null;
  const owned = new Set(ownedIds);

  const cookieStore = await cookies();
  const cookieId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;
  if (cookieId && owned.has(cookieId)) return cookieId;

  const supabase = await createSupabaseDataClient();
  if (supabase) {
    const { data: prefs } = await supabase
      .from("user_preferences")
      .select("active_profile_id")
      .eq("user_id", userId)
      .maybeSingle<{ active_profile_id: string | null }>();
    if (prefs?.active_profile_id && owned.has(prefs.active_profile_id)) {
      return prefs.active_profile_id;
    }
  }

  return ownedIds[0];
}

export async function getStoredActiveProfileId(userId: string): Promise<string | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const cookieStore = await cookies();
  const cookieId = cookieStore.get(ACTIVE_PROFILE_COOKIE)?.value;

  if (cookieId) {
    const owned = await getSellerProfileById(userId, cookieId);
    if (owned) return cookieId;
  }

  const { data: prefs } = await supabase
    .from("user_preferences")
    .select("active_profile_id")
    .eq("user_id", userId)
    .maybeSingle<{ active_profile_id: string | null }>();

  if (prefs?.active_profile_id) {
    const owned = await getSellerProfileById(userId, prefs.active_profile_id);
    if (owned) return prefs.active_profile_id;
  }

  const profiles = await listSellerProfiles(userId);
  if (profiles.length > 0) return profiles[0].id;

  const migrated = await ensureLegacyProfileMigrated(userId);
  if (migrated) return migrated.id;

  return null;
}

export async function setActiveProfileId(userId: string, profileId: string): Promise<boolean> {
  const owned = await getSellerProfileById(userId, profileId);
  if (!owned) return false;

  const supabase = await createSupabaseDataClient();
  if (supabase) {
    const { error } = await supabase.from("user_preferences").upsert({
      user_id: userId,
      active_profile_id: profileId,
      updated_at: new Date().toISOString(),
    });
    if (error) {
      // user_preferences table may not exist yet — cookie fallback is fine
    }
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_PROFILE_COOKIE, profileId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return true;
}

export async function resolveActiveProfileIdAfterDelete(
  userId: string,
  deletedProfileId: string,
): Promise<void> {
  const activeId = await getStoredActiveProfileId(userId);
  if (activeId !== deletedProfileId) return;

  const profiles = await listSellerProfiles(userId);
  if (profiles.length > 0) {
    await setActiveProfileId(userId, profiles[0].id);
    return;
  }

  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_PROFILE_COOKIE);

  const supabase = await createSupabaseDataClient();
  if (supabase) {
    await supabase.from("user_preferences").upsert({
      user_id: userId,
      active_profile_id: null,
      updated_at: new Date().toISOString(),
    });
  }
}
