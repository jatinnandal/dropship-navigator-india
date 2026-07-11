import { describe, expect, it } from "vitest";
import { defaultProfile } from "@/lib/mvp-data";
import { buildWeeklyReview } from "@/lib/weekly-review";
import { renderWeeklyReviewEmail } from "@/lib/weekly-review-email";

const review = buildWeeklyReview({
  profile: { ...defaultProfile, hasGstin: false },
  hasGstin: false,
  currentModuleId: "product-selection",
  moduleStatus: "available",
  progress: { completedSubTasks: 5, totalSubTasks: 24 },
  workspace: {
    targetSellingPrice: 599,
    productCost: 200,
    shippingCost: 70,
    estimatedRtoRate: 25,
  },
  recon: { uploadedAt: "2026-07-01", totalDelta: 163.41, flaggedCount: 1, tcsEstimate: 17.48 },
  now: new Date("2026-07-08T12:00:00"),
});

describe("renderWeeklyReviewEmail", () => {
  it("puts the per-order profit in the subject line", () => {
    const { subject } = renderWeeklyReviewEmail(review, "Jatin");
    expect(subject).toMatch(/Your Monday numbers: −?₹[\d,.]+\/order at 25% RTO/);
  });

  it("includes projections, recon numbers and the mentor line", () => {
    const { html } = renderWeeklyReviewEmail(review, "Jatin");
    expect(html).toContain("Monday check-in, Jatin.");
    expect(html).toContain("30 orders/wk");
    expect(html).toContain("₹163");
    expect(html).toContain("₹17");
    expect(html).toContain("Mentor");
    // no GSTIN → no GST deadlines section
    expect(html).not.toContain("GST deadlines");
  });
});
