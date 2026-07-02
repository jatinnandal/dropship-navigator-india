import type { ProfileFacts } from "@/lib/profile-facts";
import { channelLabel } from "@/lib/profile-name";
import type { TaskModuleId } from "@/lib/tasks";

function subTaskDone(subTasks: Record<string, boolean> | undefined, id: string): boolean {
  return subTasks?.[id] === true;
}

function simulatorDone(completedSimulators: Record<string, boolean> | undefined, kind: string): boolean {
  return completedSimulators?.[kind] === true;
}

export type RequirementSeverity = "required" | "recommended";

export type RequirementRule = {
  id: string;
  moduleId: TaskModuleId;
  label: string;
  why: string;
  severity: RequirementSeverity;
  appliesWhen: (facts: ProfileFacts) => boolean;
};

export type BaseSubTaskRule = {
  id: string;
  moduleId: TaskModuleId;
  label: string;
  why: string;
  severity: RequirementSeverity;
  /** When true, this base subtask is omitted from the plan. */
  excludeWhen?: (facts: ProfileFacts) => boolean;
  /** Override severity when included (e.g. downgrade to recommended). */
  severityWhen?: (facts: ProfileFacts) => RequirementSeverity;
};

export type JourneyRuntime = {
  hasGstin: boolean;
  subTasks?: Record<string, boolean>;
  completedSimulators?: Record<string, boolean>;
};

export type WarningRule = {
  id: string;
  moduleId: TaskModuleId;
  message: string | ((facts: ProfileFacts, runtime: JourneyRuntime) => string);
  appliesWhen: (facts: ProfileFacts, runtime: JourneyRuntime) => boolean;
};

export type ModuleCopy = {
  title: string;
  description: string;
  outcomes: string[];
  tools: string[];
  isPriority: boolean;
  deprioritized: boolean;
};

