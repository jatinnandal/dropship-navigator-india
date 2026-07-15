export const WHATSAPP_ADDRESS_VERIFY = `Hi {{name}}, this is {{store}} confirming your COD order #{{order}} for ₹{{amount}}.

Your address on file: {{address}}

Please reply with your FULL address including:
- House/flat number
- Street/landmark
- Pincode

Reply YES to confirm or CANCEL to cancel.`;

export const WHATSAPP_COD_CONFIRM = `Hi {{name}}, this is {{store}} confirming your COD order #{{order}} for ₹{{amount}}.

Please reply YES to confirm delivery or CANCEL to cancel.

Delivery address: {{address}}`;

export const RTO_RESEARCH_PROMPT = `I am a first-time online seller in India. I plan to sell [WRITE YOUR PRODUCT HERE, e.g. cotton kurtis / silicone kitchen organizers / phone cases] mostly as Cash on Delivery (COD, where the buyer pays the courier on delivery) on [Meesho / Amazon.in / Flipkart / my own website].

What is a realistic expected RTO rate for this product category in India? (RTO means Return to Origin: the share of COD orders that come back undelivered.)

Please give me a rough percentage range, explain what pushes it higher or lower (size or fit issues, fragility, price, delivery region), and roughly how much lower it usually runs for prepaid orders (paid online in advance).

Important: treat this as a rough starting estimate only. Remind me to confirm the real number from my own marketplace seller dashboard's returns/RTO report after my first ~20 orders, and do not present any figure as exact.`;

export const PNL_TRACKER_TEMPLATE = `Weekly SKU-level P&L tracker - one row per SKU, per week

Columns (make these your spreadsheet header):
SKU | Units sold | Revenue (from settlement file) | Product cost | Shipping | Marketplace fees + GST | Ad spend | Returns/RTO loss | Net profit

Net margin % = Net profit / Revenue x 100

Worked example (1 SKU, 1 week - illustrative numbers):
Silicone organizer | 40 | 19,960 | 7,000 | 2,400 | 3,600 | 3,200 | 1,800 | 1,960
Net margin = 1,960 / 19,960 = ~9.8%  (TIGHT - can't comfortably fund ads yet)

How to read a row:
GOOD row - net margin 20%+ with stable RTO: a SKU to scale.
BAD row - net margin negative, or under ~10% for two weeks running: pause or fix it before spending another rupee on ads.

Rule: build every number from your SETTLEMENT file, never the orders screen - the orders screen counts cancelled and RTO parcels as income.`;

export const RTO_RETURNS_LOG_TEMPLATE = `Weekly RTO / returns log - find the pattern, fix the root cause

Two separate problems, tracked in separate columns (never lump them):
Date | Order ID | Pincode | Product/SKU | Type (RTO or Return) | Reason | Cost to you

RTO reason (buyer never paid): refused at door / wrong or incomplete address / cash not ready / courier could not reach.
Return reason (buyer paid, then returned): wrong size / not as described / changed mind / arrived damaged.

Every week, compute:
RTO rate = RTO orders / total COD orders
Return rate = returned orders / delivered orders

Then act on the top reason in EACH column - the fixes are different:
- Most RTO from incomplete addresses or one pincode cluster? Tighten address quality and expectations.
- Most returns from wrong size or "not as described"? Fix the size chart, photos, and description.

A ₹200 refusal and a ₹2,000 refusal need different responses - don't treat all returns the same.`;

export const SUPPLIER_SLA_TEMPLATE = `Supplier SLA Agreement (WhatsApp/email - get written confirmation)

1. Dispatch timeline: All orders placed before 2 PM will be dispatched within {{hours}} hours.
2. Packaging: Each unit in individual polybag/box with SKU label.
3. QC: Defect rate must stay below 2%. Seller may reject batch if exceeded.
4. Replacements: Defective units replaced within 48 hours at supplier cost.
5. Stock updates: Supplier notifies within 24h if any SKU goes out of stock.
6. Returns/RTO: Supplier shares responsibility for wrong-item dispatches.

Supplier name: _______________
Date agreed: _______________`;

export const SIZE_CHART_CHECKLIST = `Size chart checklist (fashion listings)

- Measure 3 samples per size (chest, length, shoulder, sleeve)
- Add "fits true to size" or "runs small/large" note
- Include model height + size worn in listing photos
- Add cm AND inches columns
- Link size chart image in first 3 listing images
- Mention "exchange for size" policy if offering`;

