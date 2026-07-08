# Tools Plan — Research-Backed Specs & Accuracy Contract

> Generated: 2026-07-07
> Status: APPROVED PENDING REVIEW — implementation follows this doc
> Supersedes tool specs in MASTER-PLAN.md Phase 3

---

## Why this doc exists

The tools index shipped with 4 links to tools that were never built (404s) and 7 built
tools that weren't linked. That's fixed. The deeper problem: **hard numbers inside the
data files are stale or wrong**. A mentor tool that computes margins with wrong fees is
worse than no tool — sellers make real decisions with these numbers.

This doc is the single source of truth for:
1. What each tool does and why (the seller problem it solves)
2. The exact data each tool depends on, with verified 2026 values and sources
3. What's wrong today and how to fix it
4. Build order

---

## Accuracy contract (applies to every tool)

1. **Every hard number carries provenance.** Each data module exports a
   `DATA_META = { lastVerified: "YYYY-MM-DD", sources: string[] }` block. UI renders a
   "Rates verified <month year>" badge with a disclaimer.
2. **Account-specific rates are labelled estimates.** Marketplace fees vary by category,
   price band, and seller tier. Tools show "check your rate card in Seller Hub" next to
   any fee that varies by account.
3. **Category-level fee tables, not flat percentages.** A flat "Amazon = 12%" is wrong in
   both directions (0% under ₹1,000 since Mar 2026; up to 22%+ for some fashion). Fee
   data must be `(channel, category, priceBand) → fee`.
4. **Teach the gap between advertised and actual.** The most valuable pattern in every
   money tool: show the advertised number, then the real number after COD fee, GST on
   fees, fuel surcharge, RTO weighting.
5. **No fake UI state.** Status badges (due dates, done ticks, locks) must derive from
   real user/journey/calendar state or not render at all.

---

## Verified data corrections (July 2026 research pass)

| Data point | In code today | Verified July 2026 | Impact |
|---|---|---|---|
| Meesho commission | 8% | **0% all categories** (monetizes via ads + logistics). Seller costs: logistics ₹27–120 by weight/zone + platform fee ₹25–30 + 18% GST on fees | Margin calc overstates Meesho costs by ~8% of price |
| Amazon referral | flat 12% | **0% for products ≤ ₹1,000** across 1,800+ categories (effective Mar 16, 2026). Above ₹1,000: category-specific, recently reduced 4–9.5% in apparel, healthcare, home, personal care, grocery, footwear, automotive | Margin calc wildly wrong for budget products — the core dropship price band |
| Amazon closing fee | flat ₹25 | Price-band based: **₹20 under ₹300** (was ₹45), **₹26 for ₹300–500** (was ₹35), higher bands per rate card; Easy Ship gets ~₹15 reduction under ₹300 | Under-charges some bands, over-charges others |
| Flipkart fees | flat 13% + ₹20 | Four components: commission **2–25% by category** (mobiles 2–5%, fashion jewelry up to 25%), fixed fee by **price slab + seller tier** (Gold/Silver/Bronze), **collection fee % on COD orders by price range**, shipping by zone; **18% GST on all of them** | Structure missing entirely — no tier, no collection fee |
| GST TCS | 1% | **0.5%** (0.25% CGST + 0.25% SGST, or 0.5% IGST) — reduced by 53rd GST Council, effective July 10, 2024 | Every payout calc overstates TCS 2× |
| Shiprocket COD | ₹30 flat, 0% | **₹25–40 flat OR 1.5–2.5% of order value, whichever is higher** | COD fee badly understated on high-value orders |
| Shiprocket base | ₹26/500g | ₹20–26/500g **by subscription plan**; blended real cost ₹36–45+; worked example ₹26 base → ₹73–86 after COD + GST + surcharges | Directionally OK — keep the advertised-vs-actual teaching frame |
| Amazon settlement | (in settlement-data.ts, unverified) | 7-day reserve post-delivery + 14-day settlement cycle → **14–21 days from purchase** | Verify settlement-data.ts against this |
| Flipkart settlement | (unverified) | **7–15 days after dispatch/delivery, tiered** — Gold/Platinum faster | Verify |
| Meesho settlement | (unverified) | **~7 days after delivery** + bank processing | Verify |
| GSTR-1 / GSTR-3B dates | 11th / 20th, QRMP 13th | Correct — GSTR-1 monthly 11th, QRMP quarterly 13th, GSTR-3B 20th (22nd/24th for QRMP by state) | Add the 22nd/24th QRMP state split |
| GST late fee | ₹50/day capped ₹10k | Correct for normal returns; **₹20/day for NIL returns** | Add NIL-return rate — most new sellers file NIL early months |

