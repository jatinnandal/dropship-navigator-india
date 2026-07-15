import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import {
  identityDocsForBusiness,
  needsDsc,
  stateLabel,
} from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

function panelLabel(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Amazon Seller Central";
    case "flipkart":
      return "Flipkart Seller Hub";
    case "shopify":
      return "your Shopify admin";
    default:
      return "the Meesho Supplier Panel";
  }
}

/** Where the seller's bank account gets entered on their chosen channel - so the
 * proof they prepare now is scanned once and reused there. */
function bankPanelPath(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "This exact account is what you'll enter later in Seller Central -> Settings (gear icon) -> Account Info -> Payment Information -> Deposit Methods. Amazon pays only into the account entered there.";
    case "flipkart":
      return "This exact account is what you'll enter later in Flipkart Seller Hub (seller.flipkart.com) -> your profile icon -> Manage Profile -> Bank Details. Payouts go only to the account verified there.";
    case "shopify":
      return "Shopify itself never pays you - your payment gateway (Razorpay/Cashfree) does. This exact account goes into the gateway's dashboard during its KYC, and the holder name must match your legal name there too.";
    default:
      return "This exact account is what you'll enter later in the Meesho Supplier Panel (supplier.meesho.com) -> Settings -> Bank Details. Meesho settles payouts only to the account verified there.";
  }
}

/** Where the pickup/dispatch address lives on the seller's chosen channel. */
function pickupAddressPath(channel: OnboardingProfile["primaryChannel"]): string {
  switch (channel) {
    case "amazon":
      return "Your ship-from address will live in Seller Central -> Settings (gear icon) -> Shipping Settings. Set it in the GSTIN's state when you onboard - Amazon checks the two against each other.";
    case "flipkart":
      return "Your pickup address will live in Flipkart Seller Hub under your profile icon -> Manage Profile. Set it in the GSTIN's state when you onboard - Flipkart rejects a state mismatch automatically.";
    case "shopify":
      return "Your fulfilment address will live in your Shopify admin under Settings -> Locations. Your courier picks up there, and for clean GST invoicing it should sit in your GSTIN's state.";
    default:
      return "Your pickup address will live in the Meesho Supplier Panel (supplier.meesho.com) under Settings. Set it in the GSTIN's state when you onboard - Meesho checks it against your GSTIN's state code.";
  }
}

/** Channel-exact GST/tax setup inside the seller panel - never "open your seller panel". */
function gstTaxPanelSteps(channel: OnboardingProfile["primaryChannel"]): string[] {
  switch (channel) {
    case "amazon":
      return [
        "Log in at sellercentral.amazon.in, click the Settings gear (top right) -> Account Info, and open the tax information section. Enter your GSTIN with no spaces and save.",
        "Still under Settings, open Tax Settings and set the default Product Tax Code (PTC) matching your main category's GST rate - listings without their own code fall back to this default, so get it right.",
        "Enter the correct HSN code on every listing as you create it. When Amazon generates tax invoices on your behalf (FBA and Easy Ship do; pure self-ship sellers print their own), the HSN drives the tax - wrong code means wrong tax on every order.",
        "Proceed when Account Info shows your GSTIN accepted. If a freshly issued GSTIN keeps failing, wait 24-72h for government data to sync and re-check it on https://www.gst.gov.in (Search Taxpayer) before contacting Seller Support.",
      ];
    case "flipkart":
      return [
        "Log in at seller.flipkart.com, click your profile icon (top right) -> Manage Profile, and open Business Details. Enter your GSTIN with no spaces and save.",
        "Flipkart validates the GSTIN against government records automatically - the field shows as verified once it matches.",
        "Enter the correct HSN code on each listing while creating it - Flipkart applies the GST rate from the HSN you pick.",
        "Proceed when Business Details accepts the GSTIN AND your pickup address state matches the GSTIN state code. A fresh GSTIN can take 24-72h to sync - wait and retry, don't re-register.",
      ];
    case "shopify":
      return [
        "In your Shopify admin (yourstore.myshopify.com/admin) open Settings -> Taxes and duties -> India and add your GST registration.",
        "Shopify does not map HSN codes or file GST for you - keep an HSN-to-GST-rate sheet for your products and apply it on every invoice.",
        "If you use an invoicing app from the Shopify App Store, enter your GSTIN and HSN codes there too - the invoice, not the storefront, is the legal document.",
        "Proceed when a test order generates an invoice showing your GSTIN, the HSN, and the correct GST rate. If it doesn't, fix the tax settings before taking real orders.",
      ];
    default:
      return [
        "Log in at supplier.meesho.com, open Settings from the menu, and find the business/GST details section. Enter your GSTIN with no spaces and save.",
        "Meesho checks the GSTIN against government records - it must show Active on https://www.gst.gov.in (Search Taxpayer -> Search by GSTIN/UIN) or the panel rejects it.",
        "Enter the correct HSN code on each catalog you upload - Meesho uses it for the GST rate on your order invoices.",
        "Proceed when the panel accepts the GSTIN without error. A fresh GSTIN can take 24-72h to sync - wait and retry, never create a second account.",
      ];
  }
}

