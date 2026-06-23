import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel, nameMismatchWarning } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

function channelOnboardingSteps(channel: OnboardingProfile["primaryChannel"]): TaskStep[] {
  switch (channel) {
    case "amazon":
      return [
        {
          id: "amazon-signup",
          title: "Create your Amazon Seller Central account",
          why: "Amazon has the strictest verification but highest buyer trust. Getting it right the first time saves weeks.",
          how: [
            "Go to sellercentral.amazon.in and click Register.",
            "Choose Individual or Professional (Professional if >40 units/month).",
            "Enter email, password, and business location (India).",
            "Have PAN, GSTIN, bank proof, and address proof ready.",
          ],
          trap: "Enter GSTIN with NO spaces. Wait 24-72h after new GST registration before verifying on Amazon.",
        },
        {
          id: "amazon-kyc",
          title: "Complete Amazon KYC without rejection",
          why: "Amazon auto-verifies against GST portal data. Any mismatch = instant rejection.",
          how: [
            "Business name: copy-paste from GST certificate exactly.",
            "Bank account: holder name must match GST legal name character for character.",
            "Address: use utility bill under 60 days OR rent agreement + NOC + owner proof.",
            "Upload clear, full-colour scans — not phone photos in bad lighting.",
          ],
          trap: '"Pvt Ltd" vs "Private Limited" fails. "A.K. Traders" vs "AK Traders" fails. Exact match only.',
        },
      ];
    case "flipkart":
      return [
        {
          id: "flipkart-signup",
          title: "Register on Flipkart Seller Hub",
          why: "Flipkart requires GST for all sellers — no exemptions. Verification is thorough but fair.",
          how: [
            "Go to seller.flipkart.com and click Start Selling.",
            "Enter mobile, email, and business details.",
            "GSTIN is mandatory — have it ready.",
            "Complete OTP verification on mobile and email.",
          ],
          trap: "Flipkart checks GSTIN state code against your pickup address state. Mismatch = rejection.",
        },
        {
          id: "flipkart-kyc",
          title: "Submit Flipkart KYC documents",
          why: "Flipkart's verification team manually reviews documents. Quality matters more than speed.",
          how: [
            "Upload GST certificate, PAN, cancelled cheque, address proof.",
            "Bank account name = GST registered name (exact match).",
            "Pickup address must be in same state as GSTIN.",
            "Allow 24-48 hours for verification; follow up if pending >3 days.",
          ],
          trap: "Blurry uploads trigger manual review that can take a week+. Scan properly the first time.",
        },
      ];
    case "shopify":
      return [
        {
          id: "shopify-setup",
          title: "Set up your Shopify store",
          why: "Shopify gives you full brand control but you need to drive your own traffic from day one.",
          how: [
            "Sign up at shopify.in (14-day free trial).",
            "Choose a theme — keep it clean and mobile-first.",
            "Add business name, contact info, shipping policy, return policy, privacy policy.",
            "Connect Razorpay or Cashfree for payments (requires GSTIN for business account).",
          ],
          trap: "Launching a Shopify store without GSTIN limits payment gateway options and buyer trust.",
        },
        {
          id: "shopify-trust",
          title: "Build trust signals buyers look for",
          why: "Indian buyers are skeptical of unknown websites. Trust signals directly affect conversion rate.",
          how: [
            "Add clear contact info: phone, email, business address.",
            "Display GSTIN and business name in footer.",
            "Write a clear return/refund policy (14-day minimum by law).",
            "Enable COD via Razorpay/Cashfree if targeting Tier 2/3 cities.",
            "Add customer reviews/testimonials (even from sample orders).",
          ],
          trap: "A beautiful store with no contact info and no return policy converts at near zero.",
        },
      ];
    default:
      return [
        {
          id: "meesho-signup",
          title: "Register as Meesho supplier",
          why: "Meesho has the lowest entry barrier — zero commission, easy onboarding, huge Tier 2/3 reach.",
          how: [
            "Download Meesho Supplier app or go to supplier.meesho.com.",
            "Register with mobile number (must be fresh — not used on another account).",
            "Enter business details: GSTIN or UIN (for exempt categories).",
            "Upload PAN, bank proof, and address proof.",
          ],
          trap: "Meesho rejects instantly if mobile number was used on any previous seller account.",
        },
        {
          id: "meesho-kyc",
          title: "Pass Meesho KYC on first attempt",
          why: "Meesho auto-rejects on name mismatch, blurry photos, and inactive GSTIN — usually within minutes.",
          how: [
            "GST certificate name = bank account name (exact match).",
            "Upload clear cancelled cheque or passbook (not blurry phone photo).",
            "Pickup address state must match GSTIN state code.",
            "If rejected: check exact error, fix the specific issue, reapply (don't create new account).",
          ],
          trap: "Three rejections with the same error usually means a data mismatch you haven't fixed. Don't keep reapplying blindly.",
        },
      ];
  }
}

