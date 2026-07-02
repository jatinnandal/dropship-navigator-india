import { userHasAnySellerProfile } from "@/lib/seller-profile-store";

export async function getPostAuthRedirect(userId: string): Promise<string> {
  const hasProfile = await userHasAnySellerProfile(userId);
  return hasProfile ? "/app" : "/app/welcome";
}

export async function userHasProfile(userId: string): Promise<boolean> {
  return userHasAnySellerProfile(userId);
}

export async function userHasAnyProfile(userId: string): Promise<boolean> {
  return userHasAnySellerProfile(userId);
}

/** For middleware: check seller_profiles first, fall back to legacy profiles table. */
export async function userHasProfileInDb(
  supabase: NonNullable<Awaited<ReturnType<typeof import("@/lib/supabase/server").createSupabaseServerClient>>>,
  userId: string,
): Promise<boolean> {
  try {
    const { count, error } = await supabase
      .from("seller_profiles")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId);

    if (!error && (count ?? 0) > 0) return true;

    const { data, error: legacyError } = await supabase
      .from("profiles")
      .select("user_id")
      .eq("user_id", userId)
      .maybeSingle();

    if (legacyError) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}
