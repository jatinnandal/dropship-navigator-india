import type { OnboardingProfile, PrimaryChannel } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { channelLabel, nameMismatchWarning } from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

/** The seller panel each channel actually uses - named once, reused everywhere. */
function panelName(channel: PrimaryChannel): string {
  switch (channel) {
    case "amazon":
      return "Seller Central (sellercentral.amazon.in)";
    case "flipkart":
      return "Flipkart Seller Hub (seller.flipkart.com)";
    case "shopify":
      return "your Shopify admin (yourstore.myshopify.com/admin)";
    default:
      return "the Meesho Supplier Panel (supplier.meesho.com)";
  }
}

function channelOnboardingSteps(channel: OnboardingProfile["primaryChannel"]): TaskStep[] {
  switch (channel) {
    case "amazon":
      return [
        {
          id: "amazon-signup",
          title: "Create your Amazon Seller Central account",
          why: "Amazon has the strictest verification but highest buyer trust. Getting it right the first time saves weeks.",
          how: [
            "Go to sellercentral.amazon.in and click Register - you can use an existing Amazon buyer login or a fresh email.",
            "The flow goes screen by screen: business location (India), business type, PAN, GSTIN, store name, pickup address, bank details. Pick the business type that matches your actual registration - it must line up with your GST records.",
            "Keep PAN, GSTIN, a cancelled cheque or bank statement, and address proof scanned BEFORE you start - half-finished KYC sessions breed typos.",
            "Store name: brandable is nice, but don't overthink - it's changeable later; your legal details are not.",
            "Done when the Seller Central dashboard opens and shows identity verification in progress - a login alone is not a seller account.",
          ],
          trap: "Enter GSTIN with NO spaces. Wait 24-72h after new GST registration before verifying on Amazon - fresh GSTINs take time to sync with the data Amazon checks against.",
        },
        {
          id: "amazon-kyc",
          title: "Complete Amazon KYC without rejection",
          why: "Amazon auto-verifies against GST portal data. Any mismatch = instant rejection.",
          how: [
            "Business name: copy-paste from GST certificate exactly.",
            "Bank account: holder name must match GST legal name character for character.",
            "Address: use utility bill under 60 days OR rent agreement + NOC + owner proof.",
            "Upload clear, full-colour scans - not phone photos in bad lighting.",
            "Track status on the Seller Central dashboard banner. If Amazon asks for an extra document, upload it from that same screen - don't email it.",
          ],
          trap: '"Pvt Ltd" vs "Private Limited" fails. "A.K. Traders" vs "AK Traders" fails. Exact match only.',
        },
      ];
    case "flipkart":
      return [
        {
          id: "flipkart-signup",
          title: "Register on Flipkart Seller Hub",
          why: "Flipkart requires GST for all sellers - no exemptions. Verification is thorough but fair.",
          how: [
            "Go to seller.flipkart.com and click Start Selling.",
            "The first screen asks mobile (OTP), email, and GSTIN together - Flipkart wants GSTIN upfront, there is no deferring it.",
            "Then pickup address (must be in your GSTIN's state - the form checks the state code), bank details, and store details.",
            "Complete OTP verification on both mobile and email before closing the tab - unverified contacts stall the application silently.",
            "Done when the Seller Hub dashboard opens with an onboarding checklist - items showing verification pending is normal at this stage.",
          ],
          trap: "Flipkart checks GSTIN state code against your pickup address state. Mismatch = rejection.",
        },
        {
          id: "flipkart-kyc",
          title: "Submit Flipkart KYC documents",
          why: "Flipkart's verification team manually reviews documents. Quality matters more than speed.",
          how: [
            "Upload inside the Seller Hub onboarding checklist - each pending item has its own upload slot: GST certificate, PAN, cancelled cheque, address proof.",
            "Bank account name = GST registered name (exact match).",
            "Pickup address must be in same state as GSTIN.",
            "Allow 24-48 hours for verification. Pending >3 days? Raise it from the Help option inside Seller Hub with your registered mobile - don't just wait.",
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
            "Sign up at shopify.com - the signup page shows the current trial offer. You'll land in your admin at yourstore.myshopify.com/admin; bookmark it.",
            "Pick a free theme under Online Store → Themes - clean and mobile-first. Check every page on your own phone, not just desktop.",
            "Add legal pages under Settings → Policies: return/refund, privacy, terms of service. Shopify links them into checkout automatically - and buyers DO look for them.",
            "Fill Settings → General with business name, address, and phone - these flow into order emails and invoices.",
            "Payments: connect Razorpay or Cashfree under Settings → Payments once your PG is approved (a business account needs GSTIN). Not approved yet? Enable Cash on Delivery under Manual payment methods so you can still take orders.",
          ],
          trap: "Launching a Shopify store without GSTIN limits payment gateway options and buyer trust.",
        },
        {
          id: "shopify-trust",
          title: "Build trust signals buyers look for",
          why: "Indian buyers are skeptical of unknown websites. Trust signals directly affect conversion rate.",
          how: [
            "Create a contact page (Online Store → Pages) with phone, email, and business address - then add it to the footer menu under Online Store → Navigation.",
            "Show GSTIN and legal business name in the footer (Online Store → Themes → Customize → footer section).",
            "Write a clear return/refund policy (14-day minimum by law).",
            "Enable COD as a manual payment method (Settings → Payments) if targeting Tier 2/3 cities - COD is how most first orders arrive.",
            "Add customer reviews/testimonials (even from sample orders).",
            "Final test: open the store on your phone as a stranger would - can you tell who runs it, how returns work, and how to reach a human without hunting? If not, fix before spending on ads.",
          ],
          trap: "A beautiful store with no contact info and no return policy converts at near zero.",
        },
      ];
    default:
      return [
        {
          id: "meesho-signup",
          title: "Register on the Meesho Supplier Panel",
          why: "Meesho has the lowest entry barrier - zero commission, easy onboarding, huge Tier 2/3 reach. Getting the signup details right the first time avoids the auto-rejection loop.",
          how: [
            "Go to supplier.meesho.com (or the Meesho Supplier app) and start registration with your mobile number + OTP. The number must be fresh - never used on any Meesho seller account before.",
            "Enter your GSTIN - or your Enrolment ID if you're selling within your state in an eligible category without GST (the documentation module showed how to get one free on gst.gov.in).",
            "Enter your pickup address in the same state as your GSTIN/Enrolment ID, then bank details.",
            "Upload PAN and bank proof (cancelled cheque or passbook front page) as clear scans - not dim phone photos.",
            "Done when the Supplier Panel dashboard opens with Catalog and Orders sections visible - verification may still be processing, that's fine.",
          ],
          trap: "Meesho rejects instantly if the mobile number was used on any previous seller account. Don't borrow a family member's already-used number.",
        },
        {
          id: "meesho-kyc",
          title: "Pass Meesho KYC on first attempt",
          why: "Meesho auto-verifies against GST portal and bank data - name mismatch, blurry photos, and inactive GSTIN get auto-rejected, usually within minutes.",
          how: [
            "GST certificate name = bank account name, character for character. Paste both into one note and compare before submitting.",
            "Upload a clear cancelled cheque or passbook scan - account number and name must be readable at a glance.",
            "Pickup address state must match your GSTIN state code (the first 2 digits of the GSTIN).",
            "If rejected: the exact reason appears in Supplier Panel notifications and your registered email. Fix that one field and resubmit from the SAME account.",
          ],
          trap: "Three rejections with the same error means a data mismatch you haven't found yet - stop resubmitting and compare every name field side by side. Never create a fresh account to reset; that gets flagged.",
        },
      ];
  }
}

