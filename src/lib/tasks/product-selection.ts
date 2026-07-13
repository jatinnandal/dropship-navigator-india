import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { Task, TaskStep } from "@/lib/tasks/types";

/**
 * Channel-exact demand validation. The profile already tells us WHERE the
 * seller will sell, so each channel gets that marketplace's actual demand
 * signals and click paths - never "open your target marketplace".
 */
const DEMAND_CHECK: Record<
  PrimaryChannel,
  { title: string; how: string[]; tools: NonNullable<TaskStep["tools"]> }
> = {
  meesho: {
    title: "Validate demand on Meesho with real data (not gut feeling)",
    how: [
      "Open the Meesho app and type your category into the search bar one word at a time. The autocomplete suggestions are ranked by real buyer searches - write down 5-10 suggested phrases. That list is your demand map.",
      "Open the top 5 listings for your product idea. Meesho has no public best-seller list, so review count is your demand proxy: listings with thousands of reviews = proven repeat demand; a first page full of sub-100-review listings = unproven niche.",
      "Note the first-page price band. Meesho buyers are extremely price-sensitive - if the page sells at ₹250-350 and your costs need ₹400+, change the product, not the price.",
      "Check Google Trends with region set to India: you want stable or rising 12-month interest, not a one-week spike.",
      "Count sellers offering the exact same item (rule of thumb): 50+ = oversaturated, under 20 = room to differentiate.",
    ],
    tools: [
      {
        name: "Google Trends",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
      },
    ],
  },
  amazon: {
    title: "Validate demand on Amazon.in with real data (not gut feeling)",
    how: [
      "Open amazon.in/gp/bestsellers, pick your category, then drill into the subcategory. These top-100 lists are public and update through the day - your shortlist starts here, not on Instagram.",
      "Open 3-5 top listings: check review recency (reviews posted in the last few weeks = selling right now, not a stale hit) and the Best Sellers Rank on the product page - a low, steady BSR means consistent sales.",
      "Type your category into the Amazon search bar one word at a time and note the autocomplete suggestions - that's what buyers actually search, in ranked order.",
      "Check Google Trends with region set to India: you want stable or rising 12-month interest, not a one-week spike.",
      "Count sellers on the exact SKU (rule of thumb): 50+ = oversaturated, under 20 = room to differentiate.",
    ],
    tools: [
      {
        name: "Google Trends",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
      },
      {
        name: "Helium 10",
        whenToUse: "If you want keyword-level data on Amazon India.",
        why: "Keyword volume, competitor sales estimates, and listing quality scores.",
      },
    ],
  },
  flipkart: {
    title: "Validate demand on Flipkart with real data (not gut feeling)",
    how: [
      "Search your category on Flipkart and sort by Popularity. Review and rating counts across the first page are your demand proxy - thousands of ratings = proven demand.",
      "Type the category into the search bar one word at a time and note the autocomplete suggestions - they're ranked by real buyer queries.",
      "Count how many first-page listings carry the Flipkart Assured badge. Many Assured listings = established competitors with fulfilment advantages - check you can match their price before committing.",
      "Check Google Trends with region set to India: you want stable or rising 12-month interest, not a one-week spike.",
      "Count sellers on the exact same item (rule of thumb): 50+ = oversaturated, under 20 = room to differentiate.",
    ],
    tools: [
      {
        name: "Google Trends",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
      },
    ],
  },
  shopify: {
    title: "Validate demand before betting your own store on it",
    how: [
      "Your own store gives you no demand data - borrow the marketplaces'. Search your category on Amazon.in and Meesho and use their review counts as your India demand proxy: thousands of reviews = proven demand.",
      "Open the Meta Ad Library (facebook.com/ads/library), set country to India, and search your product. A competitor running the same ad for weeks is telling you it converts - note their angles and pricing.",
      "Count how many Indian stores are running ads for the exact product: a handful = room to enter; dozens = you'll pay a premium ad cost to break in.",
      "Check Google Trends with region set to India: you want stable or rising 12-month interest, not a one-week spike.",
    ],
    tools: [
      {
        name: "Google Trends",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
      },
      {
        name: "Meta Ad Library",
        whenToUse: "Before committing to a product for your own store.",
        why: "Free - shows every ad a competitor runs in India and how long it has been running (long-running = converting).",
      },
    ],
  },
};

