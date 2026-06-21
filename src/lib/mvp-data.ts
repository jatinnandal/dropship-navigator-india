export type ExperienceLevel = "beginner" | "existing_seller";
export type BudgetBand = "under_20k" | "20k_1l" | "above_1l";
export type PrimaryChannel = "meesho" | "amazon" | "flipkart" | "shopify";

export type OnboardingProfile = {
  experienceLevel: ExperienceLevel;
  budgetBand: BudgetBand;
  primaryChannel: PrimaryChannel;
  hasGstin: boolean;
};

export type JourneyModule = {
  id: string;
  title: string;
  description: string;
  outcomes: string[];
  tools: string[];
  isPriority: boolean;
};

const allModules: JourneyModule[] = [
  {
    id: "legal-gst",
    title: "Legal setup and GST",
    description:
      "Set up entity basics, GST registration, and marketplace-ready documentation.",
    outcomes: [
      "Understand sole prop vs LLP vs Pvt Ltd",
      "Checklist: PAN, Aadhaar, bank, address proof",
      "GSTIN readiness for marketplace onboarding",
    ],
    tools: ["TheGSTCo", "EcomSarthi", "AfinAdvisory"],
    isPriority: true,
  },
  {
    id: "product-selection",
    title: "Pick niche and product",
    description:
      "Validate product demand, margin viability, and competition before listing.",
    outcomes: [
      "Avoid heavy/fragile products with high RTO risk",
      "Estimate margin after fees and ad spend",
      "Build shortlist of 3-5 SKUs to test",
    ],
    tools: ["Helium 10", "Jungle Scout", "SellerSprite"],
    isPriority: true,
  },
  {
    id: "supplier-sourcing",
    title: "Source and vet suppliers",
    description:
      "Find suppliers, run sample orders, and lock quality and dispatch reliability.",
    outcomes: [
      "Compare IndiaMART and direct wholesalers",
      "Sample testing and quality checklist",
      "Negotiate pricing and replacement policy",
    ],
    tools: ["IndiaMART", "TradeIndia", "Drpshippr"],
    isPriority: true,
  },
  {
    id: "channel-launch",
    title: "Launch on channel",
    description:
      "Create marketplace/store presence with SEO-ready listings and approvals.",
    outcomes: [
      "Channel-specific onboarding checklist",
      "Category approval and tax mapping",
      "Publish first listings with optimized titles",
    ],
    tools: ["Amazon Seller Central", "Flipkart Seller Hub", "Meesho Supplier Panel"],
    isPriority: true,
  },
  {
    id: "ads-growth",
    title: "Ads and growth loop",
    description:
      "Run controlled ad tests and improve conversion before scaling spend.",
    outcomes: [
      "Basic campaign setup and budget guardrails",
      "Weekly creatives and listing iteration plan",
      "Track ROAS and break-even CAC",
    ],
    tools: ["Amazon Ads", "Meta Ads", "Canva"],
    isPriority: false,
  },
  {
    id: "tracking-analytics",
    title: "Track profit and reconcile",
    description:
      "Track real profitability by SKU, monitor RTO, and catch settlement gaps early.",
    outcomes: [
      "Daily net profit visibility",
      "Return and RTO trend monitoring",
      "Payment and claim reconciliation process",
    ],
    tools: ["eVanik", "TrackEcom", "eCominess"],
    isPriority: false,
  },
];

export function buildPersonalizedJourney(profile: OnboardingProfile): JourneyModule[] {
  return allModules.map((module) => {
    if (module.id === "legal-gst" && profile.hasGstin) {
      return {
        ...module,
        description: "You already have GSTIN. Validate tax mapping and compliance hygiene.",
      };
    }

    if (module.id === "channel-launch") {
      const channelLabel =
        profile.primaryChannel === "amazon"
          ? "Amazon"
          : profile.primaryChannel === "flipkart"
            ? "Flipkart"
            : profile.primaryChannel === "shopify"
              ? "Shopify"
              : "Meesho";

      return {
        ...module,
        description: `Focus first launch on ${channelLabel} before expanding multi-channel.`,
      };
    }

    if (module.id === "ads-growth" && profile.budgetBand === "under_20k") {
      return {
        ...module,
        description: "Use low-budget testing with strict daily caps and organic-heavy execution.",
      };
    }

    return module;
  });
}

export const defaultProfile: OnboardingProfile = {
  experienceLevel: "beginner",
  budgetBand: "under_20k",
  primaryChannel: "meesho",
  hasGstin: false,
};
