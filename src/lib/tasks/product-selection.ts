import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { Task, TaskStep } from "@/lib/tasks/types";

export function buildProductSelectionTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  _workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "mindset",
      title: "Stop picking products you like — pick products that profit",
      why: "90% of Indian dropshipping failures come from random product selection. Viral Instagram products often have terrible margins and high RTO.",
      how: [
        "Forget what you personally want to sell.",
        "Look for products with proven demand on marketplaces, not just social media.",
        "Every product must pass a margin test before you list it.",
      ],
      trap: "Trending on Instagram does not mean it will sell on Meesho/Amazon. Marketplace buyers have different price expectations.",
      mentorNote:
        "An experienced seller never falls in love with a product before checking the numbers. Fall in love with the margin, not the item.",
    },
    {
      id: "demand-check",
      title: "Validate demand with real data (not gut feeling)",
      why: "Listing without demand validation wastes your onboarding effort and first ad budget.",
      how: [
        "Open your target marketplace and search your product category.",
        "Check best-seller lists and search suggestions (autocomplete).",
        "Use Google Trends for India — look for stable or rising interest, not one-week spikes.",
        "Count competitors: 50+ sellers on the exact SKU = oversaturated; under 20 = opportunity.",
      ],
      trap: "Copying a competitor's exact product at a slightly lower price is not a strategy. Find gaps they miss (better packaging, faster dispatch, clearer listing).",
      tools: [
        {
          name: "Google Trends",
          whenToUse: "Before shortlisting any product.",
          why: "Free demand signal — shows if interest is growing, stable, or dying in India.",
        },
        {
          name: "Helium 10",
          whenToUse: "If launching on Amazon India.",
          why: "Keyword volume, competitor sales estimates, and listing quality scores.",
        },
      ],
    },
    {
      id: "rto-screen",
      title: "Screen out RTO-heavy products",
      why: "COD Return-to-Origin at ~26% nationally is the #1 profit killer. Fashion (40%+ RTO), fragile items, and heavy products destroy margins.",
      how: ["Answer honestly about your product ideas — I'll flag high-risk categories."],
      question: {
        id: "product-risk",
        prompt: "Which best describes your planned products?",
        options: [
          { value: "low", label: "Light, non-fragile, no size issues (home, kitchen, accessories)" },
          { value: "medium", label: "Moderate weight or some variation (beauty, small electronics)" },
          { value: "high", label: "Fashion/clothing, fragile, or heavy items" },
        ],
      },
      trap: "Fashion on COD has 30-40% RTO. Unless you have strong size charts and COD confirmation, avoid it as a beginner.",
    },
  ];

  const risk = answers["product-risk"] ?? "";
  if (risk === "high") {
    steps.push({
      id: "rto-warning",
      title: "High RTO risk — proceed with extra caution",
      why: "Your product category has historically high return rates on COD. Most beginners lose money here.",
      how: [
        "If you still want to proceed: implement WhatsApp COD confirmation before every dispatch.",
        "Use detailed size charts and accurate product photos to reduce size-related returns.",
        "Budget 30-40% RTO in your margin calculator (next step).",
        "Consider starting with a lower-risk category first to learn the process.",
      ],
      trap: "Ignoring RTO in your margin math makes every sale look profitable until month-end reconciliation reveals losses.",
      kind: "input",
      input: {
        id: "rto-rate",
        label: "Expected RTO rate (%) — be conservative",
        placeholder: "30",
        workspaceKey: "estimatedRtoRate",
        inputType: "number",
      },
    });
  } else {
    steps.push({
      id: "rto-default",
      title: "Set a realistic RTO estimate",
      why: "Even low-risk products face 10-15% RTO on COD. Budget for it in every calculation.",
      how: [
        "For light/general products on COD: assume 15-20% RTO.",
        "For prepaid-only: assume under 2% returns.",
      ],
      kind: "input",
      input: {
        id: "rto-rate",
        label: "Expected RTO rate (%)",
        placeholder: risk === "medium" ? "20" : "15",
        workspaceKey: "estimatedRtoRate",
        inputType: "number",
      },
    });
  }

  steps.push(
    {
      id: "shortlist",
      title: "Build your shortlist of 3 test products",
      why: "Focused testing beats launching 50 random products. Three SKUs let you compare without spreading thin.",
      how: [
        "Write 3 product names you want to test.",
        "For each: note selling price, supplier cost, and weight.",
        "Reject any where you cannot find a supplier with sample availability.",
      ],
      kind: "input",
      input: {
        id: "sku-1",
        label: "Product 1 name",
        placeholder: "e.g. Silicone kitchen organizer",
        workspaceKey: "shortlistedSkus",
        hint: "We'll save your top picks for later steps.",
      },
      mentorNote: "Three products. Not ten. Not fifty. Three.",
    },
    {
      id: "margin-calc",
      title: "Run the margin test on each product",
      why: "If margin after ALL costs (fees, shipping, ads, RTO) is below 15%, the product cannot sustain paid traffic.",
      how: [
        "Use the calculator below with realistic numbers.",
        "Enter supplier cost + shipping + expected ad cost per order.",
        "Target: at least 15% net margin, ideally 25%+.",
      ],
      trap: "Calculating only product cost vs selling price ignores 20-30% in hidden marketplace fees. That is why beginners think they profit while losing money.",
      kind: "calculator",
      calculator: { kind: "margin" },
      tools: [
        {
          name: "SellerSprite",
          whenToUse: "For Amazon keyword and competitor analysis.",
          why: "Helps estimate sales velocity before you commit to a SKU.",
        },
      ],
    },
    {
      id: "markup-gate",
      title: "Pass the 3x markup gate",
      why: "Practitioners use a 3x markup on landed cost (product + shipping) as a minimum for products you plan to advertise.",
      how: [
        "Land cost = product cost + shipping to customer.",
        "Selling price should be at least 3x land cost.",
        "If not, either raise price, find cheaper supplier, or drop the product.",
      ],
      trap: "A ₹200 product sold at ₹400 looks like 100% margin but after fees and RTO you may net ₹30. The 3x rule accounts for this.",
      question: {
        id: "markup-pass",
        prompt: "Does your best product pass the 3x markup test?",
        options: [
          { value: "yes", label: "Yes — selling price is 3x+ landed cost" },
          { value: "no", label: "No — margin is too thin" },
        ],
      },
    },
  );

  if (answers["markup-pass"] === "no") {
    steps.push({
      id: "markup-fix",
      title: "Fix margin before proceeding",
      why: "Launching thin-margin products guarantees ad losses. Fix now, not after burning ₹10,000 on ads.",
      how: [
        "Renegotiate supplier price or find alternative supplier.",
        "Increase selling price (check competitor pricing first).",
        "Switch to a lighter product with lower shipping cost.",
        "Drop this SKU and pick from your shortlist alternatives.",
      ],
      trap: "Hoping to 'make it up on volume' with thin margins is how 90% of sellers fail in India.",
    });
  }

  steps.push({
    id: "sample-commit",
    title: "Commit to ordering samples before listing",
    why: "Catalogue photos lie. Sample orders reveal actual quality, packaging durability, and dispatch speed.",
    how: [
      "Order 1 sample of each shortlisted product from your top supplier candidate.",
      "Test packaging by simulating courier handling (drop test from 3 feet).",
      "Time the dispatch: if supplier takes 5+ days, your customers wait 7-10 days total.",
      "Only list products where sample quality and dispatch speed pass.",
    ],
    trap: "Bulk ordering before sampling is the most expensive beginner mistake. ₹5,000-50,000 stuck in unsellable inventory.",
    mentorNote: "A ₹200 sample order saves you from a ₹20,000 mistake. Always sample.",
  });

  const intro =
    profile.budgetBand === "under_20k"
      ? "With a tight budget, product selection is everything. We'll find 3 winners that survive real costs — no ad budget to waste on bad picks."
      : "Let's find products with real demand, healthy margins, and manageable RTO risk for your first launch.";

  return {
    id: "product-selection",
    title: "Find winning products, step by step",
    intro,
    steps,
  };
}
