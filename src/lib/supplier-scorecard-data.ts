/**
 * Supplier vetting as verifiable evidence, not a 0-10 gut rating.
 *
 * Every check is a discrete fact a first-time seller can actually establish
 * (verify a GSTIN, ask one question, inspect a sample) - never "rate quality
 * 0-10". Checks are staged by WHEN they become knowable, so the tool doubles
 * as a to-do list. Not answering a check counts as "still to verify", never as
 * a failing score. A few checks are dealbreakers: a bad answer there means
 * "do not pay yet" regardless of everything else.
 */
export type ScoreCategory =
  | "legitimacy"
  | "quality"
  | "reliability"
  | "pricing"
  | "communication";

export type CheckStage = "before-contact" | "first-talk" | "after-sample";

export type OptionStatus = "good" | "ok" | "bad";

export type CriterionOption = {
  value: string;
  label: string;
  status: OptionStatus;
};

export type ScorecardCriterion = {
  id: string;
  category: ScoreCategory;
  stage: CheckStage;
  /** The thing you are establishing, phrased as what to check. */
  question: string;
  /** Exact action - site, panel path, or the question to ask - to answer it. */
  howToVerify: string;
  /** A bad answer here is a dealbreaker: verdict becomes "avoid". */
  critical?: boolean;
  options: CriterionOption[];
};

export const CATEGORY_META: Record<ScoreCategory, { label: string }> = {
  legitimacy: { label: "Legitimacy" },
  quality: { label: "Quality" },
  reliability: { label: "Reliability" },
  pricing: { label: "Pricing & terms" },
  communication: { label: "Communication" },
};

export const STAGE_META: Record<CheckStage, { label: string; caption: string }> = {
  "before-contact": {
    label: "Before you contact them",
    caption: "Public checks you can do right now from the listing.",
  },
  "first-talk": {
    label: "In your first conversation",
    caption: "Ask these directly - the answers separate real suppliers from resellers and scams.",
  },
  "after-sample": {
    label: "After the sample / first order",
    caption: "Only knowable once you have the product in hand.",
  },
};

