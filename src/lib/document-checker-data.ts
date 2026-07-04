export type DocumentCategory = "identity" | "business" | "financial" | "product";

export type DocumentItem = {
  id: string;
  name: string;
  category: DocumentCategory;
  requiredFor: ("amazon" | "flipkart" | "meesho" | "shopify")[];
  description: string;
  commonMistakes: string[];
  validationTips: string[];
  crossCheckWith?: string[]; // other document IDs that must match
};

export type ValidationCheck = {
  id: string;
  label: string;
  description: string;
  severity: "critical" | "warning" | "info";
};

export const DOCUMENTS: DocumentItem[] = [
  {
    id: "pan",
    name: "PAN Card",
    category: "identity",
    requiredFor: ["amazon", "flipkart", "meesho", "shopify"],
    description:
      "Permanent Account Number card issued by Income Tax Department. Required for all marketplace registrations.",
    commonMistakes: [
      "Name doesn't match GST certificate",
      "Blurry or low-quality photo/scan",
      "Old PAN with different name (post marriage/legal name change)",
    ],
    validationTips: [
      "Ensure name matches EXACTLY with GST and bank documents",
      "Use a high-resolution color scan (300 DPI minimum)",
      "If name changed, get PAN updated FIRST before applying",
    ],
    crossCheckWith: ["gstin", "bank-statement"],
  },
  {
    id: "aadhaar",
    name: "Aadhaar Card",
    category: "identity",
    requiredFor: ["amazon", "flipkart"],
    description:
      "12-digit unique identity number issued by UIDAI. Used for identity and address verification.",
    commonMistakes: [
      "Address mismatch with GST registered address",
      "Expired or outdated photo",
    ],
    validationTips: [
      "Download latest e-Aadhaar from UIDAI website for clearest copy",
      "Update address if it differs from GST registered address",
      "Mask Aadhaar number if platform only needs last 4 digits",
    ],
    crossCheckWith: ["gstin"],
  },
  {
    id: "gstin",
    name: "GSTIN Certificate",
    category: "business",
    requiredFor: ["amazon", "flipkart", "meesho"],
    description:
      "GST Identification Number certificate from the GST portal. Proves business registration.",
    commonMistakes: [
      "Business name different from PAN name",
      "Wrong trade name listed",
      "Inactive or suspended GST status",
    ],
    validationTips: [
      "Download fresh certificate from GST portal — don't use old printouts",
      "Verify status is 'Active' before submitting",
      "Trade name should match brand name you'll use on marketplace",
      "Legal name must match PAN card character-for-character",
    ],
    crossCheckWith: ["pan", "bank-statement"],
  },
  {
    id: "bank-statement",
    name: "Bank Statement / Cancelled Cheque",
    category: "financial",
    requiredFor: ["amazon", "flipkart", "meesho", "shopify"],
    description:
      "Recent bank statement or cancelled cheque for payment verification and settlement.",
    commonMistakes: [
      "Account holder name doesn't match PAN name",
      "Statement older than 3 months",
      "Savings account instead of current account (some platforms reject)",
    ],
    validationTips: [
      "Use current/business account for faster approval",
      "Get statement dated within last 30 days",
      "Account holder name must match PAN exactly — even initials matter",
      "Cancelled cheque should clearly show MICR code and account number",
    ],
    crossCheckWith: ["pan", "gstin"],
  },
  {
    id: "address-proof",
    name: "Business Address Proof",
    category: "business",
    requiredFor: ["amazon", "flipkart"],
    description:
      "Utility bill, rent agreement, or property document proving business address.",
    commonMistakes: [
      "Address doesn't match GST registered address",
      "Utility bill expired (older than 2 months)",
    ],
    validationTips: [
      "Electricity bill is most commonly accepted",
      "Address must match GST certificate exactly — including pin code",
      "If rented, keep NOC from landlord ready as backup",
    ],
    crossCheckWith: ["gstin"],
  },
  {
    id: "product-images",
    name: "Product Images",
    category: "product",
    requiredFor: ["amazon", "flipkart", "meesho", "shopify"],
    description:
      "High-quality product photographs meeting marketplace image guidelines.",
    commonMistakes: [
      "Background not pure white (Amazon requires RGB 255,255,255)",
      "Watermarks or logos present on image",
      "Low resolution — below 1000×1000px",
      "Product not centered in frame",
    ],
    validationTips: [
      "Main image: white background, product fills 85% of frame",
      "Minimum 1000×1000px; ideal is 2000×2000px",
      "No text, borders, or watermarks on main image",
      "Include lifestyle and infographic images as secondary",
    ],
  },
  {
    id: "brand-auth",
    name: "Brand Authorization Letter",
    category: "product",
    requiredFor: ["amazon"],
    description:
      "Letter from brand owner authorizing you to sell their products on the marketplace.",
    commonMistakes: [
      "Missing manufacturer/brand owner letterhead",
      "No GST number mentioned on authorization letter",
    ],
    validationTips: [
      "Must be on brand owner's official letterhead",
      "Include both parties' GST numbers",
      "Specify exact product categories authorized",
      "Letter should be dated within last 12 months",
    ],
  },
  {
    id: "trademark",
    name: "Trademark Certificate",
    category: "product",
    requiredFor: ["amazon"],
    description:
      "Registered trademark certificate for brand registry enrollment.",
    commonMistakes: [
      "Trademark only applied — not yet registered",
      "Trademark class doesn't match product category",
    ],
    validationTips: [
      "Only 'Registered' status accepted — 'Objected' or 'Opposed' won't work",
      "Ensure trademark class covers your actual product category",
      "Keep TM renewal up to date",
      "For Amazon Brand Registry, word mark preferred over logo mark",
    ],
  },
];

export const CROSS_VALIDATION_CHECKS: ValidationCheck[] = [
  {
    id: "pan-gst-name",
    label: "PAN ↔ GST Name Match",
    description:
      "Name on PAN must exactly match the legal name on GST certificate — character for character, including case.",
    severity: "critical",
  },
  {
    id: "pan-bank-name",
    label: "PAN ↔ Bank Account Name Match",
    description:
      "Name on bank account/cheque must exactly match PAN — even 'KUMAR' vs 'Kumar' triggers rejection.",
    severity: "critical",
  },
  {
    id: "gst-address-match",
    label: "GST ↔ Address Proof Match",
    description:
      "GST registered address must match business address proof document including pin code.",
    severity: "critical",
  },
  {
    id: "gst-trade-brand",
    label: "GST Trade Name ↔ Brand Name",
    description:
      "Trade name on GST should match the brand/store name you register on the marketplace.",
    severity: "warning",
  },
];

export const CATEGORY_LABELS: Record<DocumentCategory, string> = {
  identity: "Identity Documents",
  business: "Business Documents",
  financial: "Financial Documents",
  product: "Product Documents",
};

export const MARKETPLACE_LABELS: Record<string, string> = {
  amazon: "Amazon",
  flipkart: "Flipkart",
  meesho: "Meesho",
  shopify: "Shopify",
};
