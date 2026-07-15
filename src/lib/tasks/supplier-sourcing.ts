import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { Task, TaskStep } from "@/lib/tasks/types";

/**
 * What a bad supplier actually breaks on each channel. The profile tells us
 * where the seller sells, so the mindset step names their real failure mode
 * instead of a generic warning.
 */
const BAD_SUPPLIER_WHY: Record<PrimaryChannel, string> = {
  meesho:
    "On Meesho, late Valmo handovers and 'not as described' returns sink your account health - and you cannot call buyers to smooth things over, because Meesho masks phone numbers. Your supplier's dispatch speed IS your rating.",
  amazon:
    "On Amazon, a bad supplier shows up as late shipment rate and order defect rate - the exact Seller Central metrics that get accounts suspended. Quality and dispatch speed matter more than saving ₹10 per unit.",
  flipkart:
    "On Flipkart, missed dispatch SLAs and quality returns drag down your Seller Hub metrics - the numbers that decide your visibility and whether you stay listed. Quality and dispatch speed matter more than saving ₹10 per unit.",
  shopify:
    "On your own store there is no marketplace to hide behind - a bad supplier means refunds and chargebacks AFTER you already paid for the ad click that brought the order. Quality and dispatch speed matter more than saving ₹10 per unit.",
};

/**
 * Where the stock physically sits differs by channel. Meesho and Flipkart pick
 * up from YOUR registered address, so "supplier ships direct to customers"
 * only works cleanly on your own store - spell that out before anyone lists.
 */
function sourcingModelNoteForChannel(channel: PrimaryChannel): string {
  switch (channel) {
    case "meesho":
      return "Meesho reality check: Valmo picks up from YOUR registered pickup address, so a supplier who 'ships direct to customers' does not fit. Either hold small stock yourself, or agree in writing that the supplier's warehouse becomes your registered pickup address and they pack to your label - note the panel checks the pickup address against your GSTIN's state, so this works cleanly only with an in-state supplier (or one added as an additional place of business on your GST registration).";
    case "amazon":
      return "Amazon reality check: you must be the seller of record - no supplier invoices or supplier branding inside the box. Get plain/white-label packing agreed in writing, or ship stock to yourself (or into FBA) and dispatch from there.";
    case "flipkart":
      return "Flipkart reality check: pickup happens from your registered pickup location. Decide where stock physically sits - your place, or the supplier's warehouse registered as your pickup address with them packing to your label, agreed in writing (an out-of-state pickup address can clash with your GSTIN's state - keep it in-state or add it to your GST registration).";
    case "shopify":
      return "Own-store advantage: this is the one channel where true dropshipping works cleanly - dropship platforms like Roposo Clout (which has a Shopify app), GlowRoad and BaapStore hold stock and ship direct to your customer; check each one's current store-integration options. A plain IndiaMART manufacturer usually will NOT ship single units - ask before you shortlist them.";
  }
}

/** Channel-exact path to stop taking orders when supply breaks mid-run. */
function pauseListingPathForChannel(channel: PrimaryChannel): string {
  switch (channel) {
    case "meesho":
      return "Pause first: in the Meesho Supplier Panel (supplier.meesho.com) open Inventory and set the affected SKU's stock to 0 - new orders stop while you fix supply.";
    case "amazon":
      return "Pause first: in Seller Central open Manage Inventory and set the affected SKU's quantity to 0 (or close the listing) - do NOT accept orders you cannot dispatch on time.";
    case "flipkart":
      return "Pause first: in Flipkart Seller Hub open Listings and deactivate the affected listing (or set its stock to 0) - do NOT accept orders you cannot dispatch on time.";
    case "shopify":
      return "Pause first: in your Shopify admin open Products, set inventory to 0 and make sure 'Continue selling when out of stock' is unticked - checkout stops while you fix supply.";
  }
}

