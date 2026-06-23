export type ExperienceLevel = "beginner" | "existing_seller";
export type BudgetBand = "under_20k" | "20k_1l" | "above_1l";
export type PrimaryChannel = "meesho" | "amazon" | "flipkart" | "shopify";
export type ProductType = "general" | "food" | "beauty" | "electronics" | "fashion";
export type BusinessType = "individual" | "proprietorship" | "partnership" | "llp" | "private_limited";
export type SalesModel = "marketplace_only" | "own_website_only" | "both";

export type OnboardingProfile = {
  experienceLevel: ExperienceLevel;
  budgetBand: BudgetBand;
  primaryChannel: PrimaryChannel;
  hasGstin: boolean;
  operatingState: string;
  productType: ProductType;
  businessType: BusinessType;
  salesModel: SalesModel;
  importsProducts: boolean;
  sellsPrepackagedGoods: boolean;
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
    id: "common-documentation",
    title: "Common business documentation",
    description:
      "Complete business basics required across most products before product-specific compliance.",
    outcomes: [
      "Understand sole prop vs LLP vs Pvt Ltd",
      "Set up PAN, Aadhaar, bank current account, address proof, and canceled cheque",
      "Prepare marketplace-ready identity and banking documents",
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
    id: "compliance-by-product",
    title: "GST and product-specific compliance",
    description:
      "Apply compliance based on your selected product category and operating location.",
    outcomes: [
      "GST applicability and registration flow",
      "Product/category approvals required before listing",
      "State-specific operational checks for invoicing and logistics",
    ],
    tools: ["IndiaFilings", "Vakilsearch", "ClearTax"],
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
    if (module.id === "common-documentation" && profile.hasGstin) {
      return {
        ...module,
        description: "Your base documentation is in place. Quickly validate and move to product compliance.",
      };
    }

    if (module.id === "compliance-by-product") {
      const productComplianceHint =
        profile.productType === "food"
          ? "Food category usually needs FSSAI registration/license in addition to GST and marketplace category checks."
          : profile.productType === "beauty"
            ? "Beauty/cosmetics can require additional labeling and category-level compliance checks before launch."
            : profile.productType === "electronics"
              ? "Electronics may need category-specific standards/certification checks (for example BIS-related checks)."
              : profile.productType === "fashion"
                ? "Fashion generally has lighter regulatory load, but label/brand and return-policy hygiene is critical."
                : "General merchandise usually follows baseline GST + marketplace category requirements.";

      return {
        ...module,
        description: `${productComplianceHint} Operating state selected: ${profile.operatingState}.`,
        outcomes: profile.hasGstin
          ? [
              "GSTIN already available: validate GST settings on marketplace accounts",
              "Complete product-category compliance checklist",
              "Prepare compliant invoice + return documentation",
            ]
          : [
              "Register GST (if required for your channel/category) and prepare tax profile",
              "Complete product-category compliance checklist",
              "Prepare compliant invoice + return documentation",
            ],
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
  operatingState: "Maharashtra",
  productType: "general",
  businessType: "proprietorship",
  salesModel: "marketplace_only",
  importsProducts: false,
  sellsPrepackagedGoods: true,
};
