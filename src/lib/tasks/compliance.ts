import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel, stateLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

/**
 * Channel-exact paths for entering HSN + GST rate. The profile tells us which
 * seller panel this seller lives in, so we name that panel's actual screens -
 * never "your marketplace tax settings".
 */
const HSN_PANEL_STEPS: Record<PrimaryChannel, string[]> = {
  meesho: [
    "In the Meesho Supplier Panel (supplier.meesho.com) your GST details sit under account settings, and every catalog upload asks for the product's GST rate - keep your HSN mapping sheet open and enter the rate the official lookup showed, not a guess.",
    "Meesho generates the customer invoice from your catalog's GST details, so a wrong rate at upload becomes a wrong invoice on every single order.",
  ],
  amazon: [
    "In Seller Central set your GST defaults under Settings → Tax Settings, then fill the HSN field on each listing (Inventory → Manage Inventory → Edit). The default tax setting only covers listings you have not mapped - map every launch SKU explicitly.",
  ],
  flipkart: [
    "In Flipkart Seller Hub the HSN and GST rate are asked in the listing's tax details when you create or edit it (Listings → My Listings → Edit) - fill them from your mapping sheet at creation time, not after sales start.",
  ],
  shopify: [
    "Shopify will not stop you from charging the wrong tax. Set GST under Settings → Taxes and duties, add the HS/HSN code in each product's customs/shipping section, and confirm your invoicing setup prints HSN on every invoice line - on your own store, you are the compliance department.",
  ],
};

/** Channel-exact category-gating reality: who gates, where, and what unlocks it. */
const CATEGORY_APPROVAL_STEPS: Record<PrimaryChannel, string[]> = {
  meesho: [
    "Most Meesho categories open once your GSTIN (or Enrolment ID) is verified in the Supplier Panel - there is no separate approval queue for most products.",
    "Selling on an Enrolment ID: only categories eligible for non-GST selling appear for you. If your category will not show up, that IS the gate - complete your GSTIN to unlock it.",
    "Certificate categories (food, some beauty) still legally need the underlying FSSAI/labeling compliance even where the panel does not ask upfront - the liability is yours, not Meesho's.",
  ],
  amazon: [
    "In Seller Central open Catalog → Add Products and search your exact product. If the category or brand is gated you will see 'Apply to sell' or a listing-limitation notice - click it to see the exact documents Amazon wants.",
    "Typical asks: real product photos (not supplier renders), a recent purchase invoice from your supplier, and category certificates (FSSAI, BIS) where they apply.",
    "Track the request under Selling Applications: 'Approved' = go list; anything else = read the rejection note, fix that exact document, resubmit - never re-send the same file.",
  ],
  flipkart: [
    "In Seller Hub start Listings → Add New Listing and select your category and brand. Gated brands open a brand-approval flow asking for trademark proof or a brand authorization letter plus a purchase invoice.",
    "Selling unbranded/own-label: pick the generic/non-branded option for the category instead of typing a brand name you do not own - that shortcut is an IP complaint waiting to happen.",
    "Wait for the approval to show in Seller Hub before creating listings in the gated category - suppressed listings give no clear error.",
  ],
  shopify: [
    "Your own store has no category approval - the gatekeepers move to your payment gateway and ad platforms.",
    "Read your payment gateway's restricted business/product list before launch - gateways freeze first and ask questions later, and a frozen balance hurts more than a slow approval.",
    "Meta and Google ads keep their own restricted-category policies - check them for your product type before spending a rupee on ads.",
  ],
};

/** Where the Legal Metrology declarations go ON THE LISTING for this channel. */
function lmListingLine(channel: PrimaryChannel): string {
  switch (channel) {
    case "meesho":
      return "The key declarations must appear on the listing too, not just the package - fill net quantity and manufacturer/packer details in the catalog fields on the Meesho Supplier Panel, and put anything without a dedicated field into the product description.";
    case "amazon":
      return "The key declarations must appear on the listing too - Amazon has dedicated fields (net quantity, manufacturer, packer, importer, country of origin) in the listing's edit screens; leaving them blank is a common listing-suppression cause.";
    case "flipkart":
      return "The key declarations must appear on the listing too - fill net quantity, manufacturer/packer and country of origin in the listing attributes in Seller Hub; blank fields stall the catalog QC approval.";
    default:
      return "The key declarations must appear on your product page too - on your own store no form forces you, so add net quantity, manufacturer/packer and customer care details to the description or a specification block yourself.";
  }
}

