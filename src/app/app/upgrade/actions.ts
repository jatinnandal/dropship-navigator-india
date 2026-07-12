"use server";

import { getCurrentUserId } from "@/lib/current-user";
import { getCurrentPlan } from "@/lib/plan";
import {
  createRazorpaySubscription,
  cancelRazorpaySubscription,
  updateSubscriptionPlan,
  fetchSubscription,
  resolvePlanId,
  type BillingPeriod,
} from "@/lib/razorpay";
import { createSupabaseDataClient } from "@/lib/supabase/server";
import type { Plan } from "@/lib/entitlements";

export async function createCheckoutSubscription(params: {
  plan: "starter" | "growth";
  billing: BillingPeriod;
}): Promise<{ subscriptionId: string } | { error: string }> {
  const userId = await getCurrentUserId();

  const result = await createRazorpaySubscription({
    userId,
    plan: params.plan,
    billing: params.billing,
  });

  if (!result) {
    return { error: "Payment system not configured. Please try again later." };
  }

  return { subscriptionId: result.subscriptionId };
}

export async function getSubscriptionStatus(): Promise<{
  plan: Plan;
  status: string;
}> {
  const plan = await getCurrentPlan();
  return { plan, status: plan === "free" ? "none" : "active" };
}

export async function downgradeSubscription(params: {
  billing: BillingPeriod;
}): Promise<{ ok: boolean; periodEnd?: string; error?: string }> {
  const userId = await getCurrentUserId();
  const plan = await getCurrentPlan();

  if (plan !== "growth") {
    return { ok: false, error: "Only Growth plan can downgrade" };
  }

  const supabase = await createSupabaseDataClient();
  if (!supabase) return { ok: false, error: "Database not configured" };

  const { data } = await supabase
    .from("subscriptions")
    .select("razorpay_subscription_id, current_period_end")
    .eq("user_id", userId)
    .maybeSingle<{ razorpay_subscription_id: string | null; current_period_end: string | null }>();

  if (!data?.razorpay_subscription_id) {
    return { ok: false, error: "No active subscription found" };
  }

  const starterPlanId = resolvePlanId("starter", params.billing);
  if (!starterPlanId) {
    return { ok: false, error: "Starter plan not configured" };
  }

  try {
    await updateSubscriptionPlan(data.razorpay_subscription_id, starterPlanId);
    return {
      ok: true,
      periodEnd: data.current_period_end ?? undefined,
    };
  } catch (err) {
    console.error("Downgrade error:", err);
    return { ok: false, error: "Could not schedule downgrade. Please try again." };
  }
}

export async function getSubscriptionDetails(): Promise<{
  plan: Plan;
  status: string;
  periodEnd: string | null;
  pendingDowngrade: boolean;
  scheduledPlan: string | null;
}> {
  const plan = await getCurrentPlan();
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseDataClient();

  if (!supabase || plan === "free") {
    return { plan, status: "none", periodEnd: null, pendingDowngrade: false, scheduledPlan: null };
  }

  const { data } = await supabase
    .from("subscriptions")
    .select("razorpay_subscription_id, current_period_end, status")
    .eq("user_id", userId)
    .maybeSingle<{ razorpay_subscription_id: string | null; current_period_end: string | null; status: string }>();

  if (!data?.razorpay_subscription_id) {
    return { plan, status: "none", periodEnd: null, pendingDowngrade: false, scheduledPlan: null };
  }

  let pendingDowngrade = false;
  let scheduledPlan: string | null = null;

  try {
    const sub = await fetchSubscription(data.razorpay_subscription_id);
    if (sub.has_scheduled_changes) {
      pendingDowngrade = true;
      scheduledPlan = "starter";
    }
  } catch {
    // Razorpay fetch failed - show what DB has
  }

  return {
    plan,
    status: data.status,
    periodEnd: data.current_period_end,
    pendingDowngrade,
    scheduledPlan,
  };
}

export async function cancelSubscription(): Promise<{
  ok: boolean;
  error?: string;
}> {
  const userId = await getCurrentUserId();
  const supabase = await createSupabaseDataClient();
  if (!supabase) return { ok: false, error: "Database not configured" };

  const { data } = await supabase
    .from("subscriptions")
    .select("razorpay_subscription_id")
    .eq("user_id", userId)
    .maybeSingle<{ razorpay_subscription_id: string | null }>();

  if (!data?.razorpay_subscription_id) {
    return { ok: false, error: "No active subscription found" };
  }

  const cancelled = await cancelRazorpaySubscription(
    data.razorpay_subscription_id,
  );

  if (!cancelled) {
    return { ok: false, error: "Could not cancel subscription. Please try again." };
  }

  return { ok: true };
}