export const FASHION_PHOTO_SHOTS = `Fashion photo shot list (minimum 5 images)

1. White background - front view (main image)
2. White background - back view
3. Lifestyle shot - model wearing product
4. Close-up - fabric/texture detail
5. Size chart infographic
6. (Optional) Flat lay with accessories`;

export const RETURN_POLICY_SNIPPET = `Return & exchange policy (fashion - customize for your store)

- 7-day return window from delivery date
- Product must be unworn, tags attached, original packaging
- Exchanges for size available within 7 days (customer pays return shipping)
- Refunds processed within 5-7 business days after QC
- COD orders: refund via UPI/bank transfer
- Customized/personalized items: no returns`;

export const MARKETPLACE_APPEAL_TICKET = `Subject: Payout hold / settlement discrepancy - Seller ID {{seller_id}}

Dear {{marketplace}} Seller Support,

I am writing regarding a hold/discrepancy on my settlement for the period {{date_range}}.

Seller ID: {{seller_id}}
GSTIN: {{gstin}}
Expected payout: ₹{{expected}}
Actual received: ₹{{actual}}
Difference: ₹{{difference}}

I have attached:
- GST registration certificate
- Bank account proof (name matches GST legal name)
- Return/refund policy screenshot from my store
- Sample invoices for disputed orders

Please review and release the held amount or clarify the deduction.

Regards,
{{legal_name}}
{{contact}}`;

export const WHATSAPP_SUPPLIER_ETA = `Hi {{supplier_name}},

We have live orders for {{sku}} on {{marketplace}}.

Please confirm in writing:
1. Current stock available: __ units
2. Restock ETA if out of stock: __ days
3. Dispatch timeline for pending orders

We need this today to manage customer orders. Please reply on this thread.

- {{store_name}}`;

export const WHATSAPP_CUSTOMER_DELAY = `Hi {{name}},

Thank you for your order #{{order}} from {{store}}.

We're facing a brief stock delay on {{product}}. Your order is confirmed - we're working with our supplier and expect to ship within {{eta_days}} days.

We'll update you before dispatch. Reply if you'd prefer to cancel.

Sorry for the inconvenience.
- {{store_name}}`;

export const PAOS_APPEAL_TEMPLATE = `Plan of Action (POA) - Account Suspension Appeal

To: {{marketplace}} Seller Performance Team

Seller ID: {{seller_id}}
GSTIN: {{gstin}}
Suspension date: {{suspension_date}}
Reason cited: {{suspension_reason}}

1. ROOT CAUSE IDENTIFIED
We identified that {{root_cause_detail}} led to the policy violation.

2. CORRECTIVE ACTIONS ALREADY TAKEN
- {{action_1}}
- {{action_2}}
- {{action_3}}

3. PREVENTIVE MEASURES
- Daily dispatch SLA monitoring with supplier confirmation
- Updated inventory sync to prevent overselling
- IP/brand review on all active listings completed on {{review_date}}

4. SUPPORTING EVIDENCE ATTACHED
- Updated listing screenshots
- Supplier SLA confirmation
- Dispatch logs for last 30 days
- GST certificate and bank proof

We request reinstatement and commit to maintaining metrics within policy thresholds.

{{legal_name}}
{{contact}}`;

export const ESCALATION_LETTER = `Formal escalation - settlement / account hold

To: {{marketplace}} Seller Grievance Cell

Date: {{date}}

Seller details:
- Legal name: {{legal_name}}
- GSTIN: {{gstin}}
- Seller ID: {{seller_id}}
- Registered email: {{email}}

Issue: Settlement amount of ₹{{amount}} has been held since {{hold_date}} without clear reason.

Previous ticket reference: {{ticket_id}}

Requested action: Release held settlement or provide itemized breakdown of deductions within 7 business days.

Supporting documents attached: GST cert, bank proof, return policy, order-wise settlement report.

{{legal_name}}
{{contact}}`;

export const COURIER_BENCHMARK_CHECKLIST = `Courier benchmark checklist (same pincode pair)

Test route: {{origin_pincode}} → {{dest_pincode}}

| Criteria | Courier A | Courier B |
|----------|-----------|-----------|
| Forward shipping (₹) | | |
| RTO reverse charge (₹) | | |
| COD remittance days | | |
| Pickup SLA | | |
| NDR retry policy | | |
| Weight slab accuracy | | |

Run 5 test shipments each before committing volume.`;

