import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { PersonalizedModulePlan } from "@/lib/llm/plan-generator";

/**
 * Persistence for personalized compliance-module plans. Keyed by
 * (profile_id, module_id, profile_hash) so a plan is generated once per profile
 * state and served from cache thereafter - returning users never regenerate.
 * The monthly generation count (countGenerationsThisMonth) is the abuse cap.
 */

export async function getModulePlan(
  profileId: string,
  moduleId: string,
  profileHash: string,
): Promise<PersonalizedModulePlan | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("journey_plans")
    .select("plan")
    .eq("profile_id", profileId)
    .eq("module_id", moduleId)
    .eq("profile_hash", profileHash)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.plan as PersonalizedModulePlan | undefined) ?? null;
}

export async function countGenerationsThisMonth(profileId: string): Promise<number> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("journey_plans")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .not("module_id", "is", null)
    .gte("generated_at", monthStart.toISOString());

  return count ?? 0;
}

export async function insertModulePlan(
  profileId: string,
  moduleId: string,
  profileHash: string,
  model: string,
  plan: PersonalizedModulePlan,
): Promise<boolean> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return false;

  const { error } = await supabase.from("journey_plans").insert({
    profile_id: profileId,
    module_id: moduleId,
    profile_hash: profileHash,
    model,
    plan,
  });

  return !error;
}