export function buildSourcingTask(
  profile: OnboardingProfile,
  _answers: Record<string, string>,
  _workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "sourcing-mindset",
      title: "Your supplier IS your business",
      why: BAD_SUPPLIER_WHY[profile.primaryChannel],
      how: [
        "Never commit to a supplier based on catalogue photos alone.",
        "Test dispatch speed, packaging quality, and communication with a paid sample before you list.",
        "Always have a backup supplier for your top SKU.",
      ],
      mentorNote:
        "A constant refrain from new Indian sellers: 'nobody tells me how to actually find a reliable supplier.' That's what this module fixes.",
    },
    {
      id: "where-to-find",
      title: "Where to find suppliers in India",
      why: "India has strong domestic manufacturing. Local suppliers mean faster delivery, lower RTO, and GST-compliant invoices. AliExpress/CJ = 2-3 week delivery = COD death.",
      how: [
        "On https://www.indiamart.com, search your exact product plus the word 'manufacturer' (e.g. 'silicone kitchen organizer manufacturer'). In the results filter panel set Business Type to Manufacturer, and filter to a hub city if your category has one - real clusters exist: Surat sarees, Tirupur knitwear, Moradabad brass, Jaipur pottery, Delhi kitchenware.",
        "Open each supplier's profile page BEFORE messaging: look for the TrustSEAL badge, a GST number shown on the profile, year of establishment, and real factory photos (not just product shots). No GST shown, or only watermarked stock images = skip without messaging.",
        "Repeat the same search on https://www.tradeindia.com - a different supplier pool, useful for niche categories and for lining up a backup later.",
        "Dropship-ready alternative: Roposo Clout / GlowRoad / BaapStore hold the stock and dispatch in 3-5 days - thinner margin, zero inventory risk.",
        sourcingModelNoteForChannel(profile.primaryChannel),
        "Proceed when at least 5 suppliers pass this profile screen - you'll message all of them next and sample from the top 2-3. Fewer than 5? Widen your search terms or drop the city filter. Still avoid AliExpress/CJ for COD - the customer refuses after a 25-day wait.",
      ],
      trap: "IndiaMART's 'Get Best Price' button posts your requirement as an open buy-lead - dozens of sellers get your number and the calls last for weeks. Message shortlisted suppliers one by one from their profile page instead.",
      mentorNote:
        "Open Tools > Supplier scorecard and keep it beside you from here on - every vetting question in this module maps to a scorecard line, and it totals the verdict for you.",
      tools: [
        {
          name: "IndiaMART",
          whenToUse: "First stop for supplier discovery in any category.",
          why: "Largest B2B network in India - filter by manufacturer, location, and TrustSEAL verification.",
          href: "https://www.indiamart.com",
        },
        {
          name: "BaapStore",
          whenToUse: "If you want done-for-you sourcing + fulfillment.",
          why: "Handles sourcing, shipping and COD - an option for beginners who want zero inventory risk.",
          href: "https://www.baapstore.com",
        },
      ],
    },
    {
      id: "sourcing-origin-game",
      title: "Spot the viable supplier (swipe game)",
      why: "Outdated YouTube advice says AliExpress. In India COD, 25-day shipping means the buyer often forgets and refuses at the door. Learn to spot domestic suppliers.",
      how: ["Mark each card 'Use this supplier' if it's a viable India option, or 'Trap' if not. On a phone you can also swipe right (use) or left (trap). Read the reason before moving on."],
      kind: "simulator",
      simulator: { kind: "sourcing_swipe" },
    },
    {
      id: "red-flag-screener",
      title: "Red flag screener - spot scams before you pay",
      why: "IndiaMART does not guarantee suppliers. Scammers collect advance payment and disappear. Know the red flags.",
      how: ["Answer honestly about your supplier interactions so far."],
      question: {
        id: "red-flags",
        prompt: "These are the warning signs to watch for. Where are you right now?",
        options: [
          { value: "not-yet", label: "Haven't contacted any suppliers yet" },
          { value: "none", label: "Contacted some - no red flags so far" },
          { value: "some", label: "Some concerns (price too low, vague answers, no GST)" },
          { value: "major", label: "Major red flags (100% advance, off-platform payment, no address)" },
        ],
      },
      trap: "A price 40-50% below every other supplier is almost always a scam. Legitimate manufacturers cannot sustain those prices.",
    },
  ];

  // Everyone gets the verify-before-you-pay checklist - it is the core scam
  // protection, and a beginner who hasn't messaged anyone yet needs it most.
  {
    steps.push({
      id: "red-flag-detail",
      title: "Verify before you pay anyone - always",
      why: "Advance payment to an unverified supplier is the most common sourcing scam in India. Run this checklist on every supplier before a single rupee moves.",
      how: [
        "Verify their GSTIN: open https://www.gst.gov.in, go to Search Taxpayer, Search by GSTIN/UIN, and enter their number with no spaces. Status must read Active (not Suspended/Cancelled) and the legal name must match who you're dealing with. A supplier who won't share a GSTIN is an instant no.",
        "Ask for factory photos/video walkthrough (not catalogue images).",
        "Check physical address on Google Maps - does it exist?",
        "Request a pro-forma invoice with unit cost, packaging, handling, dispatch timeline.",
        "NEVER pay 100% advance - standard is 30-50% with balance on delivery/inspection.",
        "Keep ALL communication in writing (WhatsApp/email, not just calls).",
      ],
      trap: "Pressure to pay outside the platform (direct bank transfer for 'discount') = walk away immediately.",
      stuck: [
        "If scammed: call 1930 immediately to freeze funds, file at https://cybercrime.gov.in.",
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
        "On IndiaMART, filter Business Type = Manufacturer - then verify it yourself, because that label is self-declared.",
        "Send this exact first message to every shortlisted supplier: 'What is your MOQ and per-unit price including GST? What are sample charges, and are they adjustable against a bulk order? What is dispatch time after payment? Can you show me the production floor on a video call?'",
        "Disqualifying answers: offers a 'kaccha bill' or no GST invoice, demands 100% advance via GPay/PhonePe/Paytm, refuses samples or a factory video call, sends copy-paste replies that dodge your specific questions, or quotes 40-50% below every other supplier.",
        "Good answers: a specific MOQ and price + GST, sample charge adjustable against bulk, dispatch quoted in days with a courier name, and a video call offered without fuss.",
        "Ask for their GST certificate - it states the nature of business (manufacturer vs trader) in black and white.",
        "Price cross-check: a manufacturer is typically 15-30% cheaper than a trader for the same product. A 'manufacturer' quoting trader prices is usually reselling.",
      ],
      trap: "The most expensive mistake: trusting a supplier based on their IndiaMART catalogue alone.",
      mentorNote:
        "Run every reply through the Supplier scorecard: it turns your answers into a verdict. Sample only the suppliers it clears, and drop any it flags to avoid - no second message needed.",
      question: {
        id: "supplier-type",
        prompt: "Have you confirmed your supplier is a manufacturer?",
        options: [
          { value: "yes", label: "Yes - verified manufacturer with factory" },
          { value: "trader", label: "It's a trader/middleman" },
          { value: "unsure", label: "Not sure yet" },
        ],
      },
    },
    {
      id: "sample-order",
      title: "Order samples - non-negotiable",
      why: "Sample orders reveal actual quality, packaging durability, and dispatch speed. Catalogue photos lie.",
      how: [
        "Order 1-2 samples from each of your top 2-3 suppliers. Pay the sample charge by bank transfer to the company's current account (the account name should match the GST legal name) and ask for it to be adjusted against your first bulk order - that's the industry standard.",
        "Before opening: photograph the courier label and the outer box from all sides. If you ever need a replacement claim, these photos are your evidence.",
        "While opening, photograph: the inner packing material, the product from every angle, close-ups of any defect, and the product sitting on a weighing scale - couriers bill by weight and volume, so a heavier-than-quoted product silently eats your margin.",
        profile.sellsPrepackagedGoods
          ? "Check the label for Legal Metrology declarations: MRP, net quantity, manufacturer/packer name + address, customer care details. Missing any of these = the supplier must fix labels before you can list."
          : "Check the labeling: no other brand's name, no supplier watermark, no pre-printed inflated MRP.",
        "Do a drop test from about 3 feet to simulate courier handling, then test every function your listing will promise.",
        "Time the full loop: payment to delivery should be under 7 days domestic. A supplier who dispatches late on a sample they KNOW you are judging will be worse on real orders.",
        "Decision rule: compare samples side by side and choose on quality + dispatch reliability, not price. One clear quality failure = that supplier is out - do not rationalize defects.",
      ],
      trap: "Bulk ordering before sampling is the most expensive beginner mistake. Always sample first.",
      mentorNote: "₹200 on a sample saves you from a ₹20,000 inventory mistake. No exceptions.",
    },
    {
      id: "negotiate-terms",
      title: "Lock terms in writing before you sell",
      why: "Verbal agreements mean nothing when a customer gets a damaged product and your supplier refuses replacement.",
      how: [
        "Get a pro-forma invoice before any payment: unit price + GST, packaging, transport to your city (the full landed cost), MOQ, and dispatch timeline in hours - 'depends on order' is a red flag, not an answer.",
        "Payment terms that are normal: 30-50% advance with the balance on dispatch or delivery (paying against the LR / lorry receipt copy is common and safe). 100% advance to a new supplier = walk away.",
        "Pay by NEFT/RTGS to a current account whose name matches the GST legal name. A 'discount' for paying a personal UPI number is a scam pattern, not a discount - use IndiaMART PayAssured or bank escrow when unsure.",
        "Replacement policy in writing: who pays for defective/wrong items, how fast the replacement dispatches once you flag it (the SLA template below asks for 48 hours), and who covers reverse shipping.",
        "Confirm packaging standards (box strength, bubble wrap, no supplier branding) and get the decision-maker's direct number - not just the sales rep answering the catalogue chat.",
        "Ask the dropship question in plain words: 'Will you pack and ship single units directly to my customers?' Most manufacturers only do bulk - know the answer BEFORE you list.",
      ],
      trap: "No written replacement terms = you eat every return cost yourself.",
    },
    {
      id: "save-supplier",
      title: "Save your chosen supplier",
      why: "We'll remember your supplier across the journey - for launch, ads, and tracking steps.",
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
        "Search your top SKU on tradeindia.com and shortlist one supplier from a DIFFERENT city than your primary - a separate pool and region means one flood, strike, or courier outage cannot stop both.",
        "Run the backup through the same screen as your primary: the first-message questions, the Supplier scorecard, and one paid sample. An unsampled backup is not a backup, it's a phone number.",
        "Keep their quote, lead time, and replacement terms on file next to your primary's - you will switch under time pressure, not at leisure.",
        "Give them one small real order early, so their first mistake happens on a handful of units - not on the day your primary fails.",
      ],
      trap: "Single-source dependency is how sellers go from 50 orders/day to zero overnight.",
      tools: [
        {
          name: "TradeIndia",
          whenToUse: "To find backup suppliers beyond IndiaMART.",
          why: "Different supplier pool - useful when primary supplier fails.",
          href: "https://www.tradeindia.com",
        },
      ],
    },
    {
      id: "supplier-oos-midrun",
      title: "Playbook: supplier out of stock mid-run",
      why: "Stockouts during active sales cause cancellation penalties and account suspension.",
      how: [
        pauseListingPathForChannel(profile.primaryChannel),
        "Never cancel customer orders if avoidable - route pending orders to your backup supplier first.",
        profile.primaryChannel === "shopify"
          ? "Email affected customers a revised dispatch date from your store - own store means you own the communication."
          : "If your marketplace lets you raise handling time on the SKU, do it while supply recovers - never let orders quietly breach the dispatch SLA.",
        "Reactivate the listing only when the backup has confirmed stock and dispatch timeline in writing.",
      ],
      trap: "Letting orders pile up while waiting for primary supplier restock triggers cancellation rate suspension.",
    },
    {
      id: "supplier-price-hike",
      title: "Playbook: supplier price hike",
      why: "Sudden cost increases can flip profitable SKUs to loss-makers overnight.",
      how: [
        "Absorb: if margin still >15% after hike - keep price, protect reviews.",
        "Pass through: raise listing price if demand is inelastic.",
        "Switch: activate backup supplier if their price is lower.",
        "Decision tree: if new margin <10%, pause SKU until economics fixed.",
      ],
      trap: "Absorbing hikes to 'keep sales going' while margin goes negative - ads amplify the loss.",
    },
    {
      id: "supplier-quality-failure",
      title: "Playbook: supplier quality failure",
      why: "Bad batches destroy ratings and trigger returns that look like seller fault.",
      how: [
        "Batch QC on every restock - check 3 units per batch minimum.",
        "Document defects with photos before contacting supplier.",
        "Written replacement claim referencing your SLA agreement.",
        "If defect rate >5% on a batch: pause listing until supplier fixes root cause.",
      ],
      trap: "Shipping known-defective units to clear inventory - marketplace return rate suspension follows.",
    },
  );

  return {
    id: "supplier-sourcing",
    title: "Find and vet suppliers safely",
    intro: `We'll find reliable ${profile.productType} suppliers, avoid scams, and lock terms before you list a single product.`,
    steps,
  };
}
