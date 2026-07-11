import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { PersonalizedPlan } from "@/lib/llm/plan-generator";

/**
 * Persistence for LLM personalized journey plans. One row per generation; the
 * profile's current plan is the most recent row. The regen cap is enforced by
 * counting this-calendar-month rows (see countRegensThisMonth).
 */

export async function getLatestPlan(profileId: string): Promise<PersonalizedPlan | null> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return null;

  const { data } = await supabase
    .from("journey_plans")
    .select("plan")
    .eq("profile_id", profileId)
    .order("generated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (data?.plan as PersonalizedPlan | undefined) ?? null;
}

export async function countRegensThisMonth(profileId: string): Promise<number> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return 0;

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const { count } = await supabase
    .from("journey_plans")
    .select("id", { count: "exact", head: true })
    .eq("profile_id", profileId)
    .gte("generated_at", monthStart.toISOString());

  return count ?? 0;
}

export async function insertPlan(profileId: string, plan: PersonalizedPlan): Promise<boolean> {
  const supabase = await createSupabaseDataClient();
  if (!supabase) return false;

  const { error } = await supabase.from("journey_plans").insert({
    profile_id: profileId,
    model: plan.model,
    plan,
  });

  return !error;
}