function addressProofStep(premises: string, profile: OnboardingProfile): TaskStep {
  const base = {
    id: "gather-address",
    title: "Prepare the RIGHT address proof for your situation",
  };

  if (premises === "rented") {
    return {
      ...base,
      why: "Rented premises need extra documents. Missing the owner NOC is one of the most common clarification triggers.",
      needs: [
        "Rent/lease agreement (signed)",
        "Owner's NOC / consent letter (signed)",
        "Owner's ID proof",
        "A recent utility bill (electricity/water) for the address",
      ],
      how: [
        "Collect the signed rent agreement - every page, not just the first.",
        "Get the NOC from the owner: a short signed letter naming the owner, you/your business, the full address, and a line permitting business use and GST registration there, with signature and date.",
        "Attach the owner's ID and a recent utility bill for the same address - if your latest paper bill is old, download a fresh bill PDF from the electricity provider's website or app.",
        "Read the address on the agreement, the NOC, and the bill side by side - all three must be word-for-word what you will type under Principal Place of Business in Part B of the GST form, down to Rd vs Road.",
        "Scan each as a clear colour PDF. The Part B upload screen states its own file-size limit - compress to fit, never crop corners off.",
      ],
      trap: `Note: GST accepts a rent agreement, but later Amazon often wants a utility bill under 60 days as primary proof. Keep both ready for ${stateLabel(profile.operatingState)}.`,
      mentorNote:
        "Treat address proof like a puzzle - every document must show the same address, spelled the same way.",
    };
  }

  if (premises === "family") {
    return {
      ...base,
      why: "If the place is in a family member's name, the officer needs proof you are allowed to use it.",
      needs: [
        "Consent letter from the owner (family member)",
        "Owner's ID proof",
        "Recent utility bill in the owner's name",
      ],
      how: [
        "Get a signed consent letter from the owner: their name, your name, the full address, and a line permitting business use and GST registration there, signed and dated.",
        "Attach the owner's ID proof and a recent utility bill in the owner's name - download a fresh bill PDF from the provider's website or app if the paper one is old.",
        "Check the address on the letter, the ID, and the bill against what you will type under Principal Place of Business in Part B - identical spelling, including abbreviations like Rd vs Road.",
        "Scan as clear colour PDFs. The Part B upload screen states its file-size limit - compress to fit rather than cropping.",
      ],
      trap: "An electricity bill not in your name without a consent letter is a guaranteed clarification notice.",
    };
  }

  if (premises === "shared") {
    return {
      ...base,
      why: "Shared/coworking/virtual offices are accepted but need the right paperwork or they look unverifiable.",
      needs: [
        "Agreement with the shared-office provider",
        "NOC/consent from the provider",
        "Provider's utility bill or ownership proof",
      ],
      how: [
        "Ask the provider in writing BEFORE paying: 'Do you support GST registration at this address, and do you issue an NOC and address proof for it?' Providers that do this routinely include the documents in a GST/compliance plan.",
        "Collect the workspace agreement plus a signed NOC from the provider naming you/your business and the full address including unit or desk number.",
        "Attach the provider's ownership proof or utility bill for the address - ask their support desk if it's not in your welcome pack.",
        "Match the address text across agreement, NOC, and proof with what you'll type under Principal Place of Business - providers often write unit/floor numbers differently on different documents.",
      ],
      trap: "Some virtual-office addresses are flagged. Confirm the provider supports GST registration before relying on it.",
    };
  }

  return {
    ...base,
    why: "Owned premises are the simplest case, but the proof must be recent and match your name and address exactly.",
    needs: [
      "Latest electricity bill OR property tax receipt OR municipal khata",
      "Document should clearly show the full address",
    ],
    how: [
      "Pick one recent ownership proof: latest electricity bill, property tax receipt, or municipal khata. A fresh bill PDF downloaded from your electricity provider's website or app beats a photographed paper bill - it's dated, legible, and uncropped.",
      "Confirm the address text matches character for character what you will type under Principal Place of Business in Part B of the GST form.",
      "Scan or export in full colour with all four corners visible. The Part B upload screen states its file-size limit - compress to fit if needed.",
    ],
    trap: "An outdated or partially cropped bill is treated as invalid. Use a recent, full, legible copy.",
  };
}

