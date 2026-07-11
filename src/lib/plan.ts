import { cache } from "react";
import { getCurrentUserId } from "@/lib/current-user";
import { entitlementsFor, type Entitlements, type Plan } from "@/lib/entitlements";
import { createSupabaseDataClient } from "@/lib/supabase/server";

/**
 * Resolve the signed-in user's plan. Missing row, cancelled, or lookup
 * failure ⇒ "free" (deny-by-default). Cached per request.
 *
 * Dev: DEV_PLAN_OVERRIDE=free|starter|growth forces a plan in non-production
 * builds so every gating state can be tested without touching the table.
 */
export const getCurrentPlan = cache(async (): Promise<Plan> => {
  if (process.env.NODE_ENV !== "production") {
    const override = process.env.DEV_PLAN_OVERRIDE as Plan | undefined;
    if (override === "free" || override === "starter" || override === "growth") {
      return override;
    }
  }

  const userId = await getCurrentUserId();
  const supabase = await createSupabaseDataClient();
  if (!supabase) return "free";

  const { data } = await supabase
    .from("subscriptions")
    .select("plan,status")
    .eq("user_id", userId)
    .maybeSingle<{ plan: Plan; status: string }>();

  if (!data) return "free";
  // past_due keeps access (7-day grace handled by the billing job later).
  if (data.status === "cancelled") return "free";
  return data.plan;
});

export const getCurrentEntitlements = cache(async (): Promise<Entitlements> => {
  return entitlementsFor(await getCurrentPlan());
});
