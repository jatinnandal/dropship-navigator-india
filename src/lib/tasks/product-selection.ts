import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import type { Task, TaskStep } from "@/lib/tasks/types";

/**
 * Channel-exact demand validation. The profile already tells us WHERE the
 * seller will sell, so each channel gets that marketplace's actual demand
 * signals and click paths - never "open your target marketplace". Each step
 * spells out exactly what to open (with a real link), and what a GOOD vs BAD
 * result looks like, so an absolute beginner is never left guessing.
 */
const DEMAND_CHECK: Record<
  PrimaryChannel,
  { title: string; how: string[]; tools: NonNullable<TaskStep["tools"]> }
> = {
  meesho: {
    title: "Check if people actually buy this on Meesho (not just a gut feeling)",
    how: [
      "Open the Meesho app or meesho.com and tap the search bar. Type your product idea one word at a time and watch the autocomplete suggestions drop down. These are ranked by what real buyers actually type. Write down the 5 to 10 phrases it suggests. Good sign: several specific phrases appear (for example 'kitchen rack steel', 'kitchen rack wall'). Bad sign: almost nothing autocompletes, which means very few people search for it.",
      "Open the top 5 listings for your idea. Meesho has no public best-seller list, so the number of reviews and ratings on a listing is your stand-in for demand. Good sign: several listings on the first page have thousands of reviews, which means people buy it again and again. Bad sign: the first page is mostly listings with under 100 reviews, which means the demand is unproven.",
      "Read the price band on the first page of results. Meesho buyers are very price-sensitive and mostly pay Cash on Delivery. Good sign: the common price is comfortably above your total cost, so you have room to profit. Bad sign: the page is selling at around ₹250-350 but your own costs need ₹400 or more. If that happens, change the product, not the price.",
      "Open Google Trends at https://trends.google.com/trends/explore?geo=IN and type your product into the search box. The geo=IN in that link already sets the region to India, but confirm it: near the top there is a region dropdown that should read 'India'. If it says 'Worldwide' or another country, click it and choose India. Then set the time dropdown beside it to 'Past 12 months'. Healthy line: it stays roughly flat or drifts gently upward across the whole year and stays well above the bottom. Bad line: one tall spike for a week or two that then falls back down to near zero. That is a fad you cannot keep restocking.",
      "Count how many sellers are offering the exact same item. As a rough rule: 50 or more sellers means the item is oversaturated and hard to stand out in. Under 20 sellers means there is still room to differentiate with better photos, packaging, or a clearer listing.",
    ],
    tools: [
      {
        name: "Google Trends (India)",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
        href: "https://trends.google.com/trends/explore?geo=IN",
      },
    ],
  },
  amazon: {
    title: "Check if people actually buy this on Amazon.in (not just a gut feeling)",
    how: [
      "Open https://www.amazon.in/gp/bestsellers and pick your category from the left, then click into the closest subcategory. This is a public Top 100 list that Amazon refreshes through the day, so your shortlist starts here, not on Instagram. Good sign: products like yours appear on the list with fresh-looking listings. Bad sign: your product type is nowhere in the Top 100, which means weak search demand on Amazon.",
      "Open 3 to 5 of the top listings and check two things. First, the date on the most recent reviews. Good sign: reviews posted in the last few weeks, meaning it is selling right now. Bad sign: the newest review is months old. Second, find the Best Sellers Rank line under 'Product details' on the page. It is a rank number Amazon prints for the item, and the lower the number, the more often it sells. A low, steady rank is a good sign.",
      "Click the Amazon search bar and type your category one word at a time. Note the autocomplete suggestions that drop down, in the order they appear. That order is what buyers actually search for most. Good sign: many specific, buyer-style phrases appear. Bad sign: barely any suggestions, meaning low search interest.",
      "Open Google Trends at https://trends.google.com/trends/explore?geo=IN and type your product into the search box. The geo=IN in that link already sets the region to India, but confirm it: near the top there is a region dropdown that should read 'India'. If it says 'Worldwide' or another country, click it and choose India. Then set the time dropdown beside it to 'Past 12 months'. Healthy line: it stays roughly flat or drifts gently upward across the whole year and stays well above the bottom. Bad line: one tall spike for a week or two that then falls back down to near zero. That is a fad you cannot keep restocking.",
      "Count how many sellers are offering the exact same item on its listing. As a rough rule: 50 or more sellers means the item is oversaturated. Under 20 sellers means there is still room to differentiate with better photos, packaging, or a clearer listing.",
    ],
    tools: [
      {
        name: "Google Trends (India)",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
        href: "https://trends.google.com/trends/explore?geo=IN",
      },
      {
        name: "Amazon Best Sellers",
        whenToUse: "Your first stop for what already sells on Amazon.in.",
        why: "Free public Top 100 per category, refreshed through the day.",
        href: "https://www.amazon.in/gp/bestsellers",
      },
    ],
  },
  flipkart: {
    title: "Check if people actually buy this on Flipkart (not just a gut feeling)",
    how: [
      "Open flipkart.com, search your category, and use the 'Sort by' control at the top right to pick 'Popularity'. Flipkart has no public best-seller list, so the number of ratings and reviews across the first page is your stand-in for demand. Good sign: the top listings have thousands of ratings, meaning steady repeat buying. Bad sign: the first page is thin on ratings, meaning demand is unproven.",
      "Click the Flipkart search bar and type your category one word at a time. Note the autocomplete suggestions in the order they appear. That order reflects what buyers actually search for. Good sign: several specific phrases appear. Bad sign: almost nothing suggests, meaning low search interest.",
      "Count how many first-page listings show the 'Flipkart Assured' badge. Many Assured listings means established competitors with faster delivery and a trust edge. That is not a reason to quit, but before you commit, confirm you can match or beat their price and still profit. If you cannot, pick a different product.",
      "Open Google Trends at https://trends.google.com/trends/explore?geo=IN and type your product into the search box. The geo=IN in that link already sets the region to India, but confirm it: near the top there is a region dropdown that should read 'India'. If it says 'Worldwide' or another country, click it and choose India. Then set the time dropdown beside it to 'Past 12 months'. Healthy line: it stays roughly flat or drifts gently upward across the whole year and stays well above the bottom. Bad line: one tall spike for a week or two that then falls back down to near zero. That is a fad you cannot keep restocking.",
      "Count how many sellers are offering the exact same item. As a rough rule: 50 or more sellers means the item is oversaturated and hard to stand out in. Under 20 sellers means there is still room to differentiate with better photos, packaging, or a clearer listing.",
    ],
    tools: [
      {
        name: "Google Trends (India)",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
        href: "https://trends.google.com/trends/explore?geo=IN",
      },
    ],
  },
  shopify: {
    title: "Check demand before you bet your own store on it",
    how: [
      "Your own store starts with zero visitors, so it gives you no demand data. Borrow it from the marketplaces. Search your product on amazon.in and on meesho.com and read the review counts. Good sign: listings with thousands of reviews on either site, which proves Indians are already buying it. Bad sign: only listings with under 100 reviews, meaning the demand is unproven.",
      "Open the Meta Ad Library at https://www.facebook.com/ads/library. Set the country box to 'India', set the category to 'All ads', and type your product into the search box. This shows every Facebook and Instagram ad currently running. Good sign: a competitor has been running the same ad for several weeks, because nobody keeps paying for an ad that does not sell. Note their offer, their photos, and their price. Bad sign: no ads at all, or ads that appeared only a day or two ago.",
      "In the same Ad Library results, count roughly how many different Indian stores are advertising the exact same product. A handful means there is room to enter. Dozens of stores all pushing it means you will pay a high price for ad clicks to break in, because you are all bidding for the same buyers.",
      "Open Google Trends at https://trends.google.com/trends/explore?geo=IN and type your product into the search box. The geo=IN in that link already sets the region to India, but confirm it: near the top there is a region dropdown that should read 'India'. If it says 'Worldwide' or another country, click it and choose India. Then set the time dropdown beside it to 'Past 12 months'. Healthy line: it stays roughly flat or drifts gently upward across the whole year and stays well above the bottom. Bad line: one tall spike for a week or two that then falls back down to near zero. That is a fad you cannot keep restocking.",
      "Before you commit, sanity-check the price. Look at what the marketplace listings and the Meta Ad Library competitors are charging, then compare it to your own cost of buying and shipping one unit. Good sign: their selling price leaves you clear room above your cost. Bad sign: they are already selling near or below what it costs you to deliver one, which means you cannot compete on your own store.",
    ],
    tools: [
      {
        name: "Meta Ad Library (India)",
        whenToUse: "Before committing to a product for your own store.",
        why: "Free - shows every ad a competitor runs in India and how long it has been running (long-running = converting).",
        href: "https://www.facebook.com/ads/library",
      },
      {
        name: "Google Trends (India)",
        whenToUse: "Before shortlisting any product.",
        why: "Free demand signal - shows if interest is growing, stable, or dying in India.",
        href: "https://trends.google.com/trends/explore?geo=IN",
      },
    ],
  },
};

