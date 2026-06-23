import type { OnboardingProfile } from "@/lib/mvp-data";

export type StepPartner = {
  name: string;
  whenToUse: string;
  whatToAsk: string;
};

export type PersonalizationFactor = {
  factor: string;
  value: string;
  impact: string;
};

export type StepPhase = {
  phase: string;
  goal: string;
  tasks: string[];
};

export type StepDetail = {
  plainLanguageSummary: string;
  requiredInputs: PersonalizationFactor[];
  mustHaveDocuments: string[];
  decisionFlow: string[];
  executionPlan: StepPhase[];
  doneCriteria: string[];
  actionChecklist: string[];
  mistakesToAvoid: string[];
  partnerOptions: StepPartner[];
};

export function getStepDetail(moduleId: string, profile: OnboardingProfile): StepDetail {
  const businessDocSet =
    profile.businessType === "private_limited"
      ? [
          "Company PAN, Certificate of Incorporation, MoA/AoA",
          "Board resolution + authorized signatory details",
          "Registered office proof (electricity bill/rent agreement + owner proof/NOC)",
        ]
      : profile.businessType === "llp"
        ? [
            "LLP PAN + LLP incorporation documents",
            "LLP agreement and authorized signatory proof",
            "Registered office proof (electricity bill/rent agreement + owner proof/NOC)",
          ]
        : profile.businessType === "partnership"
          ? [
              "Firm PAN + partnership deed",
              "PAN/Aadhaar details of all partners + authorized signatory proof",
              "Business address proof (electricity bill/rent agreement + owner proof/NOC)",
            ]
          : [
              "Personal PAN + Aadhaar (or equivalent KYC) for proprietor/individual",
              "Business address proof (electricity bill/rent agreement + owner proof/NOC)",
              "Bank proof (cancelled cheque/passbook statement with IFSC)",
            ];

  switch (moduleId) {
    case "common-documentation":
      return {
        plainLanguageSummary:
          "Before listing any product, keep your basic documents ready in one folder. This avoids repeated rejection on marketplaces and makes onboarding much faster.",
        requiredInputs: [
          {
            factor: "Business type",
            value: profile.businessType,
            impact: "Changes GST and constitution document set.",
          },
          {
            factor: "Sales model",
            value: profile.salesModel,
            impact: "Marketplace-first model usually triggers stricter day-1 compliance checks.",
          },
          {
            factor: "Operating state",
            value: profile.operatingState,
            impact: "State details impact address proofs and practical filing workflow.",
          },
        ],
        mustHaveDocuments: [
          ...businessDocSet,
          "Dedicated business phone + email used consistently across all platforms",
          "Bank account in matching legal/business name",
        ],
        decisionFlow: [
          "If you will sell on marketplace (Amazon/Flipkart/Meesho), treat GST readiness as day-1 requirement unless only exempt categories apply.",
          "If your business name differs across PAN, bank, GST, and marketplace profile, fix name mismatch before any onboarding submission.",
          "If business type is not finalized, start with proprietorship only if you need fastest launch and simple setup; otherwise align with long-term structure.",
          "If operating from rented/shared premises, keep owner proof + NOC + rent agreement ready before registration filings.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Identity and Constitution",
            goal: "Lock the legal identity that will be reused everywhere.",
            tasks: [
              "Finalize business type and exact legal business name format.",
              "Prepare PAN and owner/director/partner KYC as per business type.",
              "Create one master profile sheet with legal name, address, mobile, email, and authorized signatory.",
            ],
          },
          {
            phase: "Phase 2 - Address and Banking",
            goal: "Prepare proofs that typically cause rejections.",
            tasks: [
              "Collect principal place of business proof (electricity bill/property tax/rent agreement + owner proof).",
              "Collect consent/NOC where required for rented/shared setup.",
              "Set bank account with matching legal name and keep cancelled cheque or bank statement ready.",
            ],
          },
          {
            phase: "Phase 3 - Marketplace Readiness Pack",
            goal: "Create a single upload-ready folder for onboarding teams.",
            tasks: [
              "Build final document folder with clear filenames and PDFs/JPEGs.",
              "Create a one-page onboarding data sheet (GST/PAN/bank/address/store name).",
              "Dry-run one marketplace onboarding form using the data sheet and resolve mismatches before submission.",
            ],
          },
        ],
        doneCriteria: [
          "All core IDs, address proofs, and bank proofs are organized in one folder.",
          "Business name and address are identical across PAN/GST/bank/marketplace profile.",
          "A single onboarding data sheet exists and can be reused by any team member without confusion.",
        ],
        actionChecklist: [
          "Create one shared folder with PAN, Aadhaar, address proof, canceled cheque, and bank details.",
          "Decide business type (sole proprietorship is usually fastest for beginners).",
          "Use your exact legal name format consistently across bank and marketplace forms.",
          "Keep one phone number and one business email only for marketplace accounts.",
        ],
        mistakesToAvoid: [
          "Using different spellings across PAN, bank account, and marketplace profile.",
          "Starting listing work before documentation is complete.",
          "Mixing personal and business transactions in random bank accounts.",
        ],
        partnerOptions: [
          {
            name: "IndiaFilings",
            whenToUse: "If you want help choosing entity type and preparing docs quickly.",
            whatToAsk: "Ask for a beginner package with only essential setup, no upsell.",
          },
          {
            name: "Vakilsearch",
            whenToUse: "If you want assisted registration and compliance reminders.",
            whatToAsk: "Ask exact timeline, document list, and total all-inclusive price.",
          },
          {
            name: "Local CA (state-specific)",
            whenToUse: `If your operations in ${profile.operatingState} have local process nuances.`,
            whatToAsk: "Ask for a practical checklist for marketplace seller onboarding.",
          },
        ],
      };

    case "product-selection":
      return {
        plainLanguageSummary:
          "Pick products that are easy to ship, hard to break, and can survive returns. Focus on practical winners, not viral products.",
        requiredInputs: [
          {
            factor: "Product category",
            value: profile.productType,
            impact: "Affects compliance and rejection risk later.",
          },
          {
            factor: "Budget band",
            value: profile.budgetBand,
            impact: "Defines testing batch size and ad spend runway.",
          },
        ],
        mustHaveDocuments: [
          "Basic SKU costing sheet (product + packaging + shipping + fees + ads + returns)",
          "Supplier quotation and sample test notes",
        ],
        decisionFlow: [
          "If margin after all costs is below your target, reject the SKU even if demand appears high.",
          "If product is fragile/heavy/complex to return, treat as high-risk for beginner launch.",
          "If first channel is marketplace and category approval is complex, shortlist easier category SKUs first.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Shortlist",
            goal: "Move from broad ideas to 10 realistic candidates.",
            tasks: [
              "Collect 10 SKU ideas from marketplace search and competitor stores.",
              "Record price band, competitor count, and review quality.",
              "Eliminate obvious low-margin and high-breakage products.",
            ],
          },
          {
            phase: "Phase 2 - Unit Economics",
            goal: "Find 3 candidates that are profitable after real costs.",
            tasks: [
              "Estimate landed cost, packaging, shipping, commission, ad cost, and expected returns loss.",
              "Compute contribution margin per order at conservative selling price.",
              "Retain only top 3 SKUs that survive conservative assumptions.",
            ],
          },
        ],
        doneCriteria: [
          "You have exactly 3 launch SKUs with positive conservative unit economics.",
          "Each selected SKU has supplier sample confirmation and quality notes.",
        ],
        actionChecklist: [
          "Shortlist 10 products in your category and check demand consistency.",
          "Reject items with fragile packaging, high size/weight, or poor margin.",
          "Estimate final per-order profit after fees, shipping, ads, and expected returns.",
          "Pick 3 products only for first test cycle.",
        ],
        mistakesToAvoid: [
          "Selecting products only by trend videos without margin math.",
          "Ignoring return rate and COD failure risk.",
          "Launching too many products at once.",
        ],
        partnerOptions: [
          {
            name: "Helium 10",
            whenToUse: "If you need deeper market data for Amazon-focused launch.",
            whatToAsk: "Ask which plan is enough for early-stage SKU validation.",
          },
          {
            name: "SellerSprite",
            whenToUse: "If you want keyword + competitor analysis for listing prep.",
            whatToAsk: "Ask how to estimate sales velocity for shortlisted products.",
          },
          {
            name: "Freelance category researcher",
            whenToUse: "If you want quick shortlist support before purchase decisions.",
            whatToAsk: "Ask for data-backed shortlist with margin assumptions clearly shown.",
          },
        ],
      };

    case "compliance-by-product": {
      const categoryNote =
        profile.productType === "food"
          ? "Food products usually need FSSAI steps in addition to GST and category approval."
          : profile.productType === "beauty"
            ? "Beauty/cosmetics often need tighter labeling and ingredient compliance checks."
            : profile.productType === "electronics"
              ? "Electronics can require standards/certification checks before broad scale."
              : profile.productType === "fashion"
                ? "Fashion has lighter regulatory burden but still needs clean invoicing and returns policy."
                : "General merchandise mostly follows baseline GST + marketplace category rules.";

      return {
        plainLanguageSummary: `This is where compliance becomes category-specific. ${categoryNote} Since you operate from ${profile.operatingState}, confirm local process expectations with a CA before launch.`,
        requiredInputs: [
          {
            factor: "Product type",
            value: profile.productType,
            impact: "Drives category-specific licenses/certifications (for example FSSAI/BIS patterns).",
          },
          {
            factor: "Sales model",
            value: profile.salesModel,
            impact: "Marketplace-heavy setup typically needs earlier GST readiness.",
          },
          {
            factor: "Import intent",
            value: profile.importsProducts ? "yes" : "no",
            impact: "Imported goods can require importer labeling/compliance responsibilities.",
          },
          {
            factor: "Pre-packaged goods",
            value: profile.sellsPrepackagedGoods ? "yes" : "no",
            impact: "Impacts packaged commodities declaration responsibilities.",
          },
        ],
        mustHaveDocuments: [
          "GST registration proof and tax profile details (if applicable)",
          profile.productType === "food"
            ? "FSSAI registration/license details for relevant food operations"
            : "Category-specific compliance record (as applicable)",
          profile.productType === "electronics"
            ? "BIS/CRS applicability check record for shortlisted electronics SKUs"
            : "Product category approval checklist for target marketplace",
          profile.sellsPrepackagedGoods
            ? "Packaged goods declaration checklist (MRP, net quantity, manufacturer/packer/importer, customer care details)"
            : "Custom/non-packaged product declaration checklist",
        ],
        decisionFlow: [
          profile.salesModel === "marketplace_only" || profile.salesModel === "both"
            ? "Marketplace model selected: assume stricter compliance checks before large catalog launch."
            : "Own-website-first model selected: threshold and compliance timing can differ, but keep GST and invoicing hygiene from day one.",
          profile.productType === "food"
            ? "Food category selected: prioritize FSSAI path before scaling listings."
            : "Non-food category selected: validate category-specific approvals/certifications for your chosen channel.",
          profile.productType === "electronics"
            ? "Electronics selected: run BIS/CRS applicability check before purchase/import commitment."
            : "Electronics not selected: maintain category compliance checklist and labeling accuracy.",
          profile.sellsPrepackagedGoods
            ? "Pre-packaged goods selected: ensure packaged declarations are present and visible in listings."
            : "Non pre-packaged model selected: still maintain clear product declarations and return/invoice policy.",
          profile.importsProducts
            ? "Import path selected: include importer details and origin/compliance checks in planning."
            : "Domestic sourcing path selected: validate domestic supplier compliance records.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Applicability Mapping",
            goal: "Identify exactly which compliance items apply to your business model.",
            tasks: [
              "Map your profile inputs (product type, sales model, state, import intent) to a compliance checklist.",
              "Separate mandatory-now vs mandatory-later items for launch.",
              "Create a red/yellow/green tracker: red blocks listing, yellow can be done in parallel.",
            ],
          },
          {
            phase: "Phase 2 - Registration and Category Files",
            goal: "Complete registrations/certificates that are hard blockers.",
            tasks: [
              profile.hasGstin
                ? "Validate GST details and tax mappings in each channel setup."
                : "Complete GST registration workflow and verify business details consistency.",
              profile.productType === "food"
                ? "Start and track FSSAI process; keep application/reference IDs and validity details documented."
                : "Prepare category-specific compliance file and supporting declarations for your products.",
              profile.productType === "electronics"
                ? "Run BIS/CRS applicability and testing/registration checklist for shortlisted SKUs."
                : "Validate platform category policy requirements and required certificates (if any).",
            ],
          },
          {
            phase: "Phase 3 - Listing-Safe Compliance Pack",
            goal: "Ensure every listing can be defended during audit/check.",
            tasks: [
              "Attach tax, declaration, and certificate references to each SKU listing sheet.",
              "Create invoice template and returns template aligned to category requirements.",
              "Conduct internal pre-launch compliance review for first 10 SKUs.",
            ],
          },
        ],
        doneCriteria: [
          "A profile-specific compliance checklist exists with status for each item.",
          "All launch SKUs have documented tax/category/declaration mapping.",
          "No known red-flag compliance blockers remain for first channel launch.",
        ],
        actionChecklist: [
          profile.hasGstin
            ? "Validate GST profile and tax rates in your marketplace settings."
            : "Complete GST registration workflow (if applicable for your channel/category).",
          "Confirm product-category-specific approvals required before listing.",
          "Prepare invoice format, returns policy, and basic compliance record keeping.",
          "Create one one-page compliance note for your team to avoid repeated mistakes.",
        ],
        mistakesToAvoid: [
          "Assuming one compliance template works for all categories.",
          "Listing first and checking certificates later.",
          "Using incorrect GST/tax mapping per product type.",
        ],
        partnerOptions: [
          {
            name: "ClearTax",
            whenToUse: "If you need help with GST setup and filing workflow.",
            whatToAsk: "Ask for category-wise GST mapping guidance, not just filing.",
          },
          {
            name: "TheGSTCo",
            whenToUse: "If you want practical onboarding-focused GST support.",
            whatToAsk: "Ask for setup + marketplace tax configuration support.",
          },
          {
            name: "Category specialist consultant",
            whenToUse: `If you are in ${profile.productType} and need pre-listing compliance confidence.`,
            whatToAsk: "Ask for mandatory vs optional certificates with launch priority.",
          },
        ],
      };
    }

    case "supplier-sourcing":
      return {
        plainLanguageSummary:
          "Good supplier quality and dispatch speed matter more than saving a few rupees per unit. Bad supplier reliability destroys ratings and cash flow.",
        requiredInputs: [
          {
            factor: "Product type",
            value: profile.productType,
            impact: "Changes quality test checklist and packaging standards.",
          },
        ],
        mustHaveDocuments: [
          "Supplier comparison sheet (MOQ, lead time, defect replacement, payment terms)",
          "Sample approval checklist signed by your team",
        ],
        decisionFlow: [
          "If supplier cannot commit replacement terms in writing, treat as high-risk.",
          "If sample quality and dispatch reliability conflict, prioritize reliability for launch.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Supplier Qualification",
            goal: "Filter down to suppliers that can actually fulfill consistently.",
            tasks: [
              "Collect and compare 5 supplier quotes with lead time and MOQ.",
              "Ask for references and verify dispatch consistency.",
              "Shortlist top 2-3 suppliers for sample cycle.",
            ],
          },
        ],
        doneCriteria: [
          "At least one backup supplier is finalized with written replacement terms.",
          "Sample quality pass criteria are documented and approved.",
        ],
        actionChecklist: [
          "Collect 5 supplier options and compare MOQ, lead time, and replacement policy.",
          "Order samples before finalizing bulk commitment.",
          "Check packaging quality for transit and returns.",
          "Lock basic SLA: dispatch timeline, replacement handling, and escalation contact.",
        ],
        mistakesToAvoid: [
          "Committing on bulk order without sample testing.",
          "Choosing supplier only by lowest rate.",
          "Not documenting replacement and defect terms in writing.",
        ],
        partnerOptions: [
          {
            name: "IndiaMART",
            whenToUse: "If you need broad supplier discovery quickly.",
            whatToAsk: "Ask for recent dispatch references and real fulfillment timelines.",
          },
          {
            name: "TradeIndia",
            whenToUse: "If you want alternative supplier pool beyond one platform.",
            whatToAsk: "Ask MOQ flexibility for first 30-60 day test phase.",
          },
          {
            name: "Third-party QC freelancer",
            whenToUse: "If your product has quality variation risk.",
            whatToAsk: "Ask for sample inspection checklist and defect-rate reporting.",
          },
        ],
      };

    case "channel-launch": {
      const channelName =
        profile.primaryChannel === "amazon"
          ? "Amazon"
          : profile.primaryChannel === "flipkart"
            ? "Flipkart"
            : profile.primaryChannel === "shopify"
              ? "Shopify"
              : "Meesho";

      return {
        plainLanguageSummary: `Launch on ${channelName} first. One channel done well is better than weak setup on three channels.`,
        requiredInputs: [
          {
            factor: "Primary channel",
            value: profile.primaryChannel,
            impact: "Decides first onboarding and listing checklist.",
          },
          {
            factor: "GST status",
            value: profile.hasGstin ? "available" : "not yet",
            impact: "Can block or delay full channel activation depending on model/category.",
          },
        ],
        mustHaveDocuments: [
          "Channel onboarding docs (PAN, GST if applicable, bank proof, pickup address proof)",
          "Brand authorization/trademark proof if listing branded products",
          "Listing media pack (images, titles, bullets, specs, tax category mapping)",
        ],
        decisionFlow: [
          "If onboarding is pending, do not upload large catalog yet.",
          "If listing quality is weak, improve content before scaling ads.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Onboarding Completion",
            goal: "Get account fully approved without repeated rejections.",
            tasks: [
              "Submit identity, GST, bank, and pickup details with exact match.",
              "Resolve all pending verification tasks before listing push.",
            ],
          },
        ],
        doneCriteria: [
          "Channel account is fully active and payout setup is verified.",
          "First 3-5 listings are live with complete media and metadata.",
        ],
        actionChecklist: [
          `Complete ${channelName} onboarding checklist fully before listing work.`,
          "Prepare title, bullet points, image set, and pricing strategy for each SKU.",
          "Verify tax/category mapping and shipping settings.",
          "Publish 3-5 starter listings and track first 7 days closely.",
        ],
        mistakesToAvoid: [
          "Trying all channels at once on day 1.",
          "Uploading weak images and generic descriptions.",
          "Ignoring early customer Q&A and ratings signals.",
        ],
        partnerOptions: [
          {
            name: "Marketplace onboarding agency",
            whenToUse: "If you want faster listing setup with fewer rejections.",
            whatToAsk: "Ask if they include category approval + listing optimization both.",
          },
          {
            name: "Cataloging freelancer",
            whenToUse: "If you already have products but listings are weak.",
            whatToAsk: "Ask for before/after sample listings and timeline per SKU.",
          },
          {
            name: "Product photography studio",
            whenToUse: "If image quality is limiting conversion.",
            whatToAsk: "Ask for image pack with white background + infographics.",
          },
        ],
      };
    }

    case "ads-growth":
      return {
        plainLanguageSummary:
          "Ads should validate winners, not burn money. Start with strict budget caps and scale only products that convert.",
        requiredInputs: [
          {
            factor: "Budget band",
            value: profile.budgetBand,
            impact: "Defines daily cap and campaign depth.",
          },
        ],
        mustHaveDocuments: [
          "Weekly ad tracker (spend, sales, ROAS/ACOS, conversion)",
          "Creative test log with performance notes",
        ],
        decisionFlow: [
          "If conversion is weak, fix listing first before increasing ad budget.",
          "If one SKU wins consistently, scale in small controlled increments.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Controlled Tests",
            goal: "Find winning products/creatives with minimum wasted spend.",
            tasks: [
              "Run small-budget campaigns for limited SKU set.",
              "Review performance every 3-7 days and document decisions.",
            ],
          },
        ],
        doneCriteria: [
          "At least one campaign shows stable positive unit economics.",
          "Weak campaigns are paused with learnings recorded.",
        ],
        actionChecklist: [
          "Start with one campaign per product group, small daily caps.",
          "Track CTR, conversion rate, ACOS/ROAS weekly.",
          "Pause weak ads quickly and reallocate to winning listings.",
          "Improve listing content before increasing ad budgets.",
        ],
        mistakesToAvoid: [
          "Scaling ad spend before product-market fit is visible.",
          "Judging performance too early (less than 5-7 days).",
          "Running ads with poor listing images/content.",
        ],
        partnerOptions: [
          {
            name: "Amazon Ads specialist",
            whenToUse: "If ad structure is confusing and spend is wasted.",
            whatToAsk: "Ask for weekly optimization cadence and reporting template.",
          },
          {
            name: "Meta ads freelancer",
            whenToUse: "If you are driving traffic to own store.",
            whatToAsk: "Ask for test plan with creative iteration process.",
          },
          {
            name: "Creative designer",
            whenToUse: "If ad CTR is weak despite right targeting.",
            whatToAsk: "Ask for ad creatives optimized for first 3 seconds.",
          },
        ],
      };

    case "tracking-analytics":
      return {
        plainLanguageSummary:
          "Revenue is vanity, net profit is reality. Build a simple weekly profit and returns dashboard to avoid surprises.",
        requiredInputs: [
          {
            factor: "Sales model",
            value: profile.salesModel,
            impact: "Determines which reports and payout files to reconcile.",
          },
        ],
        mustHaveDocuments: [
          "Weekly P&L sheet by SKU and channel",
          "Settlement reconciliation template",
          "Returns and RTO reason tracker",
        ],
        decisionFlow: [
          "If SKU-level margin is negative for 2+ cycles, pause or reprice.",
          "If settlement mismatch repeats, open claims and track closure SLA.",
        ],
        executionPlan: [
          {
            phase: "Phase 1 - Data Pipeline",
            goal: "Create one reliable source of truth for profitability.",
            tasks: [
              "Collect weekly order, ad, and settlement exports.",
              "Update SKU P&L and flag negative-margin SKUs.",
            ],
          },
        ],
        doneCriteria: [
          "Weekly profitability review is running on schedule.",
          "Top loss drivers (returns/ads/fees) are identified and assigned actions.",
        ],
        actionChecklist: [
          "Track SKU-level revenue, fees, ad spend, shipping, and net margin.",
          "Monitor return and RTO rate by product every week.",
          "Reconcile settlement reports vs expected payouts.",
          "Create a weekly action list from data (pause, improve, scale).",
        ],
        mistakesToAvoid: [
          "Looking only at sales without net margin.",
          "Ignoring settlement mismatch for weeks.",
          "Not separating one-time costs vs recurring costs.",
        ],
        partnerOptions: [
          {
            name: "eVanik",
            whenToUse: "If you want easier marketplace analytics views.",
            whatToAsk: "Ask for SKU-level profitability and reconciliation workflows.",
          },
          {
            name: "TrackEcom",
            whenToUse: "If returns/RTO tracking is becoming hard manually.",
            whatToAsk: "Ask for return reason and channel-wise breakdowns.",
          },
          {
            name: "Bookkeeping support",
            whenToUse: "If weekly reconciliation is slipping and errors are growing.",
            whatToAsk: "Ask for monthly close process and issue escalation path.",
          },
        ],
      };

    default:
      return {
        plainLanguageSummary: "This step is being expanded with a detailed playbook.",
        requiredInputs: [],
        mustHaveDocuments: [],
        decisionFlow: [],
        executionPlan: [],
        doneCriteria: [],
        actionChecklist: ["Review this step, define outcomes, and execute in sequence."],
        mistakesToAvoid: ["Skipping the basics and jumping to advanced actions too early."],
        partnerOptions: [],
      };
  }
}