function logisticsStepsForChannel(channel: OnboardingProfile["primaryChannel"]): string[] {
  switch (channel) {
    case "meesho":
      return [
        "Meesho ships everything through its own logistics network (Valmo and partner couriers) - you don't pick a courier per order, and there is no self-ship option to evaluate.",
        "Your real decisions: confirm your pickup pincode is serviceable (the Supplier Panel flags this during onboarding) and be packed before the scheduled pickup arrives.",
        "If pickups keep failing at your pincode, raise a ticket from the Supplier Panel's help section BEFORE pushing for more orders - parcels you can't hand over become SLA breaches.",
      ];
    case "amazon":
      return [
        "Easy Ship (Amazon's courier picks up from you) is the beginner default - set it in Seller Central → Settings → Shipping Settings.",
        "Self Ship means your own courier AND your own RTO reverse charges - only consider it after you hold real courier rate cards that beat Easy Ship all-in.",
        "Confirm Easy Ship pickup serviceability for your pickup pincode inside Shipping Settings before you list - a non-serviceable pickup pincode turns every order into a manual headache.",
      ];
    case "flipkart":
      return [
        "Ekart (Flipkart logistics) is the default - Seller Hub shows the pickup schedule per order and you hand over the packed parcel.",
        "Compare all-in cost including RTO reverse charges before considering self-ship - self-ship needs a pre-approved courier list in Seller Hub.",
        "A missed Ekart pickup still counts against YOUR dispatch SLA - pack the evening before the scheduled pickup, not the morning of.",
      ];
    default:
      return [
        "Compare Shiprocket vs Delhivery vs Xpressbees for your pickup pincode - sign up, enter pickup pin + package weight, and each shows serviceability and rate before you commit.",
        "Run a courier benchmark (5 test shipments per courier) before committing volume - score pickup punctuality, delivery days, and COD remittance accuracy, not just the forward rate.",
        "Check the COD remittance cycle - 7 vs 14 days changes how long your cash is stuck in transit.",
      ];
  }
}

function shippingSlaForChannel(channel: OnboardingProfile["primaryChannel"]): string[] {
  switch (channel) {
    case "amazon":
      return [
        "Easy Ship: dispatch within 2 business days of order.",
        "Self Ship: confirm by midnight, ship next business day.",
        "Late dispatch >4% triggers account health warning.",
      ];
    case "flipkart":
      return [
        "Dispatch within 24-48 hours depending on listing promise.",
        "Handover to Ekart within SLA window - late handover = cancellation.",
      ];
    case "meesho":
      return [
        "Dispatch within 48 hours for most categories.",
        "Valmo pickup scheduled day after order - keep inventory ready.",
      ];
    default:
      return [
        "Set realistic dispatch timeline on store (2-3 days if supplier needs time).",
        "Update inventory to zero rather than accepting orders you cannot ship.",
      ];
  }
}

/**
 * Channel-exact listing creation. The profile tells us WHICH panel the seller
 * uploads into, so each channel gets its real form path, field rules, and
 * pass/fail criteria - never "open your marketplace and add a listing".
 */