export function buildComplianceTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const productTypeLine =
    profile.productType === "food"
      ? "Product type - food: FSSAI registration and food labeling steps are switched ON for you below."
      : profile.productType === "electronics"
        ? "Product type - electronics: the BIS/CRS certification check is switched ON for you below."
        : profile.productType === "beauty"
          ? "Product type - beauty: cosmetics labeling and CDSCO checks are switched ON for you below."
          : profile.productType === "fashion"
            ? "Product type - fashion: no certificate needed; your compliance is accurate listings, size charts, and brand authorization."
            : "Product type - general: no category certificate needed; your work is correct HSN mapping and complete labels.";

  const salesModelLine =
    profile.salesModel === "own_website_only"
      ? "Sales model - own website only: no marketplace gatekeeper checks your listings, so YOU enforce labeling and invoicing on yourself. The obligations do not shrink, only the audits do."
      : profile.salesModel === "both"
        ? `Sales model - marketplace + own website: ${channelLabel(profile.primaryChannel)}'s category rules apply to marketplace listings, and on your own site you self-enforce the same labeling and invoice rules.`
        : `Sales model - marketplace only: ${channelLabel(profile.primaryChannel)}'s category approval and listing rules apply on top of the legal requirements.`;

  const importsLine = profile.importsProducts
    ? "Imports - yes: importer-of-record duties are ON. The import labeling and customs step below is mandatory for you."
    : "Imports - no: the import compliance step is skipped, but your domestic supplier's labels must still be complete - check them in the labeling step.";

  const prepackLine = profile.sellsPrepackagedGoods
    ? "Pre-packaged - yes: the Legal Metrology declarations step below is ON. Every sealed package needs the mandatory label before it ships."
    : "Pre-packaged - no: the packaged-goods labeling step is skipped, but listings and invoices still need accurate product descriptions.";

  const steps: TaskStep[] = [
    {
      id: "applicability",
      title: "Map which compliance rules apply to YOU",
      why: "Compliance is not one-size-fits-all. Your product type, sales model, and import status determine what's mandatory vs optional.",
      how: [
        "Each line below comes from your onboarding answers and switches specific steps on or off in this walkthrough - read it as your personal checklist, not general theory.",
        productTypeLine,
        salesModelLine,
        importsLine,
        prepackLine,
        `State - ${stateLabel(profile.operatingState)}: your GSTIN's first 2 digits and your pickup address must both belong to this state (the Documentation walkthrough validates that).`,
        "If any line above is wrong, fix your profile before continuing - every later step builds on these answers.",
      ],
      mentorNote: workspace.gstin
        ? `Good - you already saved GSTIN ${workspace.gstin}. We'll validate it's configured correctly for your products.`
        : "Complete the documentation step first if you don't have a GSTIN yet.",
    },
  ];

  if (!profile.hasGstin && !workspace.gstin) {
    steps.push({
      id: "gst-first",
      title: "Get GSTIN before category compliance",
      why:
        profile.primaryChannel === "shopify"
          ? "On your own store nobody blocks you upfront - but you cannot issue valid GST invoices, claim input credit, or charge tax correctly without a GSTIN once registration applies to you."
          : "Marketplace category approvals require GSTIN. Without it, you cannot proceed with product-specific compliance.",
      how:
        profile.primaryChannel === "meesho"
          ? [
              "Meesho gives you a legal fast lane: the free Enrolment ID (the Documentation walkthrough shows the exact gst.gov.in clicks) lets you list eligible categories to buyers in your own state while the GSTIN processes.",
              "Run the GSTIN application in parallel anyway - inter-state buyers, other marketplaces, and several compliance screens below need the real 15-digit GSTIN.",
              "Come back here once either the Enrolment ID or the GSTIN is saved in your workspace.",
            ]
          : profile.primaryChannel === "shopify"
            ? [
                "The Documentation walkthrough covers whether the turnover threshold applies to your own-website model and walks you through registration on gst.gov.in if it does not.",
                "Return here once your GST position is settled - the HSN mapping below assumes you know your rates.",
              ]
            : [
                `${channelLabel(profile.primaryChannel)} will not let you finish seller onboarding or category approval without a GSTIN - there is no workaround.`,
                "Go back to the Documentation guided walkthrough and complete GST registration - it takes you through gst.gov.in screen by screen.",
                "Return here once your GSTIN is saved; the HSN and category steps below need it.",
              ],
      trap: "Listing products before GST approval leads to account suspension and TCS recovery issues.",
    });
  }

  steps.push({
    id: "gst-config",
    title: "Configure GST for your product categories",
    why: "Wrong HSN code or GST rate on a listing causes suppression, wrong tax collection, and filing mismatches.",
    how: [
      "Look up each launch SKU on the official CBIC search at https://services.gst.gov.in/services/searchhsnsac - type the product name, note the HSN code and the GST rate (5%, 12%, 18%, or 28%) the portal shows.",
      "Cross-check against your supplier's GST invoice: the HSN they bill you under for the same goods should match your code. If it differs, ask the supplier why before listing - one of you is wrong.",
      ...HSN_PANEL_STEPS[profile.primaryChannel],
      "Write the mapping into a one-page sheet (SKU → HSN → GST rate) and file it in your compliance pack - every new SKU gets a row before it gets a listing.",
      "The same HSN must then appear in three places that always match: the listing/tax settings, every sales invoice line, and the HSN summary in your GSTR-1. A mismatch across these three is what turns into notices.",
    ],
    trap: "Using a generic HSN like 9997 for everything triggers audit flags. Each product needs its specific code.",
    tools: [
      {
        name: "GST HSN/SAC Search (services.gst.gov.in)",
        whenToUse: "First stop for every new SKU.",
        why: "Official CBIC lookup - the code and rate shown here are what any audit compares your filings against.",
        href: "https://services.gst.gov.in/services/searchhsnsac",
      },
      {
        name: "ClearTax HSN Finder",
        whenToUse: "When the official search is ambiguous between two near-identical codes.",
        why: "Plain-language descriptions help you pick the right entry - prevents the most common tax mapping error.",
        href: "https://cleartax.in/s/hsn-code-finder",
      },
    ],
  });

  if (profile.productType === "food") {
    steps.push({
      id: "fssai",
      title: "FSSAI registration for food products",
      why: "Selling food on any Indian marketplace requires FSSAI registration or license. No exceptions for e-commerce.",
      how: [
        "Open https://foscos.fssai.gov.in → Apply for License/Registration → select your state. The eligibility questionnaire derives whether you need Basic Registration (turnover under ₹12L) or a State/Central License - answer honestly and trust its result over forum advice.",
        "Upload business address proof and product category details, and pick the kind of business that matches how you actually operate - trading/retail if you only resell, not manufacturing.",
        "Once granted: the FSSAI logo and your 14-digit license/registration number go on every food label AND into the marketplace's food category approval form - listings without the number get rejected.",
        "Physical check before dispatch: your sample's label must carry the FSSAI number plus the standard food label details (ingredients, dates, net quantity, MRP) - photograph it for your compliance pack.",
        "Track the validity date in your compliance pack and renew before expiry - an expired number takes live listings down.",
      ],
      trap: "Homemade/unlabeled food sold online violates FSSAI rules even if you have GST. Proper labeling is mandatory.",
      stuck: [
        "Not sure which license type: Basic for small/local, State for ₹12L-₹20Cr, Central above ₹20Cr.",
        "Application pending: you can list some categories with application reference number - check marketplace policy.",
      ],
      tools: [
        {
          name: "IndiaFilings FSSAI",
          whenToUse: "If FSSAI application process feels confusing.",
          why: "Handles registration end-to-end with document prep - typically 7-15 days.",
          href: "https://www.indiafilings.com/fssai-registration",
        },
      ],
    });
  }

  if (profile.productType === "electronics") {
    steps.push({
      id: "bis-check",
      title: "BIS/CRS compliance check for electronics",
      why: "Many electronics categories require BIS certification before sale in India. Selling without it risks seizure and account suspension.",
      how: [
        "On https://www.bis.gov.in open the Product Certification section and find the list of products under the Compulsory Registration Scheme (CRS). Search for your exact product type - entries are specific ('power banks', 'adapters', 'LED lights'), so check every plausible entry, not a general phrase like 'mobile accessories'.",
        "On the CRS list: ask your supplier for their BIS registration number (starts with R-) and the certificate itself. The certificate must name the factory that actually manufactures your product - a trader's paperwork for a different factory covers nothing.",
        "Physical check on your sample: the BIS Standard Mark with the R-number must be printed on the product or its packaging. A certificate in a drawer with no mark on the product is not compliance.",
        "Not on the CRS list: take a dated screenshot of your search and file it in your compliance pack - marketplaces ask for proof either way during electronics category approval.",
      ],
      trap: "Importing electronics from China without BIS certification is illegal for CRS-covered products. Customs may seize shipments.",
      question: {
        id: "bis-needed",
        prompt: "Have you confirmed whether your electronics need BIS certification?",
        options: [
          { value: "yes-certified", label: "Yes - product is BIS certified" },
          { value: "yes-needed", label: "Yes - certification is needed, not yet done" },
          { value: "no", label: "Not yet checked" },
        ],
      },
    });

    if (answers["bis-needed"] === "no" || answers["bis-needed"] === "yes-needed") {
      steps.push({
        id: "bis-action",
        title: "Verify BIS requirement before listing",
        why: "Amazon and Flipkart increasingly enforce BIS checks during category approval for electronics.",
        how: [
          "Do the CRS list check on https://www.bis.gov.in NOW, before creating a single listing - this is the one compliance check that can get shipments seized, not just listings blocked.",
          "If listed: get the supplier's BIS certificate and verify the R-number covers YOUR product's actual manufacturer and model - OR apply yourself (a weeks-long, costly process - current timelines and fees are on https://www.manakonline.in), which rarely makes sense for a first SKU.",
          "If the supplier cannot produce a matching certificate, change the supplier or the product - do not list and hope.",
          "If not listed: document your check (dated screenshot) and keep it ready for marketplace category approval.",
        ],
        trap: "Assuming small accessories are exempt - many cables, chargers, and power banks require BIS.",
      });
    }
  }

  if (profile.productType === "beauty") {
    steps.push({
      id: "beauty-compliance",
      title: "Cosmetics and beauty product compliance",
      why: "Beauty products have labeling requirements under Drugs & Cosmetics Act. Marketplaces reject listings with missing ingredient lists.",
      how: [
        "Put your actual sample on the desk and check the label carries: ingredient list, name and address of the manufacturer (and importer, if imported), manufacturing date, use-before/expiry date, batch number, net content, and MRP. Photograph the label for your compliance pack.",
        "Imported cosmetics: ask the importer for their CDSCO import registration certificate number BEFORE you buy stock - no certificate, no deal; the liability lands on you, not them.",
        "Check CDSCO's banned/restricted ingredient lists (https://cdsco.gov.in) against your product's ingredient list - if anything on your label appears there, drop the SKU.",
        profile.primaryChannel === "shopify"
          ? "Copy the ingredient list and manufacturer/importer details onto your product page yourself - on your own store there is no marketplace field forcing you, but the labeling rules apply all the same."
          : `Copy the ingredient list and manufacturer/importer details into the listing fields on ${channelLabel(profile.primaryChannel)} - beauty listings missing these fields get rejected at creation or taken down at audit.`,
      ],
      trap: "Selling imported Korean/western cosmetics without import registration and proper labeling is a common suspension cause.",
    });
  }

  if (profile.productType === "fashion") {
    steps.push({
      id: "fashion-compliance",
      title: "Fashion listing compliance",
      why: "Fashion has lighter regulatory burden than food/electronics, but marketplaces enforce brand authorization and return policies strictly.",
      how: [
        "Branded goods: get a signed authorization letter that names the brand, YOUR exact legal business name (as on your GST), and a validity period - from the brand or an authorized distributor - and keep GST purchase invoices showing the brand name. No letter and no invoices = sell own-label instead.",
        "Own-label/unbranded: run your product title's words through the trademark search on https://ipindia.gov.in - a registered word mark in your title is an IP strike even when the product itself is generic.",
        "Size chart mandatory on every listing, measured from your actual samples in cm and inches - reduces 'wrong size' returns (the Product selection walkthrough has the template).",
        "Return/exchange policy visible on listing and store page; accurate color and fabric description - 'not as described' is the top return reason after size.",
        "7-day return window is standard; shorter windows reduce trust on unknown stores.",
      ],
      trap: "Using celebrity/influencer photos without rights = IP complaint and listing removal.",
      mentorNote: "Fashion compliance is mostly about accurate listings and return clarity - not certificates.",
    });
  }

  if (profile.sellsPrepackagedGoods) {
    steps.push({
      id: "legal-metrology",
      title: "Legal Metrology declarations for packaged goods",
      why: "Pre-packaged means sealed before sale - which is almost every dropshipped product. The Legal Metrology (Packaged Commodities) Rules set mandatory label declarations, and both marketplace audits and consumer complaints check them.",
      how: [
        "Put your supplier sample on the desk and tick off every mandatory declaration on the package: (1) name and address of the manufacturer/packer, (2) common name of the product, (3) net quantity in standard units, (4) month and year of manufacture or packing, (5) MRP inclusive of all taxes, (6) consumer care name with phone or email.",
        profile.importsProducts
          ? "You import: the package must ALSO carry 'Imported by' with your name and Indian address plus the country of origin - the import compliance step below covers who prints this."
          : "You buy domestic: printing the manufacturer/packer declarations is your supplier's job - your job is refusing stock where they are missing.",
        lmListingLine(profile.primaryChannel),
        "MRP on the package must match your listing price policy, and multi-packs need the unit sale price visible.",
        "Anything missing on the package = stop. Ask the supplier for corrected packaging or a compliant sticker carrying the missing declarations before dispatch - a properly affixed label is acceptable; a bare poly bag is not.",
        "Exact letter heights and formats are set in the rules' tables - read the Legal Metrology (Packaged Commodities) Rules on the Department of Consumer Affairs site (https://consumeraffairs.nic.in) rather than guessing.",
        "Photograph the compliant label of every launch SKU and file it in your compliance pack (last step).",
      ],
      trap: "Dropshipped products from suppliers often lack proper labeling. Do not list until packaging meets Legal Metrology rules.",
      mentorNote:
        profile.productType === "food"
          ? "Food stacks FSSAI label requirements on top of these declarations - both sets must be present on the same label."
          : "Dropshipping does not outsource this - the marketplace holds the seller of record responsible, and that is you.",
    });
  }

  if (profile.importsProducts) {
    steps.push({
      id: "import-compliance",
      title: "Import labeling and customs compliance",
      why: "As the importer of record, YOU are responsible for correct labeling, HSN classification, and duty payment - not your supplier.",
      how: [
        "One-time setup: get an IEC (Importer Exporter Code) on https://www.dgft.gov.in against your PAN - customs will not clear commercial imports without it.",
        "Confirm the customs HSN classification with your customs broker and check it matches the HSN you mapped in the GST step - the Bill of Entry, your invoices, and your listings must tell one story.",
        "Add 'Imported by: [Your Business Name, Address]' and the country of origin on every retail package - agree with the supplier BEFORE production on who prints this, or budget your own compliant stickers.",
        "Calculate IGST + customs duty into your landed cost (calculator step in Product selection) - duty surprises kill thin margins.",
        "Keep every Bill of Entry and import invoice - the IGST you paid at customs is claimable as input credit only against these documents.",
      ],
      trap: "Under-declaring product value at customs to save duty is illegal and can result in shipment seizure plus penalties.",
    });
  }

  steps.push({
    id: "category-approval",
    title:
      profile.primaryChannel === "shopify"
        ? "Clear the gatekeepers your own store still has"
        : `Prepare for ${channelLabel(profile.primaryChannel)} category approval`,
    why:
      profile.primaryChannel === "shopify"
        ? "No marketplace gates your store - but payment gateways and ad platforms gate the same categories, and they enforce after money starts moving."
        : "Some categories are gated - you need extra documents before listings go live. Applying without them causes delays.",
    how: [
      ...CATEGORY_APPROVAL_STEPS[profile.primaryChannel],
      ...(profile.primaryChannel === "shopify"
        ? []
        : ["Allow 3-7 business days for approval - do not start ads until it is through."]),
    ],
    trap:
      profile.primaryChannel === "shopify"
        ? "Assuming 'my own store, my own rules' - the payment gateway's restricted list applies from your first order, and a payout freeze arrives without warning."
        : "Listing in a gated category without approval gets the listing suppressed with no clear error message.",
    mentorNote: "Category approval is boring but blocking. Do it once, correctly, and never think about it again.",
  });

  steps.push({
    id: "compliance-pack",
    title: "Build your compliance pack (one folder, all products)",
    why: "When marketplace audits or customers complain, you need every certificate accessible in seconds.",
    how: [
      "Create a Compliance folder with subfolders per product.",
      "Each product file: HSN code, GST rate, certificates, labeling photos.",
      "Add a compliance checklist per SKU (green = ready, red = blocked).",
      "Review monthly - certificates expire and regulations change.",
      "Confirm all launch SKUs have documented compliance mapping before listing.",
    ],
  });

  const categoryNote =
    profile.productType === "food"
      ? "Food needs FSSAI + GST + marketplace category approval."
      : profile.productType === "electronics"
        ? "Electronics may need BIS + GST + category approval."
        : profile.productType === "beauty"
          ? "Beauty needs proper labeling + GST + category checks."
          : profile.productType === "fashion"
            ? "Fashion needs size charts, return policy, and brand authorization if branded."
            : "General merchandise follows GST + marketplace category rules.";

  return {
    id: "compliance-by-product",
    title: "Product compliance, personalized to you",
    intro: `${categoryNote} We'll walk through exactly what applies to your ${profile.productType} products in ${stateLabel(profile.operatingState)}.`,
    steps,
  };
}
