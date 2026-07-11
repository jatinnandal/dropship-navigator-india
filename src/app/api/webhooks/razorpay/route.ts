import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import {
  getRazorpayConfig,
  verifyWebhookSignature,
  type RazorpaySubscriptionEntity,
} from "@/lib/razorpay";
import type { Plan } from "@/lib/entitlements";

export const runtime = "nodejs";

const VALID_PLANS = new Set<string>(["starter", "growth"]);

type WebhookPayload = {
  event: string;
  payload: {
    subscription: {
      entity: RazorpaySubscriptionEntity;
    };
  };
};

export async function POST(request: NextRequest) {
  const config = getRazorpayConfig();
  if (!config) {
    return NextResponse.json(
      { error: "Razorpay not configured" },
      { status: 503 },
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json(
      { error: "service role not configured" },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(body, signature, config.webhookSecret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid JSON" }, { status: 400 });
  }

  const { event } = payload;
  const entity = payload?.payload?.subscription?.entity;
  if (!entity) {
    return NextResponse.json({ error: "missing subscription entity" }, { status: 400 });
  }

  const userId = entity.notes?.user_id;
  const plan = entity.notes?.plan;

  if (!userId) {
    return NextResponse.json({ error: "missing user_id in notes" }, { status: 400 });
  }

  const now = new Date().toISOString();

  if (event === "subscription.activated") {
    if (!plan || !VALID_PLANS.has(plan)) {
      return NextResponse.json({ error: "invalid plan in notes" }, { status: 400 });
    }

    const periodEnd = entity.current_end
      ? new Date(entity.current_end * 1000).toISOString()
      : null;

    const { error } = await admin.from("subscriptions").upsert(
      {
        user_id: userId,
        plan: plan as Plan,
        status: "active",
        source: "razorpay",
        razorpay_subscription_id: entity.id,
        current_period_end: periodEnd,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("Webhook upsert error:", error);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "activated" });
  }

  if (event === "subscription.charged") {
    const periodEnd = entity.current_end
      ? new Date(entity.current_end * 1000).toISOString()
      : null;

    const { error } = await admin
      .from("subscriptions")
      .update({
        status: "active",
        current_period_end: periodEnd,
        updated_at: now,
      })
      .eq("razorpay_subscription_id", entity.id);

    if (error) {
      console.error("Webhook charge update error:", error);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "charged" });
  }

  if (event === "subscription.pending" || event === "subscription.halted") {
    const { error } = await admin
      .from("subscriptions")
      .update({ status: "past_due", updated_at: now })
      .eq("razorpay_subscription_id", entity.id);

    if (error) {
      console.error("Webhook past_due update error:", error);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "past_due" });
  }

  if (event === "subscription.cancelled") {
    const { error } = await admin
      .from("subscriptions")
      .update({ status: "cancelled", updated_at: now })
      .eq("razorpay_subscription_id", entity.id);

    if (error) {
      console.error("Webhook cancel update error:", error);
      return NextResponse.json({ error: "db error" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, action: "cancelled" });
  }

  return NextResponse.json({ ok: true, action: "ignored", event });
}
