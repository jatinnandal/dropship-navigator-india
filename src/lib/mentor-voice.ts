import type { OnboardingProfile } from "@/lib/mvp-data";
import type { TaskModuleId } from "@/lib/tasks";
import type { JourneyNodeStatus } from "@/lib/journey-graph";

export function getModuleMentorLine(
  moduleId: TaskModuleId,
  profile: OnboardingProfile,
  status: JourneyNodeStatus,
  hasGstin: boolean,
): string {
  if (status === "done") {
    return "Module complete — revisit if your product or channel changes.";
  }

  switch (moduleId) {
    case "common-documentation":
      if (!hasGstin) {
        return "Most sellers feel stuck here first. GST feels scary, but it's the gate to every marketplace.";
      }
      return "Docs look boring — but a 10-minute name mismatch costs you weeks of KYC rejections.";
    case "product-selection":
      if (profile.productType === "fashion") {
        return "Fashion can work — but 35% RTO is real. Pick products that survive COD economics.";
      }
      return "Don't fall in love with a product before the margin calculator says yes.";
    case "compliance-by-product":
      return "One wrong HSN code can block listings or trigger GST notices. Slow down here.";
    case "supplier-sourcing":
      return profile.importsProducts
        ? "Cross-border sourcing + COD is a trap. Domestic suppliers with 3–5 day dispatch win."
        : "Your supplier IS your business. One stockout without a backup ends your momentum.";
    case "channel-launch":
      if (profile.primaryChannel === "shopify" && profile.businessType === "individual") {
        return "PG rejection is common for individuals — COD-first is a valid path, not a failure.";
      }
      return "Marketplace suspension usually starts with dispatch delays and IP complaints — not bad luck.";
    case "ads-growth":
      return "Ads amplify what's already working. If unit economics are red, ads make you lose faster.";
    case "tracking-analytics":
      return "Revenue in the dashboard ≠ money in your bank. Weekly reconciliation saves businesses.";
    default:
      return "One step at a time — you're building a real business, not chasing a hack.";
  }
}

export function getModuleCompletionMessage(moduleId: TaskModuleId): string {
  const messages: Partial<Record<TaskModuleId, string>> = {
    "common-documentation":
      "GSTIN and docs folder done — marketplaces will ask for these again. Keep scans updated and names identical everywhere.",
    "product-selection":
      "Product picked with margin math. If you haven't ordered samples yet, that's your next real-world action.",
    "compliance-by-product":
      "Compliance mapped for your category. Add new SKUs to the checklist before listing — one wrong HSN blocks payouts.",
    "supplier-sourcing":
      "Supplier vetted with backup contact saved. One stockout without a backup ends momentum overnight.",
    "channel-launch":
      "Channel live or close to it. Protect the account now — dispatch SLA and customer response time matter more than ads.",
    "ads-growth":
      "Ad math locked in. Scale only above break-even ROAS — thin margins plus ads equals faster losses, not faster growth.",
    "tracking-analytics":
      "Profit tracking ritual set. Monday reconciliation beats month-end surprises every time.",
  };
  return messages[moduleId] ?? "Solid progress — keep building one sub-task at a time.";
}
