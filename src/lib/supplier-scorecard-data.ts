export type ScoreCategory =
  | "legitimacy"
  | "quality"
  | "reliability"
  | "pricing"
  | "communication";

export type ScorecardCriterion = {
  id: string;
  category: ScoreCategory;
  question: string;
  weight: number; // 1-5 importance
  redFlags: string[];
  greenFlags: string[];
  tip: string;
};

export type SupplierScore = {
  category: ScoreCategory;
  score: number; // 0-10
  maxScore: number;
  verdict: "pass" | "caution" | "fail";
};

export const CATEGORY_META: Record<
  ScoreCategory,
  { label: string; maxWeight: number }
> = {
  legitimacy: { label: "Legitimacy", maxWeight: 5 },
  quality: { label: "Quality", maxWeight: 4 },
  reliability: { label: "Reliability", maxWeight: 4 },
  pricing: { label: "Pricing", maxWeight: 3 },
  communication: { label: "Communication", maxWeight: 3 },
};

export const SCORECARD_CRITERIA: ScorecardCriterion[] = [
  // ── Legitimacy (weight 5) ──
  {
    id: "legit-gstin",
    category: "legitimacy",
    question: "Does supplier have valid GSTIN?",
    weight: 5,
    redFlags: ["No GST", "GST shows inactive/cancelled"],
    greenFlags: ["Active GST, verify on gst.gov.in"],
    tip: "Check GST status at services.gst.gov.in/services/searchtp — inactive GST = illegal invoices.",
  },
  {
    id: "legit-age",
    category: "legitimacy",
    question: "Is business registered >2 years?",
    weight: 5,
    redFlags: ["New registration <6 months"],
    greenFlags: [">3 years active"],
    tip: "Check incorporation date on MCA portal (mca.gov.in) using CIN number.",
  },
  {
    id: "legit-address",
    category: "legitimacy",
    question: "Does supplier have physical address you can verify?",
    weight: 5,
    redFlags: ["Only virtual office", "PO Box"],
    greenFlags: ["Factory/warehouse address on Google Maps"],
    tip: "Drop the address into Google Maps Street View. Real factories show loading bays, signage.",
  },
  {
    id: "legit-references",
    category: "legitimacy",
    question: "Can supplier provide past client references?",
    weight: 4,
    redFlags: ["Refuses references", "Only testimonials, no contacts"],
    greenFlags: ["Provides 2-3 verifiable buyers"],
    tip: "Ask for 2 buyer phone numbers. Legitimate suppliers share this willingly.",
  },

  // ── Quality (weight 4) ──
  {
    id: "quality-samples",
    category: "quality",
    question: "Will supplier send samples before bulk order?",
    weight: 4,
    redFlags: ["Refuses samples", "Charges >3x for samples"],
    greenFlags: ["Free samples for orders >MOQ"],
    tip: "Always pay for samples rather than skip them — it's the cheapest insurance you'll buy.",
  },
  {
    id: "quality-certs",
    category: "quality",
    question: "Does product have required certifications (BIS/FSSAI/ISI)?",
    weight: 4,
    redFlags: ["No certification for regulated product"],
    greenFlags: ["Shows certificates with lot numbers"],
    tip: "Selling uncertified products in regulated categories can get your listings removed AND attract legal action.",
  },
  {
    id: "quality-images",
    category: "quality",
    question: "Are product images real photos or stock?",
    weight: 3,
    redFlags: ["Stock photos", "Watermarked images"],
    greenFlags: ["Multiple angles, factory photos"],
    tip: "Reverse image search on Google. Stock photos = they don't have the product.",
  },
  {
    id: "quality-consistency",
    category: "quality",
    question: "Does supplier have quality control process?",
    weight: 3,
    redFlags: ["No QC mentioned", "Ships without inspection"],
    greenFlags: ["Shares QC checklist", "Allows third-party inspection"],
    tip: "Ask for their defect rate. Honest suppliers know it; scammers dodge the question.",
  },

  // ── Reliability (weight 4) ──
  {
    id: "reliable-leadtime",
    category: "reliability",
    question: "What is stated lead time?",
    weight: 4,
    redFlags: [">21 days", "Vague 'depends on order'"],
    greenFlags: ["7-14 days with tracking"],
    tip: "Add 5-7 days buffer to stated lead time — Indian logistics routinely slips.",
  },
  {
    id: "reliable-defects",
    category: "reliability",
    question: "Does supplier offer replacement for defects?",
    weight: 4,
    redFlags: ["No returns policy", "Only 24hr window"],
    greenFlags: ["7-day replacement, written in contract"],
    tip: "Get replacement policy IN WRITING before first order. WhatsApp promises mean nothing.",
  },
  {
    id: "reliable-scale",
    category: "reliability",
    question: "Can supplier handle order volume increases?",
    weight: 3,
    redFlags: ["Can't do >100 units"],
    greenFlags: ["Scales to 500+ with 1 week notice"],
    tip: "Test with small order first (50 units), then ramp. Don't promise volumes you can't guarantee.",
  },
  {
    id: "reliable-packaging",
    category: "reliability",
    question: "Does supplier provide marketplace-compliant packaging?",
    weight: 3,
    redFlags: ["No branded packaging", "Uses newspaper wrapping"],
    greenFlags: ["Branded boxes", "Offers white-label packaging"],
    tip: "Amazon/Flipkart penalize poorly packaged items. Factor packaging cost into landed cost.",
  },

  // ── Pricing (weight 3) ──
  {
    id: "pricing-market",
    category: "pricing",
    question: "Is pricing significantly below market?",
    weight: 3,
    redFlags: ["50%+ below market = likely fake/counterfeit"],
    greenFlags: ["10-20% below with clear explanation"],
    tip: "If a deal seems too good to be true in Indian wholesale, it is. Always.",
  },
  {
    id: "pricing-terms",
    category: "pricing",
    question: "Are payment terms reasonable?",
    weight: 3,
    redFlags: ["100% advance, no escrow", "Only cryptocurrency"],
    greenFlags: ["50% advance + 50% on dispatch", "Accepts trade assurance"],
    tip: "Never pay 100% advance to a new supplier. Use IndiaMART PayAssured or bank escrow.",
  },
  {
    id: "pricing-hidden",
    category: "pricing",
    question: "Are there hidden costs (packaging, GST, transport)?",
    weight: 2,
    redFlags: ["Price is 'ex-factory' without mention of other costs"],
    greenFlags: ["All-inclusive landed cost quote", "Transparent breakup provided"],
    tip: "Always ask for LANDED cost (product + GST + packaging + transport to your city).",
  },

  // ── Communication (weight 3) ──
  {
    id: "comm-response",
    category: "communication",
    question: "Response time to inquiries?",
    weight: 3,
    redFlags: [">48 hours", "Copy-paste responses"],
    greenFlags: ["<12 hours", "Detailed, specific answers"],
    tip: "Ask a specific technical question. Copy-paste replies = sales team, not actual manufacturer.",
  },
  {
    id: "comm-contract",
    category: "communication",
    question: "Willing to sign supply agreement?",
    weight: 3,
    redFlags: ["Refuses written contract"],
    greenFlags: ["Has standard supply agreement template"],
    tip: "No contract = no legal recourse when things go wrong (and they will).",
  },
  {
    id: "comm-transparency",
    category: "communication",
    question: "Does supplier proactively share production updates?",
    weight: 2,
    redFlags: ["Goes silent after payment", "Only responds when chased"],
    greenFlags: ["Sends progress photos", "WhatsApp updates at each stage"],
    tip: "Good suppliers treat you as a partner. Silence after payment is the biggest red flag.",
  },
];

