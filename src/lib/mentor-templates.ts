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

export const SUPPLIER_SLA_TEMPLATE = `Supplier SLA Agreement (WhatsApp/email — get written confirmation)

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

1. White background — front view (main image)
2. White background — back view
3. Lifestyle shot — model wearing product
4. Close-up — fabric/texture detail
5. Size chart infographic
6. (Optional) Flat lay with accessories`;

export const RETURN_POLICY_SNIPPET = `Return & exchange policy (fashion — customize for your store)

- 7-day return window from delivery date
- Product must be unworn, tags attached, original packaging
- Exchanges for size available within 7 days (customer pays return shipping)
- Refunds processed within 5-7 business days after QC
- COD orders: refund via UPI/bank transfer
- Customized/personalized items: no returns`;

export const MARKETPLACE_APPEAL_TICKET = `Subject: Payout hold / settlement discrepancy — Seller ID {{seller_id}}

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

— {{store_name}}`;

export const WHATSAPP_CUSTOMER_DELAY = `Hi {{name}},

Thank you for your order #{{order}} from {{store}}.

We're facing a brief stock delay on {{product}}. Your order is confirmed — we're working with our supplier and expect to ship within {{eta_days}} days.

We'll update you before dispatch. Reply if you'd prefer to cancel.

Sorry for the inconvenience.
— {{store_name}}`;

export const PAOS_APPEAL_TEMPLATE = `Plan of Action (POA) — Account Suspension Appeal

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

export const ESCALATION_LETTER = `Formal escalation — settlement / account hold

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

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);
}
