import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { Task, TaskStep } from "@/lib/tasks/types";

export function buildSourcingTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  _workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "sourcing-mindset",
      title: "Your supplier IS your business",
      why: "Bad supplier = bad reviews = account suspension. Quality and dispatch speed matter more than saving ₹10 per unit.",
      how: [
        "Never commit to a supplier based on catalogue photos alone.",
        "Test dispatch speed, packaging quality, and communication before listing.",
        "Always have a backup supplier for your top SKU.",
      ],
      mentorNote:
        "The #1 complaint on Shopify India forums: 'Nobody tells me how to find reliable suppliers.' That's what we're fixing now.",
    },
    {
      id: "where-to-find",
      title: "Where to find suppliers in India",
      why: "India has strong domestic manufacturing. Local suppliers mean faster delivery, lower RTO, and GST-compliant invoices.",
      how: [
        "IndiaMART: broadest supplier network — filter by Manufacturer + TrustSEAL.",
        "TradeIndia: alternative pool, good for niche categories.",
        "GlowRoad / BaapStore: dropship-ready with COD fulfillment (paid plans).",
        "Local wholesale markets: best for fashion, accessories, and seasonal goods.",
      ],
      tools: [
        {
          name: "IndiaMART",
          whenToUse: "First stop for supplier discovery in any category.",
          why: "Largest B2B network in India — filter by manufacturer, location, and TrustSEAL verification.",
        },
        {
          name: "BaapStore",
          whenToUse: "If you want done-for-you sourcing + fulfillment.",
          why: "150K+ SKUs, handles shipping and COD — good for beginners who want zero inventory risk.",
        },
      ],
    },
    {
      id: "red-flag-screener",
      title: "Red flag screener — spot scams before you pay",
      why: "IndiaMART does not guarantee suppliers. Scammers collect advance payment and disappear. Know the red flags.",
      how: ["Answer honestly about your supplier interactions so far."],
      question: {
        id: "red-flags",
        prompt: "Has any supplier you've contacted shown these warning signs?",
        options: [
          { value: "none", label: "No red flags — they look legitimate" },
          { value: "some", label: "Some concerns (price too low, vague answers, no GST)" },
          { value: "major", label: "Major red flags (100% advance, off-platform payment, no address)" },
        ],
      },
      trap: "Price 40-50% below market rate is almost always a scam. Legitimate manufacturers cannot sustain those prices.",
    },
  ];

  const flags = answers["red-flags"] ?? "";
  if (flags === "some" || flags === "major") {
    steps.push({
      id: "red-flag-detail",
      title: "Verify before you pay anything",
      why: "Advance payment to an unverified supplier is the most common sourcing scam in India.",
      how: [
        "Verify GSTIN on gst.gov.in — active status, matching business name.",
        "Ask for factory photos/video walkthrough (not catalogue images).",
        "Check physical address on Google Maps — does it exist?",
        "Request pro-forma invoice with unit cost, packaging, handling, dispatch timeline.",
        "NEVER pay 100% advance — standard is 30-50% with balance on delivery/inspection.",
        "Keep ALL communication in writing (WhatsApp/email, not just calls).",
      ],
      trap: "Pressure to pay outside the platform (direct bank transfer for 'discount') = walk away immediately.",
      stuck: [
        "If scammed: call 1930 immediately to freeze funds, file at cybercrime.gov.in.",
        "Report fraudulent supplier on IndiaMART complaint page with evidence.",
      ],
    });
  }

  steps.push(
    {
      id: "manufacturer-check",
      title: "Confirm they are a manufacturer, not a trader",
      why: "Trading companies add markup and reduce your control over quality. Manufacturers give better pricing and customization.",
      how: [
        "On IndiaMART, filter Business Type = Manufacturer.",
        "Ask for factory photos in their profile gallery (not just product shots).",
        "Request video call walkthrough of production floor.",
        "Check GST certificate — registered as manufacturer, not trader.",
        "Compare unit price: manufacturer is typically 15-30% cheaper than trader for same product.",
      ],
      trap: "The most expensive mistake: trusting a supplier based on their IndiaMART catalogue alone.",
      question: {
        id: "supplier-type",
        prompt: "Have you confirmed your supplier is a manufacturer?",
        options: [
          { value: "yes", label: "Yes — verified manufacturer with factory" },
          { value: "trader", label: "It's a trader/middleman" },
          { value: "unsure", label: "Not sure yet" },
        ],
      },
    },
    {
      id: "sample-order",
      title: "Order samples — non-negotiable",
      why: "Sample orders reveal actual quality, packaging durability, and dispatch speed. Catalogue photos lie.",
      how: [
        "Order 1-2 samples from your top 2 supplier candidates.",
        "When samples arrive: check quality, weight, packaging, labeling.",
        "Do a drop test — simulate courier handling (drop from 3 feet).",
        "Time dispatch: order to delivery should be under 7 days for domestic.",
        "Compare samples side by side before choosing.",
      ],
      trap: "Bulk ordering before sampling is the most expensive beginner mistake. Always sample first.",
      mentorNote: "₹200 on a sample saves you from a ₹20,000 inventory mistake. No exceptions.",
    },
    {
      id: "negotiate-terms",
      title: "Lock terms in writing before you sell",
      why: "Verbal agreements mean nothing when a customer gets a damaged product and your supplier refuses replacement.",
      how: [
        "Get written confirmation of: unit price, MOQ, dispatch timeline (hours, not days).",
        "Define replacement policy: who pays for defective/wrong items?",
        "Confirm packaging standards: bubble wrap, box strength, branding options.",
        "Agree on escalation contact (phone number of decision-maker, not just sales rep).",
        "Clarify: will they ship single units to end customers (dropship) or only bulk?",
      ],
      trap: "No written replacement terms = you eat every return cost yourself.",
    },
    {
      id: "save-supplier",
      title: "Save your chosen supplier",
      why: "We'll remember your supplier across the journey — for launch, ads, and tracking steps.",
      how: ["Enter the supplier name and city you decided to work with."],
      kind: "input",
      input: {
        id: "supplier-name",
        label: "Primary supplier name + city",
        placeholder: "e.g. ABC Manufacturing, Surat",
        workspaceKey: "chosenSupplier",
      },
    },
    {
      id: "backup-supplier",
      title: "Line up a backup supplier",
      why: "Your primary supplier will eventually have stockouts, quality issues, or dispatch delays. A backup keeps you selling.",
      how: [
        "Identify one alternative supplier for your top SKU.",
        "Order one sample from them too.",
        "Keep their contact and pricing on file.",
        "Test them with a small order before you actually need them.",
      ],
      trap: "Single-source dependency is how sellers go from 50 orders/day to zero overnight.",
      tools: [
        {
          name: "TradeIndia",
          whenToUse: "To find backup suppliers beyond IndiaMART.",
          why: "Different supplier pool — useful when primary supplier fails.",
        },
      ],
    },
  );

  return {
    id: "supplier-sourcing",
    title: "Find and vet suppliers safely",
    intro: `We'll find reliable ${profile.productType} suppliers, avoid scams, and lock terms before you list a single product.`,
    steps,
  };
}