export function calculateSupplierScore(answers: Record<string, number>): {
  categories: SupplierScore[];
  totalScore: number;
  maxTotal: number;
  overallVerdict: "recommended" | "proceed-with-caution" | "avoid";
  criticalRedFlags: string[];
} {
  const categoryScores: Record<ScoreCategory, { weighted: number; maxWeighted: number }> = {
    legitimacy: { weighted: 0, maxWeighted: 0 },
    quality: { weighted: 0, maxWeighted: 0 },
    reliability: { weighted: 0, maxWeighted: 0 },
    pricing: { weighted: 0, maxWeighted: 0 },
    communication: { weighted: 0, maxWeighted: 0 },
  };

  const criticalRedFlags: string[] = [];

  for (const criterion of SCORECARD_CRITERIA) {
    const score = answers[criterion.id] ?? 0;
    const weighted = score * criterion.weight;
    const maxWeighted = 10 * criterion.weight;

    categoryScores[criterion.category].weighted += weighted;
    categoryScores[criterion.category].maxWeighted += maxWeighted;

    // Flag critical items (weight >= 4) scoring below 5
    if (criterion.weight >= 4 && score < 5) {
      criticalRedFlags.push(criterion.question);
    }
  }

  const categories: SupplierScore[] = (
    Object.keys(categoryScores) as ScoreCategory[]
  ).map((cat) => {
    const { weighted, maxWeighted } = categoryScores[cat];
    const normalized = maxWeighted > 0 ? (weighted / maxWeighted) * 10 : 0;
    let verdict: "pass" | "caution" | "fail";
    if (normalized >= 7) verdict = "pass";
    else if (normalized >= 4) verdict = "caution";
    else verdict = "fail";
    return {
      category: cat,
      score: Math.round(normalized * 10) / 10,
      maxScore: 10,
      verdict,
    };
  });

  // Total weighted score (normalized to 100)
  const totalWeighted = Object.values(categoryScores).reduce((s, c) => s + c.weighted, 0);
  const totalMax = Object.values(categoryScores).reduce((s, c) => s + c.maxWeighted, 0);
  const totalScore = totalMax > 0 ? Math.round((totalWeighted / totalMax) * 100) : 0;

  let overallVerdict: "recommended" | "proceed-with-caution" | "avoid";
  if (totalScore >= 70 && criticalRedFlags.length === 0) {
    overallVerdict = "recommended";
  } else if (totalScore >= 40 && criticalRedFlags.length <= 2) {
    overallVerdict = "proceed-with-caution";
  } else {
    overallVerdict = "avoid";
  }

  return { categories, totalScore, maxTotal: 100, overallVerdict, criticalRedFlags };
}
