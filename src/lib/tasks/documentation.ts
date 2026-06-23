import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import {
  identityDocsForBusiness,
  needsDsc,
  stateLabel,
} from "@/lib/tasks/shared";
import type { Task, TaskStep } from "@/lib/tasks/types";

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
        "Collect the signed rent agreement.",
        "Get a signed NOC/consent letter from the owner allowing business use.",
        "Attach the owner's ID and a recent utility bill that shows the same address.",
        "Make sure the address text is identical across all of them.",
      ],
      trap: `Note: GST accepts a rent agreement, but later Amazon often wants a utility bill under 60 days as primary proof. Keep both ready for ${stateLabel(profile.operatingState)}.`,
      mentorNote:
        "Treat address proof like a puzzle — every document must show the same address, spelled the same way.",
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
        "Get a signed consent letter from the owner.",
        "Attach the owner's ID and a recent utility bill for the address.",
        "Keep the address spelling identical across documents and the form.",
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
        "Get the workspace agreement plus a signed NOC from the provider.",
        "Attach the provider's ownership/utility proof for the address.",
        "Confirm the provider allows GST registration at that address.",
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
      "Pick one recent ownership proof (electricity bill/property tax/khata).",
      "Confirm the address text matches what you will type in the form.",
      "Scan it clearly in full colour.",
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
        "Open gst.gov.in.",
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
      title: "Check your GSTIN state code matches your pickup state",
      why: "Amazon/Flipkart/Meesho require your pickup/dispatch address to be in the same state as your GSTIN. A mismatch here is a very common silent rejection.",
      how: [
        `The first 2 digits of your GSTIN are your state code. Confirm they represent ${stateLabel(profile.operatingState)}.`,
        "Make sure the pickup address you plan to use on the marketplace is in that same state.",
      ],
      trap: "If you operate from a different state than your GSTIN, you typically need a GSTIN for that state too. Do not enter an out-of-state pickup address.",
      kind: "input",
      input: {
        id: "pickup-state-input",
        label: "Pickup / dispatch state (must match GSTIN state code)",
        placeholder: profile.operatingState,
        workspaceKey: "pickupState",
      },
    },
    {
      id: "validate-name-match",
      title: "Make name + bank match your GSTIN exactly",
      why: "Automated verification fails on tiny differences. Rahul S. Sharma vs Rahul Sharma, or Street vs St., is enough to get rejected.",
      needs: ["Bank account proof (cancelled cheque or stamped statement)"],
      how: [
        "Write down the legal/trade name exactly as on the GST portal.",
        "Confirm your bank account holder name matches it character for character.",
        "Confirm IFSC is current (bank mergers change IFSC codes).",
      ],
      trap: "A savings account in your personal name while GST is in a business name is the #1 mismatch. Fix the name or use a matching account before onboarding.",
      kind: "input",
      input: {
        id: "bank-name-input",
        label: "Bank account holder name (exact match with GST)",
        workspaceKey: "bankAccountName",
      },
      mentorNote: workspace.legalBusinessName
        ? `You told me your legal name is "${workspace.legalBusinessName}". Your bank name must match this exactly.`
        : "Lock your legal name first — then copy-paste it everywhere, never re-type.",
    },
    {
      id: "validate-marketplace-tax",
      title: "Set GST correctly inside each marketplace",
      why: "Having a GSTIN is not enough. It must be entered in the seller panel and mapped to correct HSN/tax rates, or your listings can be blocked or mis-taxed.",
      how: [
        "In each seller panel, open the GST/Tax section and enter your GSTIN (no spaces).",
        "Map each product to the correct HSN code and GST rate.",
        "Save and confirm the panel shows GST as verified.",
      ],
      trap: "Wrong HSN/GST rate causes compliance issues later even if onboarding succeeds. Get the mapping right at listing time, not after sales start.",
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
    why: "Address proof is the single biggest reason GST applications get a clarification notice. The exact documents you need depend on who owns the place.",
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
        : [
            "Accept that GSTIN is needed before listing on the marketplace.",
            "The only exception is if every product you sell is GST-exempt (rare).",
          ],
    trap: "Selling on a marketplace without a valid GSTIN can get your account suspended and TCS recovered. Do not list first and register later.",
    mentorNote:
      "Most beginners think GST is optional under ₹20L turnover. On marketplaces, it is mandatory from day one — no exceptions.",
  });

  steps.push({
    id: "lock-name",
    title: "Lock ONE exact legal name you will reuse everywhere",
    why: "Every platform later must match your GST name character for character. Decide it once, now, and never deviate.",
    how: [
      "Write your business/legal name in the EXACT format you will use forever.",
      "Use the same capitalization, spacing, and initials across PAN, bank, GST and marketplace.",
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
    why: "Blurry phone photos in bad lighting are the #1 reason Meesho/Flipkart reject KYC in the first attempt — before anyone even reads your details.",
    how: [
      "Use a scanner app or good daylight — not a dark room photo.",
      "All four corners visible, no fingers, no glare.",
      "Full colour, not black-and-white.",
      "PDF for multi-page docs; JPEG under 2 MB for single pages.",
      "Name files clearly: PAN_John_Doe.pdf, Cancelled_Cheque.pdf.",
    ],
    trap: '"Sharma Textiles Pvt Ltd" on GST but "Sharma Textiles Private Limited" on bank fails even though they mean the same thing. Exact match only.',
    mentorNote: "Spend 10 extra minutes on scan quality now — it saves days of rejection loops later.",
  });

  steps.push({
    id: "mobile-check",
    title: "Use a fresh mobile number for seller accounts",
    why: "Using a number already linked to another seller account (even a deactivated one) triggers an instant security rejection on Meesho and Amazon.",
    how: [
      "Use a dedicated business mobile number you control long-term.",
      "Confirm DND is off — OTPs for GST and marketplace signup need to arrive.",
      "Never reuse a number from a previous failed seller attempt.",
    ],
    trap: "If OTP does not arrive, send START to 1909 to deactivate DND, then retry after 2 minutes.",
    question: {
      id: "mobile-fresh",
      prompt: "Is this mobile number already used on any seller account?",
      options: [
        { value: "no", label: "No — it is fresh / only for this business" },
        { value: "yes", label: "Yes — it was used before" },
      ],
    },
  });

  if (answers["mobile-fresh"] === "yes") {
    steps.push({
      id: "mobile-fix",
      title: "Get a new number before you apply",
      why: "Reusing a flagged number causes silent rejections with no clear error message. A new SIM costs ₹200 — much cheaper than weeks of frustration.",
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
      "Confirm the account holder name matches your locked legal name.",
      "Confirm the IFSC is current (recent bank mergers changed many IFSC codes).",
      "Prefer a current account in the business name; a stamped physical statement is trusted more for new sellers.",
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
      "Open gst.gov.in -> Services -> Registration -> New Registration.",
      "Select taxpayer type, your state, PAN, email and mobile.",
      "Enter the OTPs sent to mobile and email to generate your TRN (Temporary Reference Number).",
      "Save the TRN safely; you will log back in with it to finish Part B.",
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
      "Log in with your TRN and continue the saved application.",
      "Enter trade name, constitution, and date of commencement.",
      "Add Principal Place of Business with the matching address proof from your premises step.",
      "Clearly describe what you sell and add correct HSN codes for your products.",
      "Add bank details exactly as on your proof.",
    ],
    trap: "Describe real goods with correct HSN. A vague description like general trading with mismatched HSN invites a REG-03 notice.",
  });

  steps.push({
    id: "aadhaar-auth",
    title: "Complete Aadhaar authentication",
    why: "Aadhaar e-KYC speeds approval and often avoids physical verification. Failed auth usually means slower, manual review.",
    how: [
      "Choose Aadhaar authentication for the promoter/authorized signatory when prompted.",
      "Open the authentication link sent to the Aadhaar-linked mobile/email and complete OTP e-KYC.",
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
      "Go to gst.gov.in -> Services -> Track Application Status and enter your ARN.",
      "Check this every day for the first week.",
      "If status becomes Pending for Clarification, act immediately (next step).",
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
      "Download your GST certificate (REG-06), including all annexures.",
      "Re-confirm the legal name and address on the certificate; this is now your master record.",
      "When you enter it on a marketplace and it fails, wait 24-72h and retry before panicking.",
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
        why: "Handles REG-03 responses and ongoing GSTR filing — good if compliance feels overwhelming.",
      },
      {
        name: "TheGSTCo",
        whenToUse: "If you want marketplace-focused GST setup help.",
        why: "Specializes in seller onboarding tax configuration, not just registration.",
      },
    ],
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
      why: "Marketplaces pay you via NEFT to this account. Name mismatch is the #1 payout failure.",
      how: [
        "Open a current account in your exact legal business name (or verify existing one matches).",
        "Get a cancelled cheque or stamped bank statement showing name + IFSC.",
        "Confirm IFSC is current — bank mergers changed many codes in 2024-25.",
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
  const hasGstin = answers.hasGstin ?? (profile.hasGstin ? "yes" : "no");

  const decisionStep: TaskStep = {
    id: "have-gstin",
    title: "First, where do you stand with GST?",
    why: "Your path is completely different if you already have a GSTIN. Let me route you correctly instead of wasting your time.",
    how: ["Pick the option that matches your current situation."],
    question: {
      id: "hasGstin",
      prompt: "Do you already have a valid GSTIN?",
      options: [
        { value: "no", label: "No, I need to register" },
        { value: "yes", label: "Yes, I already have one" },
      ],
    },
    mentorNote:
      "Don't worry — most beginners start here. I'll tell you exactly what to do based on your answer.",
  };

  const baseSteps = buildBaseDocsSteps(profile);
  const gstSteps =
    hasGstin === "yes"
      ? buildValidationTrack(profile, workspace)
      : buildRegistrationTrack(profile, answers);

  const intro =
    hasGstin === "yes"
      ? "We'll organize your base documents and validate your existing GSTIN for marketplace readiness."
      : "We'll get your business documents and GST registration done step by step — avoiding the mistakes that cause 3+ rejections.";

  return {
    id: "common-documentation",
    title: "Business docs + GST, done with you",
    intro,
    steps: [decisionStep, ...baseSteps, ...gstSteps],
  };
}

/** @deprecated Use buildDocumentationTask via buildTask registry */
export function buildGstRegistrationTask(
  profile: OnboardingProfile,
  answers: Record<string, string>,
): Task {
  const task = buildDocumentationTask(profile, answers, {});
  return { ...task, id: "gst-registration", title: "GST registration, done with you" };
}