Sources (fetched 2026-07-07):
- Meesho 0%: [supplier.meesho.com](https://supplier.meesho.com/), [Meesho commission 2026 breakdown](https://swcybernetics.in/knowledge-base/meesho-commission-rates-seller-fees-2026), [gonukkad fee guide](https://www.gonukkad.com/blog/meesho-commission-seller-fees)
- Amazon Mar 2026 update: [Seller forum: fee updates effective Mar 16 2026](https://sellercentral.amazon.in/seller-forums/discussions/t/5edc203d-8623-4838-8ed3-b3fc6289cb45), [0% referral under ₹1,000 explained](https://www.kwickmetrics.com/blog/amazon-referral-fee-2026-india), [sell.amazon.in/fees-and-pricing](https://sell.amazon.in/fees-and-pricing)
- Flipkart: [seller.flipkart.com/fees-and-commission](https://seller.flipkart.com/fees-and-commission), [Flipkart fee guide 2026](https://swcybernetics.in/knowledge-base/flipkart-commission-rates-seller-fees-2026)
- TCS 0.5%: [TaxGuru IGST notification](https://taxguru.in/goods-and-service-tax/igst-e-commerce-operator-tcs-collection-rate-reduced-0-50-percent.html), [CGST 0.25%](https://taxguru.in/goods-and-service-tax/cgst-e-commerce-operator-tcs-collection-rate-reduced-0-25-percent.html)
- Shiprocket: [shiprocket.in/pricing](https://www.shiprocket.in/pricing/), [Shiprocket pricing analysis](https://checkthat.ai/brands/shiprocket/pricing)
- Settlements: [Amazon payment cycle guide](https://www.gonukkad.com/blog/amazon-india-seller-payment-cycle), [eVanik marketplace payment cycles](https://www.evanik.com/marketplace-payment-cycle/), [Meesho payment cycle](https://www.digicommerce.in/blog/meesho-payment-cycle/)

---

## Existing tools — spec + gap per tool

### 1. Margin calculator (`/app/tools/margin-calculator`)
- **Problem**: A ₹1,000 product showing "50% margin" nets 8–18% after fees. Sellers list
  before ever computing this.
- **Must do**: Input product cost, selling price, weight bracket, category, COD share,
  RTO rate → per-channel table: referral/commission, closing/fixed fee, collection fee
  (COD), shipping, GST on fees, TCS, RTO-weighted loss → net margin ₹ and %.
- **Gaps**: Uses flat fees (see corrections table). No category dimension. No COD
  collection fee for Flipkart. TCS 2× overstated. Meesho charged 8% that doesn't exist.
- **Fix**: Rebuild `marketplace-fees.ts` as category × price-band rate table with
  `DATA_META`. Cover top dropship categories first: apparel, home & kitchen, beauty,
  electronics accessories, toys, jewelry.

### 2. Cashflow simulator (`/app/tools/cashflow-simulator`)
- **Problem**: Meta bills daily; COD cash lands day 5–7+. Sellers die of cashflow in
  week 2–3 while "profitable" on paper.
- **Must do**: 90-day daily balance projection from ad spend, order rate, COD mix,
  settlement lags per channel, RTO rate. Show lowest-balance day and survival verdict.
- **Gaps**: Verify settlement lags against corrections table (Amazon 14–21 days, not
  T+7). Festival surge mode exists — keep.

### 3. COD vs prepaid impact (`/app/tools/cod-prepaid-simulator`)
- **Problem**: Sellers default to 100% COD "because India", not knowing each COD order
  carries collection fee + higher RTO.
- **Must do**: Compare COD-heavy vs prepaid-heavy mixes in exact ₹/month at the user's
  volume. Include prepaid gateway fee (~2%) vs COD collection fee vs RTO differential.
- **Gaps**: Uses same stale fee data — inherits marketplace-fees rebuild.

### 4. Settlement timeline (`/app/tools/settlement-timeline`)
- **Problem**: "₹5L/month sellers need ₹1–2L permanently parked" — invisible until felt.
- **Must do**: Order-to-bank timeline per channel with verified cycles; working-capital
  requirement at user's volume.
- **Gaps**: Verify `settlement-data.ts` numbers (see corrections).

### 5. Shipping estimator (`/app/tools/shipping-estimator`)
- **Problem**: "₹26/500g" becomes ₹73–86 delivered. Sellers price shipping at the ad rate.
- **Must do**: Compare carriers on real cost: base + weight + COD (flat OR %, whichever
  higher) + fuel + GST; show advertised vs actual side by side; RTO round-trip cost.
- **Gaps**: COD percentage component missing (`codPercentFee: 0`); add
  `max(flat, percent)` logic. Volumetric weight calculator missing — add
  `(L×W×H)/5000` with a fragility note.

### 6. Supplier scorecard (`/app/tools/supplier-scorecard`)
- **Problem**: Supplier fraud/quality causes 60–70% of early failures.
- **Must do**: 18 weighted criteria (GST verified, sample policy, advance terms,
  communication, reviews...) → score + verdict + specific red flags.
- **Gaps**: Content tool, low staleness risk. Add GSTIN checksum validation to the
  "GST verified" criterion (validator exists in verification-checklist — share it).

### 7. GST filing calendar (`/app/tools/gst-calendar`)
- **Problem**: NIL filing is mandatory even at zero sales; miss it and GSTIN suspension
  blocks every marketplace.
- **Must do**: Personalized calendar (QRMP vs monthly), prep checklists, late-fee math.
- **Gaps**: Add QRMP GSTR-3B 22nd/24th state split; add NIL late fee ₹20/day; verify
  GSTR-8 (TCS) mention reflects 0.5%.

### 8. Document checker (`/app/tools/document-checker`)
- **Problem**: #1 Amazon rejection cause: name/address mismatch across PAN, GST, bank.
- **Must do**: Cross-validation matrix + marketplace-specific checklists.
- **Gaps**: None found — content current. Keep.

### 9. Verification checklist (`/app/tools/verification-checklist`)
- **Must do**: GSTIN/PAN format + checksum validation, cross-document name matching.
- **Gaps**: None critical. Share validators with document-checker and supplier-scorecard.

### 10. Decision wizards (`/app/tools/decision-trees`)
- **Must do**: Marketplace choice, FBA/FBM, niche, COD/prepaid flows.
- **Gaps**: Audit recommendations against 2026 reality (e.g., "Meesho for zero-risk
  learning" still correct given 0% commission — strengthen that path).

### 11. Seasonal calendar (`/app/tools/seasonal-calendar`)
- **Must do**: 21 events, prep lead times, ad multipliers.
- **Gaps**: Dates must be year-aware (Diwali moves annually). Verify 2026–27 dates.

### 12. WhatsApp templates (`/app/tools/whatsapp-templates`)
- **Must do**: Scripts for confirmation, dispatch, NDR, review ask.
- **Gaps**: None — content tool. Keep.

### 13. Success stories (`/app/tools/success-stories`)
- **Gaps**: Stories are synthetic. Label honestly ("composite profiles based on typical
  seller journeys") — trust is the product. Low priority.

---

## Missing tools — full specs (currently "coming soon")

### 14. COD call simulator — **highest priority new build**
Landing page and dashboard already advertise it; it's the product's signature promise.
- **Problem**: One bad confirmation call = ₹60–90 round-trip shipping loss. 26–35% RTO
  is mostly decided in this call.
- **Spec**: Branching chat/voice-script simulator. 5 scenarios from real RTO causes:
  wrong/vague address, impulse regret, "cash not ready", price shock, unreachable.
  Each turn: 3 reply choices → customer reacts → outcome: SHIPS or RETURNS, with ₹
  impact and a debrief (what the winning reply did: confirm address landmark, payment
  intent, delivery window). Score saved to workspace; journey task
  `cod-call-practiced` marks done on first completed scenario.
- **Data**: RTO cost table from shipping-data (round-trip by zone); scenario scripts —
  content, no staleness.
- **Route**: `/app/tools/cod-simulator` with redirect from old phantom slug.

### 15. Product scorecard
- **Problem**: Product choice is the highest-leverage decision; sellers pick by gut.
- **Spec**: Score a candidate product 0–100 across weighted axes: margin headroom
  (reuses margin-calculator math at the user's price point), competition density
  (self-assessed tier), weight/fragility (shipping + damage risk), category return rate
  (fashion 25–35% vs home <10%), seasonality (links seasonal-calendar), capital need
  (MOQ × cost + buffer from settlement lag). Verdict + top 2 risks + "compare up to 3
  products" table. Saves shortlist to workspace.
- **Route**: `/app/tools/product-scorecard` (fixes the featured-card 404 target).

### 16. Break-even ROAS calculator
- **Problem**: Sellers run Meta ads without knowing their ad-spend floor; "2x ROAS"
  can be deeply unprofitable after fees + RTO.
- **Spec**: Inputs: price, landed cost, channel (pulls rebuilt fee table), COD mix, RTO
  rate → contribution margin per shipped order → break-even ROAS = price ÷ contribution
  margin. Show target ROAS at 10%/20% profit goals. Warn when break-even ROAS > 4
  (structurally unprofitable for cold Meta traffic).
- **Route**: `/app/tools/breakeven-roas`. Unlocks at ads stage (real lock, not fake).

### 17. Sourcing swipe game
- **Problem**: Supplier red flags are pattern recognition — best taught by reps, not
  checklists.
- **Spec**: Deck of ~20 realistic supplier chat cards (clearly labelled as simulated).
  Swipe legit/trap → instant verdict + the tell (100% advance + no samples, no GSTIN,
  stock photos, price 40% under market, WhatsApp-only + "courier guarantee"). Streak
  scoring; end screen links supplier-scorecard for the real vetting workflow.
- **Route**: `/app/tools/sourcing-game`. Content build, zero staleness.

---

## Cross-cutting work

- **State-driven index**: GST card shows real next due date from gst-calendar-data;
  stage lock on breakeven-roas from journey state; "done" ticks only from workspace.
- **`DATA_META` + UI badge**: every data module; badge component
  `<DataFreshness meta={DATA_META} />` under each tool.
- **Shared validators**: extract GSTIN/PAN validation into `src/lib/validators.ts`,
  consume from verification-checklist, document-checker, supplier-scorecard.

---

## Build order

| Phase | Scope | Why first |
|---|---|---|
| **A. Accuracy hotfix** | Rebuild `marketplace-fees.ts` (category × price band, TCS 0.5%, Meesho 0%), fix Shiprocket COD formula, verify settlement-data, GST calendar tweaks, DATA_META + freshness badges | Live tools computing wrong numbers = active harm |
| **B. Signature tool** | COD call simulator | Advertised on landing + dashboard; core differentiator |
| **C. Money tools** | Product scorecard, Break-even ROAS | Reuse Phase A fee tables; complete the money story |
| **D. Content + polish** | Sourcing swipe game, state-driven index statuses, shared validators, seasonal date verification | Valuable but not load-bearing |
