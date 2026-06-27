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
  ack?: string;
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
    why: "Beginners need GST and sourcing hand-holding first. Existing sellers can skip basics — wrong routing wastes your time.",
    mentorNote: "Most sellers feel stuck at the start. That's normal — we'll route you to the right first step.",
    inputType: "select",
    options: [
      {
        value: "beginner",
        label: "Absolute beginner",
        description: "Never sold online before",
        ack: "Perfect — we'll start from documents and GST, not ads.",
      },
      {
        value: "existing_seller",
        label: "Already selling",
        description: "Have some marketplace or store experience",
        ack: "Good — we'll skip basics and focus on gaps in your current setup.",
      },
    ],
  },
  {
    id: "budget",
    field: "budgetBand",
    label: "What's your starting budget?",
    why: "Budget shapes channel choice and ad timing. Under ₹20k means lean paths — overspending on ads before unit economics kills most beginners.",
    mentorNote: "Honest budget = honest advice. No shame in starting lean — Meesho and COD-first paths work.",
    inputType: "select",
    options: [
      {
        value: "under_20k",
        label: "Under ₹20,000",
        description: "Lean start — Meesho or COD-first paths",
        ack: "Lean budget — we'll prioritize zero-commission channels and COD before paid ads.",
      },
      {
        value: "20k_1l",
        label: "₹20,000 – 1 lakh",
        description: "Room for samples, ads, and compliance",
        ack: "Solid range — room for samples plus a controlled ad test after listings go live.",
      },
      {
        value: "above_1l",
        label: "Above ₹1 lakh",
        description: "Can invest in inventory and multi-channel",
        ack: "Strong buffer — still start one channel before spreading thin.",
      },
    ],
  },
  {
    id: "channel",
    field: "primaryChannel",
    label: "Where do you want to sell first?",
    why: "Your first channel drives KYC docs, logistics, and fee math for the whole journey — pick one to master first.",
    mentorNote: "Meesho is the right start for lean budgets — zero fees and no PG setup needed.",
    inputType: "select",
    options: [
      {
        value: "meesho",
        label: "Meesho",
        description: "Lowest barrier — zero commission, Tier 2/3 reach",
        ack: "Smart choice for a lean start — Meesho's zero commission model fits tight budgets.",
      },
      {
        value: "amazon",
        label: "Amazon India",
        description: "Highest trust, strictest verification",
        ack: "Amazon pays off if you pass strict KYC — have GSTIN and bank match ready.",
      },
      {
        value: "flipkart",
        label: "Flipkart",
        description: "Strong fashion and electronics demand",
        ack: "Flipkart works well for fashion and electronics — GSTIN is mandatory from day one.",
      },
      {
        value: "shopify",
        label: "Shopify (own store)",
        description: "Full brand control — you drive traffic",
        ack: "Own store = you drive traffic. Plan COD-first if PG approval is pending.",
      },
    ],
  },
  {
    id: "gstin",
    field: "hasGstin",
    label: "Do you already have a GSTIN?",
    why: "GST status changes your first 2 weeks — without GSTIN, marketplaces block listing until registration completes.",
    mentorNote: "No GSTIN yet? We'll walk you through registration before listing — most beginners start here.",
    inputType: "select",
    options: [
      { value: "no", label: "Not yet", description: "We'll prioritize GST registration", ack: "We'll put GST registration first in your launch plan." },
      { value: "yes", label: "Yes, I have GSTIN", description: "Skip to validation and marketplace KYC", ack: "Good — we'll validate your GSTIN and match bank name next." },
    ],
  },
  {
    id: "product",
    field: "productType",
    label: "What will you sell?",
    why: "Category affects compliance (FSSAI, BIS), RTO defaults, and seasonality — fashion on COD needs different math than electronics.",
    mentorNote: "Fashion can work — but budget 35% RTO in your margin calculator from day one.",
    inputType: "select",
    options: [
      { value: "general", label: "General merchandise", ack: "General goods — we'll use moderate RTO defaults in your calculator." },
      { value: "fashion", label: "Fashion & apparel", description: "Higher RTO — we'll warn you early", ack: "Fashion flagged — we'll use 35% RTO defaults and size-chart checklists." },
      { value: "beauty", label: "Beauty & cosmetics", ack: "Beauty — watch for category gating and labeling rules on marketplaces." },
      { value: "electronics", label: "Electronics & gadgets", ack: "Electronics — BIS certification may be required for some SKUs." },
      { value: "food", label: "Food & consumables", description: "FSSAI may be required", ack: "Food — FSSAI and labeling compliance will be prioritized." },
    ],
  },
  {
    id: "state",
    field: "operatingState",
    label: "Which state will you operate from?",
    why: "GST state code must match pickup address on every marketplace — mismatch is an instant KYC rejection.",
    mentorNote: "Your GSTIN's first two digits must match this state. Pickup address must be in the same state.",
    inputType: "text",
  },
  {
    id: "business-type",
    field: "businessType",
    label: "How is your business set up?",
    why: "Entity type affects PG approval, marketplace KYC, and how fast you can start — individuals face higher rejection rates.",
    mentorNote: "Proprietorship = PAN + fast start. LLP/Pvt Ltd = payment-gateway friendly but more paperwork.",
    inputType: "select",
    options: [
      {
        value: "individual",
        label: "Individual (not formalized)",
        description: "Fastest start — PG and some marketplaces may reject",
        ack: "Individuals can start — we'll plan COD-first paths if PG rejects.",
      },
      {
        value: "proprietorship",
        label: "Sole proprietorship",
        description: "PAN + GST — best balance for most beginners",
        ack: "Proprietorship is the sweet spot for most Indian beginners.",
      },
      { value: "partnership", label: "Partnership firm", ack: "Partnership — keep all partner names consistent across GST and bank." },
      { value: "llp", label: "LLP", description: "PG-friendly, moderate compliance", ack: "LLP — good for PG approval with moderate compliance overhead." },
      { value: "private_limited", label: "Private limited", description: "Most paperwork, highest PG trust", ack: "Pvt Ltd — highest trust with payment gateways and marketplaces." },
    ],
  },
  {
    id: "sales-model",
    field: "salesModel",
    label: "What's your selling model?",
    why: "Marketplace-only vs own website changes launch order — own website means you drive all traffic from day one.",
    mentorNote: "Marketplace first is safer for beginners — built-in buyers, no ad spend on day one.",
    inputType: "select",
    options: [
      { value: "marketplace_only", label: "Marketplace only", description: "Amazon / Flipkart / Meesho", ack: "Marketplace-first — we'll optimize for KYC and listing quality." },
      { value: "own_website_only", label: "Own website only", description: "Shopify or similar", ack: "Own website — traffic and trust signals become your top priority." },
      { value: "both", label: "Both marketplace + website", ack: "Both channels — we'll still recommend mastering one before scaling the other." },
    ],
  },
  {
    id: "imports",
    field: "importsProducts",
    label: "Will you import products?",
    why: "Imports add customs delays and COD risk — 2–3 week shipping from China kills COD conversion in India.",
    mentorNote: "For COD in India, domestic suppliers with 3–5 day dispatch beat imports every time.",
    inputType: "select",
    options: [
      { value: "no", label: "No — domestic suppliers only", ack: "Domestic sourcing — we'll prioritize IndiaMART and 3–5 day dispatch suppliers." },
      { value: "yes", label: "Yes — import or cross-border", ack: "Imports flagged — we'll warn you about COD and customs delays early." },
    ],
  },
  {
    id: "prepackaged",
    field: "sellsPrepackagedGoods",
    label: "Are products pre-packaged for sale?",
    why: "Pre-packaged goods trigger Legal Metrology rules — missing MRP or net quantity on label blocks compliance.",
    mentorNote: "If pre-packaged, Legal Metrology labeling matters as much as GST for marketplace approval.",
    inputType: "select",
    options: [
      { value: "yes", label: "Yes — pre-packaged goods", ack: "Pre-packaged — we'll include labeling and MRP compliance in your plan." },
      { value: "no", label: "No / mostly custom-made", ack: "Custom-made — simpler compliance path for most categories." },
    ],
  },
];

export function getAckForSelection(step: OnboardingStep, value: string): string | undefined {
  return step.options?.find((o) => o.value === value)?.ack;
}

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