function buildValidationTrack(profile: OnboardingProfile, workspace: Workspace): TaskStep[] {
  return [
    {
      id: "validate-status",
      title: "Confirm your GSTIN is actually ACTIVE",
      why: "Marketplaces reject onboarding instantly if your GSTIN is suspended, cancelled, or still syncing. Most beginners never check this first.",
      needs: ["Your 15-digit GSTIN"],
      how: [
        "Open https://www.gst.gov.in.",
        "Go to Search Taxpayer -> Search by GSTIN/UIN.",
        "Enter your GSTIN with NO spaces or dashes.",
        "Confirm Status shows Active and the legal/trade name is correct.",
      ],
      trap: "If you registered in the last 24-72 hours, marketplace verification can still fail because the government data has not synced yet. That is normal. Wait and retry rather than re-applying.",
      stuck: [
        "Status shows Suspended/Cancelled: you must resolve this on the GST portal before any marketplace will accept it.",
        "Name looks wrong: note the exact spelling shown here. Every other platform must match THIS, character for character.",
      ],
      kind: "input",
      input: {
        id: "gstin-input",
        label: "Your GSTIN (15 characters, no spaces)",
        placeholder: "27ABCDE1234F1Z5",
        workspaceKey: "gstin",
        hint: "We will reuse this on every marketplace form so you never re-type it.",
      },
    },
    {
      id: "validate-state-code",
      title: `Confirm your GSTIN state code matches ${stateLabel(profile.operatingState)}`,
      why: "Amazon/Flipkart/Meesho require your pickup/dispatch address to be in the same state as your GSTIN. A mismatch here is a very common silent rejection.",
      how: [
        `You told us you operate from ${stateLabel(profile.operatingState)}, so the first 2 digits of your GSTIN should be that state's code. Not sure of the code? The Search Taxpayer result on https://www.gst.gov.in shows your state jurisdiction on the same screen - that settles it.`,
        pickupAddressPath(profile.primaryChannel),
        "Both in the same state = proceed. If your real dispatch state and GSTIN state differ, stop here and fix it before onboarding - the marketplace check is automated and the rejection message rarely names the cause.",
      ],
      trap: `If you'll actually dispatch from a different state than ${stateLabel(profile.operatingState)}, you'd typically need a GSTIN for that state too - update your profile if your operating state has changed.`,
    },
    {
      id: "validate-name-match",
      title: "Make name + bank match your GSTIN exactly",
      why: "Automated verification fails on tiny differences. Rahul S. Sharma vs Rahul Sharma, or Street vs St., is enough to get rejected.",
      needs: ["Bank account proof (cancelled cheque or stamped statement)"],
      how: [
        "Open https://www.gst.gov.in -> Search Taxpayer -> Search by GSTIN/UIN and copy the Legal Name of Business exactly as shown there into a note - that string is your master record.",
        "Compare it with your bank account holder name read off a cancelled cheque or your netbanking profile page - character for character, including initials, dots, and spacing. Never compare from memory.",
        "Verify the IFSC by searching it on your bank's website or the RBI's IFSC directory - the code printed on an old cheque book can be stale after a bank merger.",
        "Exact match = proceed to marketplace onboarding. Any difference at all = stop and fix the bank name (or open a matching account) first - automated verification will not forgive it.",
      ],
      trap: "A savings account in your personal name while GST is in a business name is the most common mismatch. Fix the name or use a matching account before onboarding.",
      kind: "input",
      input: {
        id: "bank-name-input",
        label: "Bank account holder name (exact match with GST)",
        workspaceKey: "bankAccountName",
      },
      mentorNote: workspace.legalBusinessName
        ? `You told me your legal name is "${workspace.legalBusinessName}". Your bank name must match this exactly.`
        : "Lock your legal name first - then copy-paste it everywhere, never re-type.",
    },
    {
      id: "validate-marketplace-tax",
      title: `Set GST correctly inside ${panelLabel(profile.primaryChannel)}`,
      why: "Having a GSTIN is not enough. It must be entered in the seller panel and mapped to correct HSN/tax rates, or your listings can be blocked or mis-taxed.",
      how: gstTaxPanelSteps(profile.primaryChannel),
      trap: "Wrong HSN/GST rate causes compliance issues later even if onboarding succeeds. Get the mapping right at listing time, not after sales start. If a panel section has moved, search the panel's own help for 'GSTIN' rather than guessing.",
    },
    {
      id: "gst-filing-calendar",
      title: "Know your GST filing calendar (GSTR-1 + GSTR-3B)",
      why: "Missing filings suspends your GSTIN - and marketplaces block suspended GSTINs instantly. This is not optional after registration.",
      how: [
        "Monthly filers: GSTR-1 by 11th, GSTR-3B by 20th (next month).",
        "QRMP (turnover up to ₹5 crore): GSTR-1 and GSTR-3B quarterly, tax paid monthly via PMT-06 challan.",
        "Zero sales this period? You still MUST file - NIL returns are mandatory from month 1, or it's ₹20/day in late fees.",
        "Set phone reminders 3 days before each due date.",
        "Consequence chain: missed filing → GSTIN suspended → marketplace listing blocked.",
      ],
      trap: "Assuming your CA will remind you. YOU are liable - set your own calendar regardless of who files. And NIL months still need filings - new sellers get burned by this in their very first month.",
      tools: [
        {
          name: "ClearTax",
          whenToUse: "If you want guided GSTR-1/3B filing with marketplace import.",
          why: "Reduces manual errors - vendor-neutral option alongside any CA.",
          href: "https://cleartax.in",
        },
        {
          name: "Taxbuddy",
          whenToUse: "If you want affordable assisted filing for small sellers.",
          why: "Good for beginners who find the GST portal overwhelming.",
          href: "https://www.taxbuddy.com",
        },
      ],
      mentorNote: "Mark the sub-task 'GST filing calendar understood' on your journey when you've set reminders.",
    },
  ];
}

