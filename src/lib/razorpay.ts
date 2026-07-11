import { createHmac, timingSafeEqual } from "crypto";
import type { Plan } from "@/lib/entitlements";

const RAZORPAY_BASE = "https://api.razorpay.com/v1";

type RazorpayConfig = {
  keyId: string;
  keySecret: string;
  webhookSecret: string;
};

export type RazorpaySubscriptionEntity = {
  id: string;
  plan_id: string;
  status: string;
  current_start: number | null;
  current_end: number | null;
  notes: Record<string, string>;
  short_url: string;
};

export function getRazorpayConfig(): RazorpayConfig | null {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!keyId || !keySecret || !webhookSecret) return null;
  return { keyId, keySecret, webhookSecret };
}

async function razorpayFetch<T>(
  path: string,
  config: RazorpayConfig,
  options?: RequestInit,
): Promise<T> {
  const auth = Buffer.from(`${config.keyId}:${config.keySecret}`).toString("base64");
  const res = await fetch(`${RAZORPAY_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${auth}`,
      ...options?.headers,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Razorpay ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

const PLAN_ENV_MAP: Record<string, string> = {
  starter_monthly: "RAZORPAY_PLAN_STARTER_MONTHLY",
  starter_yearly: "RAZORPAY_PLAN_STARTER_YEARLY",
  growth_monthly: "RAZORPAY_PLAN_GROWTH_MONTHLY",
  growth_yearly: "RAZORPAY_PLAN_GROWTH_YEARLY",
};

export type BillingPeriod = "monthly" | "yearly";

export function resolvePlanId(
  plan: Exclude<Plan, "free">,
  billing: BillingPeriod,
): string | null {
  const envKey = PLAN_ENV_MAP[`${plan}_${billing}`];
  if (!envKey) return null;
  return process.env[envKey] || null;
}

export async function createRazorpaySubscription(params: {
  userId: string;
  plan: Exclude<Plan, "free">;
  billing: BillingPeriod;
}): Promise<{ subscriptionId: string; shortUrl: string } | null> {
  const config = getRazorpayConfig();
  if (!config) return null;

  const planId = resolvePlanId(params.plan, params.billing);
  if (!planId) return null;

  const totalCount = params.billing === "monthly" ? 120 : 10;

  const body = {
    plan_id: planId,
    total_count: totalCount,
    customer_notify: 1,
    notes: {
      user_id: params.userId,
      plan: params.plan,
    },
  };

  const data = await razorpayFetch<{ id: string; short_url: string }>(
    "/subscriptions",
    config,
    { method: "POST", body: JSON.stringify(body) },
  );

  return { subscriptionId: data.id, shortUrl: data.short_url };
}

export async function cancelRazorpaySubscription(
  subscriptionId: string,
): Promise<boolean> {
  const config = getRazorpayConfig();
  if (!config) return false;

  try {
    await razorpayFetch(
      `/subscriptions/${subscriptionId}/cancel`,
      config,
      { method: "POST", body: JSON.stringify({ cancel_at_cycle_end: true }) },
    );
    return true;
  } catch {
    return false;
  }
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  webhookSecret: string,
): boolean {
  const expected = createHmac("sha256", webhookSecret).update(body).digest();
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length) return false;
  return timingSafeEqual(expected, actual);
}