export function buildProductSelectionTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  _workspace: Workspace,
): Task {
  const demandCheck = DEMAND_CHECK[profile.primaryChannel];

  const steps: TaskStep[] = [
    {
      id: "mindset",
      title: "Stop picking products you like - pick products that profit",
      why: "Random product selection is the single biggest killer of new Indian dropshipping businesses. Viral Instagram products often have terrible margins and high RTO.",
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
      title: demandCheck.title,
      why: "Listing without demand validation wastes your onboarding effort and first ad budget.",
      how: demandCheck.how,
      trap: "Copying a competitor's exact product at a slightly lower price is not a strategy. Find gaps they miss (better packaging, faster dispatch, clearer listing).",
      tools: demandCheck.tools,
    },
    {
      id: "product-swipe-game",
      title: "Quick game: spot the winning product",
      why: "Learn what makes a good India COD product in 2 minutes - swipe like you are vetting real SKUs.",
      how: ["Swipe right on products that are good for beginners. Left on traps."],
      kind: "simulator",
      simulator: { kind: "product_swipe" },
    },
    {
      id: "returns-vs-rto",
      title: "Returns vs RTO - know the difference",
      why: "Beginners confuse these. RTO means customer never paid. Returns mean they paid, then wanted refund - different cost, different fix.",
      how: [
        "RTO (Return to Origin): courier could not deliver COD order. You lose forward + reverse shipping (~₹60-90). National COD RTO ~20-26%.",
        "Returns (post-delivery): customer received product, then returned. You refund + pay reverse logistics. Fashion: 24-40% return rates.",
        "Overall e-commerce returns: ~10-18% depending on category.",
        "Price with a return buffer: fashion sellers often add 8-12% to selling price for expected returns.",
      ],
      trap: "Celebrating low RTO while ignoring high return rates still bleeds profit - track both separately.",
      mentorNote:
        profile.productType === "fashion"
          ? "Fashion is hit twice: high RTO on COD AND high post-delivery returns. Budget for both."
          : undefined,
    },
    {
      id: "rto-screen",
      title: "Screen out RTO-heavy products",
      why: "COD Return-to-Origin at ~26% nationally is the #1 profit killer. Fashion (40%+ RTO), fragile items, and heavy products destroy margins.",
      how: ["Answer honestly about your product ideas - I'll flag high-risk categories."],
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
      title: "High RTO risk - proceed with extra caution",
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
        label: "Expected RTO rate (%) - be conservative",
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

  if (profile.productType === "fashion") {
    steps.push(
      {
        id: "fashion-size-chart",
        title: "Size chart template (fashion mandatory)",
        why: "Wrong size is the #1 return reason in fashion. A clear size chart cuts returns 15-25%.",
        how: [
          "Measure 3 samples per size - chest, length, shoulder, sleeve.",
          "Add cm AND inches columns.",
          "Note if product runs small/large.",
          "Include model height + size worn in listing photos.",
        ],
        trap: "Listing fashion without a size chart = 30-40% combined RTO + returns.",
      },
      {
        id: "fashion-photos",
        title: "Fashion photo checklist",
        why: "Bad photos drive 'not as described' returns - worse than RTO because customer already paid.",
        how: [
          "Minimum 5 images: white BG front, back, lifestyle, fabric close-up, size chart infographic.",
          "Show product on a model matching your target buyer.",
          "Never use supplier watermarked photos without permission.",
        ],
      },
      {
        id: "fashion-return-policy",
        title: "Return policy wording",
        why: "Clear return policy builds trust AND sets expectations. Vague policy = disputes.",
        how: [
          "7-day return window from delivery.",
          "Unworn, tags attached, original packaging.",
          "Exchange for size within 7 days (customer pays return shipping).",
        ],
      },
      {
        id: "fashion-return-buffer",
        title: "Price with a return buffer",
        why: "At 30% fashion returns, your effective revenue is 70% of listed price. Price accordingly.",
        how: [
          "Add 8-12% to your target selling price for expected returns.",
          "Re-run margin calculator with 35% RTO + 10% return assumption.",
          "If margin still below 15%, raise price or pick different product.",
        ],
      },
    );
  }

  steps.push(
    {
      id: "shortlist",
      title: "Build a shortlist of 3 candidates to compare",
      why: "You will launch ONE hero product first - but compare 3 candidates so the winner is a choice, not a guess. The other two become backups.",
      how: [
        "Write 3 product names you want to compare.",
        "For each: note selling price, supplier cost, and weight.",
        "Reject any where you cannot find a supplier with sample availability.",
      ],
      kind: "input",
      input: {
        id: "sku-1",
        label: "Product 1 name",
        placeholder: "e.g. Silicone kitchen organizer",
        workspaceKey: "shortlistedSkus",
        hint: "We'll save your candidates - you'll pick 1 hero next.",
      },
      mentorNote: "Three candidates to compare. You launch ONE hero first - the other two are backups, not simultaneous launches.",
    },
    {
      id: "rto-reality",
      title: "Will I Survive? - RTO Reality Slider",
      why: "Slide RTO up and watch profit disappear - this is the #1 reason Indian dropshippers think they profit while losing money.",
      how: ["Adjust the sliders and see net profit change in real time."],
      kind: "simulator",
      simulator: { kind: "rto_reality" },
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
          name: "Marketplace bestseller lists + Google Trends India",
          whenToUse: "Free demand check before you commit to a SKU.",
          why: "Steady bestseller rank + steady 12-month Trends beats a spiky fad you can't restock into.",
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
          { value: "yes", label: "Yes - selling price is 3x+ landed cost" },
          { value: "no", label: "No - margin is too thin" },
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
      trap: "Hoping to 'make it up on volume' with thin margins is how thin-margin sellers quietly bleed out in India.",
    });
  }

  steps.push({
    id: "lock-hero",
    title: "Lock your hero product",
    why: "Pick the single strongest candidate as your hero to launch first. The other two stay on the bench as backups - you do not launch or sample all three at once.",
    how: [
      "Choose the candidate with the best margin-after-RTO and easiest fulfilment.",
      "Mark it as your hero; keep the runner-ups noted as backups.",
      "You will order a sample of this hero from a vetted supplier in the next step (Supplier sourcing) - not before you have a supplier.",
    ],
    trap: "Sampling and launching 3 products at once triples your cost and splits your attention. One hero, done well, first.",
    mentorNote: "A ₹200 sample of your hero saves you from a ₹20,000 mistake - but you order it once you have a supplier, in the next module.",
  });

  const intro =
    profile.budgetBand === "under_20k"
      ? "With a tight budget, product selection is everything. We'll compare 3 candidates and lock ONE hero that survives real costs - no ad budget to waste on bad picks."
      : "Let's compare a few candidates and lock one hero product with real demand, healthy margins, and manageable RTO risk for your first launch.";

  return {
    id: "product-selection",
    title: "Find your hero product, step by step",
    intro,
    steps,
  };
}
