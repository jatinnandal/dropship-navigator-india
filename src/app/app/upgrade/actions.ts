"use server";

import { getCurrentUserId } from "@/lib/current-user";
import { getCurrentPlan } from "@/lib/plan";
import {
  createRazorpaySubscription,
  cancelRazorpaySubscription,
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