function buildRegistrationTrack(
  profile: OnboardingProfile,
  answers: Record<string, string>,
): TaskStep[] {
  const premises = answers.premises ?? "";
  const steps: TaskStep[] = [];

  steps.push({
    id: "premises",
    title: "Tell me about your business address",
    why: "Address proof is a leading reason GST applications get a clarification notice. The exact documents you need depend on who owns the place.",
    how: ["Pick the option that matches where you will run the business from."],
    question: {
      id: "premises",
      prompt: "Who owns the premises you will register?",
      options: [
        { value: "own", label: "I own it" },
        { value: "rented", label: "It is rented (landlord)" },
        { value: "family", label: "Owned by family / in someone else's name" },
        { value: "shared", label: "Shared / virtual / coworking" },
      ],
    },
  });

  steps.push({
    id: "confirm-applicability",
    title: "Confirm GST is actually required for you",
    why:
      profile.salesModel === "own_website_only"
        ? "You selected own-website-only. The usual turnover threshold can apply to you, but most sellers still register early for input credit and credibility."
        : "You selected a marketplace model. Under Section 24(ix), GST is mandatory from your first sale, with no turnover threshold.",
    how:
      profile.salesModel === "own_website_only"
        ? [
            "If you only sell on your own website, you may stay under the threshold initially.",
            "If you will ever sell on Amazon/Flipkart/Meesho, plan to register now.",
          ]
        : profile.primaryChannel === "meesho"
          ? [
              "Plan for a GSTIN - you'll need it to sell inter-state or scale.",
              "Meesho carve-out: intra-state selling under the threshold works with a free Enrolment ID while your GSTIN processes - the next step shows how.",
            ]
          : [
              "Accept that GSTIN is needed before listing on the marketplace.",
              "The only exception is if every product you sell is GST-exempt (rare).",
            ],
    trap: "Selling on a marketplace without a valid GSTIN can get your account suspended and TCS recovered. Do not list first and register later.",
    mentorNote:
      profile.primaryChannel === "meesho"
        ? "Most beginners think GST is optional under the turnover threshold (₹40L for goods, ₹20L in special-category states). On Amazon/Flipkart it is mandatory from day one regardless. Meesho has one legal carve-out - the Enrolment ID for intra-state sellers - covered in the next step."
        : "Most beginners think GST is optional under the turnover threshold (₹40L for goods, ₹20L in special-category states). On marketplaces it is mandatory from day one regardless - no exceptions.",
  });

  if (profile.primaryChannel === "meesho") {
    steps.push({
      id: "enrolment-id-fast-path",
      title: "Start selling on Meesho NOW with an Enrolment ID (no GSTIN wait)",
      why: "Meesho onboards non-GST sellers with a free Enrolment ID (intra-state only, under the turnover threshold) - you don't have to spend the 3-5 GSTIN-processing days doing nothing.",
      how: [
        "On https://www.gst.gov.in choose Registration → Generate User ID for Unregistered Applicant → e-commerce enrolment.",
        "Verify PAN + Aadhaar OTP and note the 15-digit Enrolment ID.",
        "Enter it in Meesho seller signup - you can list and sell within your own state immediately.",
        "Keep the GSTIN application below moving in parallel; switch to it before selling inter-state or crossing the threshold.",
      ],
      trap: "The Enrolment ID limits you to buyers in YOUR state, and Amazon/Flipkart do not accept it - this fast path is Meesho-specific.",
      mentorNote: "Do this today and list products this week instead of waiting for the GSTIN. Same-state buyers are enough to validate your first product.",
    });
  }

  steps.push({
    id: "lock-name",
    title: "Lock ONE exact legal name you will reuse everywhere",
    why: "Every platform later must match your GST name character for character. Decide it once, now, and never deviate.",
    how: [
      profile.businessType === "individual" || profile.businessType === "proprietorship"
        ? "You don't get to invent this name: for an individual/proprietor, the GST portal pulls your legal name straight from the PAN database. So your master name is the name printed on your PAN card - copy it from the card, character for character."
        : "You don't get to invent this name: it's the entity name on your Certificate of Incorporation or deed. Copy it from that document, character for character - including 'Private Limited' vs 'Pvt Ltd' exactly as printed.",
      "Use that same capitalization, spacing, and initials across bank, GST and marketplace - every later form must match it.",
      "Save it in a note you will copy-paste from, so you never re-type it.",
    ],
    trap: "Manually retyping the name on each platform is how mismatches happen. Copy-paste from one source of truth.",
    kind: "input",
    input: {
      id: "legal-name-input",
      label: "Your exact legal business name",
      placeholder: "e.g. Sharma Enterprises",
      workspaceKey: "legalBusinessName",
      hint: "This becomes your master record. Copy-paste from here on every form.",
    },
  });

  steps.push({
    id: "scan-quality",
    title: "Scan documents the right way (most rejections start here)",
    why: "Blurry phone photos in bad lighting are a top reason Meesho/Flipkart reject KYC in the first attempt - before anyone even reads your details.",
    how: [
      "Use a scanner app or good daylight - not a dark room photo.",
      "All four corners visible, no fingers, no glare.",
      "Full colour, not black-and-white.",
      "PDF for multi-page docs; JPEG under 2 MB for single pages.",
      "Name files clearly: PAN_John_Doe.pdf, Cancelled_Cheque.pdf.",
    ],
    trap: '"Sharma Textiles Pvt Ltd" on GST but "Sharma Textiles Private Limited" on bank fails even though they mean the same thing. Exact match only.',
    mentorNote: "Spend 10 extra minutes on scan quality now - it saves days of rejection loops later.",
  });

  steps.push({
    id: "mobile-check",
    title: "Use a fresh mobile number for seller accounts",
    why: "Using a number already linked to another seller account (even a deactivated one) triggers an instant security rejection on Meesho and Amazon.",
    how: [
      "Use a dedicated business mobile number you control long-term.",
      "Confirm DND is off - OTPs for GST and marketplace signup need to arrive.",
      "Never reuse a number from a previous failed seller attempt.",
    ],
    trap: "If OTP does not arrive, send START to 1909 to deactivate DND, then retry after 2 minutes.",
    question: {
      id: "mobile-fresh",
      prompt: "Is this mobile number already used on any seller account?",
      options: [
        { value: "no", label: "No - it is fresh / only for this business" },
        { value: "yes", label: "Yes - it was used before" },
      ],
    },
  });

  if (answers["mobile-fresh"] === "yes") {
    steps.push({
      id: "mobile-fix",
      title: "Get a new number before you apply",
      why: "Reusing a flagged number causes silent rejections with no clear error message. A new SIM costs ₹200 - much cheaper than weeks of frustration.",
      how: [
        "Get a new prepaid SIM in your name.",
        "Link it to Aadhaar for OTP services.",
        "Use ONLY this number for GST registration and all marketplace accounts.",
      ],
      trap: "Do not try to 'work around' a flagged number. Platforms track device + number + bank combinations.",
    });
  }

  steps.push({
    id: "gather-identity",
    title: "Gather your identity + constitution documents",
    why: `Your business type is "${profile.businessType}", which has a specific document set. Missing one of these triggers a clarification notice.`,
    needs: identityDocsForBusiness(profile),
    how: [
      "Scan each document as a clear, full-page colour scan (not a dark phone photo).",
      "Keep photos in JPEG under 100 KB; documents as clear PDF/JPEG.",
      "Name every file clearly so you can find it fast during the form.",
    ],
    trap: "Blurry, cropped, or black-and-white uploads are read as suspicious and get rejected. Full colour, all four corners visible.",
  });

  steps.push(addressProofStep(premises, profile));

  steps.push({
    id: "gather-bank",
    title: "Prepare bank proof in a matching name",
    why: "Bank name mismatch and wrong IFSC are top rejection causes at both GST and marketplace stages.",
    needs: ["Cancelled cheque OR bank statement/passbook first page showing name + IFSC"],
    how: [
      "Read the account holder name off the cancelled cheque or your netbanking profile page and compare with your locked legal name character for character - never from memory.",
      "Verify the IFSC by searching it on your bank's website or the RBI's IFSC directory - the code printed on an old cheque book can be stale after a bank merger.",
      "Prefer a current account in the business name; a stamped physical statement is trusted more for new sellers.",
      bankPanelPath(profile.primaryChannel),
    ],
    trap: "A personal savings account while GST is in a business name will fail later marketplace checks even if GST accepts it.",
    kind: "input",
    input: {
      id: "bank-name-reg",
      label: "Bank account holder name",
      workspaceKey: "bankAccountName",
    },
  });

  steps.push({
    id: "create-trn",
    title: "Create your TRN on the GST portal (Part A)",
    why: "This is the actual start of registration. Getting Part A clean avoids OTP and email headaches later.",
    needs: ["PAN", "Mobile number (Aadhaar-linked, DND off)", "Email you control"],
    how: [
      "Open https://www.gst.gov.in -> Services -> Registration -> New Registration.",
      "In the 'I am a' dropdown pick Taxpayer, then select your state and district, enter your legal name exactly as per PAN, then PAN, email and mobile.",
      "Enter the OTPs sent to mobile and email to generate your TRN (Temporary Reference Number).",
      "Note the TRN AND the expiry date the portal shows with it - Part B must be finished inside that window or the TRN lapses and you start over.",
      "To resume later: same New Registration page -> select the Temporary Reference Number option -> enter TRN + captcha -> a fresh OTP opens your saved application.",
    ],
    trap: "If your number has DND active, OTPs may not arrive. Send START to 1909 (or check DND) before this step.",
    stuck: [
      "OTP not arriving: check DND, network, and that the number is correct; use Resend after a minute.",
      "Email OTP missing: check spam; use an email you actually control long-term, not a temporary one.",
    ],
  });

  steps.push({
    id: "fill-partb",
    title: "Fill Part B: business details, place of business, goods",
    why: "Vague business activity or wrong HSN codes is a frequent clarification trigger.",
    needs: ["TRN login", "All documents from earlier steps", "Your main product HSN codes"],
    how: [
      "Log in with your TRN; your saved application appears under My Saved Applications - click the edit (pencil) icon to open Part B.",
      "Work through the tabs left to right - they include Business Details, Promoter/Partners, Authorized Signatory, Principal Place of Business, Goods and Services, State Specific Information, and finally Verification (the portal may show a few more depending on your answers). Save each tab before moving on - the portal marks a tab complete once saved.",
      "In Business Details enter trade name, constitution, and date of commencement of business.",
      "In Principal Place of Business type the address exactly as on the proof from your premises step, pick the correct nature of possession (owned/rented/consented/shared), and upload that proof - the upload screen states its own file-size limit.",
      "In Goods and Services describe what you actually sell and add the HSN codes for your main products. Not sure of a code? Use Services -> User Services -> Search HSN Code on the same portal.",
      "If the form asks for bank details, enter them exactly as on your proof. If it doesn't, the portal will demand them shortly after approval - same exact-match rule applies then.",
    ],
    trap: "Describe real goods with correct HSN. A vague description like general trading with mismatched HSN invites a REG-03 notice.",
  });

  steps.push({
    id: "aadhaar-auth",
    title: "Complete Aadhaar authentication",
    why: "Aadhaar e-KYC speeds approval and often avoids physical verification. Failed auth usually means slower, manual review.",
    how: [
      "Choose Aadhaar authentication for the promoter/authorized signatory when prompted in the application.",
      "The authentication link arrives by SMS/email on the Aadhaar-linked contact - open it, enter the Aadhaar number, and complete the OTP e-KYC there.",
      "Come back to the application and confirm the Aadhaar authentication status shows as authenticated before you submit - a pending status here means the link was never completed.",
    ],
    trap: "If the Aadhaar-linked mobile is wrong or unavailable, authentication fails and the officer may demand physical verification. Fix the linked mobile first if possible.",
  });

  steps.push({
    id: "submit",
    title: needsDsc(profile) ? "Submit with DSC (required for your entity)" : "Submit with EVC",
    why: needsDsc(profile)
      ? "Companies and LLPs must submit using a Digital Signature Certificate (DSC). Without it you cannot file."
      : "Proprietors/individuals can submit using EVC (OTP), which is simpler and faster.",
    how: needsDsc(profile)
      ? [
          "Install the DSC and the emSigner utility.",
          "Select the authorized signatory and sign the application with the DSC.",
          "Submit and note your ARN (Application Reference Number).",
        ]
      : [
          "Select Submit with EVC.",
          "Enter the OTP sent to the authorized signatory.",
          "Submit and note your ARN (Application Reference Number).",
        ],
    trap: needsDsc(profile)
      ? "DSC must belong to an authorized director/partner and be registered on the portal first. A mismatched DSC blocks submission."
      : "Save the ARN. You will use it to track status and to respond if a clarification notice arrives.",
  });

  steps.push({
    id: "track-arn",
    title: "Track your ARN and watch for a clarification notice",
    why: "An officer reviews within a few working days. If they want clarity, they issue REG-03. Most beginners miss it and get auto-rejected.",
    how: [
      "Go to https://www.gst.gov.in -> Services -> Registration -> Track Application Status, enter your ARN, and check it every day for the first week.",
      "'Pending for Processing' = your application is in the officer's queue. No action needed - keep checking.",
      "'Validation Error' = your PAN/Aadhaar data didn't match government records. Reopen the application and fix the exact field the error names.",
      "'Pending for Clarification' = a REG-03 notice has been issued. Act the same day - the next step shows exactly how to reply.",
      "'Approved' = your GSTIN plus first-time login credentials arrive on your registered email. Move to the certificate step.",
      "'Rejected' = a REG-05 order was passed. Read the order for the stated reason - you can apply fresh once the actual issue is fixed, but never resubmit the identical application.",
    ],
    trap: "A REG-03 clarification is NOT a rejection. But you only get 7 working days to reply via REG-04, or it auto-rejects (REG-05).",
  });

  steps.push({
    id: "handle-reg03",
    title: "If you get REG-03, reply correctly via REG-04",
    why: "This is the moment that decides approval. A clean, specific reply within the deadline usually gets you approved.",
    how: [
      "Open Services -> Registration -> Application for Filing Clarifications.",
      "Enter the notice Reference No. or your ARN.",
      "Answer each query directly and upload corrected/clear documents (fix the exact issue raised).",
      "Submit with EVC/DSC before the 7-working-day deadline.",
    ],
    trap: "Common REG-03 causes: blurry proof, address mismatch, missing owner NOC/consent, name mismatch, vague activity/HSN. Fix the specific cause, do not just resubmit the same file.",
    stuck: [
      "Not sure what they want: re-read the notice line; it names the exact document/field.",
      "Address query: re-upload a clear bill + agreement + signed NOC that all show the same address.",
    ],
  });

  steps.push({
    id: "receive-gstin",
    title: "Get your GSTIN and prepare for marketplace sync",
    why: "Approval gives you a GSTIN, but marketplaces may still not see it for 24-72 hours.",
    how: [
      "Check the email on your application: approval brings your GSTIN plus a temporary username/password for your first https://www.gst.gov.in login. Log in and set your own credentials.",
      "Download the certificate: Services -> User Services -> View/Download Certificates -> REG-06. Save the PDF with all annexures into your Seller-Docs/GST folder.",
      "Re-confirm the legal name and address printed on the certificate - this is now your master record for every marketplace form.",
      "When you enter the GSTIN on a marketplace and verification fails, wait 24-72h and retry before panicking - marketplace databases lag the GST portal for fresh registrations.",
    ],
    trap: "Enter the GSTIN with no spaces or special characters on every platform. Match your seller pickup state to the GSTIN state code.",
    kind: "input",
    input: {
      id: "gstin-received",
      label: "Your new GSTIN (save it here for reuse)",
      placeholder: "15 characters, no spaces",
      workspaceKey: "gstin",
    },
    tools: [
      {
        name: "ClearTax",
        whenToUse: "If you want assisted GST registration with filing support.",
        why: "Handles REG-03 responses and ongoing GSTR filing - good if compliance feels overwhelming.",
        href: "https://cleartax.in",
      },
      {
        name: "TheGSTCo",
        whenToUse: "If you want marketplace-focused GST setup help.",
        why: "Specializes in seller onboarding tax configuration, not just registration.",
        href: "https://thegstco.com",
      },
    ],
  });

  steps.push({
    id: "gst-filing-calendar",
    title: "Set up your post-registration filing calendar",
    why: "Your GSTIN is only useful if you keep it active. Filings start the month after registration.",
    how: [
      "Mark GSTR-1 and GSTR-3B due dates on your phone calendar with reminders 3 days before each.",
      "Turnover under ₹5 crore? You can opt into QRMP for quarterly returns: https://www.gst.gov.in -> Services -> Returns -> Opt-in for Quarterly Return. Fewer filings, but tax is still paid monthly.",
      "Zero sales in a period changes nothing - NIL returns are still mandatory from month 1. File them.",
      "Plan who files: you, ClearTax, or a CA - but YOU stay liable regardless of who presses submit.",
    ],
    trap: "New sellers forget the first filing and get their GSTIN suspended for non-filing - before they even scale.",
  });

  return steps;
}