/** Base subtasks from the original catalog — rules decide inclusion and severity. */
export const BASE_SUBTASK_RULES: BaseSubTaskRule[] = [
  {
    id: "docs-folder-ready",
    moduleId: "common-documentation",
    label: "Master document folder created",
    why: "One folder for PAN, bank, and KYC docs saves hours during marketplace verification.",
    severity: "required",
    excludeWhen: (f) => f.skipBasics,
  },
  {
    id: "gstin-active",
    moduleId: "common-documentation",
    label: "GSTIN obtained or validated",
    why: "Most marketplaces require GSTIN before full seller access.",
    severity: "required",
    excludeWhen: (f) => f.hasGstin,
  },
  {
    id: "bank-matched",
    moduleId: "common-documentation",
    label: "Bank name matches legal name",
    why: "Name mismatch is the #1 marketplace payout rejection.",
    severity: "required",
    severityWhen: (f) => (f.skipBasics ? "recommended" : "required"),
  },
  {
    id: "gst-filing-understood",
    moduleId: "common-documentation",
    label: "GST filing calendar understood",
    why: "Missed filings suspend GSTIN and block marketplaces.",
    severity: "required",
    excludeWhen: (f) => f.hasGstin && f.isExistingSeller,
    severityWhen: (f) => (f.hasGstin ? "recommended" : "required"),
  },
  {
    id: "product-shortlist",
    moduleId: "product-selection",
    label: "3 products shortlisted with margin check",
    why: "Margin calculator gate before listing prevents cash burn.",
    severity: "required",
  },
  {
    id: "samples-ordered",
    moduleId: "product-selection",
    label: "Sample order placed",
    why: "Samples catch quality issues before inventory commitment.",
    severity: "required",
    severityWhen: (f) => (f.isLeanBudget ? "recommended" : "required"),
  },
  {
    id: "hsn-mapped",
    moduleId: "compliance-by-product",
    label: "HSN codes mapped for launch SKUs",
    why: "Wrong HSN triggers listing suppression and GST notices.",
    severity: "required",
  },
  {
    id: "category-certs",
    moduleId: "compliance-by-product",
    label: "Category certificates ready (if needed)",
    why: "Category gating blocks listing until certs are uploaded.",
    severity: "required",
  },
  {
    id: "supplier-vetted",
    moduleId: "supplier-sourcing",
    label: "Primary supplier vetted + terms in writing",
    why: "Unvetted suppliers cause stockouts and cancellation penalties.",
    severity: "required",
  },
  {
    id: "backup-supplier",
    moduleId: "supplier-sourcing",
    label: "Backup supplier identified",
    why: "Backup prevents listing freeze when primary runs out of stock.",
    severity: "recommended",
    severityWhen: (f) => (f.hasComfortableBudget ? "required" : "recommended"),
  },
  {
    id: "domestic-supplier-confirmed",
    moduleId: "supplier-sourcing",
    label: "Domestic supplier confirmed (not AliExpress)",
    why: "India COD needs 3–5 day dispatch — imports kill conversion.",
    severity: "required",
    excludeWhen: (f) => f.hasImportRisk,
    severityWhen: (f) => (f.hasImportRisk ? "recommended" : "required"),
  },
  {
    id: "seller-account-live",
    moduleId: "channel-launch",
    label: "Seller account approved",
    why: "Account approval unlocks listing and payout setup.",
    severity: "required",
  },
  {
    id: "first-listing-live",
    moduleId: "channel-launch",
    label: "First listing live (1 hero SKU)",
    why: "One hero SKU proves the full loop before scaling.",
    severity: "required",
  },
  {
    id: "store-linked",
    moduleId: "channel-launch",
    label: "Store / channel linked and payout ready",
    why: "Payout routing must match your bank KYC.",
    severity: "required",
  },
  {
    id: "cod-practice-done",
    moduleId: "channel-launch",
    label: "COD confirmation practice completed",
    why: "NDR follow-up cuts RTO losses on COD orders.",
    severity: "required",
    severityWhen: (f) =>
      f.sellsOnMarketplace || f.isMarketplaceChannel ? "required" : "recommended",
  },
  {
    id: "first-payout-received",
    moduleId: "channel-launch",
    label: "First payout received in bank",
    why: "Confirms end-to-end money flow before scaling.",
    severity: "required",
  },
  {
    id: "breakeven-roas-known",
    moduleId: "ads-growth",
    label: "Break-even ROAS calculated",
    why: "Ad spend without ROAS floor burns cash with no learning.",
    severity: "required",
    severityWhen: (f) => (f.isLeanBudget ? "recommended" : "required"),
  },
  {
    id: "first-ad-test",
    moduleId: "ads-growth",
    label: "First controlled ad test running",
    why: "Controlled tests beat guessing on ad scale.",
    severity: "recommended",
    severityWhen: (f) => (f.isLeanBudget ? "recommended" : "required"),
  },
  {
    id: "pnl-sheet-ready",
    moduleId: "tracking-analytics",
    label: "Weekly P&L sheet set up",
    why: "SKU-level P&L catches silent margin erosion.",
    severity: "required",
  },
  {
    id: "settlement-reconcile",
    moduleId: "tracking-analytics",
    label: "First settlement reconciled",
    why: "Reconciliation catches payout holds and underpayment.",
    severity: "required",
  },
  {
    id: "appeal-pack-ready",
    moduleId: "tracking-analytics",
    label: "Appeal pack folder assembled",
    why: "Pre-built appeals speed up account reinstatement.",
    severity: "recommended",
  },
  {
    id: "gstr8-reviewed",
    moduleId: "tracking-analytics",
    label: "GSTR-8 / TCS reconciliation reviewed",
    why: "Marketplace TCS must match your GST returns.",
    severity: "required",
    excludeWhen: (f) => !f.sellsOnMarketplace && f.isOwnWebsite,
    severityWhen: (f) => (f.hasGstin && f.sellsOnMarketplace ? "required" : "recommended"),
  },
];

