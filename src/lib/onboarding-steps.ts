import type { OnboardingProfile } from "@/lib/mvp-data";

export type OnboardingField =
  | "experienceLevel"
  | "budgetBand"
  | "primaryChannel"
  | "hasGstin"
  | "productType"
  | "operatingState"
  | "businessType"
  | "salesModel"
  | "importsProducts"
  | "sellsPrepackagedGoods";

export type OnboardingStepOption = {
  value: string;
  label: string;
  description?: string;
};

export type OnboardingStep = {
  id: string;
  field: OnboardingField;
  label: string;
  why: string;
  mentorNote?: string;
  inputType: "select" | "text";
  options?: OnboardingStepOption[];
  placeholder?: string;
};

export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    id: "experience",
    field: "experienceLevel",
    label: "Where are you starting from?",
    why: "Beginners need more hand-holding on GST and sourcing. Existing sellers skip basics.",
    inputType: "select",
    options: [
      { value: "beginner", label: "Absolute beginner", description: "Never sold online before" },
      { value: "existing_seller", label: "Already selling", description: "Have some marketplace or store experience" },
    ],
  },
  {
    id: "budget",
    field: "budgetBand",
    label: "What's your starting budget?",
    why: "Budget shapes whether we recommend marketplace-first vs own store, and ad spend timing.",
    inputType: "select",
    options: [
      { value: "under_20k", label: "Under ₹20,000", description: "Lean start — Meesho or COD-first paths" },
      { value: "20k_1l", label: "₹20,000 – 1 lakh", description: "Room for samples, ads, and compliance" },
      { value: "above_1l", label: "Above ₹1 lakh", description: "Can invest in inventory and multi-channel" },
    ],
  },
  {
    id: "channel",
    field: "primaryChannel",
    label: "Where do you want to sell first?",
    why: "Your first channel drives KYC docs, logistics, and fee math for the whole journey.",
    inputType: "select",
    options: [
      { value: "meesho", label: "Meesho", description: "Lowest barrier — zero commission, Tier 2/3 reach" },
      { value: "amazon", label: "Amazon India", description: "Highest trust, strictest verification" },
      { value: "flipkart", label: "Flipkart", description: "Strong fashion and electronics demand" },
      { value: "shopify", label: "Shopify (own store)", description: "Full brand control — you drive traffic" },
    ],
  },
  {
    id: "gstin",
    field: "hasGstin",
    label: "Do you already have a GSTIN?",
    why: "GST status changes your first 2 weeks — registration vs marketplace onboarding.",
    mentorNote: "No GSTIN yet? We'll walk you through registration before listing.",
    inputType: "select",
    options: [
      { value: "no", label: "Not yet", description: "We'll prioritize GST registration" },
      { value: "yes", label: "Yes, I have GSTIN", description: "Skip to validation and marketplace KYC" },
    ],
  },
  {
    id: "product",
    field: "productType",
    label: "What will you sell?",
    why: "Category affects compliance (FSSAI, BIS), RTO defaults, and seasonality tips.",
    inputType: "select",
    options: [
      { value: "general", label: "General merchandise" },
      { value: "fashion", label: "Fashion & apparel", description: "Higher RTO — we'll warn you early" },
      { value: "beauty", label: "Beauty & cosmetics" },
      { value: "electronics", label: "Electronics & gadgets" },
      { value: "food", label: "Food & consumables", description: "FSSAI may be required" },
    ],
  },
  {
    id: "state",
    field: "operatingState",
    label: "Which state will you operate from?",
    why: "GST state code must match pickup address on every marketplace.",
    placeholder: "e.g. Maharashtra",
    inputType: "text",
  },
  {
    id: "business-type",
    field: "businessType",
    label: "How is your business set up?",
    why: "Entity type affects PG approval, marketplace KYC, and how fast you can start.",
    mentorNote:
      "Proprietorship = PAN + fast start. LLP/Pvt Ltd = payment-gateway friendly but more paperwork.",
    inputType: "select",
    options: [
      {
        value: "individual",
        label: "Individual (not formalized)",
        description: "Fastest start — PG and some marketplaces may reject",
      },
      {
        value: "proprietorship",
        label: "Sole proprietorship",
        description: "PAN + GST — best balance for most beginners",
      },
      { value: "partnership", label: "Partnership firm" },
      { value: "llp", label: "LLP", description: "PG-friendly, moderate compliance" },
      { value: "private_limited", label: "Private limited", description: "Most paperwork, highest PG trust" },
    ],
  },
  {
    id: "sales-model",
    field: "salesModel",
    label: "What's your selling model?",
    why: "Marketplace-only vs own website changes launch order and tool picks.",
    inputType: "select",
    options: [
      { value: "marketplace_only", label: "Marketplace only", description: "Amazon / Flipkart / Meesho" },
      { value: "own_website_only", label: "Own website only", description: "Shopify or similar" },
      { value: "both", label: "Both marketplace + website" },
    ],
  },
  {
    id: "imports",
    field: "importsProducts",
    label: "Will you import products?",
    why: "Imports add customs, longer delivery, and COD risk — we adjust sourcing advice.",
    inputType: "select",
    options: [
      { value: "no", label: "No — domestic suppliers only" },
      { value: "yes", label: "Yes — import or cross-border" },
    ],
  },
  {
    id: "prepackaged",
    field: "sellsPrepackagedGoods",
    label: "Are products pre-packaged for sale?",
    why: "Pre-packaged goods may need FSSAI or labeling compliance.",
    inputType: "select",
    options: [
      { value: "yes", label: "Yes — pre-packaged goods" },
      { value: "no", label: "No / mostly custom-made" },
    ],
  },
];

export function defaultValueForField(field: OnboardingField, profile: OnboardingProfile): string {
  switch (field) {
    case "experienceLevel":
      return profile.experienceLevel;
    case "budgetBand":
      return profile.budgetBand;
    case "primaryChannel":
      return profile.primaryChannel;
    case "hasGstin":
      return profile.hasGstin ? "yes" : "no";
    case "productType":
      return profile.productType;
    case "operatingState":
      return profile.operatingState;
    case "businessType":
      return profile.businessType;
    case "salesModel":
      return profile.salesModel;
    case "importsProducts":
      return profile.importsProducts ? "yes" : "no";
    case "sellsPrepackagedGoods":
      return profile.sellsPrepackagedGoods ? "yes" : "no";
  }
}