export function buildChannelLaunchTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const channel = channelLabel(profile.primaryChannel);
  const mismatch = nameMismatchWarning(workspace);

  const steps: TaskStep[] = [
    {
      id: "one-channel",
      title: `Focus on ${channel} first — master one before expanding`,
      why: "Multi-channel on day 1 spreads you thin. One channel done well beats three done poorly.",
      how: [
        `Your primary channel is ${channel}. Complete full onboarding here before thinking about others.`,
        "Get 3-5 listings live and track performance for 2 weeks.",
        "Only expand to a second channel after consistent sales on the first.",
      ],
      mentorNote: mismatch ?? undefined,
      trap: mismatch
        ? "Fix the name mismatch above BEFORE starting marketplace onboarding."
        : "Trying Amazon + Flipkart + Meesho simultaneously is how beginners burn out in week 2.",
    },
  ];

  if (mismatch) {
    steps.push({
      id: "fix-mismatch",
      title: "Fix your name mismatch before onboarding",
      why: mismatch,
      how: [
        "Option A: Update bank account name to match GST legal name.",
        "Option B: Update GST trade name to match bank (requires amendment).",
        "Option C: Open a new bank account in the exact legal name.",
        "Verify match by copy-pasting names side by side — character for character.",
      ],
      trap: "Submitting onboarding with a known mismatch guarantees rejection. Fix first, apply second.",
    });
  }

  if (workspace.gstin) {
    steps.push({
      id: "prefill-gstin",
      title: "Use your saved GSTIN",
      why: "We'll pre-fill your GSTIN so you copy-paste consistently.",
      how: [
        `Your GSTIN: ${workspace.gstin}`,
        "Copy this exactly (no spaces) into the marketplace GST field.",
        "If verification fails, wait 24-72h and retry — new GSTINs take time to sync.",
      ],
      mentorNote: "Never re-type your GSTIN manually. Copy-paste from here every time.",
    });
  }

  steps.push(...channelOnboardingSteps(profile.primaryChannel));

  steps.push(
    {
      id: "listing-quality",
      title: "Create listings that convert (not just exist)",
      why: "Weak listings get ignored even with good products. Title, images, and description drive 80% of conversion.",
      how: [
        "Title: include primary keyword + key feature + size/color (max 200 chars on most platforms).",
        "Images: white background main photo, lifestyle shot, infographic with features, size chart.",
        "Description: bullet points with benefits (not just features), address common buyer questions.",
        "Pricing: check competitor pricing — don't race to the bottom.",
      ],
      trap: "Copying competitor listings word-for-word violates IP policies and gets listings removed.",
      tools: [
        {
          name: "Canva",
          whenToUse: "For product infographics and lifestyle images.",
          why: "Free tier is enough for basic listing images — no designer needed.",
        },
      ],
    },
    {
      id: "first-listings",
      title: "Publish your first 3-5 listings",
      why: "Start small, learn the process, then scale. First listings teach you what the platform expects.",
      how: [
        "List your top 3 products from your shortlist (from product selection step).",
        "Double-check: HSN code, GST rate, category, images, price, stock status.",
        "Set realistic dispatch timeline (don't promise 1-day if supplier takes 3).",
        "Monitor first 7 days: views, clicks, orders, customer questions.",
      ],
      trap: "Uploading 50 listings on day 1 without testing means 50 potential compliance issues at once.",
      question: {
        id: "listings-live",
        prompt: "Are your first listings live on the marketplace?",
        options: [
          { value: "yes", label: "Yes — 3+ listings are live" },
          { value: "pending", label: "Submitted, waiting for approval" },
          { value: "no", label: "Not yet — still preparing" },
        ],
      },
    },
  );

  if (answers["listings-live"] === "pending") {
    steps.push({
      id: "approval-wait",
      title: "While waiting for approval",
      why: "Use the waiting time productively instead of anxiously refreshing.",
      how: [
        "Prepare ad creatives and copy (next step in journey).",
        "Set up your profit tracking sheet (final step in journey).",
        "Order more samples if quality wasn't confirmed.",
        "Check category approval status daily — respond to any document requests within 24h.",
      ],
      trap: "Starting ads before listings are approved wastes budget. Wait for live listings.",
    });
  }

  steps.push({
    id: "launch-checklist",
    title: "Launch readiness checklist",
    why: "One missed item can block payouts or cause listing suppression after you start getting orders.",
    how: [
      "Account fully verified (not pending KYC).",
      "Bank account linked and payout tested.",
      "GST configured with correct HSN mapping.",
      "3+ listings live with complete images and descriptions.",
      "Return/refund policy set.",
      "Supplier confirmed ready to dispatch within promised timeline.",
      "Customer support channel ready (WhatsApp Business or email).",
    ],
    mentorNote: "You're live when you can receive an order and fulfill it without panic. That's the real milestone.",
  });

  return {
    id: "channel-launch",
    title: `Launch on ${channel}, step by step`,
    intro: `We'll get your ${channel} seller account approved and your first listings live — avoiding the KYC rejections that delay most beginners by weeks.`,
    steps,
  };
}