/** Profile-specific subtasks added on top of the base catalog. */
export const ADDITIONAL_REQUIREMENT_RULES: RequirementRule[] = [
  {
    id: "gst-state-code-match",
    moduleId: "common-documentation",
    label: "GST state code matches operating state",
    why: "GSTIN first two digits must match pickup state — mismatch is instant KYC rejection.",
    severity: "required",
    appliesWhen: (f) => Boolean(f.operatingState),
  },
  {
    id: "fssai-registered",
    moduleId: "compliance-by-product",
    label: "FSSAI registration or license obtained",
    why: "Food listings require FSSAI before marketplace category approval.",
    severity: "required",
    appliesWhen: (f) => f.needsFssai,
  },
  {
    id: "bis-checked",
    moduleId: "compliance-by-product",
    label: "BIS / standards check completed for SKUs",
    why: "Electronics categories often need BIS or standards compliance before listing.",
    severity: "required",
    appliesWhen: (f) => f.needsBis,
  },
  {
    id: "cosmetic-label-ready",
    moduleId: "compliance-by-product",
    label: "Cosmetic labeling and ingredient compliance ready",
    why: "Beauty SKUs face category gating and labeling scrutiny on marketplaces.",
    severity: "required",
    appliesWhen: (f) => f.needsCosmeticLabeling,
  },
  {
    id: "legal-metrology-label",
    moduleId: "compliance-by-product",
    label: "Legal Metrology label (MRP, net qty) compliant",
    why: "Pre-packaged goods need MRP and net quantity on label per Legal Metrology rules.",
    severity: "required",
    appliesWhen: (f) => f.needsLegalMetrology,
  },
  {
    id: "iec-ready",
    moduleId: "supplier-sourcing",
    label: "IEC (import export code) obtained or planned",
    why: "Imports require IEC and customs clearance — plan before relying on cross-border stock.",
    severity: "required",
    appliesWhen: (f) => f.needsIec,
  },
  {
    id: "import-risk-acknowledged",
    moduleId: "supplier-sourcing",
    label: "Import vs COD risk acknowledged",
    why: "2–3 week import shipping kills COD conversion in India.",
    severity: "required",
    appliesWhen: (f) => f.hasImportRisk,
  },
  {
    id: "pg-approved",
    moduleId: "channel-launch",
    label: "Payment gateway approved (Razorpay/Cashfree)",
    why: "Own website needs PG for prepaid — individuals face higher rejection rates.",
    severity: "required",
    appliesWhen: (f) => f.needsPaymentGateway,
  },
  {
    id: "zero-pg-cod-fallback",
    moduleId: "channel-launch",
    label: "Zero-PG COD fallback path documented",
    why: "If PG rejects, COD-first checkout keeps sales flowing.",
    severity: "recommended",
    appliesWhen: (f) => f.pgRejectionRisk,
  },
  {
    id: "marketplace-kyc-ready",
    moduleId: "channel-launch",
    label: "Marketplace KYC packet ready",
    why: "Amazon/Flipkart KYC is strict — prepare docs before applying.",
    severity: "required",
    appliesWhen: (f) => f.sellsOnMarketplace && f.gstMandatory,
  },
  {
    id: "fashion-size-chart-ready",
    moduleId: "product-selection",
    label: "Size chart and return policy drafted",
    why: "Fashion RTO drops when size charts and return policy are clear upfront.",
    severity: "required",
    appliesWhen: (f) => f.isFashion,
  },
  {
    id: "rto-calculator-done",
    moduleId: "product-selection",
    label: "RTO reality calculator completed",
    why: "Fashion defaults to 35% RTO — model it before picking SKUs.",
    severity: "recommended",
    appliesWhen: (f) => f.highRtoCategory,
  },
];

const BASE_MODULE_TOOLS: Record<TaskModuleId, string[]> = {
  "common-documentation": ["TheGSTCo", "EcomSarthi", "AfinAdvisory"],
  "product-selection": ["Helium 10", "Jungle Scout", "SellerSprite"],
  "compliance-by-product": ["IndiaFilings", "Vakilsearch", "ClearTax"],
  "supplier-sourcing": ["IndiaMART", "TradeIndia", "Drpshippr"],
  "channel-launch": ["Amazon Seller Central", "Flipkart Seller Hub", "Meesho Supplier Panel"],
  "ads-growth": ["Amazon Ads", "Meta Ads", "Canva"],
  "tracking-analytics": ["eVanik", "TrackEcom", "eCominess"],
};