const LISTING_CREATION: Record<
  PrimaryChannel,
  { title: string; how: string[]; trap: string }
> = {
  meesho: {
    title: "Create your first Meesho catalog so it converts (not just exists)",
    how: [
      "In the Supplier Panel open Catalog Upload → Add Single Catalog. One catalog = one product with its variants - start with your hero SKU only.",
      "Choose the most specific category that fits - Meesho buyers browse and filter by category, and a wrong category buries the listing.",
      "Product name: lead with the exact phrases buyers type (you saved these from the search-autocomplete demand check) + material/size/colour. Plain and specific beats clever.",
      "Images: main photo on a clean background with the product filling most of the frame (~85%), no watermark or text - aim for 5+ images total. The upload form runs its own QC; follow whatever count and size it asks for.",
      "Enter GST rate and HSN exactly as you mapped them in the compliance module - the buyer invoice is generated from these fields.",
      "Price: enter the selling price your margin calculator approved - your saved net margin and break-even ROAS are in your workspace recap. Tempted to undercut at upload time? Re-run the calculator first, then decide.",
    ],
    trap: "On Meesho the doorstep COD decision is the buyer comparing the parcel to your photos. A prettier-than-reality photo = refusal at the door = you pay both shipping legs.",
  },
  amazon: {
    title: "Create your first Amazon listing so it converts (not just exists)",
    how: [
      "In Seller Central open Catalog → Add Products. Search your exact product first: if an identical item already exists you add your offer on that listing; if not, choose the option to create a new product.",
      "A new product asks for a product ID (GTIN/EAN barcode). Generic unbranded product with no barcode? Apply for a GTIN exemption - the Add Products flow links to the application.",
      "Title: primary keyword first + material/feature + size/colour, max 200 chars. Buyers and the ranking algorithm both read left to right - don't waste the opening words.",
      "Bullet points: fill every bullet field with benefits that answer real buyer questions (fits what? made of what? how big?). Features tell, benefits sell.",
      "Backend Search Terms (the Keywords tab of the listing form): paste the autocomplete phrases from your demand check that didn't fit the title. No competitor brand names - that's an IP flag.",
      "Main image: pure white background, product filling ~85% of the frame, no text or watermark - Amazon's image check enforces this.",
      "Price: the number your margin calculator approved - net margin and break-even ROAS are saved in your workspace recap. Don't set a 'launch price' below break-even hoping to raise it later.",
      "Done when the listing shows Active in Manage Inventory. Inactive or Suppressed? The Status column names the exact missing field - fix that, not everything.",
    ],
    trap: "Copy-pasting a competitor's title and bullets triggers IP complaints and duplicate-content suppression. Write from your own sample in hand.",
  },
  flipkart: {
    title: "Create your first Flipkart listing so it converts (not just exists)",
    how: [
      "In Seller Hub open Listings → Add New Listings and pick single listing, then choose your category (vertical). Some categories need brand approval first - the form tells you and routes you to apply.",
      "Title: keyword + key attribute + size/colour. Then fill EVERY mandatory attribute field - Flipkart's search filters run on attributes, and blank attributes make you invisible to filtered searches.",
      "Images: clean background, no watermark or text, and follow the count and size the form specifies - Flipkart QC checks images before the listing goes live and names the reason when it rejects.",
      "Enter HSN and GST rate exactly as you mapped them in the compliance module.",
      "Price: your margin-calculator-approved price (net margin and break-even ROAS are in your workspace recap). Seller Hub shows similar listings' prices - don't knee-jerk undercut below your break-even.",
      "Done when the listing turns Active after QC. Stuck or rejected? The listing row shows the specific reason - fix that field and resubmit.",
    ],
    trap: "Flipkart QC rejects mostly on images and missing mandatory attributes. Resubmitting the same catalog unchanged just re-queues the same rejection - fix the named issue first.",
  },
  shopify: {
    title: "Build your first product page so it converts (not just exists)",
    how: [
      "In your Shopify admin open Products → Add product. Nothing is pre-validated for you here - this checklist replaces the marketplace's QC.",
      "Title: what a buyer would actually search + product type. Then edit the Search engine listing section at the bottom of the product form - that page title and description are what Google shows.",
      "Description: benefits first, then a plain spec block (material, size, weight, what's in the box). Answer the WhatsApp questions before they get asked.",
      "Images: same bar as the marketplaces - clean main shot, lifestyle shot, close-up, 5+ total. Compress them; heavy images slow mobile load, and mobile is where your buyers are.",
      "Set the product weight in the shipping section - your courier rates and COD charges compute from it. A guessed weight becomes a real loss on every order.",
      "Price: the margin-calculator-approved number (saved in your workspace recap). You also control shipping charges here - set any free-shipping threshold with the calculator open, not by vibes.",
      "Done when you open the page on your own phone, add to cart, and reach checkout with COD selectable. If your test order can't complete, neither can a buyer's.",
    ],
    trap: "Nobody QCs your store. A typo in price or weight ships real losses silently - re-read every number on the page before hitting publish.",
  },
};

/**
 * RTO/prepaid levers differ completely by channel: on marketplaces the seller
 * does not control checkout or buyer contact, so "push prepaid" advice is
 * only honest on Shopify.
 */
