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
      why: "India has strong domestic manufacturing. Local suppliers mean faster delivery, lower RTO, and GST-compliant invoices. AliExpress/CJ = 2–3 week delivery = COD death.",
      how: [
        "IndiaMART: broadest supplier network — filter by Manufacturer + TrustSEAL.",
        "TradeIndia: alternative pool, good for niche categories.",
        "Roposo Clout / GlowRoad / BaapStore: dropship-ready with 3–5 day dispatch.",
        "Local wholesale markets: best for fashion, accessories, and seasonal goods.",
        "Avoid: AliExpress, CJ Dropshipping for COD — customer refuses after 25-day wait.",
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
      id: "sourcing-origin-game",
      title: "Spot the viable supplier (swipe game)",
      why: "Outdated YouTube advice says AliExpress. In India COD, 25-day shipping = near 100% RTO. Learn to spot domestic suppliers.",
      how: ["Swipe right on India suppliers with 3–5 day delivery. Left on China/cross-border traps."],
      kind: "simulator",
      simulator: { kind: "sourcing_swipe" },
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
      id: "courier-benchmark",
      title: "Courier benchmarking checklist",
      why: "Same product, different courier = different RTO cost and remittance speed. Benchmark before committing volume.",
      how: [
        "Pick your top 2 courier aggregators (e.g. Shiprocket vs another).",
        "Test same pincode pair: home state → 1 metro pincode.",
        "Compare: forward rate, RTO reverse charge, COD remittance days, pickup SLA.",
        "Run 5 test shipments each before scaling.",
        "Use the copy-paste benchmark template in this step.",
      ],
      trap: "Choosing courier on price alone ignores RTO reverse charges that can exceed forward shipping.",
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
      id: "pincode-pilot",
      title: "Plan your pincode pilot",
      why: "Don't ship all-India on day 1. Run 50–100 orders in controlled pincodes before scaling ads nationally.",
      how: ["Set 3 pilot pincodes, RTO cutoff %, and pre-flight checklist."],
      kind: "simulator",
      simulator: { kind: "pincode_pilot" },
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
    {
      id: "supplier-oos-midrun",
      title: "Playbook: supplier out of stock mid-run",
      why: "Stockouts during active sales cause cancellation penalties and account suspension.",
      how: [
        "Pause affected listings immediately — do NOT accept orders you cannot fulfill.",
        "Never cancel customer orders if avoidable — switch to backup supplier first.",
        "Communicate revised dispatch SLA to marketplace if channel allows.",
        "Reactivate listings only when backup confirms stock + dispatch timeline.",
      ],
      trap: "Letting orders pile up while waiting for primary supplier restock triggers cancellation rate suspension.",
    },
    {
      id: "supplier-price-hike",
      title: "Playbook: supplier price hike",
      why: "Sudden cost increases can flip profitable SKUs to loss-makers overnight.",
      how: [
        "Absorb: if margin still >15% after hike — keep price, protect reviews.",
        "Pass through: raise listing price if demand is inelastic.",
        "Switch: activate backup supplier if their price is lower.",
        "Decision tree: if new margin <10%, pause SKU until economics fixed.",
      ],
      trap: "Absorbing hikes to 'keep sales going' while margin goes negative — ads amplify the loss.",
    },
    {
      id: "supplier-quality-failure",
      title: "Playbook: supplier quality failure",
      why: "Bad batches destroy ratings and trigger returns that look like seller fault.",
      how: [
        "Batch QC on every restock — check 3 units per batch minimum.",
        "Document defects with photos before contacting supplier.",
        "Written replacement claim referencing your SLA agreement.",
        "If defect rate >5% on a batch: pause listing until supplier fixes root cause.",
      ],
      trap: "Shipping known-defective units to clear inventory — marketplace return rate suspension follows.",
    },
  );

  return {
    id: "supplier-sourcing",
    title: "Find and vet suppliers safely",
    intro: `We'll find reliable ${profile.productType} suppliers, avoid scams, and lock terms before you list a single product.`,
    steps,
  };
}
