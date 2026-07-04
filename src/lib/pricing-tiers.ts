export type PricingTier = "free" | "premium";

export type FeatureEntry = {
  id: string;
  label: string;
  freeIncluded: boolean;
  premiumIncluded: boolean;
};

export const FEATURES: FeatureEntry[] = [
  // Free
  { id: "journey", label: "Full 7-module launch journey", freeIncluded: true, premiumIncluded: true },
  { id: "margin-calc", label: "Profit Margin Calculator", freeIncluded: true, premiumIncluded: true },
  { id: "gst-calendar", label: "GST Filing Calendar", freeIncluded: true, premiumIncluded: true },
  { id: "shipping-est", label: "Shipping Cost Estimator", freeIncluded: true, premiumIncluded: true },
  { id: "doc-checker", label: "Document Checker", freeIncluded: true, premiumIncluded: true },
  { id: "decision-trees", label: "Decision Tree Wizards", freeIncluded: true, premiumIncluded: true },
  { id: "verification", label: "Verification Checklist", freeIncluded: true, premiumIncluded: true },
  { id: "streaks", label: "Streak Tracker", freeIncluded: true, premiumIncluded: true },
  // Premium only
  { id: "cashflow-sim", label: "90-Day Cash Flow Simulator", freeIncluded: false, premiumIncluded: true },
  { id: "cod-sim", label: "COD vs Prepaid Simulator", freeIncluded: false, premiumIncluded: true },
  { id: "supplier-score", label: "Supplier Vetting Scorecard", freeIncluded: false, premiumIncluded: true },
  { id: "seasonal-full", label: "Full Seasonal Calendar", freeIncluded: false, premiumIncluded: true },
  { id: "benchmarks", label: "Seller Benchmarks & Data", freeIncluded: false, premiumIncluded: true },
  { id: "whatsapp-all", label: "All WhatsApp Templates", freeIncluded: false, premiumIncluded: true },
  { id: "success-stories", label: "Full Success Stories Library", freeIncluded: false, premiumIncluded: true },
];

export const PRICE_INR = 499;

// Map tool routes to tier
const PREMIUM_PATHS = [
  "/app/tools/cashflow-simulator",
  "/app/tools/cod-prepaid-simulator",
  "/app/tools/supplier-scorecard",
];

export function getToolTier(path: string): PricingTier {
  return PREMIUM_PATHS.some((p) => path.startsWith(p)) ? "premium" : "free";
}

export function isPremiumUser(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem("dni-premium") === "true";
}