const PREPAID_PUSH: Record<
  PrimaryChannel,
  { title: string; why: string; how: string[]; trap: string }
> = {
  meesho: {
    title: "Cut COD losses without touching checkout (Meesho owns it)",
    why: "Meesho decides the payment options and masks buyer phone numbers - you cannot offer prepaid discounts or WhatsApp buyers. Your RTO levers all sit BEFORE the order ships.",
    how: [
      "Product-page accuracy is your strongest lever: the doorstep decision is the buyer comparing parcel to photos - make them match exactly.",
      "Dispatch the same day the Valmo pickup is scheduled - long delivery windows raise doorstep refusals.",
      "Pack for inspection at the door: buyers can refuse on visible damage, so the unboxing must survive a rough journey.",
      "Review returns in the Supplier Panel weekly: if one catalog drives most of your RTO, fix its photos and description or delist it.",
      "Meesho's own notification system handles buyer contact - do not try to reach buyers off-platform; it violates policy and risks the account.",
    ],
    trap: "Shopify-style tactics ('UPI discount at checkout', 'WhatsApp before dispatch') are impossible on Meesho - checkout and buyer contact are Meesho's. Anyone teaching you those for Meesho hasn't sold on it.",
  },
  amazon: {
    title: "Reduce COD exposure on Amazon (checkout is Amazon's)",
    why: "Amazon owns checkout and payment options - you cannot add prepaid discounts or contact buyers before delivery. Your levers are listing accuracy, dispatch speed, and shipping-mode choices.",
    how: [
      "Make the listing brutally accurate - photos, size, specs. Doorstep refusal is a mismatch problem before it is a payment problem.",
      "Dispatch inside your Easy Ship SLA every single time - late deliveries get refused more.",
      "On Self Ship you control more: check Seller Central → Settings → Shipping Settings for the COD and region options your account allows.",
      "Reconcile refusals in the Payments dashboard so RTO shows up in your math, not just your mood.",
    ],
    trap: "Slipping prepaid-discount notes into the parcel or contacting buyers directly violates Amazon policy. Your levers are the listing and the dispatch - not the buyer's wallet.",
  },
  flipkart: {
    title: "Reduce COD exposure on Flipkart (checkout is Flipkart's)",
    why: "Flipkart owns checkout and the buyer picks the payment mode - you cannot offer prepaid discounts. Your levers are listing accuracy, price honesty, and dispatch speed.",
    how: [
      "Listing accuracy first: doorstep refusals are mismatch refusals - photos and specs must match the parcel.",
      "Hand over to Ekart on schedule - delayed deliveries refuse at higher rates.",
      "Watch COD share and returns per listing in Seller Hub reports - one SKU usually drives most refusals; fix or delist it.",
      "Remember Flipkart's collection fee differs by payment mode (it's in your margin calculator's fee card) - prepaid orders also settle cleaner.",
    ],
    trap: "You cannot 'push prepaid' on a marketplace you don't control. Spend that energy on the listing and dispatch speed - those you own completely.",
  },
  shopify: {
    title: "Push prepaid to cut RTO",
    why: "Every prepaid order skips RTO risk entirely. Even 10% prepaid shift improves unit economics.",
    how: [
      "Offer ₹30-50 UPI discount at checkout for prepaid.",
      "Thank-you page: static UPI QR with 'Pay now, dispatch today'.",
      "Partial prepay token: ₹99 to confirm COD order (refundable on delivery).",
      "WhatsApp: 'Pay via UPI for same-day dispatch' after order placed - you own the buyer's number here, use it.",
    ],
    trap: "Heavy COD discounting without a confirmation script - you pay shipping twice on RTO.",
  },
};

/**
 * Pincode control is a Shopify/self-ship power. Marketplaces decide their own
 * serviceability - sellers cannot blacklist buyer pincodes there, so the
 * honest play is pattern-tracking, not blocking.
 */
const PINCODE_STRATEGY: Record<
  PrimaryChannel,
  { title: string; why: string; how: string[]; trap: string }
