import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { createHmac } from "crypto";

describe("razorpay", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.RAZORPAY_KEY_ID = "rzp_test_abc";
    process.env.RAZORPAY_KEY_SECRET = "secret123";
    process.env.RAZORPAY_WEBHOOK_SECRET = "webhook_secret_456";
    process.env.RAZORPAY_PLAN_STARTER_MONTHLY = "plan_starter_m";
    process.env.RAZORPAY_PLAN_STARTER_YEARLY = "plan_starter_y";
    process.env.RAZORPAY_PLAN_GROWTH_MONTHLY = "plan_growth_m";
    process.env.RAZORPAY_PLAN_GROWTH_YEARLY = "plan_growth_y";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
    vi.resetModules();
  });

  it("getRazorpayConfig returns config when all vars set", async () => {
    const { getRazorpayConfig } = await import("@/lib/razorpay");
    const config = getRazorpayConfig();
    expect(config).not.toBeNull();
    expect(config!.keyId).toBe("rzp_test_abc");
    expect(config!.keySecret).toBe("secret123");
    expect(config!.webhookSecret).toBe("webhook_secret_456");
  });

  it("getRazorpayConfig returns null when vars missing", async () => {
    delete process.env.RAZORPAY_KEY_ID;
    const { getRazorpayConfig } = await import("@/lib/razorpay");
    expect(getRazorpayConfig()).toBeNull();
  });

  it("resolvePlanId maps all 4 combos", async () => {
    const { resolvePlanId } = await import("@/lib/razorpay");
    expect(resolvePlanId("starter", "monthly")).toBe("plan_starter_m");
    expect(resolvePlanId("starter", "yearly")).toBe("plan_starter_y");
    expect(resolvePlanId("growth", "monthly")).toBe("plan_growth_m");
    expect(resolvePlanId("growth", "yearly")).toBe("plan_growth_y");
  });

  it("resolvePlanId returns null when env var missing", async () => {
    delete process.env.RAZORPAY_PLAN_STARTER_MONTHLY;
    const { resolvePlanId } = await import("@/lib/razorpay");
    expect(resolvePlanId("starter", "monthly")).toBeNull();
  });

  it("verifyWebhookSignature accepts valid signature", async () => {
    const { verifyWebhookSignature } = await import("@/lib/razorpay");
    const body = '{"event":"subscription.activated"}';
    const secret = "webhook_secret_456";
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body, sig, secret)).toBe(true);
  });

  it("verifyWebhookSignature rejects invalid signature", async () => {
    const { verifyWebhookSignature } = await import("@/lib/razorpay");
    const body = '{"event":"subscription.activated"}';
    expect(verifyWebhookSignature(body, "deadbeef00", "webhook_secret_456")).toBe(false);
  });

  it("verifyWebhookSignature rejects tampered body", async () => {
    const { verifyWebhookSignature } = await import("@/lib/razorpay");
    const body = '{"event":"subscription.activated"}';
    const secret = "webhook_secret_456";
    const sig = createHmac("sha256", secret).update(body).digest("hex");
    expect(verifyWebhookSignature(body + "x", sig, secret)).toBe(false);
  });
});
