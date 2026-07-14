import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

function sponsoredAdsTitle(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Run Amazon Sponsored Products on your hero listing";
    case "flipkart":
      return "Run Flipkart PLA (Product Listing Ads) on your hero listing";
    default:
      return "Run Meesho Ads from the Supplier Panel";
  }
}

function sponsoredAdsHow(
  channel: OnboardingProfile["primaryChannel"],
  budgetBand: OnboardingProfile["budgetBand"],
): string[] {
  const dailyBudget = budgetBand === "under_20k" ? "₹200-500" : "₹500-1000";
  switch (channel) {
    case "amazon":
      return [
        "In Seller Central, open the menu → Advertising → Campaign Manager → Create campaign → Sponsored Products. Advertise your hero listing only - one product, one campaign.",
        "Pick Automatic targeting for campaign 1 - Amazon mines buyer search terms for you. You graduate to manual keywords once the search term report shows what actually converts.",
        `Set daily budget to ${dailyBudget} and stay near Amazon's suggested bid - resist the urge to out-bid everyone on day 1.`,
        "Day 3 read (Campaign Manager, date range set to last 3 days): impressions and clicks. Near-zero impressions = bid too low or listing not retail-ready - nudge the bid, don't touch budget. Clicks but no orders = the listing is leaking - fix images, price, or reviews before spending more.",
        "Day 7 read: ACOS per campaign. ACOS above your net margin % = every ad sale loses money - pause it. ACOS below your margin = profitable - raise budget 20-30% per week, never double overnight.",
        "Weekly: open Reports → Advertising reports → Search term report. Move converting search terms into a manual campaign; add irrelevant ones as negative keywords so they stop eating your clicks.",
      ];
    case "flipkart":
      return [
        "In Seller Hub (seller.flipkart.com), open Advertising and create a Product Listing Ads (PLA) campaign. Advertise your hero listing only - one product, one campaign.",
        "PLA is pay-per-click: placement depends on your bid AND listing quality, so a strong listing lowers your effective cost per sale.",
        `Set daily budget to ${dailyBudget} and start near the suggested bid.`,
        "Day 3 read (Advertising dashboard, last 3 days): views and clicks. Near-zero views = uncompetitive bid or weak listing quality - fix the listing first, the bid second. Clicks but no orders = the listing is leaking - fix images, price, or offers before spending more.",
        "Day 7 read: spend vs ad revenue on the campaign dashboard. ROAS = ad revenue ÷ spend - compare it against the break-even ROAS you calculated above. Below break-even = pause; above = raise budget 20-30% per week.",
      ];
    default:
      return [
        "In the Supplier Panel (supplier.meesho.com), open the Advertisements section and create a campaign on your live catalog. Advertise your hero catalog only - one catalog, one campaign. If you don't see it there, check the Promotions section of the panel.",
        "Meesho Ads is pay-per-click: you set a daily budget and pay when a buyer taps your promoted catalog.",
        `Set daily budget to ${dailyBudget}. Meesho buyers are price-first - your first image and price do the converting, the ad only buys the eyeballs.`,
        "Day 3 read (Advertisements dashboard, last 3 days): views and clicks. Views but few clicks = your first image or price is losing the tap - fix the catalog, not the bid. Clicks but no orders = page-level mismatch - photos and price must deliver what the ad promised.",
        "Day 7 read: ad spend vs orders from ads in the dashboard. ROAS = ad revenue ÷ spend - compare it against the break-even ROAS you calculated above. Below break-even = pause and fix the catalog; above = raise budget 20-30% per week.",
      ];
  }
}

function listingLiveCheck(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Is your listing actually live? Seller Central → Inventory → Manage All Inventory - status must say Active, not Inactive or Suppressed. An ad pointing at a suppressed listing spends money on a dead page.";
    case "flipkart":
      return "Is your listing actually live? Seller Hub → Listings - it must show as Active with stock, not Inactive or Blocked. Ads on a blocked listing burn budget for nothing.";
    case "shopify":
      return "Is your product page actually live? Open your store as a customer (incognito window, not admin preview) - product visible, price right, checkout works end to end.";
    default:
      return "Is your catalog actually live? It must be past QC in the Supplier Panel (supplier.meesho.com) and visible to buyers - search your own product in the Meesho buyer app to confirm.";
  }
}