> = {
  meesho: {
    title: "You can't block pincodes on Meesho - here's what you CAN do",
    why: "Serviceability is Meesho's call, not yours - suppliers have no pincode blacklist. But RTO still clusters, and you can act on the pattern.",
    how: [
      "Read your RTO'd orders in the Supplier Panel monthly: note which states and regions repeat.",
      "If one product drives RTO in specific regions, the cause is usually expectation mismatch - tighten photos, size info, and description before blaming geography.",
      "Meesho's notification system handles buyer confirmation - your lever is what the buyer expects when the parcel arrives, not who gets to order.",
      "Keep the data: when you later add your own store, your Meesho RTO map tells you exactly where NOT to enable COD.",
    ],
    trap: "Dodging 'bad pincodes' by cancelling orders yourself wrecks your cancellation metric far faster than RTO wrecks your margin.",
  },
  amazon: {
    title: "Pincode reality on Amazon: mostly no blocking, so track instead",
    why: "On Easy Ship, Amazon decides serviceability - there is no seller pincode blacklist. Your play is knowing your RTO pattern and controlling what you can.",
    how: [
      "Pull your returns and RTO orders monthly from Seller Central reports and look for region clusters.",
      "If a region clusters, check whether it's really geography or one SKU's expectation mismatch - fix the listing first.",
      "Self Ship exception: you define where you ship in Settings → Shipping Settings - check how granular your account's region options go before assuming pincode-level control.",
      "Never cancel orders from 'scary' regions - cancellation rate is an account-health metric with real suspension teeth.",
    ],
    trap: "Cancelling COD orders you're afraid of counts against YOUR cancellation metric. Track patterns and fix listings instead.",
  },
  flipkart: {
    title: "Pincode reality on Flipkart: no seller blacklist, so track instead",
    why: "Ekart decides serviceability - sellers cannot block buyer pincodes. Knowing your RTO pattern still pays.",
    how: [
      "Review returned and RTO orders in Seller Hub reports monthly and note region clusters.",
      "Fix the listing before blaming geography - refusal clusters usually trace back to one SKU's photos or price expectations.",
      "Never self-cancel orders from high-RTO regions - cancellation metrics trigger penalties faster than RTO does.",
      "Keep the RTO map - it becomes your COD serviceability plan if you later launch your own store.",
    ],
    trap: "Cancelling orders to dodge RTO trades a margin problem for an account-suspension problem.",
  },
  shopify: {
    title: "Pincode blacklist strategy",
    why: "RTO varies wildly by pincode - a handful of bad pincodes can quietly eat the margin the rest of the country earns. On your own store you control serviceability, so block the worst ones early.",
    how: [
      "Run the pincode pilot (50-100 orders in controlled pincodes) before national shipping - the planner is the pincode-pilot step further down this walkthrough.",
      "Blacklist pincodes whose RTO runs far above your average once you have 20+ orders there (rule of thumb: roughly double your overall rate).",
      "Your courier aggregator's NDR data shows WHERE refusals and bad addresses cluster - export it monthly and look for pincode patterns.",
      "Enforce the blacklist where you actually can: your courier aggregator's COD serviceability settings, or a Shopify pincode-check app on the product page - check each tool's own rules screen for how granular it goes.",
    ],
    trap: "Shipping all-India on day 1 with COD - ads amplify RTO losses before you learn the patterns.",
  },
};

function firstWeekTrackingLine(channel: PrimaryChannel): string {
  switch (channel) {
    case "amazon":
      return "Track the first 7 days in Seller Central → Reports → Business Reports → Detail Page Sales and Traffic: sessions without orders = price or image problem; no sessions = search visibility problem.";
    case "flipkart":
      return "Track the first 7 days in Seller Hub's listings dashboard: views and orders per listing - views without orders points at price or images; no views points at title and attributes.";
    case "shopify":
      return "Track the first 7 days in Shopify admin → Analytics: sessions, add-to-carts, and checkout completion - the step where buyers drop off names your problem.";
    default:
      return "Track the first 7 days in the Supplier Panel: orders and returns per catalog plus buyer queries - answer queries fast (within 4 hours), response speed feeds your catalog's visibility.";
  }
}

function approvalStatusLine(channel: PrimaryChannel): string {
  switch (channel) {
    case "amazon":
      return "Check Manage Inventory daily - an Inactive or Suppressed row names the missing field in its Status column; respond to any document request within 24h.";
    case "flipkart":
      return "Check the listing's QC state in Seller Hub → Listings daily - respond to any document request within 24h.";
    case "shopify":
      return "Shopify has no listing approval - if you're waiting on anything it's the payment gateway. Keep the COD path live so waiting never blocks selling.";
    default:
      return "Check QC status daily in the Supplier Panel's catalog section - a rejected catalog shows the reason; fix that field and resubmit the SAME catalog.";
  }
}

function accountHealthLine(channel: PrimaryChannel): string {
  switch (channel) {
    case "amazon":
      return "Watch Seller Central → Account Health weekly - it shows the same metrics Amazon's enforcement reads, before any email arrives.";
    case "flipkart":
      return "Watch your dashboard metrics in Seller Hub weekly - breaches surface there before the warning emails do.";
    case "shopify":
      return "No marketplace can suspend you - but your payment gateway can freeze payouts over disputes and chargebacks, so the same discipline applies.";
    default:
      return "Watch Supplier Panel notifications and your registered email weekly - Meesho flags quality and cancellation issues there first.";
  }
}

