import type { CrisisProtocol, CrisisType } from "@/lib/crisis/types";

export const CRISIS_PROTOCOLS: Record<CrisisType, CrisisProtocol> = {
  account_suspended: {
    type: "account_suspended",
    label: "Account suspended",
    steps: [
      {
        title: "Don't argue in the first ticket",
        body: "Marketplace bots flag emotional replies. Open one case, state facts only, and wait 24 hours before escalating. Arguing in tickets often extends suspensions by weeks.",
        timerLabel: "Wait at least 24h before follow-up",
      },
      {
        title: "Find the trigger metric",
        body: "Check Seller Central / Seller Hub for dispatch rate, late shipment rate, IP complaints, or policy violations. Most suspensions cite one metric - you need the exact number before writing an appeal.",
        actionHref: "/app/tasks/channel-launch",
        actionLabel: "Open account protection guide",
      },
      {
        title: "Write your Plan of Action",
        body: "Use the editor below - pre-filled with your business details. Be specific about root cause, fixes already done, and prevention. Generic POAs get rejected.",
        templateId: "paos",
      },
      {
        title: "Submit appeal with evidence",
        body: "Attach: GST certificate, bank proof, dispatch logs (last 30 days), updated listing screenshots, and supplier SLA if relevant. Submit once - duplicate appeals reset the queue.",
      },
      {
        title: "Follow-up cadence",
        body: "Day 3: polite status check referencing ticket ID. Day 7: escalate with new evidence if no response. Day 14: formal grievance letter. Do not open parallel tickets on the same issue.",
        timerLabel: "Day 3 · Day 7 · Day 14",
      },
    ],
  },
  supplier_oos: {
    type: "supplier_oos",
    label: "Supplier out of stock",
    steps: [
      {
        title: "Within 1 hour - pause listings",
        body: "Do NOT cancel customer orders. Pause or deactivate affected SKUs on every channel. Cancelling damages account metrics; pausing stops new orders while you assess.",
        timerLabel: "Do this first - within 1 hour",
      },
      {
        title: "Within 2 hours - get ETA in writing",
        body: "WhatsApp or email your supplier. You need a written ETA and restock date - verbal promises won't help in marketplace disputes.",
        templateId: "supplier_eta",
      },
      {
        title: "Within 4 hours - hold unshipped orders",
        body: "If ETA is more than 72 hours, contact your courier to hold unshipped parcels. Prevents RTO charges on orders you can't fulfil.",
        timerLabel: "Only if ETA exceeds 72 hours",
      },
      {
        title: "Within 24 hours - message customers",
        body: "Proactive WhatsApp to buyers with pending orders. Honest delay messages reduce cancellations and bad reviews compared to silence.",
        templateId: "customer_whatsapp",
      },
    ],
  },
  payment_hold: {
    type: "payment_hold",
    label: "Payout held / not received",
    steps: [
      {
        title: "Confirm it's actually a hold",
        body: "Check the settlement cycle first: Amazon pays 14-21 days from purchase, Flipkart 7-15 by tier, Meesho ~7 days after delivery. Money inside that window isn't held - it's in transit. Run a payout reconciliation to see exactly what's pending versus deducted.",
        actionHref: "/app/tools/payout-reconciliation",
        actionLabel: "Reconcile latest settlement",
      },
      {
        title: "Find the hold reason in the dashboard",
        body: "Payments → Statements/Transactions. Common causes: bank re-verification pending (name mismatch), negative balance from returns, account-level review, or a single disputed order freezing the cycle. Screenshot everything - dates matter for escalation.",
        timerLabel: "Do this today",
      },
      {
        title: "Fix the fixable, ticket the rest",
        body: "Name-mismatch and re-verification holds clear in 2-4 days once you re-upload matching documents (bank proof must match GST legal name character-for-character). For everything else, open ONE ticket with the template below.",
        templateId: "settlement_ticket",
      },
      {
        title: "Escalate on a clock",
        body: "No response in 7 business days, or a template reply: send the formal grievance below to the marketplace's Grievance Officer (every Indian marketplace must name one under the Consumer Protection E-Commerce Rules). Reference your first ticket ID.",
        templateId: "settlement_escalation",
        timerLabel: "Day 7 · escalate",
      },
      {
        title: "Protect cashflow while you wait",
        body: "Assume the held amount arrives 30 days late: pause ad scaling, don't place large supplier orders against it, and switch spend to what current cash covers. The cashflow simulator shows survival at the delayed settlement.",
        actionHref: "/app/tools/cashflow-simulator",
        actionLabel: "Model the delay",
      },
    ],
  },
  ip_complaint: {
    type: "ip_complaint",
    label: "IP / brand complaint on listing",
    steps: [
      {
        title: "Don't relist - triage first",
        body: "Relisting a flagged product before resolving the complaint converts one strike into a suspension. Read the notice: who complained (brand owner vs marketplace bot), which listing, what right (trademark/copyright/design).",
        timerLabel: "Before anything else",
      },
      {
        title: "Classify your position honestly",
        body: "Three cases: (A) you sell genuine branded goods with an invoice chain - defensible; (B) your listing is generic but used a brand word or photo in title/images - your error, fix it; (C) the product is a lookalike/first-copy - delist everything similar NOW. Case C is not defensible and repeat strikes end accounts.",
      },
      {
        title: "Gather the paper trail",
        body: "Case A: GST purchase invoices naming the brand, supplier's distributor authorization. Case B: corrected listing screenshots + removal timestamps. No invoices for branded goods = treat it as case C, whatever the supplier told you.",
      },
      {
        title: "Respond with the counter-notice",
        body: "Use the template - pick the matching position, attach evidence, stay factual. Send via the marketplace's notice-response channel (the email/portal named in the complaint), not a general support ticket.",
        templateId: "ip_response",
      },
      {
        title: "Audit the rest of your catalogue",
        body: "Search your live listings for brand names in titles, stock photos you didn't shoot, and logos visible in images. One complaint means the brand or its agency is scanning - the second strike lands much faster.",
        timerLabel: "Within 48h",
      },
    ],
  },
  gst_notice: {
    type: "gst_notice",
    label: "GST notice received",
    steps: [
      {
        title: "Read the form number and deadline first",
        body: "The form tells you the severity: ASMT-10 (return mismatch query), REG-17/31 (show-cause for cancellation - serious, often address verification), DRC-01/01A (tax demand), or a plain clarification. The reply deadline is printed on the notice - missing it converts questions into demands and suspensions.",
        timerLabel: "Deadline is on the notice - usually 7-30 days",
      },
      {
        title: "Don't panic, don't ignore, don't reply raw",
        body: "Most e-commerce notices are mechanical mismatches: GSTR-1 vs GSTR-3B timing, TCS the marketplace reported versus what you filed, or returns/RTO reducing later-month values. These resolve with a reconciliation sheet, not a penalty - but only if answered properly and on time.",
      },
      {
        title: "Build the reconciliation pack",
        body: "Download for the notice period: GSTR-1, GSTR-3B, marketplace settlement reports, and your TCS statement. The payout reconciliation tool gives you order-wise sale and TCS numbers to anchor the sheet.",
        actionHref: "/app/tools/payout-reconciliation",
        actionLabel: "Pull settlement numbers",
      },
      {
        title: "Draft the reply - then have a CA sign off",
        body: "Use the skeleton below to organize the facts BEFORE the CA call: it cuts billable hours and keeps the story straight. A notice reply is a legal filing - ₹2,000-5,000 of CA review is cheap against a wrong admission.",
        templateId: "gst_scn_reply",
      },
      {
        title: "File within deadline + calendar the follow-up",
        body: "Submit on the portal (Services → User Services → View Notices), save the ARN, set a reminder for any hearing date. Keep filing returns on time meanwhile - a fresh lapse during proceedings looks terrible.",
        actionHref: "/app/tools/gst-calendar",
        actionLabel: "Open filing calendar",
      },
    ],
  },
  courier_dispute: {
    type: "courier_dispute",
    label: "Courier dispute / fake delivery",
    steps: [
      {
        title: "Freeze the evidence window",
        body: "Fake-delivery and lost-RTO claims die on missing evidence. Today: screenshot the tracking page with timestamps, request the POD (proof of delivery) from the courier, and get the customer's written 'not received' on WhatsApp. PODs get purged - ask within 7 days.",
        timerLabel: "Within 24h - PODs expire",
      },
      {
        title: "Classify the dispute",
        body: "Four types, different fixes: fake delivery (delivered-but-not-received), RTO never returned (courier shows RTO, nothing came back), weight dispute (charged a higher slab than the parcel), transit damage. Weight disputes are the most winnable - a packing photo with a scale makes it near-automatic.",
      },
      {
        title: "File the dispute with evidence attached",
        body: "Use the template. File with the courier/aggregator panel AND with the marketplace for marketplace-shipped orders (that's the ticket that matters). One dispute per AWB, everything attached up front - partial evidence gets auto-rejected.",
        templateId: "courier_dispute",
      },
      {
        title: "Start packing videos from the next parcel",
        body: "A 15-second video per parcel - item, invoice, weight on the scale, sealing - kills 90% of future disputes before they start. Cheap phone tripod at the packing desk. Non-negotiable past 10 orders/day.",
      },
      {
        title: "Track the route, not just the order",
        body: "Log disputes per pincode + courier pair. Two fake deliveries on the same route = switch courier for that pincode or force prepaid there.",
        actionHref: "/app/tools/shipping-estimator",
        actionLabel: "Compare couriers",
      },
    ],
  },
  review_bombing: {
    type: "review_bombing",
    label: "Review attack on listing",
    steps: [
      {
        title: "Diagnose: attack or genuine quality signal?",
        body: "Check order IDs against the reviews first. Multiple 1-stars from real buyers of the same batch = quality problem (pause the listing, check the batch with your supplier - different playbook). Reviews with no matching orders, burst timing, or copy-paste text = attack.",
        timerLabel: "First hour",
      },
      {
        title: "Reply publicly, once per review",
        body: "One calm reply per review using the template - you're writing for future buyers, not for the reviewer. Never accuse anyone of being a competitor, never argue in threads.",
        templateId: "review_response",
      },
      {
        title: "Report the fakes with a pattern dossier",
        body: "Report each suspect review via 'Report abuse' AND open one seller-support ticket listing all review IDs together with the pattern evidence (no verified purchase, burst timing, identical phrasing). Batched reports with patterns get human review; one-offs get bots.",
        timerLabel: "Within 48h",
      },
      {
        title: "Defend the rating with real reviews",
        body: "The antidote to fake 1-stars is volume of genuine ones: enrol eligible listings in the marketplace's review program and send the post-delivery WhatsApp review ask to recent happy buyers. Never buy reviews - that's the account-ending move.",
        actionHref: "/app/tools/whatsapp-templates",
        actionLabel: "Review-request script",
      },
      {
        title: "Watch conversion, adjust ads",
        body: "A rating drop from 4.3 to 3.8 can halve conversion - pause aggressive ad scaling until the rating recovers, or you pay full CPC for traffic that bounces off the reviews.",
      },
    ],
  },
};

export function getCrisisProtocol(type: CrisisType): CrisisProtocol {
  return CRISIS_PROTOCOLS[type];
}