function productComplianceHint(facts: ProfileFacts): string {
  if (facts.needsFssai) {
    return "Food category needs FSSAI registration/license in addition to GST and marketplace checks.";
  }
  if (facts.needsCosmeticLabeling) {
    return "Beauty/cosmetics need labeling and category-level compliance before launch.";
  }
  if (facts.needsBis) {
    return "Electronics may need BIS or category-specific standards checks before listing.";
  }
  if (facts.isFashion) {
    return "Fashion has lighter regulatory load but size charts and return-policy hygiene are critical.";
  }
  return "General merchandise follows baseline GST + marketplace category requirements.";
}

export function buildModuleCopy(moduleId: TaskModuleId, facts: ProfileFacts): ModuleCopy {
  const { profile } = facts;
  const ch = channelLabel(profile.primaryChannel);

  switch (moduleId) {
    case "common-documentation": {
      if (facts.hasGstin && facts.isExistingSeller) {
        return {
          title: "Validate business documentation",
          description:
            "You already sell and have GST — quick validation of bank match, filings calendar, and marketplace KYC docs.",
          outcomes: [
            "Validate bank name matches GST legal name",
            "Confirm GST state code matches operating state",
            "Refresh marketplace KYC document folder",
          ],
          tools: BASE_MODULE_TOOLS[moduleId],
          isPriority: true,
          deprioritized: false,
        };
      }
      if (facts.skipBasics) {
        return {
          title: "Validate business docs",
          description: `Existing seller path — confirm PAN, bank, and address proofs match marketplace KYC. Operating state: ${facts.operatingState}.`,
          outcomes: [
            "Confirm PAN and bank match marketplace records",
            "Validate GST state code vs pickup address",
            "Prepare KYC upload packet",
          ],
          tools: BASE_MODULE_TOOLS[moduleId],
          isPriority: true,
          deprioritized: false,
        };
      }
      if (facts.hasGstin) {
        return {
          title: "Validate business documentation",
          description: "Base documentation in place — validate bank match and GST settings before listing.",
          outcomes: [
            "Validate bank name matches legal name",
            "Confirm GST state code matches operating state",
            "Understand GST filing calendar",
          ],
          tools: BASE_MODULE_TOOLS[moduleId],
          isPriority: true,
          deprioritized: false,
        };
      }
      return {
        title: "Business docs + GST",
        description: `Complete PAN, bank, address proofs, and GST registration for ${facts.operatingState}.`,
        outcomes: [
          "Set up PAN, Aadhaar, bank account, address proof",
          "Register or validate GSTIN",
          "Match bank name to legal entity name",
        ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: true,
        deprioritized: false,
      };
    }

    case "product-selection": {
      const fashionNote = facts.isFashion
        ? " Fashion path: returns≠RTO lesson, size charts, and 35% RTO defaults."
        : "";
      const importNote = facts.hasImportRisk
        ? " Import path flagged — margin math must include customs and longer lead times."
        : "";
      return {
        title: facts.isFashion ? "Pick fashion product" : "Pick your product",
        description: `Validate demand, margin viability, and competition before listing.${fashionNote}${importNote}`,
        outcomes: facts.isFashion
          ? [
              "Shortlist 3 SKUs with 15%+ net margin after 35% RTO",
              "Draft size chart and return policy",
              "Order samples before listing",
            ]
          : [
              "Avoid heavy/fragile high-RTO products",
              "Estimate margin after fees and ad spend",
              "Build shortlist of 3–5 test SKUs",
            ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: true,
        deprioritized: false,
      };
    }

    case "compliance-by-product": {
      const hint = productComplianceHint(facts);
      return {
        title: "Product compliance",
        description: `${hint} Operating state: ${facts.operatingState}.`,
        outcomes: facts.hasGstin
          ? [
              "Validate GST settings on marketplace accounts",
              "Complete product-category compliance checklist",
              facts.needsLegalMetrology
                ? "Legal Metrology labels (MRP, net qty) on pre-packaged goods"
                : "Prepare compliant invoice + return documentation",
            ].filter(Boolean) as string[]
          : [
              facts.gstMandatory
                ? "Register GST — mandatory for your channel"
                : "Register GST if required for channel/category",
              "Complete product-category compliance checklist",
              facts.needsFssai ? "Obtain FSSAI registration/license" : "Prepare category certificates if needed",
            ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: true,
        deprioritized: false,
      };
    }

    case "supplier-sourcing": {
      const desc = facts.hasImportRisk
        ? "Import path — IEC, customs lead times, and COD risk. Still vet backup domestic supplier for India COD."
        : "Domestic suppliers only for India COD — includes AliExpress trap game and pincode pilot planner.";
      return {
        title: "Find suppliers",
        description: desc,
        outcomes: facts.hasImportRisk
          ? [
              "Obtain or plan IEC for imports",
              "Acknowledge COD vs import lead-time tradeoff",
              "Identify domestic backup for faster dispatch",
            ]
          : [
              "Compare IndiaMART and direct wholesalers",
              "Sample test and quality checklist",
              "Negotiate pricing and replacement policy",
            ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: true,
        deprioritized: false,
      };
    }

    case "channel-launch": {
      const shopifyNote = facts.isOwnWebsite
        ? facts.pgRejectionRisk
          ? " PG rejection is common for individuals — Zero-PG COD path included."
          : " Zero-PG fallback if Razorpay/Cashfree pending."
        : "";
      const multiNote = facts.isMultiChannel
        ? " Master one channel first before expanding."
        : "";
      return {
        title: `Launch on ${ch}`,
        description: `Focus first launch on ${ch} before expanding multi-channel.${shopifyNote}${multiNote}`,
        outcomes: facts.needsPaymentGateway
          ? [
              `${ch} store setup checklist`,
              "Payment gateway or Zero-PG COD path live",
              "First hero SKU listing published",
            ]
          : [
              "Channel-specific onboarding checklist",
              "Category approval and tax mapping",
              "Publish first listings with optimized titles",
            ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: true,
        deprioritized: false,
      };
    }

    case "ads-growth": {
      const deprioritized = facts.isLeanBudget;
      const mixNote =
        profile.primaryChannel === "meesho"
          ? " Meesho is COD-heavy — focus on RTO reduction over prepaid push."
          : "";
      const description = deprioritized
        ? `Low-budget testing with strict daily caps, COD/prepaid mix simulator, and cashflow dead-zone planning.${mixNote}`
        : `Break-even ROAS, controlled ad tests, and payment-mix modeling before scaling.${mixNote}`;
      return {
        title: facts.isLeanBudget ? "Run ads (low budget)" : "Run ads",
        description,
        outcomes: [
          "Calculate break-even ROAS before spending",
          "Run first controlled ad test",
          "Model COD vs prepaid payment mix",
        ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: !deprioritized,
        deprioritized,
      };
    }

    case "tracking-analytics":
      return {
        title: "Track profit",
        description:
          "Weekly P&L, settlement reconciliation, GSTR-8/TCS, payout holds, and appeal pack templates.",
        outcomes: [
          "Daily net profit visibility by SKU",
          "Return and RTO trend monitoring",
          "Payment and claim reconciliation process",
        ],
        tools: BASE_MODULE_TOOLS[moduleId],
        isPriority: facts.sellsOnMarketplace,
        deprioritized: false,
      };

    default:
      return {
        title: moduleId,
        description: "",
        outcomes: [],
        tools: [],
        isPriority: false,
        deprioritized: false,
      };
  }
}

/** Hard locks: module cannot start until prerequisite sub-tasks done. */
export const MODULE_LOCK_RULES: Partial<
  Record<TaskModuleId, { subTaskId: string; moduleId: TaskModuleId; appliesWhen?: (facts: ProfileFacts) => boolean }[]>
> = {
  "ads-growth": [
    { subTaskId: "first-listing-live", moduleId: "channel-launch" },
  ],
  "channel-launch": [
    {
      subTaskId: "gstin-active",
      moduleId: "common-documentation",
      appliesWhen: (f) => f.gstMandatory && f.needsGstRegistration,
    },
    {
      subTaskId: "fssai-registered",
      moduleId: "compliance-by-product",
      appliesWhen: (f) => f.needsFssai,
    },
  ],
};

export const WARNING_RULES: WarningRule[] = [
  {
    id: "gst-compliance-beginner",
    moduleId: "compliance-by-product",
    message: "GSTIN not saved yet — compliance steps may block marketplace listing.",
    appliesWhen: (f, r) => !r.hasGstin && f.isBeginner,
  },
  {
    id: "fashion-rto-simulator",
    moduleId: "product-selection",
    message: "Recommended: complete the RTO Reality slider with fashion defaults (35% RTO).",
    appliesWhen: (f, r) => f.isFashion && !simulatorDone(r.completedSimulators, "rto_reality"),
  },
  {
    id: "sourcing-swipe",
    moduleId: "supplier-sourcing",
    message: "Recommended: play the sourcing swipe game — avoid AliExpress/CJ traps.",
    appliesWhen: (_f, r) => !simulatorDone(r.completedSimulators, "sourcing_swipe"),
  },
  {
    id: "import-cod-risk",
    moduleId: "supplier-sourcing",
    message: "Imports + COD: 2–3 week shipping kills conversion. Plan domestic fulfillment or prepaid-only.",
    appliesWhen: (f) => f.hasImportRisk && f.sellsOnMarketplace,
  },
  {
    id: "ads-rto-simulator",
    moduleId: "ads-growth",
    message: "Recommended: run Will I Survive? RTO slider before scaling ad spend.",
    appliesWhen: (_f, r) => !simulatorDone(r.completedSimulators, "rto_reality"),
  },
  {
    id: "ads-cod-mix",
    moduleId: "ads-growth",
    message: "Recommended: model your COD vs prepaid payment mix.",
    appliesWhen: (_f, r) => !simulatorDone(r.completedSimulators, "cod_prepaid_mix"),
  },
  {
    id: "ads-fashion-rto",
    moduleId: "ads-growth",
    message: "Fashion + COD: budget 35% RTO and high return rates in ad math.",
    appliesWhen: (f) => f.isFashion,
  },
  {
    id: "ads-lean-budget",
    moduleId: "ads-growth",
    message: "Lean budget — keep daily ad caps strict until first payout reconciled.",
    appliesWhen: (f) => f.isLeanBudget,
  },
  {
    id: "tracking-settlement",
    moduleId: "tracking-analytics",
    message: "Reconcile your first settlement — catches payout holds and silent underpayment.",
    appliesWhen: (_f, r) => !subTaskDone(r.subTasks, "settlement-reconcile"),
  },
  {
    id: "shopify-pg-individual",
    moduleId: "channel-launch",
    message: "Individuals face higher PG rejection — Zero-PG COD path may be needed.",
    appliesWhen: (f) => f.pgRejectionRisk,
  },
  {
    id: "channel-hsn",
    moduleId: "channel-launch",
    message: "Recommended: map HSN codes before listing — wrong tax rate triggers suppression.",
    appliesWhen: (_f, r) => !subTaskDone(r.subTasks, "hsn-mapped"),
  },
  {
    id: "channel-no-gst",
    moduleId: "channel-launch",
    message: "No GSTIN saved — most marketplaces block listing until GST is active.",
    appliesWhen: (f, r) => !r.hasGstin && f.isBeginner && f.gstMandatory,
  },
  {
    id: "channel-supplier",
    moduleId: "channel-launch",
    message: "Recommended: vet supplier before scaling listings — stockouts cause cancellation penalties.",
    appliesWhen: (_f, r) => !subTaskDone(r.subTasks, "supplier-vetted"),
  },
  {
    id: "legal-metrology",
    moduleId: "compliance-by-product",
    message: "Pre-packaged goods need MRP and net quantity on label — missing labels block category approval.",
    appliesWhen: (f) => f.needsLegalMetrology,
  },
  {
    id: "ads-roas",
    moduleId: "ads-growth",
    message: "Recommended: know break-even ROAS before spending on ads.",
    appliesWhen: (_f, r) => !subTaskDone(r.subTasks, "breakeven-roas-known"),
  },
];

export const ALL_MODULE_IDS: TaskModuleId[] = [
  "common-documentation",
  "product-selection",
  "compliance-by-product",
  "supplier-sourcing",
  "channel-launch",
  "ads-growth",
  "tracking-analytics",
];