export const SCORECARD_CRITERIA: ScorecardCriterion[] = [
  // ── Before contact (public) ──
  {
    id: "legit-gstin",
    category: "legitimacy",
    stage: "before-contact",
    question: "GST registration is real and active",
    howToVerify:
      "Copy their GSTIN and check it at services.gst.gov.in/services/searchtp - status must read Active.",
    critical: true,
    options: [
      { value: "verified", label: "Verified Active on the GST portal", status: "good" },
      { value: "given", label: "GSTIN given, not yet checked", status: "ok" },
      { value: "none", label: "No GSTIN, or shows cancelled/inactive", status: "bad" },
    ],
  },
  {
    id: "legit-address",
    category: "legitimacy",
    stage: "before-contact",
    question: "Physical address is a real place",
    howToVerify:
      "Drop the address into Google Maps Street View - a real supplier shows a shop/warehouse with signage, not an empty plot or house.",
    options: [
      { value: "real", label: "Real premises visible on Maps", status: "good" },
      { value: "unchecked", label: "Address given, not checked", status: "ok" },
      { value: "virtual", label: "Only a virtual office / PO box / no address", status: "bad" },
    ],
  },
  {
    id: "legit-age",
    category: "legitimacy",
    stage: "before-contact",
    question: "Business has a track record",
    howToVerify:
      "Check the IndiaMART/JustDial member-since date, response rate, and review count - and search the name for complaints.",
    options: [
      { value: "established", label: "3+ years, reviews present", status: "good" },
      { value: "some", label: "6 months to 3 years", status: "ok" },
      { value: "new", label: "Brand new or can't tell", status: "bad" },
    ],
  },
  {
    id: "quality-images",
    category: "quality",
    stage: "before-contact",
    question: "Product photos are their own",
    howToVerify:
      "Right-click a listing image → Search image with Google. Stock or watermarked photos mean they may not hold the stock.",
    options: [
      { value: "own", label: "Own photos, multiple real angles", status: "good" },
      { value: "mixed", label: "Mix of own and stock", status: "ok" },
      { value: "stock", label: "Stock / watermarked (reverse-image match)", status: "bad" },
    ],
  },

  // ── First conversation (ask) ──
  {
    id: "quality-samples",
    category: "quality",
    stage: "first-talk",
    question: "Willing to send a sample before bulk",
    howToVerify:
      "Ask: \"Can I buy one sample before a bulk order?\" A fair supplier says yes at roughly unit price (plus courier).",
    critical: true,
    options: [
      { value: "yes", label: "Yes, sample at a fair price", status: "good" },
      { value: "conditions", label: "Yes but with conditions / high sample cost", status: "ok" },
      { value: "refuses", label: "Refuses samples, or charges many times unit price", status: "bad" },
    ],
  },
  {
    id: "pricing-terms",
    category: "pricing",
    stage: "first-talk",
    question: "Payment terms for a first order",
    howToVerify:
      "Ask how they want payment. Safe: part-advance + balance on dispatch, or a protected rail (IndiaMART PayAssured / escrow).",
    critical: true,
    options: [
      { value: "protected", label: "Part-advance + balance, or PayAssured/escrow", status: "good" },
      { value: "full-protected", label: "Full advance but via a protected rail", status: "ok" },
      { value: "full-direct", label: "100% advance to a bank/UPI, or crypto only", status: "bad" },
    ],
  },
  {
    id: "pricing-market",
    category: "pricing",
    stage: "first-talk",
    question: "Price passes the sanity check",
    howToVerify:
      "Compare the quoted landed cost against the retail price of the same item. A price far below market usually means fake, seconds, or counterfeit.",
    options: [
      { value: "reasonable", label: "Below retail with a clear reason", status: "good" },
      { value: "market", label: "Roughly in line with market", status: "ok" },
      { value: "toolow", label: "Far too low to be genuine", status: "bad" },
    ],
  },
  {
    id: "quality-certs",
    category: "quality",
    stage: "first-talk",
    question: "Certification for regulated products",
    howToVerify:
      "If you sell electronics (BIS), food/cosmetics (FSSAI), or toys/ISI items, ask for the certificate with its licence number. Unregulated product? Mark this as fine.",
    options: [
      { value: "shown", label: "Valid certificate shown (or product unregulated)", status: "good" },
      { value: "claimed", label: "Says certified, hasn't shown proof", status: "ok" },
      { value: "none", label: "No certificate for a regulated product", status: "bad" },
    ],
  },
  {
    id: "reliable-leadtime",
    category: "reliability",
    stage: "first-talk",
    question: "Lead time is workable",
    howToVerify:
      "Ask dispatch time for your order size, and whether they share a tracking/dispatch confirmation.",
    options: [
      { value: "fast", label: "7-14 days with tracking", status: "good" },
      { value: "medium", label: "15-21 days", status: "ok" },
      { value: "slow", label: "Over 21 days or a vague answer", status: "bad" },
    ],
  },
  {
    id: "reliable-defects",
    category: "reliability",
    stage: "first-talk",
    question: "Replacement policy is on record",
    howToVerify:
      "Ask what happens if a batch arrives defective, and get the answer in writing (chat counts).",
    options: [
      { value: "written", label: "Clear replacement terms, in writing", status: "good" },
      { value: "verbal", label: "Verbal promise only", status: "ok" },
      { value: "none", label: "No policy, or won't commit", status: "bad" },
    ],
  },
  {
    id: "comm-response",
    category: "communication",
    stage: "first-talk",
    question: "Answers are fast and specific",
    howToVerify:
      "Ask one specific technical question (material, dimensions, packaging). A real manufacturer answers precisely; a reseller sends copy-paste.",
    options: [
      { value: "specific", label: "Quick and specific answers", status: "good" },
      { value: "slowish", label: "Same-day but generic", status: "ok" },
      { value: "poor", label: "Over 48h or copy-paste replies", status: "bad" },
    ],
  },
  {
    id: "comm-contract",
    category: "communication",
    stage: "first-talk",
    question: "Willing to put terms in writing",
    howToVerify:
      "Ask for a simple written agreement (price, MOQ, lead time, defect terms). Refusal to write anything down = no recourse later.",
    options: [
      { value: "agreement", label: "Has or accepts a written agreement", status: "good" },
      { value: "chat", label: "Informal but on record (chat)", status: "ok" },
      { value: "refuses", label: "Refuses anything in writing", status: "bad" },
    ],
  },
  {
    id: "legit-references",
    category: "legitimacy",
    stage: "first-talk",
    question: "Can point to real buyers",
    howToVerify:
      "Ask for 2 current buyers you can contact. Legitimate suppliers share this; scammers deflect to testimonials.",
    options: [
      { value: "given", label: "Gave 2+ contactable buyers", status: "good" },
      { value: "testimonials", label: "Testimonials only, no contacts", status: "ok" },
      { value: "refuses", label: "Refuses references", status: "bad" },
    ],
  },

  // ── After sample / first order ──
  {
    id: "quality-consistency",
    category: "quality",
    stage: "after-sample",
    question: "Sample matches the listing",
    howToVerify:
      "Compare the sample against the photos and your spec: material, finish, sizing, defects.",
    critical: true,
    options: [
      { value: "matches", label: "Matches or beats the listing", status: "good" },
      { value: "minor", label: "Minor differences, acceptable", status: "ok" },
      { value: "worse", label: "Worse than photos / defective", status: "bad" },
    ],
  },
  {
    id: "reliable-packaging",
    category: "reliability",
    stage: "after-sample",
    question: "Packaging survives marketplace shipping",
    howToVerify:
      "Check the sample's packaging - marketplaces penalise damaged deliveries, so it must protect the product in transit.",
    options: [
      { value: "ready", label: "Sturdy / branded, marketplace-ready", status: "good" },
      { value: "plain", label: "Plain but protective", status: "ok" },
      { value: "poor", label: "Loose / newspaper - would fail in transit", status: "bad" },
    ],
  },
  {
    id: "comm-transparency",
    category: "communication",
    stage: "after-sample",
    question: "Stayed reachable through the order",
    howToVerify:
      "Did they update you through dispatch, or go quiet after payment?",
    options: [
      { value: "proactive", label: "Proactive updates / photos", status: "good" },
      { value: "reactive", label: "Replied only when chased", status: "ok" },
      { value: "silent", label: "Went silent after payment", status: "bad" },
    ],
  },
];

