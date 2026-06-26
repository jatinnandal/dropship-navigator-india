import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { stateLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

export function buildComplianceTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "applicability",
      title: "Map which compliance rules apply to YOU",
      why: "Compliance is not one-size-fits-all. Your product type, sales model, and import status determine what's mandatory vs optional.",
      how: [
        "Review your profile inputs below — each one changes your checklist.",
        `Product type: ${profile.productType}`,
        `Sales model: ${profile.salesModel}`,
        `Imports: ${profile.importsProducts ? "yes" : "no"}`,
        `Pre-packaged: ${profile.sellsPrepackagedGoods ? "yes" : "no"}`,
        `State: ${stateLabel(profile.operatingState)}`,
      ],
      mentorNote: workspace.gstin
        ? `Good — you already saved GSTIN ${workspace.gstin}. We'll validate it's configured correctly for your products.`
        : "Complete the documentation step first if you don't have a GSTIN yet.",
    },
  ];

  if (!profile.hasGstin && !workspace.gstin) {
    steps.push({
      id: "gst-first",
      title: "Get GSTIN before category compliance",
      why: "Marketplace category approvals require GSTIN. Without it, you cannot proceed with product-specific compliance.",
      how: [
        "Go back to the Documentation guided walkthrough and complete GST registration.",
        "Return here once you have your GSTIN saved.",
      ],
      trap: "Listing products before GST approval leads to account suspension and TCS recovery issues.",
    });
  }

  steps.push({
    id: "gst-config",
    title: "Configure GST for your product categories",
    why: "Wrong HSN code or GST rate on a listing causes suppression, wrong tax collection, and filing mismatches.",
    how: [
      "Look up the correct HSN code for each product on cbic-gst.gov.in.",
      "Map each SKU to its HSN and applicable GST rate (5%, 12%, 18%, or 28%).",
      "Enter these in your marketplace seller panel tax settings.",
      "Create a one-page HSN mapping sheet for your team.",
    ],
    trap: "Using a generic HSN like 9997 for everything triggers audit flags. Each product needs its specific code.",
    tools: [
      {
        name: "ClearTax HSN Finder",
        whenToUse: "When unsure of HSN code for a product.",
        why: "Free lookup tool — prevents the most common tax mapping error.",
      },
    ],
  });

  if (profile.productType === "food") {
    steps.push({
      id: "fssai",
      title: "FSSAI registration for food products",
      why: "Selling food on any Indian marketplace requires FSSAI registration or license. No exceptions for e-commerce.",
      how: [
        "Determine if you need Basic Registration (turnover under ₹12L) or State/Central License.",
        "Apply at foscos.fssai.gov.in with business address proof and product category details.",
        "Display FSSAI license number on all product listings and packaging.",
        "Keep validity date tracked — expired FSSAI blocks listings.",
      ],
      trap: "Homemade/unlabeled food sold online violates FSSAI rules even if you have GST. Proper labeling is mandatory.",
      stuck: [
        "Not sure which license type: Basic for small/local, State for ₹12L-₹20Cr, Central above ₹20Cr.",
        "Application pending: you can list some categories with application reference number — check marketplace policy.",
      ],
      tools: [
        {
          name: "IndiaFilings FSSAI",
          whenToUse: "If FSSAI application process feels confusing.",
          why: "Handles registration end-to-end with document prep — typically 7-15 days.",
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
        "Check if your product falls under Compulsory Registration Scheme (CRS) on bis.gov.in.",
        "Common CRS categories: adapters, LED lights, mobile covers with batteries, certain cables.",
        "If required: either get BIS certification or source from a BIS-certified manufacturer.",
        "Display BIS registration number on product and listing.",
      ],
      trap: "Importing electronics from China without BIS certification is illegal for CRS-covered products. Customs may seize shipments.",
      question: {
        id: "bis-needed",
        prompt: "Have you confirmed whether your electronics need BIS certification?",
        options: [
          { value: "yes-certified", label: "Yes — product is BIS certified" },
          { value: "yes-needed", label: "Yes — certification is needed, not yet done" },
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
          "Search your product category on bis.gov.in CRS product list.",
          "If listed: contact your supplier for their BIS certificate OR apply yourself (4-8 weeks, ₹25K-50K).",
          "If not listed: document your check (screenshot) for marketplace category approval.",
        ],
        trap: "Assuming small accessories are exempt — many cables, chargers, and power banks require BIS.",
      });
    }
  }

  if (profile.productType === "beauty") {
    steps.push({
      id: "beauty-compliance",
      title: "Cosmetics and beauty product compliance",
      why: "Beauty products have labeling requirements under Drugs & Cosmetics Act. Marketplaces reject listings with missing ingredient lists.",
      how: [
        "Ensure product has ingredient list, manufacturing date, expiry date, and MRP on packaging.",
        "Import cosmetics need CDSCO import registration if applicable.",
        "Avoid products with banned ingredients (check CDSCO prohibited list).",
        "Keep manufacturer/importer details visible on listing.",
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
        "Brand authorization: if selling branded goods, get authorization letter or sell own-label/unbranded.",
        "Size chart mandatory on listing — reduces 'wrong size' returns.",
        "Return/exchange policy visible on listing and store page.",
        "Accurate color and fabric description — 'not as described' is top return reason after size.",
        "7-day return window is standard; shorter windows reduce trust on unknown stores.",
      ],
      trap: "Using celebrity/influencer photos without rights = IP complaint and listing removal.",
      mentorNote: "Fashion compliance is mostly about accurate listings and return clarity — not certificates.",
    });
  }

  if (profile.sellsPrepackagedGoods) {
    steps.push({
      id: "legal-metrology",
      title: "Legal Metrology declarations for packaged goods",
      why: "Pre-packaged products sold online must display MRP, net quantity, manufacturer/packer/importer name and address, and customer care details.",
      how: [
        "Verify every product package has: MRP, net qty, mfg/packer name + address, customer care.",
        "For imported goods: add importer name and address in India.",
        "Ensure MRP on package matches listing price policy.",
        "Keep unit sale price visible if selling multi-packs.",
      ],
      trap: "Dropshipped products from suppliers often lack proper labeling. Do not list until packaging meets Legal Metrology rules.",
    });
  }

  if (profile.importsProducts) {
    steps.push({
      id: "import-compliance",
      title: "Import labeling and customs compliance",
      why: "As the importer of record, YOU are responsible for correct labeling, HSN classification, and duty payment — not your supplier.",
      how: [
        "Confirm correct HSN code for customs classification (affects duty rate).",
        "Add 'Imported by: [Your Business Name, Address]' on product packaging.",
        "Calculate IGST + customs duty in your landed cost (calculator step in product selection).",
        "Keep Bill of Entry and import invoice for GST input credit.",
      ],
      trap: "Under-declaring product value at customs to save duty is illegal and can result in shipment seizure plus penalties.",
    });
  }

  steps.push({
    id: "category-approval",
    title: "Prepare for marketplace category approval",
    why: "Some categories are gated — you need extra documents before listings go live. Applying without them causes delays.",
    how: [
      "Check your marketplace's category approval requirements for your product type.",
      "Prepare brand authorization letter if selling branded goods.",
      "Upload compliance certificates (FSSAI, BIS, etc.) during category application.",
      "Allow 3-7 business days for approval — do not start ads until approved.",
    ],
    trap: "Listing in a gated category without approval gets the listing suppressed with no clear error message.",
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
      "Review monthly — certificates expire and regulations change.",
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