export const IP_COMPLAINT_RESPONSE = `Subject: Response to IP complaint - Listing {{listing_id}}, Seller ID {{seller_id}}

Dear {{marketplace}} Notice Team,

I received an intellectual-property complaint dated {{complaint_date}} on listing {{listing_id}}.

My position (pick ONE, delete the rest):
A) AUTHORIZED RESELLER - I source this product from {{supplier_name}}, an authorized distributor. Attached: purchase invoices with GST, supplier authorization chain.
B) GENERIC PRODUCT - The listing is for an unbranded/generic product and does not use the complainant's brand name, logo, or images. Attached: product photos as sold, listing history.
C) LISTING ERROR, FIXED - The flagged content was removed on {{fix_date}}. Attached: updated listing screenshots.

Immediate actions taken:
- Listing {{action_taken}} on {{fix_date}}
- Full catalogue reviewed for similar issues on {{review_date}}

I request reinstatement of the listing / withdrawal of the strike. If the complainant maintains the claim, please share their contact for direct resolution.

{{legal_name}} · Seller ID {{seller_id}} · {{contact}}`;

export const GST_SCN_REPLY = `DRAFT skeleton - a GST notice is a legal document. Have a CA review before submission. Reply within the deadline printed on the notice (usually 7/15/30 days) - missing it converts a query into a demand.

To: The Proper Officer, {{jurisdiction}}
Ref: Notice {{notice_ref}} dated {{notice_date}} (Form {{notice_form}})
GSTIN: {{gstin}} · Legal name: {{legal_name}}

1. ACKNOWLEDGEMENT
We acknowledge receipt of the above notice regarding {{issue_summary}}.

2. FACTS
- Nature of business: e-commerce seller on {{marketplace}} (marketplace collects TCS u/s 52)
- The period in question: {{period}}
- Marketplace sales as per GSTR-1: ₹{{gstr1_sales}}; TCS credited: ₹{{tcs_amount}}

3. EXPLANATION / RECONCILIATION
{{explanation}}
(Common e-commerce mismatches: GSTR-1 vs GSTR-3B timing, TCS credit not accepted in the TDS/TCS statement, returns/RTO reducing taxable value in a later month, marketplace commission invoices claimed as ITC.)

4. DOCUMENTS ENCLOSED
- GSTR-1, GSTR-3B for {{period}}; marketplace settlement reports; TCS statement; reconciliation sheet order-wise.

5. PRAYER
We request the proceedings be dropped / the discrepancy be treated as explained. We are available for a personal hearing if required.

{{legal_name}} · Authorized signatory · {{contact}}`;

export const COURIER_DISPUTE_TICKET = `Subject: Dispute - AWB {{awb}}: {{dispute_type}}

To: {{courier}} Escalation Desk / {{marketplace}} Seller Support

Order: {{order_id}} · AWB: {{awb}} · Declared value: ₹{{amount}}

Dispute type (keep one): fake delivery (marked delivered, customer never received) / RTO never returned to origin / weight discrepancy (charged {{charged_weight}} vs actual {{actual_weight}}) / damaged in transit.

Evidence attached:
- Pickup scan + weight at pickup (packing video/photo with scale, if available)
- Customer's written statement that the parcel was not received (for fake delivery)
- POD copy requested - signature does not match customer name
- Dimensions/weight photos for weight disputes

Requested resolution: reverse the delivery status / refund forward+RTO freight / correct the weight slab and refund the difference / claim for declared value.

Per your SLA I expect a response within 48 hours. This is dispute {{dispute_count}} on this route this month - repeated issues will move our volume.

{{store_name}} · {{contact}}`;

export const REVIEW_RESPONSE = `Public reply template - professional, no arguing, signals to REAL buyers that you're responsive.

"Hi {{name}}, sorry your experience fell short. We take quality seriously - every unit is checked before dispatch. Please reach us at {{contact}} with your order ID; we'll replace the item or refund you within 48 hours. - {{store_name}}"

Rules:
- Reply within 24h, never argue, never accuse the reviewer of being fake (even when they are).
- Offer the fix publicly, resolve privately.
- For suspected fake/competitor reviews, do NOT reply-fight - report via the marketplace's "Report abuse" with: order-ID mismatch (reviewer never bought), burst pattern (5+ 1-stars in 48h), copy-paste text across your listings, reviewer history of only 1-star reviews.
- Log every reported review ID - a second report referencing the first gets human eyes.`;

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}
