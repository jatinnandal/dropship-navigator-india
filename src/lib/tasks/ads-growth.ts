import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

export function buildAdsTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const steps: TaskStep[] = [
    {
      id: "ads-readiness",
      title: "Are you ready for ads? (honest check)",
      why: "Running ads before product-market fit is the #2 money burner after RTO. Most beginners lose their entire ad budget in week 1.",
      how: [
        "Do you have 3+ live listings with good images and descriptions?",
        "Do you know your net margin per order (after ALL costs)?",
        "Have you received at least 5-10 organic orders to validate demand?",
      ],
      trap: "If you answered no to any of these, fix the foundation first. Ads amplify what's already working — they don't create demand from nothing.",
      question: {
        id: "ads-ready",
        prompt: "Are your listings live and do you know your net margin?",
        options: [
          { value: "yes", label: "Yes — listings live, margin calculated" },
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
        "Get 5-10 organic orders first — this validates demand without ad spend.",
        "Return here once you have real conversion data.",
      ],
      trap: "Watching YouTube ads of people making lakhs with ads creates false urgency. They had margins and listings ready first.",
    });
  }

  steps.push({
    id: "breakeven-roas",
    title: "Calculate your break-even ROAS before spending ₹1",
    why: "Break-even ROAS = 1 / net margin. If margin is 20%, you need 5x ROAS just to break even. Below that, every sale loses money.",
    how: [
      "Use the calculator below with your actual product costs.",
      "Note your break-even ROAS number — this is your floor.",
      "Target 1.5-2x above break-even for sustainable profit.",
    ],
    trap: "Celebrating 2x ROAS while your break-even is 3x means you're losing money on every sale and calling it success.",
    kind: "calculator",
    calculator: { kind: "breakeven_roas" },
    mentorNote: workspace.netMarginPercent
      ? `Your saved margin is ${workspace.netMarginPercent.toFixed(1)}%. Break-even ROAS ≈ ${(100 / Math.max(workspace.netMarginPercent, 1)).toFixed(1)}x.`
      : "Run the margin calculator in product selection first — I'll remember the result here.",
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
    trap: "A ₹300 product sold at ₹599 looks profitable until ₹150 in fees + ₹100 in ads + ₹50 RTO loss = ₹99 net. That's 16% margin — break-even ROAS of 6x.",
    question: {
      id: "markup-ok",
      prompt: "Does your product pass the 3x markup test?",
      options: [
        { value: "yes", label: "Yes — 3x+ markup on landed cost" },
        { value: "no", label: "No — margin too thin for ads" },
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
      title: `Run ${channelLabel(profile.primaryChannel)} Sponsored Ads`,
      why: "Marketplace ads target buyers already searching for your product — higher intent than social ads.",
      how: [
        "Start with Sponsored Products on your best-performing listing.",
        `Daily budget: ${profile.budgetBand === "under_20k" ? "₹200-500" : "₹500-1000"} per campaign.`,
        "Run for 7 days minimum before judging performance.",
        "Track ACOS (Ad Cost of Sale) — must be below your net margin % to profit.",
        "Pause campaigns where ACOS > net margin after 7 days.",
        "Scale winners by 20-30% budget increase per week, not doubling overnight.",
      ],
      trap: "Killing ads after 2 days because of no sales. The algorithm needs 5-7 days and 15+ clicks to optimize.",
      tools: [
        {
          name: "Amazon Ads",
          whenToUse: "For Amazon Sponsored Products/Brands campaigns.",
          why: "Built into Seller Central — targets high-intent marketplace search traffic.",
        },
      ],
    });
  } else {
    steps.push({
      id: "meta-setup",
      title: "Set up Meta Business Manager correctly",
      why: "Running ads from a personal Facebook profile is the #1 cause of ad account bans in India. Business Manager is mandatory.",
      how: [
        "Create account at business.facebook.com (NOT from personal profile).",
        "Verify business with GST certificate and PAN.",
        "Add a payment method + backup card.",
        "Install Meta Pixel + Conversions API on your Shopify store.",
        "Enable two-factor authentication on all accounts.",
      ],
      trap: "Creating a new account after a ban triggers permanent restriction. Always appeal the original account first.",
    });

    steps.push({
      id: "meta-budget",
      title: "Start small — build account trust first",
      why: "New ad accounts spending ₹50,000/day on day 1 get flagged as suspicious. Gradual scaling builds trust.",
      how: [
        "Week 1: ₹300-500/day on one product, one ad set.",
        "Week 2: if ROAS > break-even, increase to ₹700-1000/day.",
        "Never increase budget more than 30% per day.",
        "Test 3-5 creative variations (different images/videos/hooks).",
        "Kill underperformers after 7 days; scale winners gradually.",
      ],
      trap: "Chargebacks against Meta payments cause permanent bans in 80%+ of cases. Always resolve billing through Help Center, never your bank.",
      tools: [
        {
          name: "Meta Ads Manager",
          whenToUse: "For Shopify/D2C traffic campaigns.",
          why: "Highest reach in India — but requires Business Manager setup and patient scaling.",
        },
      ],
    });
  }

  steps.push({
    id: "cod-rto-ads",
    title: "Cut RTO before scaling ads (COD confirmation)",
    why: "COD orders return at ~26% nationally. Every RTO eats forward + reverse shipping. COD confirmation within 30 min cuts RTO to 12-18%.",
    how: [
      "Set up WhatsApp COD confirmation: message customer within 30 min of order.",
      "Ask them to confirm or cancel with one tap.",
      "Only ship confirmed orders.",
      "For high-value orders: call to verify address and intent.",
    ],
    trap: "Scaling ad spend while RTO is above 20% means you're paying to generate returns. Fix RTO before scaling.",
    kind: "calculator",
    calculator: { kind: "rto_impact" },
    tools: [
      {
        name: "Confirmify / Level",
        whenToUse: "For automated WhatsApp COD confirmation on Shopify.",
        why: "Cuts fake COD orders by 20-30% — pays for itself within first week of ads.",
      },
    ],
  });

  steps.push({
    id: "weekly-review",
    title: "Set up your weekly ad review ritual",
    why: "Ads are not set-and-forget. Weekly review prevents slow budget bleed on underperformers.",
    how: [
      "Every Monday: export last 7 days ad data.",
      "For each campaign: note spend, orders, revenue, ROAS/ACOS.",
      "Pause anything below break-even ROAS.",
      "Increase budget 20% on winners.",
      "Test one new creative per week on your best performer.",
      "Document learnings — what worked, what didn't, why.",
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