function weeklyAdDataSource(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Seller Central → Advertising → Campaign Manager, date range set to last 7 days";
    case "flipkart":
      return "Seller Hub → Advertising dashboard, date range set to last 7 days";
    case "shopify":
      return "Meta Ads Manager → Campaigns tab, date range set to last 7 days";
    default:
      return "the Advertisements section of the Meesho Supplier Panel, last 7 days view";
  }
}

export function buildAdsTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "ads-readiness",
      title: "Are you ready for ads? (honest check)",
      why: "Running ads before product-market fit is one of the fastest ways to burn cash. Many beginners lose their entire first ad budget in week 1.",
      how: [
        listingLiveCheck(profile.primaryChannel),
        "Do you know your net margin per order after ALL costs (fees, shipping, RTO)? If not, run the margin calculator in the product selection module first - the break-even ROAS step below reuses that number.",
        "Have you received at least 5-10 organic orders? Check your Orders tab - if buyers never convert for free, paying for clicks only speeds up the loss.",
      ],
      trap: "If you answered no to any of these, fix the foundation first. Ads amplify what's already working - they don't create demand from nothing.",
      question: {
        id: "ads-ready",
        prompt: "Are your listings live and do you know your net margin?",
        options: [
          { value: "yes", label: "Yes - listings live, margin calculated" },
          { value: "partial", label: "Listings live but margin unclear" },
          { value: "no", label: "Not ready yet" },
        ],
      },
    },
  ];

  if (answers["ads-ready"] === "no") {
    steps.push({
      id: "not-ready",
      title: "Build foundation before spending on ads",
      why: "Every rupee spent on ads before product-market fit is tuition paid to Meta/Amazon.",
      how: [
        "Go back and complete: product selection (margin calc), channel launch (live listings).",
        "Get 5-10 organic orders first - this validates demand without ad spend.",
        "Return here once you have real conversion data.",
      ],
      trap: "Watching YouTube ads of people making lakhs with ads creates false urgency. They had margins and listings ready first.",
    });
  }

  steps.push({
    id: "breakeven-roas",
    title: "Calculate your break-even ROAS before spending ₹1",
    why: "Break-even ROAS is the ad revenue per rupee you must earn just to cover every cost - marketplace fees, shipping, RTO, and product. Below it, each ad sale loses money. The calculator below computes the exact figure for your product.",
    how: [
      "Use the calculator below with your actual product costs.",
      "Read the break-even ROAS it prints - that is your floor.",
      "Aim 1.5-2x above that floor for sustainable profit.",
    ],
    trap: "Celebrating 2x ROAS while your break-even is higher means you're losing money on every sale and calling it success.",
    kind: "calculator",
    calculator: { kind: "breakeven_roas" },
    mentorNote: workspace.breakEvenRoas
      ? `Your saved break-even ROAS is ${workspace.breakEvenRoas.toFixed(1)}x - that's your floor, not your target. Aim 1.5-2x above it.`
      : "Run the margin calculator in product selection first - I'll remember the result here.",
  });

  steps.push({
    id: "cod-prepaid-mix",
    title: "Model your COD vs prepaid mix",
    why: "COD returns commonly run around 20-35%, while prepaid orders rarely come back. Your payment mix is a core unit-economics driver - especially on Shopify and Meesho.",
    how: ["Adjust COD % and see how blended margin changes vs 100% prepaid."],
    kind: "simulator",
    simulator: { kind: "cod_prepaid_mix" },
    mentorNote:
      profile.primaryChannel === "meesho"
        ? "Meesho is COD-heavy by default - focus on RTO reduction, not forcing prepaid."
        : profile.primaryChannel === "shopify"
          ? "Push UPI prepaid discount on thank-you page to shift mix toward prepaid."
          : undefined,
  });

  steps.push({
    id: "markup-gate-ads",
    title: "The 3x markup rule for paid traffic",
    why: "Practitioners require 3x markup on landed cost (product + shipping) before running paid ads. Thin margins cannot survive ad costs.",
    how: [
      "Land cost = product cost + shipping.",
      "Selling price must be ≥ 3x land cost.",
      "If not: raise price, cut costs, or pick a different product.",
    ],
    trap: "A ₹300 product sold at ₹599 looks profitable until ₹150 in fees + ₹100 in ads + ₹50 RTO loss = ₹99 net. That's 16% margin - break-even ROAS of 6x.",
    question: {
      id: "markup-ok",
      prompt: "Does your product pass the 3x markup test?",
      options: [
        { value: "yes", label: "Yes - 3x+ markup on landed cost" },
        { value: "no", label: "No - margin too thin for ads" },
      ],
    },
  });

  if (answers["markup-ok"] === "no") {
    steps.push({
      id: "fix-margin-ads",
      title: "Fix margin before running ads",
      why: "Advertising a thin-margin product guarantees losses. The math doesn't lie.",
      how: [
        "Renegotiate supplier price or switch supplier.",
        "Increase selling price (check competitor ceiling first).",
        "Switch to organic-only growth until margin improves.",
        "Pick a different product from your shortlist.",
      ],
    });
  }

  const isMarketplace = profile.primaryChannel !== "shopify";
  if (isMarketplace) {
    steps.push({
      id: "marketplace-ads",
      title: sponsoredAdsTitle(profile.primaryChannel),
      why: `${channelLabel(profile.primaryChannel)} ads target buyers already searching inside the app - higher intent than social ads, and no pixel or creative production needed to start.`,
      how: sponsoredAdsHow(profile.primaryChannel, profile.budgetBand),
      trap:
        profile.budgetBand === "under_20k"
          ? "₹500/day on a 12% margin product means you need 8x ROAS to break even. Most beginners hit 2x and call it a win while bleeding cash."
          : "Killing ads after 2 days because of no sales. The algorithm needs 5-7 days and 15+ clicks to optimize.",
      tools: [
        profile.primaryChannel === "meesho"
          ? {
              name: "Meesho Ads",
              whenToUse: "In the Meesho supplier panel: Advertisements → create campaign on your live catalogs.",
              why: "Meesho's own CPC ads - the only paid placement inside the app your buyers use.",
            }
          : profile.primaryChannel === "flipkart"
            ? {
                name: "Flipkart Ads (PLA)",
                whenToUse: "In the Flipkart seller hub: Advertising → Product Listing Ads on your best sellers.",
                why: "Targets high-intent Flipkart search traffic from inside the seller hub.",
              }
            : {
                name: "Amazon Ads",
                whenToUse: "For Amazon Sponsored Products/Brands campaigns.",
                why: "Built into Seller Central - targets high-intent marketplace search traffic.",
              },
      ],
    });
  } else {
    steps.push({
      id: "meta-setup",
      title: "Set up Meta Business Manager correctly",
      why: "Running ads from a personal Facebook profile is a leading cause of ad account bans in India. Business Manager is mandatory.",
      how: [
        "Go to business.facebook.com → Create account. You sign in with your personal Facebook login, but the Business Manager is a separate business asset - ads never show your profile.",
        "Create the ad account inside it: Business Settings (gear icon) → Accounts → Ad accounts → Add → Create a new ad account. Set currency to INR and time zone to Kolkata - both are permanent for that ad account.",
        "Verify the business: Business Settings → Security Centre → Start verification, using your GST certificate and PAN. Verified accounts survive the review flags that kill unverified ones.",
        "Add a payment method plus a backup card under Billing & payments - one failed charge can pause every campaign.",
        "Install the Pixel + Conversions API without code: in Shopify admin → Settings → Apps and sales channels, add the Facebook & Instagram channel and connect it to this Business Manager - it sets up both.",
        "Turn on two-factor authentication: Business Settings → Security Centre → set two-factor to Everyone. Hijacked ad accounts get drained in hours.",
      ],
      trap: "Creating a new account after a ban triggers permanent restriction. Always appeal the original account first.",
    });

    steps.push({
      id: "meta-budget",
      title: "Start small - build account trust first",
      why:
        profile.budgetBand === "under_20k"
          ? "With under ₹20K to work with, a ₹500/day ad burn empties your runway in 40 days - before COD cash cycles back. Start at ₹200-300/day and treat week 1 as tuition, not scale."
          : "New ad accounts spending ₹50,000/day on day 1 get flagged as suspicious. Gradual scaling builds trust.",
      how: [
        "Week 1: ₹300-500/day on one product, one campaign, one ad set. In Ads Manager, choose the Sales objective so Meta optimizes for purchases, not cheap clicks.",
        "Test 3-5 creative variations inside that one ad set (different images/videos/hooks) - Meta shifts spend to the winner automatically.",
        "Day 3 read (Ads Manager → Campaigns tab, date set to last 3 days): ads delivering but almost no link clicks = creative problem, swap the image or hook. Clicks but no add-to-carts or purchases = product page problem - fix price, photos, or trust signals before touching budget.",
        "Day 7 read: add the Purchase ROAS column (Columns → Customize columns) and compare each ad set against the break-even ROAS you calculated above. Below break-even = kill it. At or above = scale toward ₹700-1000/day.",
        "Never increase budget more than 30% per day - sharp jumps reset Meta's learning phase.",
      ],
      trap: "Chargebacks against Meta payments frequently trigger permanent bans. Always resolve billing through the Help Center, never through your bank.",
      tools: [
        {
          name: "Meta Ads Manager",
          whenToUse: "For Shopify/D2C traffic campaigns.",
          why: "Highest reach in India - but requires Business Manager setup and patient scaling.",
        },
      ],
    });
  }

  steps.push({
    id: "cashflow-deadzone",
    title: "See the cashflow dead zone",
    why: "Meta bills today. COD cash arrives day 5-7. Most beginners run out of ad budget in week 1 - not because ads failed, but because cash timing killed them.",
    how: ["Set your starting budget and watch the 14-day timeline."],
    kind: "simulator",
    simulator: { kind: "cashflow_timeline" },
  });

  steps.push({
    id: "cod-rto-ads",
    title: isMarketplace
      ? "Cut RTO before scaling ads (it starts at the listing)"
      : "Cut RTO before scaling ads (COD confirmation)",
    why: "COD RTO of 20-35% is industry-typical, and every RTO eats forward + reverse shipping. Cutting it BEFORE you scale ads is the highest-leverage move in this module.",
    how: isMarketplace
      ? [
          `${channelLabel(profile.primaryChannel)} masks buyer phone numbers - you cannot call or WhatsApp customers, so RTO control happens BEFORE the order.`,
          "Make listings brutally accurate: real photos, size charts, exact specs - mismatch at the door is the top refusal driver.",
          "Dispatch on time, every time: late deliveries get refused far more often.",
          "Keep pricing honest - surprise charges at delivery are an instant refusal.",
        ]
      : [
          "Set up WhatsApp COD confirmation: message customer within 30 min of order.",
          "Ask them to confirm or cancel with one tap.",
          "Only ship confirmed orders.",
          "For high-value orders: call to verify address and intent.",
        ],
    trap: "Scaling ad spend while RTO is above 20% means you're paying to generate returns. Fix RTO before scaling.",
    kind: "calculator",
    calculator: { kind: "rto_impact" },
    tools: isMarketplace
      ? []
      : [
          {
            name: "Shipway / GoKwik",
            whenToUse: "For automated WhatsApp COD confirmation on Shopify.",
            why: "Catches fake and unsure COD orders before you pay to ship them.",
          },
        ],
  });

  steps.push({
    id: "ndr-practice",
    title: "Practice COD confirmation & NDR calls",
    why:
      profile.primaryChannel === "meesho"
        ? "Meesho's courier handles delivery contact - but these scenarios teach you WHY orders fail at the door, the exact patterns your listings must defend against. And when you add your own store later, you'll run these calls yourself."
        : "Calling customers scares beginners - but it is the only way to survive COD in India.",
    how: ["Walk through 2 scenarios. Pick the best response each time."],
    kind: "simulator",
    simulator: { kind: "ndr_caller" },
  });

  steps.push({
    id: "weekly-review",
    title: "Set up your weekly ad review ritual",
    why: "Ads are not set-and-forget. Weekly review prevents slow budget bleed on underperformers.",
    how: [
      `Every Monday: open ${weeklyAdDataSource(profile.primaryChannel)}. For each campaign, note spend, orders, and revenue, then compute ROAS = revenue ÷ spend${profile.primaryChannel === "amazon" ? " (or read ACOS directly)" : ""}.`,
      workspace.breakEvenRoas
        ? `Pause anything below your break-even ROAS - you saved it as ${workspace.breakEvenRoas.toFixed(1)}x in the calculator above. That number is your floor, not your target.`
        : "Pause anything below the break-even ROAS you calculated above - that number is your floor, not your target.",
      "Increase budget 20% on winners - one increase per week, not per day.",
      "Test one new creative per week on your best performer.",
      "Document learnings - what worked, what didn't, why. Next Monday's decisions get faster every week you write this down.",
    ],
    mentorNote:
      profile.budgetBand === "under_20k"
        ? "With a tight budget, treat every ₹500 as tuition. Learn fast, kill losers quickly, scale only proven winners."
        : "Discipline beats budget. A ₹500/day campaign with good margin beats ₹5000/day on a thin-margin product.",
  });

  return {
    id: "ads-growth",
    title: "Run ads without burning money",
    intro: "We'll make sure your margins can survive ad costs, set up campaigns correctly, and cut RTO before you scale spend.",
    steps,
  };
}