export function buildChannelLaunchTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  const channel = channelLabel(profile.primaryChannel);
  const panel = panelName(profile.primaryChannel);
  const mismatch = nameMismatchWarning(workspace);

  const steps: TaskStep[] = [
    {
      id: "one-channel",
      title: `Focus on ${channel} first - master one before expanding`,
      why: "Multi-channel on day 1 spreads you thin. One channel done well beats three done poorly.",
      how: [
        `Your primary channel is ${channel}. Everything below happens in ${panel} - bookmark it now; you'll open it daily.`,
        "Get 1 hero listing live and complete 5-10 real orders before adding more SKUs.",
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
        "Option A (usually fastest): update the bank account name - branch visit or netbanking service request, carrying your GST certificate as the name proof.",
        "Option B: amend the name on the GST side at gst.gov.in → Services → Registration → Amendment of Registration. Name changes are core-field amendments needing officer approval - expect a wait.",
        "Option C: open a new current account in the exact legal name - often faster than a GST amendment.",
        "Verify the fix by copy-pasting both names side by side in a note - character for character, including dots and spacing.",
      ],
      trap: "Submitting onboarding with a known mismatch guarantees rejection. Fix first, apply second.",
    });
  }

  if (workspace.gstin) {
    const gstinWhere = (() => {
      switch (profile.primaryChannel) {
        case "amazon":
          return "In Seller Central it goes in the tax details screen of registration.";
        case "flipkart":
          return "On seller.flipkart.com it's asked right on the Start Selling form - first screen.";
        case "shopify":
          return "Shopify itself never asks for it - your payment gateway (Razorpay/Cashfree) will during KYC, and it belongs in your store footer.";
        default:
          return "On supplier.meesho.com it goes in the GST details screen during supplier registration.";
      }
    })();
    steps.push({
      id: "prefill-gstin",
      title: "Use your saved GSTIN",
      why: "We'll pre-fill your GSTIN so you copy-paste consistently.",
      how: [
        `Your GSTIN: ${workspace.gstin}`,
        "Copy this exactly (no spaces) into the marketplace GST field.",
        gstinWhere,
        "If verification fails, wait 24-72h and retry - new GSTINs take time to sync.",
      ],
      mentorNote: "Never re-type your GSTIN manually. Copy-paste from here every time.",
    });
  }

  if (profile.primaryChannel === "shopify") {
    const isIndividual =
      profile.businessType === "individual" ||
      answers["registered-business"] === "no";

    steps.push({
      id: "business-entity-check",
      title: "Registered business status",
      why: "Razorpay and Cashfree frequently reject individuals without a registered business entity (proprietorship, LLP, Pvt Ltd). Know this before applying.",
      how: [
        `Your profile says: ${profile.businessType.replace(/_/g, " ")}.`,
        "Confirm whether you have a registered business suitable for PG approval.",
      ],
      mentorNote: isIndividual
        ? "Individuals face higher PG rejection rates. Plan B (COD-only) is realistic - not a failure."
        : undefined,
      question: {
        id: "registered-business",
        prompt: "Do you have a registered business entity (proprietorship, partnership, LLP, or company)?",
        options: [
          { value: "yes", label: "Yes - registered business with GSTIN" },
          { value: "no", label: "No - individual / not registered yet" },
        ],
      },
    });

    steps.push({
      id: "pg-check",
      title: "Payment gateway status (Razorpay / Cashfree)",
      why: "Indian PGs are rejecting many new dropshipping accounts in 2025-26. If yours is not approved, you need a Plan B - not weeks of waiting.",
      how: ["Be honest about where you stand so I can route you correctly."],
      question: {
        id: "pg-approved",
        prompt: "Is your Razorpay or Cashfree account approved for live payments?",
        options: [
          { value: "yes", label: "Yes - PG is live" },
          { value: "no", label: "No - rejected or still pending" },
          { value: "not-applied", label: "Haven't applied yet" },
        ],
      },
    });

    if (
      answers["pg-approved"] === "no" ||
      answers["pg-approved"] === "not-applied" ||
      answers["registered-business"] === "no"
    ) {
      steps.push(
        {
          id: "zero-pg-intro",
          title: "Zero-PG launch strategy (your first 10 orders)",
          why: "Getting a PG is hard right now - especially for individuals. You can still start selling.",
          how: [
            "This is normal. Many beginners launch without a PG first.",
            "Follow the COD-only + UPI QR path below for your first orders.",
          ],
          mentorNote:
            answers["registered-business"] === "no"
              ? "Register a proprietorship + GSTIN before re-applying to PG. Meanwhile, COD-only works."
              : "Sell on Meesho (zero PG needed) OR run COD-only on Shopify while PG pending.",
        },
        {
          id: "zero-pg-mobile-checkout",
          title: "Mobile-first checkout setup",
          why: "The vast majority of India buyers shop on mobile. Checkout must capture the phone number first - for COD confirmation.",
          how: [
            "In Shopify admin: Settings → Checkout → Customer information - set the phone number field to Required so every COD order arrives with a callable number.",
            "Settings → Payments: keep card/online methods off until your PG is approved, and enable Cash on Delivery under Manual payment methods as the default.",
            "Add an order-confirmation SMS/WhatsApp trigger (manual is fine for the first orders; an app later).",
            "Thank-you page: UPI QR for the prepaid discount (set up two steps below).",
          ],
          trap: "Desktop-first checkout with card payment as default confuses COD buyers.",
        },
        {
          id: "zero-pg-cod",
          title: "Enable COD-only checkout",
          why: "COD does not need Razorpay/Cashfree. Customer pays the courier - you skip PG entirely.",
          how: [
            "In Shopify admin: Settings → Payments → Manual payment methods → add Cash on Delivery (COD).",
            "Use the method's instructions field to set expectations: confirmation call/WhatsApp before dispatch, cash ready at the door.",
            "Add WhatsApp COD confirmation before every dispatch (cuts RTO) - the WhatsApp templates tool in this app has the script.",
            "Test it: place an order on your own phone through to the order-placed page choosing only COD. If you can't, buyers can't.",
          ],
          trap: "COD-only still needs GSTIN, return policy, and trust signals on your store.",
        },
        {
          id: "zero-pg-upi",
          title: "Add UPI QR on thank-you page for prepaid discount",
          why: "Offer 5% off for UPI prepaid - some buyers will pay instantly without a PG integration.",
          how: [
            "Generate a static UPI QR from your business bank app.",
            "Add to order confirmation page: 'Pay via UPI for 5% instant discount.'",
            "Manually verify payment screenshot before faster dispatch.",
          ],
          trap: "This is manual - fine for first 10-20 orders, not for scale.",
        },
        {
          id: "zero-pg-marketplace",
          title: "Parallel path: sell on Meesho while PG pending",
          why: "Meesho handles payments and logistics - no PG needed. You can test products while PG application processes.",
          how: [
            "Complete Meesho supplier onboarding at supplier.meesho.com (reuse your GSTIN + docs - or an Enrolment ID for intra-state selling).",
            "List your hero SKU first; add backups only after the first orders teach you what works.",
            "Use Meesho sales to fund PG re-application and ad tests later.",
          ],
        },
        {
          id: "zero-pg-reapply",
          title: "What to submit when re-applying to PG",
          why: "Second applications fail for the same reason as first - fix the root cause.",
          how: [
            "Live website with return policy, privacy policy, contact page, GSTIN in footer.",
            "3+ real product listings with clear images (not empty store).",
            "Sample invoices or marketplace seller screenshot if available.",
            "Business bank account matching GST legal name.",
          ],
          trap: "Re-applying with an empty Shopify store gets rejected again. Make store look real first.",
        },
      );
    }
  }

  steps.push(...channelOnboardingSteps(profile.primaryChannel));

  const listingCreation = LISTING_CREATION[profile.primaryChannel];

  steps.push(
    {
      id: "listing-quality",
      title: listingCreation.title,
      why: "Weak listings get ignored even with good products. Title, images, and description drive 80% of conversion.",
      how: listingCreation.how,
      trap: listingCreation.trap,
      tools: [
        {
          name: "Canva",
          whenToUse: "For product infographics and lifestyle images.",
          why: "Free tier is enough for basic listing images - no designer needed.",
        },
      ],
    },
    {
      id: "first-listings",
      title: "Publish your first listing - one hero SKU",
      why: "One product is enough to test the full loop: listing → order → dispatch → COD → payout. Learn on one SKU before you multiply effort across a catalog.",
      how: [
        "Pick your single strongest SKU from the shortlist (best margin + supplier reliability).",
        "Double-check before publishing: HSN code, GST rate, category, images, price, stock status.",
        "Set a dispatch timeline you can actually hit (don't promise 1-day if your supplier takes 3).",
        firstWeekTrackingLine(profile.primaryChannel),
        "Fix what the first week teaches you BEFORE listing #2 - one listing done right beats five done blind.",
      ],
      trap: "Uploading 10-50 listings on day 1 means 10-50 compliance issues at once. One listing teaches you the process; bulk upload teaches you panic.",
      question: {
        id: "listings-live",
        prompt: "Is your first listing live on the marketplace?",
        options: [
          { value: "yes", label: "Yes - at least 1 listing is live" },
          { value: "pending", label: "Submitted, waiting for approval" },
          { value: "no", label: "Not yet - still preparing" },
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
        approvalStatusLine(profile.primaryChannel),
      ],
      trap: "Starting ads before listings are approved wastes budget. Wait for live listings.",
    });
  }

  const isMarketplaceChannel = profile.primaryChannel !== "shopify";

  steps.push({
    id: "cod-calls-launch",
    title: "Practice COD confirmation before your first order",
    why: isMarketplaceChannel
      ? `One bad COD order costs 2× shipping. ${channel} masks buyer phone numbers - the courier makes delivery contact, not you - but these scenarios teach you exactly WHY orders get refused at the door, which is what your listing has to defend against.`
      : "One bad COD order costs 2× shipping. On your own store YOU make the confirmation call/WhatsApp - learn the script before you go live.",
    how: isMarketplaceChannel
      ? [
          "Complete 2 quick scenarios - pick the best response each time.",
          "Every refusal reason you see here maps to a listing fix: photo accuracy, price honesty, delivery expectations.",
        ]
      : [
          "Complete 2 quick scenarios - pick the best response each time.",
          "NDR callback within 24 hours is mandatory - missed window = automatic RTO charge.",
        ],
    kind: "simulator",
    simulator: { kind: "ndr_caller" },
  });

  const prepaidPush = PREPAID_PUSH[profile.primaryChannel];
  const pincodeStrategy = PINCODE_STRATEGY[profile.primaryChannel];

  steps.push(
    {
      id: "logistics-selection",
      title: "Choose your logistics partner",
      why: "Wrong logistics = high RTO reverse charges and late dispatch penalties that trigger account suspension.",
      how: logisticsStepsForChannel(profile.primaryChannel),
      trap: "Choosing courier on forward price alone ignores RTO reverse charges that can exceed shipping revenue.",
    },
    {
      id: "protect-your-account",
      title: "Protect your seller account from suspension",
      why: `${channelLabel(profile.primaryChannel)} suspends accounts for metrics, not bad luck. Know the triggers before your first order.`,
      how: [
        "Late dispatch rate: ship within SLA or update inventory to avoid cancellations.",
        "Cancellation rate: never cancel customer orders - pause listing instead.",
        "IP complaints: no counterfeit keywords, no copied brand images.",
        "Return abuse: respond to buyer messages within 24h.",
        accountHealthLine(profile.primaryChannel),
      ],
      trap: "Three late dispatches in a week can trigger listing suppression on Amazon/Flipkart.",
    },
    {
      id: "shipping-sla-targets",
      title: "Hit channel dispatch SLAs",
      why: "Dispatch SLA breaches are a top suspension trigger for new sellers.",
      how: shippingSlaForChannel(profile.primaryChannel),
      trap: "Promising 1-day dispatch when supplier needs 3 days = guaranteed SLA breach.",
    },
    {
      id: "invoice-compliance",
      title: "GST invoice compliance on every order",
      why: "Marketplaces audit invoices during disputes and GST scrutiny.",
      how: [
        "Every invoice: GSTIN, HSN, buyer state code, taxable value, GST rate.",
        "Invoice number series must be sequential - no gaps.",
        "B2C invoices under ₹200 can be consolidated daily on some channels - check channel rules.",
        isMarketplaceChannel
          ? `On ${channel} the buyer invoice prints with the shipping label, generated from your listing's GST rate + HSN - so listing-time accuracy IS invoice compliance. Download copies from the panel's orders/reports section for your records.`
          : "Shopify does not produce GST-compliant invoices by default - use an invoicing app or your accounting tool, and keep the invoice number series sequential.",
      ],
      trap: "Missing HSN on invoice blocks input credit claims and triggers buyer disputes.",
    },
    {
      id: "brand-ip-checklist",
      title: "Brand & IP checklist before listing",
      why: "IP complaints are the fastest path to account suspension - even for unintentional violations.",
      how: [
        "No brand names in title unless you have authorization letter.",
        "Use your own product photos - never copy competitor listing images.",
        "Check trademark on ipindia.gov.in for brand-heavy categories.",
        "Keep supplier authorization on file for branded goods.",
      ],
      trap: "Using 'Nike-style' or 'Apple-like' in title triggers automated IP bots.",
    },
    {
      id: "paos-appeal",
      title: "If your account is ever suspended",
      why: "Suspension is rare if you follow the steps above - but if it happens, speed and structure beat panic.",
      how: [
        "Don't send a generic apology - that gets rejected. You need a Plan of Action (POA) naming the root cause and the fixes you've already made.",
        "Open the Crisis playbook in this app (Crisis in the sidebar) - it has the full POA editor and appeal protocol ready to fill in, so you don't write it from scratch under pressure.",
        "Keep your appeal pack ready now (GST certificate, bank proof, return policy, sample invoices) - assembling it calmly today beats scrambling on suspension day.",
      ],
      trap: "Submitting a POA without actually fixing the root cause leads to permanent suspension on a second offense.",
    },
    {
      id: "prepaid-incentive-tactics",
      title: prepaidPush.title,
      why: prepaidPush.why,
      how: prepaidPush.how,
      trap: prepaidPush.trap,
    },
    {
      id: "pincode-blacklist-strategy",
      title: pincodeStrategy.title,
      why: pincodeStrategy.why,
      how: pincodeStrategy.how,
      trap: pincodeStrategy.trap,
    },
  );

  // Courier choice and a pincode pilot are own-store powers - on marketplaces
  // the platform assigns logistics and controls serviceability, so these only
  // apply to Shopify. (They also need stock in hand, which is why they moved
  // here from supplier sourcing.)
  if (profile.primaryChannel === "shopify") {
    steps.push(
      {
        id: "courier-benchmark",
        title: "Courier benchmarking checklist",
        why: "On your own store you pick the courier - and the same product on a different courier means different RTO cost and remittance speed. Benchmark before you commit volume.",
        how: [
          "Pick your top 2 courier aggregators (e.g. Shiprocket vs Delhivery).",
          "Test the same pincode pair: your home state -> one metro pincode.",
          "Compare: forward rate, RTO reverse charge, COD remittance days, and pickup SLA (the promised pickup window).",
          "Run about 5 test shipments each before scaling.",
          "Use the copy-paste benchmark template in this step.",
        ],
        trap: "Choosing a courier on forward price alone ignores RTO reverse charges that can exceed the forward shipping.",
      },
      {
        id: "pincode-pilot",
        title: "Plan your pincode pilot",
        why: "Don't ship all-India on day 1. On your own store you control serviceability, so run 50-100 orders in a few controlled pincodes before scaling ads nationally.",
        how: ["Set 3 pilot pincodes, an RTO cutoff %, and a pre-flight checklist."],
        kind: "simulator",
        simulator: { kind: "pincode_pilot" },
      },
    );
  }

  steps.push({
    id: "launch-checklist",
    title: "Launch readiness checklist",
    why: "One missed item can block payouts or cause listing suppression after you start getting orders.",
    how: [
      profile.primaryChannel === "shopify"
        ? "Store live with policies, contact page, and a working COD checkout you've tested yourself."
        : `Account fully verified in ${panel} - dashboard open, not pending KYC.`,
      "Bank account linked and payout tested.",
      "GST configured with correct HSN mapping.",
      "At least 1 listing live with complete images and description (add more only after first orders validate demand).",
      "Return/refund policy set.",
      "Supplier confirmed ready to dispatch within promised timeline.",
      "Customer support channel ready (WhatsApp Business or email).",
    ],
    mentorNote: "You're live when you can receive an order and fulfill it without panic. That's the real milestone.",
  });

  return {
    id: "channel-launch",
    title: `Launch on ${channel}, step by step`,
    intro: `We'll get your ${channel} seller account approved and your first listings live - avoiding the KYC rejections that delay most beginners by weeks.`,
    steps,
  };
}