export const STAGE_ORDER: CheckStage[] = ["before-contact", "first-talk", "after-sample"];

export type SupplierVerdict =
  | "unrated"
  | "avoid"
  | "keep-verifying"
  | "caution"
  | "recommended";

export type SupplierEvaluation = {
  verdict: SupplierVerdict;
  answeredCount: number;
  totalCount: number;
  goodCount: number;
  okCount: number;
  badCount: number;
  criticalCleared: number;
  criticalTotal: number;
  /** Bad answers found - the actual red flags, with the criterion + choice. */
  redFlags: { id: string; question: string; label: string; critical: boolean }[];
  /** Unanswered checks, in stage order - the "still to verify" to-do list. */
  toVerify: { id: string; stage: CheckStage; question: string; howToVerify: string }[];
};

/**
 * `answers` maps criterion id -> chosen option value. An id absent from the map
 * is "not verified yet" and is treated as a to-do, never as a failure.
 */
export function evaluateSupplier(answers: Record<string, string>): SupplierEvaluation {
  const criticalTotal = SCORECARD_CRITERIA.filter((c) => c.critical).length;
  let goodCount = 0;
  let okCount = 0;
  let badCount = 0;
  let criticalCleared = 0;
  let criticalBad = 0;
  let criticalUnknown = 0;
  const redFlags: SupplierEvaluation["redFlags"] = [];
  const toVerify: SupplierEvaluation["toVerify"] = [];

  for (const c of SCORECARD_CRITERIA) {
    const chosen = answers[c.id];
    const opt = c.options.find((o) => o.value === chosen);

    if (!opt) {
      toVerify.push({ id: c.id, stage: c.stage, question: c.question, howToVerify: c.howToVerify });
      if (c.critical) criticalUnknown++;
      continue;
    }

    if (opt.status === "good") goodCount++;
    else if (opt.status === "ok") okCount++;
    else badCount++;

    if (opt.status === "bad") {
      redFlags.push({ id: c.id, question: c.question, label: opt.label, critical: Boolean(c.critical) });
    }
    if (c.critical) {
      if (opt.status === "bad") criticalBad++;
      else criticalCleared++;
    }
  }

  const answeredCount = goodCount + okCount + badCount;
  // "Looks solid" has to mean real verification depth, not just clearing the 4
  // gates - require most checks actually done before we say a supplier is safe.
  const enoughDone = answeredCount >= Math.ceil(SCORECARD_CRITERIA.length * 0.7);

  let verdict: SupplierVerdict;
  if (answeredCount === 0) verdict = "unrated";
  else if (criticalBad > 0) verdict = "avoid";
  else if (criticalUnknown > 0 || !enoughDone) verdict = "keep-verifying";
  else if (badCount > 0) verdict = "caution";
  else verdict = "recommended";

  // Keep the to-do list in stage order.
  toVerify.sort((a, b) => STAGE_ORDER.indexOf(a.stage) - STAGE_ORDER.indexOf(b.stage));

  return {
    verdict,
    answeredCount,
    totalCount: SCORECARD_CRITERIA.length,
    goodCount,
    okCount,
    badCount,
    criticalCleared,
    criticalTotal,
    redFlags,
    toVerify,
  };
}

export const VERDICT_META: Record<
  SupplierVerdict,
  { label: string; blurb: string; tone: "neutral" | "good" | "warn" | "bad" }
> = {
  unrated: {
    label: "Start verifying",
    blurb: "Answer the checks below - start with the public ones you can do right now.",
    tone: "neutral",
  },
  avoid: {
    label: "Do not pay yet",
    blurb: "A dealbreaker check failed. Fix it or walk away before sending any money.",
    tone: "bad",
  },
  "keep-verifying": {
    label: "Not enough to trust yet",
    blurb: "Clear every must-pass check and finish most of the rest before you pay an advance.",
    tone: "warn",
  },
  caution: {
    label: "Proceed with caution",
    blurb: "No dealbreakers, but some weak spots. Cover them in writing and start with a small order.",
    tone: "warn",
  },
  recommended: {
    label: "Looks solid",
    blurb: "Every check you've done passed. Still start with a sample and a small first order.",
    tone: "good",
  },
};