/** One short hint under the RTO % input - where to get the number if unsure. */
const RTO_INPUT_HINT =
  "Not sure? Use the range above: 15-20 for light everyday products, 30-40 for fashion, fragile, or heavy. You will swap in your real figure from your seller dashboard's returns report after about 20 orders.";

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
      why: "Picking products at random is one of the most common ways new Indian sellers lose money. Viral Instagram products often have thin margins and high returns.",
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
      why: "Learn what makes a good India COD product in 2 minutes - vet each card like a real product idea.",
      how: ["Mark each card 'Good pick' if it suits a beginner, or 'Trap' if it does not. Read the reason before moving on."],
      kind: "simulator",
      simulator: { kind: "product_swipe" },
    },
    {
      id: "returns-vs-rto",
      title: "Returns vs RTO - know the difference",
      why: "These two words get mixed up, and they cost you differently. RTO means the buyer never paid and refused the parcel. A return means they paid, got it, then sent it back. Knowing which one is hurting you tells you what to fix.",
      how: [
        "RTO (Return to Origin): the courier could not deliver your COD (Cash on Delivery) order, so it comes back to you. You pay shipping both ways, roughly ₹60-90, and earn nothing. On COD this commonly runs around 20-35%, varying a lot by category and region - treat it as a rough benchmark and confirm your real number from your seller dashboard.",
        "Return (after delivery): the buyer received it, then sent it back for a refund. You refund the money and pay the reverse shipping. This is most common in fashion, where size and fit issues push it to the high end.",
        "What to actually do: for RTO, confirm shaky COD orders on WhatsApp before you ship. For returns, use clear photos, accurate sizes, and an honest description so fewer buyers are surprised.",
        "Build a small cushion into your price for expected returns rather than hoping for zero - most sellers add a few percent, more for fashion.",
      ],
      trap: "Watching only RTO while ignoring post-delivery returns still bleeds profit - track both separately.",
      mentorNote:
        profile.productType === "fashion"
          ? "Fashion is hit twice: high RTO on COD AND high post-delivery returns. Budget for both."
          : undefined,
    },
    {
      id: "rto-screen",
      title: "Screen out RTO-heavy products",
      why: "High COD returns are one of the biggest silent profit leaks for new sellers. Fashion, fragile, and heavy products tend to come back the most - spotting that now saves you from pricing a hidden loss into every order.",
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
      trap: "Fashion on COD tends to run at the high end of returns (often around 30-40%). Unless you have strong size charts and COD confirmation, avoid it as a beginner.",
    },
  ];

  const risk = answers["product-risk"] ?? "";
  if (risk === "high") {
    steps.push({
      id: "rto-warning",
      title: "How to estimate your RTO rate (high-risk category)",
      why: "Your product category has historically high return rates on COD. Most beginners lose money here by using a hopeful RTO number.",
      how: [
        "Start higher, because your category (fashion, fragile, or heavy) sits at the risky end. Assume 30 to 40 out of every 100 COD orders (Cash on Delivery, buyer pays at the door) come back undelivered. Fashion on COD in particular runs 30-40% and can go past 40%.",
        "Prepaid is still your best lever. Orders paid online in advance (prepaid) rarely bounce, usually under 2% come back. Every COD order you convert to advance payment pulls your average down, and for high-risk items that matters more than anything else.",
        "Type the higher end of the range. For your category, put 35 (or more) in the box so your profit math has no false comfort. It is far safer to be pleasantly wrong than to price a hidden loss into every order.",
        "Confirm every order before you ship. A quick WhatsApp confirmation before dispatch is the most reliable lever to pull RTO down. Do this well and your real number can land below the 35% you budgeted.",
        "Replace the guess with real data after about 20 delivered orders. Open your marketplace seller dashboard's Returns or RTO report and read the actual percentage. If it stays near 30-40%, this category may not survive COD for a beginner. The honest move is to switch to a lighter, non-fragile product and learn on that first.",
      ],
      trap: "Ignoring RTO in your margin math makes every sale look profitable until month-end reconciliation reveals losses.",
      kind: "input",
      input: {
        id: "rto-rate",
        label: "Expected RTO rate (%) - be conservative",
        placeholder: "35",
        workspaceKey: "estimatedRtoRate",
        inputType: "number",
        hint: RTO_INPUT_HINT,
      },
    });
  } else {
    steps.push({
      id: "rto-default",
      title: "How to estimate your RTO rate",
      why: "RTO (Return to Origin) is the share of COD orders that come back undelivered - and even low-risk products face 10-15% on COD. You need a number to budget for, before you have real orders.",
      how: [
        "Start from the category range. For light, non-fragile products sold as COD (Cash on Delivery, where the buyer pays the courier at the door), assume 15 to 20 out of every 100 COD orders come back undelivered. That number is your starting RTO estimate. If your item has any size or fragility worry, use 20 instead of 15.",
        "Split it by how buyers pay. Orders paid online in advance (called prepaid) almost never bounce, usually under 2% come back. RTO mostly hits COD orders. So if nearly all your orders are COD, use the 15-20% figure. If you can nudge buyers to pay online first, your overall number drops below that.",
        "When you are unsure between two numbers, type the higher one. A cushion that turns out too big is a pleasant surprise. One that turns out too small means you priced every sale to quietly lose money.",
        "Remember this is only a guess until you have real orders. After about 20 delivered orders, open your marketplace seller dashboard (Amazon Seller Central, Meesho Supplier Panel, or Flipkart Seller Hub) and find the Returns or RTO report. That real percentage replaces your guess in this box.",
        "Good result: your real RTO settles at or below the number you typed. Bad result: it climbs well above what you budgeted (COD returns commonly run around 20-35%, higher for risky categories). If that happens, fix your COD order confirmation before dispatch or switch product. Do not just keep spending on ads.",
      ],
      kind: "input",
      input: {
        id: "rto-rate",
        label: "Expected RTO rate (%)",
        placeholder: risk === "medium" ? "20" : "15",
        workspaceKey: "estimatedRtoRate",
        inputType: "number",
        hint: RTO_INPUT_HINT,
      },
    });
  }

  if (profile.productType === "fashion") {
    steps.push(
      {
        id: "fashion-size-chart",
        title: "Size chart template (fashion mandatory)",
        why: "Wrong size is the most common return reason in fashion. A clear, accurate size chart noticeably cuts size-related returns.",
        how: [
          "Measure 3 samples per size - chest, length, shoulder, sleeve.",
          "Add cm AND inches columns.",
          "Note if product runs small/large.",
          "Include model height + size worn in listing photos.",
        ],
        trap: "Listing fashion without a size chart invites a wave of size-related returns, on top of the RTO fashion already carries.",
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
        why: "If roughly 30% of fashion orders come back (a realistic planning assumption), your effective revenue is only about 70% of the listed price. Price with that in mind.",
        how: [
          "Add a return cushion to your target selling price - many fashion sellers use roughly 8-12%.",
          "Re-run the margin calculator using a cautious assumption, for example 35% RTO plus a 10% return rate.",
          "If margin is still below 15%, raise price or pick a different product.",
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
        "Write down 3 product names you want to compare. Pick them from the listings you already opened in the demand step, not from a fresh idea.",
        "Set a rough selling price for each from the first-page competitor prices you already saw in the demand step. Aim near the middle of that price band, not the lowest - as a beginner you cannot win by being the cheapest.",
        "Get a ballpark buy-price without a supplier yet: open IndiaMART.com and search the product, or look at the same item on Meesho (it sells close to what suppliers charge). Note the lowest 2-3 'per piece' prices. This is only a rough guess - you get real quotes from a vetted supplier in the next module (Supplier sourcing).",
        "Note each product's weight from the listing. Heavier parcels cost more to ship, and shipping comes straight out of your profit.",
        "Reject any product where you cannot even find a rough price on IndiaMART or Meesho. If nobody lists it cheaply, you are unlikely to find a workable supplier either.",
      ],
      kind: "input",
      input: {
        id: "sku-1",
        label: "Your 3 candidate products (separate names with commas)",
        placeholder: "e.g. Silicone kitchen organizer, Cable organizer, Spice rack",
        workspaceKey: "shortlistedSkus",
        hint: "We'll save all three. Rough price guesses are fine at this stage - you'll firm them up with real supplier quotes in the next module. Keep your price/cost/weight notes handy for the calculator next.",
      },
      mentorNote: "Three candidates to compare. You launch ONE hero first - the other two are backups, not simultaneous launches.",
    },
    {
      id: "rto-reality",
      title: "Watch RTO eat your profit",
      why: "You just estimated your RTO. Now see what it does to your profit - this is why many Indian sellers think they are profitable while quietly losing money.",
      how: ["The slider starts at the RTO you just entered. Push it higher and watch net profit fall in real time - that falling number is your safety margin shrinking."],
      kind: "simulator",
      simulator: { kind: "rto_reality" },
    },
    {
      id: "margin-calc",
      title: "Run the margin test on each product",
      why: "If margin after ALL costs (fees, shipping, ads, RTO) is below 15%, the product cannot sustain paid traffic.",
      how: [
        "Fill the calculator with the rough numbers from your shortlist: your ballpark buy-price, your candidate selling price, and the shipping cost (start at the ₹60 default for a light parcel, more if it is heavy). These are estimates for now.",
        "The returns rate (RTO - when a Cash on Delivery buyer refuses the parcel and you pay to ship it back) is already carried over from your earlier step, so you do not re-enter it here.",
        "For 'ad cost per order', on a first launch with no data, leave the default and treat it as a placeholder. Your real number only appears after roughly your first 20 orders.",
        "Read the net margin line. Below 15% means the product cannot pay for ads and returns, so fix it or drop it. 25% or more gives you real breathing room.",
        "Run the calculator once for each of your 3 candidates and compare. The one with the healthiest margin after returns becomes your hero. Come back and re-run it once your supplier quote is real.",
      ],
      trap: "Calculating only product cost vs selling price ignores the marketplace commission, payment, and GST fees the calculator adds in. That gap is why beginners think they profit while quietly losing money.",
      kind: "calculator",
      calculator: { kind: "margin" },
      tools: [
        {
          name: "Google Trends (India)",
          whenToUse: "Free demand check before you commit to a product.",
          why: "Steady 12-month interest beats a spiky fad you can't restock into.",
          href: "https://trends.google.com/trends/explore?geo=IN",
        },
      ],
    },
    {
      id: "markup-gate",
      title: "Pass the 3x markup gate",
      why: "Practitioners use a 3x markup on landed cost (product + shipping) as a minimum for products you plan to advertise.",
      how: [
        "No hand math needed - the margin calculator above already printed your markup as a multiple of landed cost (product + shipping) and whether it passes the 3x gate.",
        "Read that line: 3x or more means healthy room for ads and returns; below 3x is risky for paid traffic.",
        "If you are below 3x, raise the price, find a cheaper supplier, or drop the product.",
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