function buildBaseDocsSteps(profile: OnboardingProfile): TaskStep[] {
  return [
    {
      id: "master-folder",
      title: "Create your master document folder",
      why: "Every marketplace asks for the same documents. One organized folder means you never hunt for files during onboarding.",
      how: [
        "Create a folder on your phone/computer called Seller-Docs.",
        "Add subfolders: Identity, Address, Bank, GST, Product.",
        "Keep one master profile sheet with legal name, address, mobile, email, PAN, GSTIN.",
      ],
      trap: "Uploading different versions of the same document to different platforms causes mismatches. One folder, one source of truth.",
      mentorNote: "Think of this folder as your business passport. Every platform will ask to see it.",
    },
    {
      id: "business-type-docs",
      title: `Prepare documents for ${profile.businessType}`,
      why: "Your business type determines which constitution documents marketplaces require.",
      needs: identityDocsForBusiness(profile),
      how: [
        "Collect every document listed above.",
        "Scan in full colour with all corners visible.",
        "Verify names match across every document.",
      ],
      trap: "Starting as proprietorship but using a company PAN causes instant rejection.",
    },
    {
      id: "bank-setup",
      title: "Open or verify your business bank account",
      why: "Marketplaces pay you via NEFT to this account. Name mismatch is the most common payout failure.",
      how: [
        "Open a current account in your exact legal business name - or read your existing account's holder name off netbanking/a cancelled cheque and confirm it matches character for character.",
        "Get a cancelled cheque or stamped bank statement showing name + IFSC; scan it once, clearly, into your Seller-Docs/Bank folder.",
        "Confirm IFSC is current by searching it on your bank's website or the RBI's IFSC directory - bank mergers changed many codes in 2024-25.",
        bankPanelPath(profile.primaryChannel),
      ],
      trap: "Using a personal savings account while GST is in a business name blocks marketplace payout setup.",
      kind: "input",
      input: {
        id: "bank-name-base",
        label: "Bank account holder name",
        workspaceKey: "bankAccountName",
      },
    },
  ];
}

export function buildDocumentationTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task {
  // Route straight from the profile - no need to re-ask what onboarding captured.
  // To change GST status, the seller edits their profile (single source of truth).
  const hasGstin = profile.hasGstin;

  const baseSteps = buildBaseDocsSteps(profile);
  const gstSteps = hasGstin
    ? buildValidationTrack(profile, workspace)
    : buildRegistrationTrack(profile, answers);

  const intro = hasGstin
    ? "You already have a GSTIN, so we'll skip registration - organize your base documents and validate your GSTIN for marketplace readiness."
    : "We'll get your business documents and GST registration done step by step - avoiding the mistakes that cause 3+ rejections.";

  return {
    id: "common-documentation",
    title: "Business docs + GST, done with you",
    intro,
    steps: [...baseSteps, ...gstSteps],
  };
}
