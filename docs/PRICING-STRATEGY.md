# Pricing Strategy — Dropship Navigator India

> 2026-07-10 · Business/marketing analysis for moving from free-everything to paid tiers.
> Decision doc: pick a tier structure at the end, implementation follows.

---

## 1. The market context (what the money data says)

**What our user already pays for, monthly (anchors):**

| Product | Entry | Mid | Top | Model |
|---|---|---|---|---|
| Shiprocket (must-have ops) | Free Lite | ₹199 Business | ₹499–799 Adv/Pro | subscription + per-shipment |
| SellerApp / analytics tools | ~₹999 | ₹1,999 | ₹4k+ | subscription, targets funded sellers |
| Indian micro-SaaS consensus | ₹299–499 | ₹999–1,999 | ₹2,999+ | targets revenue-positive SMBs |
| Guru "mentorship" courses | — | — | ₹20,000–50,000 **one-time** | our positioning weapon |
| Telco/OTT sachets | ₹49–149 | — | — | proves impulse price point exists |

**Payment rails:** UPI AutoPay mandates under ₹15,000 execute without per-debit authentication and run on low-cost NPCI rails — ₹49–999/month subscriptions are frictionless and economical in India ([Razorpay recurring billing comparison](https://razorpay.com/blog/cheapest-payment-gateway-for-recurring-billing-e-nach-upi-autopay-and-subscription/), [PhonePe subscription guide](https://business.phonepe.com/articles/how-to-accept-subscription-payments-in-india-upi-auto-pay-vs-e-nach-vs-cards)).

**Conversion benchmarks** ([ChartMogul](https://chartmogul.com/reports/saas-conversion-report/), [FirstPageSage](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/), [Userpilot](https://userpilot.com/blog/saas-average-conversion-rate/)):
- Freemium → paid: 3–5% typical, 8–12% great. Wide funnel, slow conversion.
- Free trial (no card): ~9–18% convert. Trial (card upfront): ~30% — but card-upfront kills Indian top-of-funnel.
- Products with <5-minute time-to-value (ours: margin calculator "aha" in ~2 min) convert visitors to signups at ~2× the rate.

**The Khatabook lesson:** 100% free forever built a huge base and no revenue engine — monetization had to pivot to lending/hardware. Free-everything is a trap unless you're VC-funded for scale. Charging from early is honest and filters for serious sellers — which *is our brand*.

## 2. Who pays, and what they'll pay for

Two distinct wallets:

1. **Pre-revenue beginner** (biggest volume): no income from selling yet, burnt by ₹20k course ads, suspicious. Price sensitivity extreme — but ₹49 is a chai-budget impulse. What they value: the *journey* (don't get rejected, don't lose money), calculators, GST hand-holding.
2. **Post-first-payout seller** (smaller, richer): has real cashflow, pays Shiprocket ₹199+ already. What they value: **money recovery and protection** — payout reconciliation, TCS claims, rate-change alerts, crisis protocols, multi-profile (they run 2–3 marketplace accounts/niches). This is the recurring-revenue engine.

Our features map almost perfectly onto these two wallets. That's the tier split.

## 3. Recommended structure — 3 tiers

### Free — "Scout" (acquisition funnel, not a product)
- Journey **module 1 only** (documentation + GST guidance — the trust builder that proves we know India)
- Margin calculator (up to 3 saved calculations), GSTIN/PAN validator
- 1 profile, read-only seasonal calendar
- **Purpose:** SEO/word-of-mouth funnel + prove correctness before asking for money. Freemium math needs volume; our tools' 2-minute time-to-value is exactly the profile where freemium outperforms trials.

### Starter — ₹49/month or ₹399/year (save 32%)
*"The mentor" — everything a launching seller needs.*
- Full 7-module journey + all walkthroughs
- All calculators & simulators (cashflow, COD/prepaid, ROAS, scorecards, shipping)
- GST calendar, doc checker, decision wizards, WhatsApp templates
- Crisis pack: 2 core protocols (account suspended, supplier OOS)
- 1 seller profile · 1 payout reconciliation/month · weekly digest email

### Growth — ₹199/month or ₹1,599/year (save 33%)
*"The co-pilot" — for sellers with real order flow.*
- Everything in Starter, plus:
- **5 seller profiles** (multi-marketplace / multi-niche)
- **Unlimited payout reconciliations + history trends**
- **Full crisis pack** (all 7 protocols incl. payment hold, IP, GST notice, courier, reviews)
- **Rate-change alerts** on saved products (the data moat)
- Priority support / early features

### Why these price points
- **₹49 entry** (your instinct): correct for the pre-revenue wallet. Sachet-pricing precedent works in India; UPI AutoPay makes it collectible. At ~₹40 net of GST+fees and near-zero marginal cost, it's 85%+ gross margin. Its real job is **commitment**, not revenue — a paying user completes the journey, and journey-completers become Growth customers.
- **₹199 top**: deliberately matches Shiprocket Business — a price our persona demonstrably already pays for tooling. Going ₹499 now would out-price the must-have ops tool; earn that later with a "Scale" tier (multi-user, API, bulk recon) once Growth is proven.
- **Annual push everywhere**: reduces mandate churn, front-loads cash. India SMB loves visible % savings.
- **Founding offer**: existing waitlist emails → Growth at ₹99/month locked for 12 months ("founding member"). Converts the list you already captured, seeds testimonials — the *real* success stories we deleted.

### Revenue sanity check (conservative)
1,000 signups/mo → ~40% activate → Starter conversion 8% of activated (paid-low friction) ≈ 32/mo, Growth upsell 15% of Starters over time. Month-12 steady state ≈ 350 Starter + 60 Growth ≈ ₹29k MRR — small, but CAC≈0 (content/community-led) and it compounds. The lever that changes the curve is recon/rate-alert word-of-mouth among post-payout sellers.

## 4. Gating UX (how users see what they can't have)

Principles (conversion-tested patterns):
1. **Never hide, always show locked.** Hidden features can't sell themselves. Locked cards with a one-line benefit are free ads inside the product.
2. **Contextual upsell at the moment of limit-hit** converts best: hitting the 2nd-profile wall, the 2nd reconciliation of the month, a locked crisis protocol *during* a crisis. Generic banners convert worst — use sparingly.
3. **Server-side enforcement always.** UI states are marketing; the action/route check is the security.
4. Mono Depth compliant: white lock chips + mono tier badges ("STARTER" / "GROWTH"), no amber (reserved for deadlines/danger).

Surface-by-surface spec:

| Surface | Treatment |
|---|---|
| Tools index | Locked tools render normal card + `GROWTH` mono badge + lock icon; click → tool page gate (not dead) |
| Tool page (locked) | Real header + blurred preview + 3 benefit bullets + "Unlock with Growth — ₹199/mo" + annual line; no fake data |
| Recon quota | Usage meter on upload page ("1 of 1 used this month"); at limit: inline upgrade panel replaces form |
| Profiles | "New profile" button always visible; at cap → dialog: "Second niche? Growth runs 5 profiles side-by-side" |
| Crisis chooser | Locked protocols listed with lock chip: visible titles (they must know help exists), body gated; crisis moment = highest-intent upsell, copy stays respectful ("This protocol is in Growth — unlock now, 2 minutes") |
| Journey (Free) | Module 1 open; modules 2–7 visible on the map, locked with "Starter unlocks the full route" |
| Sidebar | Plan badge under profile switcher → links /pricing |
| Dashboard | No permanent upsell banners; only quota-hit states surface upgrades |

## 5. Billing rollout (phased, low-risk)

- **Phase A (ship now):** `subscriptions` table + entitlements enforcement + gating UI. Payments via **Razorpay Payment Links** for annual plans (manual-ish, zero integration risk); founding-cohort emails. Plan activation on webhook or manual admin flip. Validates willingness-to-pay in 2–3 weeks.
- **Phase B:** Razorpay Subscriptions (UPI AutoPay) for monthly ₹49/₹199, webhook-driven `active/past_due/cancelled` states, grace period 7 days, dunning email via existing Resend plumbing.
- **Invoicing:** SaaS attracts 18% GST — display prices as ₹49 incl. GST (B2C-friendly), issue GST invoices (needed by registered sellers; it's also on-brand for a GST-mentor product).

## 6. Risks & mitigations

| Risk | Mitigation |
|---|---|
| ₹49 anchors brand as cheap | Anchor *against courses* everywhere: "the ₹20,000 course, for ₹49/month, with correct math" |
| Free tier too generous → no conversion | Module-1-only is a hard wall at the moment of highest motivation (they want module 2: product selection) |
| Paid wall kills top-of-funnel reviews | Scout tier keeps validators/calculator public-ish; content/SEO stays free |
| Support load at ₹49 | Self-serve support page + community; priority support reserved for Growth |
| Refund/failed-mandate churn | Annual discount push + 7-day grace + dunning emails |

## 7. Decision needed

1. Approve tier structure (Free Scout / Starter ₹49 / Growth ₹199) or adjust price points.
2. Free tier: keep as above, or kill free entirely (trial-only)? Recommendation: keep Scout — our funnel is content + word-of-mouth and needs a free door.
3. Founding offer to current waitlist: Growth ₹99/mo ×12 months — yes/no.

Sources: [Shiprocket pricing](https://www.shiprocket.in/pricing/), [checkthat.ai Shiprocket plans](https://checkthat.ai/brands/shiprocket/pricing), [Razorpay recurring billing](https://razorpay.com/blog/cheapest-payment-gateway-for-recurring-billing-e-nach-upi-autopay-and-subscription/), [PhonePe AutoPay guide](https://business.phonepe.com/articles/how-to-accept-subscription-payments-in-india-upi-auto-pay-vs-e-nach-vs-cards), [ChartMogul conversion report](https://chartmogul.com/reports/saas-conversion-report/), [FirstPageSage freemium benchmarks](https://firstpagesage.com/seo-blog/saas-freemium-conversion-rates/), [Userpilot conversion benchmarks](https://userpilot.com/blog/saas-average-conversion-rate/), [micro-SaaS India pricing patterns](https://rajeshrnair.com/blog/software/saas/micro-saas-ideas-india.html).
