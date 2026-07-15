export type VerificationStep = {
  id: string;
  label: string;
  verificationType: "text-input" | "url-input" | "confirmation" | "upload-confirm";
  placeholder?: string;
  validationHint?: string;
  category: "registration" | "listing" | "compliance" | "banking";
  whyItMatters: string;
};

export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    id: "gstin",
    label: "Enter your GSTIN",
    verificationType: "text-input",
    placeholder: "e.g. 27AAPFU0939F1ZV",
    validationHint: "15 characters: 2-digit state code + 10-char PAN + entity code + check digit",
    category: "registration",
    whyItMatters:
      "Marketplaces verify your GSTIN against government records. A typo here means delayed onboarding or account suspension. The format must be exactly 15 characters.",
  },
  {
    id: "pan",
    label: "Enter your PAN",
    verificationType: "text-input",
    placeholder: "e.g. AAPFU0939F",
    validationHint: "10 characters: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)",
    category: "registration",
    whyItMatters:
      "Your PAN must match the one embedded in your GSTIN (characters 3-12). If they don't match, your marketplace account will be flagged for review.",
  },
  {
    id: "bank-name-match",
    label: "Confirm account holder name matches PAN exactly",
    verificationType: "confirmation",
    category: "banking",
    whyItMatters:
      "If your bank account name doesn't exactly match your PAN name, settlements will bounce. Even 'Pvt Ltd' vs 'Private Limited' can cause failures.",
  },
  {
    id: "listing-url",
    label: "Paste your first product listing URL",
    verificationType: "url-input",
    placeholder: "https://www.amazon.in/dp/... or flipkart.com/...",
    validationHint: "Must be a valid marketplace URL (amazon.in, flipkart.com, meesho.com)",
    category: "listing",
    whyItMatters:
      "Your first live listing proves your store is operational. This URL also helps you verify the listing appears in search results (not just your seller panel).",
  },
  {
    id: "listing-live",
    label: "Confirm listing is live and visible to buyers",
    verificationType: "confirmation",
    category: "listing",
    whyItMatters:
      "A listing can be 'active' in your seller panel but suppressed from search. Open an incognito browser window and search for your product title to verify.",
  },
  {
    id: "gst-return-filed",
    label: "Confirm GST return filed this month",
    verificationType: "confirmation",
    category: "compliance",
    whyItMatters:
      "Missing GST filings can get your marketplace account suspended without warning. Marketplaces cross-check GSTN compliance status monthly.",
  },
];

export const CATEGORY_LABELS: Record<VerificationStep["category"], string> = {
  registration: "Business Registration",
  banking: "Banking & Payments",
  listing: "Product Listings",
  compliance: "Tax Compliance",
};
