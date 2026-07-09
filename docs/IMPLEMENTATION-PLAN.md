# Implementation Plan — Fixes & Feature Roadmap

> Date: 2026-07-08
> Basis: [critical-review-2026-07.md](critical-review-2026-07.md) + full in-browser walkthrough of every page (desktop + mobile) on a fresh account.
> Effort key: **S** ≤ half day · **M** 1–2 days · **L** 3–5 days · **XL** 1–2 weeks

New findings from the live walkthrough (added to the review's list):

| # | Finding | Where seen |
|---|---|---|
| W1 | `/app/crisis` **404s** — dashboard's "Order gone wrong?" button is a dead link on every dashboard (crisis has `actions.ts` but no `page.tsx`) | Dashboard → Crisis CTA |
| W2 | Sidebar shows "**4-day streak**" on a brand-new account | Every app page |
| W3 | Onboarding right rail shows "**95% route so far · 5 of 5 answers**" on step 1 with zero answers (defaults counted as answers), 100% from step 2 | `/onboarding` |
| W4 | Journey "MENTOR'S READ" praises "*You cleared the paperwork stage faster than most*" at 0/24 steps | `/app/journey` |
| W5 | Dashboard greets "**Good evening, Arjun**" on an account named Claude | `/app` |
| W6 | Profile chips duplicate channel: "Meesho · General · **Meesho** · GST pending · new seller" | Journey header + mentor rail |
| W7 | Onboarding category selection may not persist (picked Fashion & apparel, profile saved General) — verify option-click → state wiring | Wizard step 5 |
| W8 | Decision wizard step counter renders "**Step 3 of ~2**" | `/app/tools/decision-trees/marketplace` |
| W9 | Supplier scorecard empty state shows "**0/100 — Avoid This Supplier**" in red before any input | `/app/tools/supplier-scorecard` |
| W10 | Shipping estimator ranks **India Post cheapest with COD toggle ON** while its own chip says "No COD" (₹0 COD fees in data make it win unfairly) | `/app/tools/shipping-estimator` |
| W11 | GST calendar lists both "GSTR-1 (Monthly)" and "NIL Return (GSTR-1/3B)" as separate same-day filings — a beginner reads this as two filings; also shows filings to a user with **no GSTIN** | `/app/tools/gst-calendar` |
| W12 | `page-reveal` route transition leaves a **long fully-black frame** (document-checker sat blank for seconds) | Route changes under `/app` |
| W13 | Landing **toolkit section collapses badly at 375px** — 4 columns squeezed, one-word-per-line, text clipped | Landing, mobile |
| W14 | Old design generation (slate/glass, colored chips, red banners) coexists with Mono Depth on: document-checker, success-stories, landing testimonials; task-runner uses orange mentor chips (decorative color, against design lock) | Various |
| W15 | Default unbranded Next 404 page | Any bad URL |
| W16 | "Ten questions" promised (welcome + signup copy), wizard asks 5 | `/app/welcome`, `/signup` |
| W17 | Landing hero + signup rail claim "**500+ sellers guided**" — fabricated | `/`, `/signup` |
| W18 | Header "Log in" button wraps to two lines at 375px; "₹5 000–₹50 000" thin-space grouping reads oddly | Mobile |

Everything below is sequenced. Within a phase, items are independent unless noted.

---

## Phase 0 — Trust integrity hotfixes (do first, ~1 week)

The product's only moat is "the honest mentor with correct numbers." Phase 0 removes everything that contradicts that. No new features until this ships.

### 0.1 Kill the fake personalization (M)
- **Greeting name** — [src/app/app/page.tsx:100](../src/app/app/page.tsx): replace hardcoded `Arjun` with the seller-profile name / user metadata / email-prefix fallback (welcome page already derives "Claude" correctly — reuse that logic, extract `getDisplayName()` into `src/lib/current-user.ts`).
- **Mentor's read (dashboard + journey)** — replace both static quote cards with `getModuleMentorLine(nextAction.moduleId, profile, status, hasGstin)` from [mentor-voice.ts](../src/lib/mentor-voice.ts) — the function already exists and is state-aware; the cards just don't call it. Add 2–3 line variants per module keyed on progress (0 steps vs mid-stage) so early users never get praised for work they haven't done (fixes W4).
- **Tools for this stage** — dashboard right rail: map `nextAction.moduleId` → that module's `tools` list from journey-rules `ModuleCopy.tools` (data already exists).
- **Streak** — [streak-data.ts](../src/lib/streak-data.ts): compute from real activity records; a new account shows "Day 1 — start your streak today", not "4-day streak" (fixes W2).
- **Acceptance:** fresh account shows own name, a mentor line about *starting* documentation, stage-correct tools, day-0 streak.

### 0.2 Remove fabricated social proof (S–M)
- Delete "500+ sellers guided" stat blocks (landing hero, signup rail) or replace with honest claims ("Built on 2026-verified marketplace rate data").
- [success-stories.ts](../src/lib/success-stories.ts): retitle page "Worked examples — realistic unit economics", change subtitle away from "Real Indian sellers, real numbers", add a visible "Illustrative scenario" chip per card; remove the three cards from the landing testimonials section entirely (a pre-launch landing is more credible with zero testimonials than with fake ones).
- Tools index copy "Real sellers, real numbers" → "Worked examples with real fee math".
- **Acceptance:** no invented person/number presented as real anywhere; grep for "Real sellers" returns nothing.

### 0.3 Fix the crisis 404 (M)
- Create `src/app/app/crisis/page.tsx`: crisis-type chooser (account suspended / supplier OOS — protocols already in [playbooks.ts](../src/lib/crisis/playbooks.ts)) → sets `activeCrisis` via existing [crisis/actions.ts](../src/app/app/crisis/actions.ts) → redirect to `/app` where `CrisisHero`/`CrisisProtocol` already render.
- Add branded `src/app/not-found.tsx` (Mono Depth, "route not found — back to dashboard") (fixes W15).
- **Acceptance:** "Order gone wrong?" → chooser → dashboard in crisis mode; unknown URLs get branded 404.

### 0.4 Guest-table security (S, **security**)
Migration in `supabase/`:

```sql
alter table public.guest_profiles enable row level security;
alter table public.guest_journey_progress enable row level security;
alter table public.guest_workspace enable row level security;
alter table public.guest_task_progress enable row level security;
-- server-only access: no anon policies; reads/writes go through
-- the existing server client which supplies visitor_id explicitly.
create policy "guest_no_direct_access" on public.guest_profiles for select using (false);
```

Guest reads/writes already run server-side (`guest-supabase-store.ts` uses the server client), but the anon key must stop being able to enumerate rows via PostgREST. Either (a) deny-all policies + move guest stores to the service-role client, or (b) per-row policies keyed on a signed visitor claim. Option (a) is a one-hour change: swap `createSupabaseServerClient()` → `createSupabaseAdminClient()` inside the four guest stores only.
- **Acceptance:** `curl` PostgREST with anon key returns zero guest rows.

### 0.5 Onboarding honesty pass (M)
- Progress: count **visited/answered steps only** ([onboarding-wizard.tsx:66](../src/components/onboarding-wizard.tsx) — `answeredCount` counts prefilled defaults; use `stepIndex + answered-this-session` instead) (fixes W3).
- Copy: "Ten questions" → "Five quick questions" everywhere, or actually ask 10 (see 2.2) (fixes W16).
- Bug W7: trace option click → `setField` → submit payload for the category step; add a Playwright test that picks Fashion and asserts the saved profile.
- Dedupe journey chips (W6): the chip list builder repeats channel from two sources — dedupe in `profile-name.ts` / journey header component.

---

## Phase 1 — One correct math engine (~2 weeks)

### 1.1 Single source of truth for fees (M)
- Delete the hardcoded `commissionRate` ternary in [cashflow-engine.ts:114-126](../src/lib/cashflow-engine.ts); compute per-order net settlement from `getFeesForProduct(channel, category, price, isCod)` (thread `category` through `CashFlowInputs`). Remove the unused `profitResult` call.
- Move the duplicated category-RTO table and settlement-days table into single exports (`profit-math.ts` re-exports; [product-scoring.ts](../src/lib/product-scoring.ts) imports instead of redefining).
- **Acceptance:** margin calculator and cashflow simulator agree on per-order profit for identical inputs (unit test asserts equality within ₹1).

### 1.2 Correct RTO expected-value model (M — the most important math change)
Replace `rtoLoss` bolt-on in [profit-math.ts](../src/lib/profit-math.ts) with per-shipped-order expected value:

```
delivered  (prob 1−r): +price − productCost − shipping − fees − adCost
rto        (prob r):   −(2×shipping) − damageRate×productCost − adCost − codHandlingLoss
expectedProfit = (1−r)·delivered + r·rto
```

- Marketplace fee reversal on RTO varies by platform — model referral as refunded, fixed/closing+shipping as not (flag per channel in `marketplace-fees.ts`), and label the assumption in UI.
- `damageRate` default 30% (current assumption), exposed as an "advanced" input.
- Cashflow engine uses the same function (it already drops revenue on RTO orders; align its product-cost salvage with `damageRate`).
- **Acceptance:** at fashion defaults (35% RTO, COD), margin verdicts drop visibly; golden tests lock expected values; all five money tools consume this one function.

### 1.3 Fee-table corrections (M)
In [marketplace-fees.ts](../src/lib/marketplace-fees.ts):
- **Amazon:** remove the 2% `paymentGatewayFee`. Scope the 0%-under-₹1,000 program to the actual category list (apparel/footwear/jewellery/grocery/home/beauty/toys/kitchen/automotive/pet); electronics keeps its normal card. Add `fulfilment: "easy_ship" | "fba" | "self_ship"` dimension — start with Easy Ship numbers + a visible "Easy Ship assumed" chip.
- **Flipkart:** replace `2% PG + COD slab` double-count with one `collectionFee(price, paymentMode)`; add seller-tier note ("Bronze assumed — Gold/Silver rates are lower, check Seller Hub"). Cap fixed-fee bands at published ₹8–35 range.
- **Meesho:** keep 0% + platform fee; make platform fee a small slab (₹25–30) instead of flat 27 if verified.
- **Shopify:** add `monthlyFixedCost` (plan cost) amortized over expected orders + "you buy your own traffic" line item defaulting ad cost > 0; OR exclude Shopify from side-by-side tables and give it its own explainer panel. Recommended: the latter (S) now, the former (M) later.
- **Acceptance:** worked examples from [TOOLS-PLAN.md](TOOLS-PLAN.md) (₹999 jewellery ES ≈ ₹100 total fees post-Mar-2026, etc.) pass as unit tests.

### 1.4 One break-even ROAS definition (S)
- Delete `breakEvenRoas` from `calculateProfit` (or recompute as `price / (contribution before adCost)` and mark the old field deprecated). Margin calculator displays the same number the ROAS tool computes ([breakeven-roas.tsx:81](../src/components/tools/breakeven-roas.tsx) is the correct formula — extract `computeRoas` into `src/lib/roas.ts` and share).
- **Acceptance:** same product → identical ROAS in both tools (test).

### 1.5 GST guidance corrections (M)
- [decision-trees-data.ts](../src/lib/decision-trees-data.ts) "no GST" leaf → split: "Sell within your state on Meesho **today** with an Enrolment ID (free, GST portal) — turnover < ₹40L, intra-state only, can't do Amazon/Flipkart yet" vs "Register GSTIN (free on gst.gov.in) to unlock every marketplace + inter-state."
- Add journey rule: persona `!hasGstin && primaryChannel === "meesho"` gets an optional "Start without GSTIN (Enrolment ID)" subtask before "GSTIN obtained", marked `recommended`.
- Onboarding GSTIN step "Why we ask" panel: same nuance (currently claims marketplaces block everything without GSTIN).
- GST calendar: when `!hasGstin && !enrolmentPath`, show a "You don't have filing obligations yet — here's what starts when you register" empty state instead of a filing list (fixes half of W11); merge NIL-return display into the GSTR-1/3B cards as a "zero sales? file NIL versions of these" note (other half of W11).
- Late-fee copy: caps by turnover (₹2,000 ≤ ₹1.5cr AATO; ₹10,000 only > ₹5cr). TCS credit wording: "accept via TDS/TCS credit received statement", not GSTR-2A.

### 1.6 Locale + disclaimers (S–M)
- `src/lib/format.ts`: `formatINR()` using `Intl.NumberFormat("en-IN")` (₹1,00,000 grouping); replace ad-hoc `₹${x}` and `en-US` usages (dashboard date, CountUp).
- Roll `<DataFreshness meta={...}/>` + "Estimates — rates vary by account/category; check your rate card" onto **all** money tools (currently 3 of 17): cashflow, cod-prepaid, settlement, shipping, gst-calendar, decision trees results.

### 1.7 Golden-number test suite (M, gates everything above)
- Vitest + `npm run test` in CI. Fixtures: TOOLS-PLAN worked examples + hand-checked scenarios per channel/category/price-band; validator vectors (valid/invalid GSTIN checksums); RTO EV model edge cases (r=0, r=1); ROAS equality across tools; fee-engine parity between margin calc and cashflow.

---

## Phase 2 — UX & design consistency (~2 weeks, parallelizable with late Phase 1)

### 2.1 Design-system unification (L)
- Migrate old-generation surfaces to Mono Depth tokens/classes: document-checker, success-stories page, landing testimonials block, any `slate-*`/`glass-panel grain` remnants (W14).
- Task-runner mentor chips: orange → white/mono per design lock ("color = semantic only"); keep amber strictly for deadline/danger accents already sanctioned.
- Extract repeated inline-style patterns (tools index, pricing) into the documented surface classes. Target: no page > ~20 inline `style={{}}` props.

### 2.2 Onboarding completeness (M)
- After the 5 core steps, add a "Confirm assumptions" screen listing the silently-defaulted fields (state, business type, sales model, imports, prepackaged) as editable chips — one tap to change, Enter to accept. Personalization factors in step details then always reflect user-confirmed values.
- Fix W8 wizard step counter ("Step 3 of ~2" → track actual path length; `estimatedSteps` in [decision-wizard.tsx:27](../src/components/tools/decision-wizard.tsx) undercounts).

### 2.3 Tool empty/edge states (M)
- Supplier scorecard: neutral "Score a supplier to see the verdict" until ≥1 criterion answered (W9).
- Shipping estimator: when COD is on, grey out carriers with no COD support + "No COD" badge in the ranking (W10); add volumetric weight input `(L×W×H)/5000` (their own TOOLS-PLAN item, never built).
- Margin calculator & scorecards: "Excellent" verdicts recalibrate after 1.2 (expected: far fewer green badges — that's the product working).

### 2.4 Motion & performance (S–M)
- W12: bound `page-reveal` (animation-delay ≤ 150ms, fill-mode both) or gate on `document.visibilityState`; never leave content at opacity 0 if JS/observer stalls — CSS-only fallback.
- Landing: `three.js` particle background loads ~500KB on every visit — lazy-load below-fold, `prefers-reduced-motion` skip, or replace with CSS grain.
- W13: landing toolkit grid → single column under 640px; audit every landing section at 375px.
- W18: header Log-in button `white-space: nowrap`; tools-index "₹5 000" → `formatINR`.

### 2.5 Accessibility pass (M)
- Sliders (RTO, COD mix): keyboard focus + `aria-valuetext` ("25% RTO").
- Contrast: `--text-faintest #5a5a5a` on black fails WCAG AA for body-size text — reserve for decorative only, bump metadata to `--text-faint`.
- Focus-visible rings on all interactive cards (tool cards are whole-card links).
- Landing reveal animations: honor `prefers-reduced-motion` everywhere (some components already do).

---

## Phase 3 — Features that earn money (weeks 6–12)

Ordered by (retention value × feasibility). Each is shippable independently.

### 3.1 Settlement reconciliation lite — the Pro anchor (XL)
**Problem:** post-launch sellers can't tell if marketplace payouts match expectations; missed TCS credits and unreversed fees are silent losses. Recurring monthly pain = subscription justification.
- MVP scope: upload Amazon/Flipkart/Meesho settlement CSV → parse (papaparse, per-marketplace column maps as versioned adapters) → compare against `getFeesForProduct` expectations per order → report: fee deltas > threshold, TCS totals (with "claim via TDS/TCS statement" CTA), RTO orders whose referral wasn't reversed, net expected-vs-received.
- Tables: `user_settlement_uploads`, `user_settlement_rows` (RLS on), retention 12 months.
- UI: new tool "Payout reconciliation" in Money & margins; free tier = 1 upload/month, Pro unlimited + history trends.
- Risks: settlement CSV formats drift — adapters need the same `DATA_META` versioning as fees.

### 3.2 Weekly profit ritual (L)
- Monday digest: last week's saved unit economics × user-entered order counts (or 3.1 data when present), upcoming GST dates from the calendar engine, one mentor nudge from `mentor-voice`, streak status.
- Delivery: email first (Resend + Supabase scheduled function). WhatsApp later (3.6).
- Dashboard gets a matching "Weekly review" card replacing one static tile.

### 3.3 Live rate-card data moat (L, recurring editorial)
- Move fee tables to versioned JSON (`data/rates/2026-Q3.json`) loaded by `marketplace-fees.ts`; changelog file per release.
- "Rates updated" banner: diff user's saved calculator snapshots against new rates → "Amazon closing fee on your band +₹6 → margin −1.8%". This alert is a Pro feature and the single strongest retention hook.
- Process: quarterly verification pass (the TOOLS-PLAN sources list is the checklist), signed off in the changelog.

### 3.4 Crisis pack expansion (M)
- Add protocols: payment/settlement hold, IP complaint, GST clarification notice (SCN), courier dispute/fake delivery, review bombing. Same `CrisisProtocol` structure; reuse POA editor with per-crisis templates.
- Wire detectors: RTO shock already exists; add "payout overdue" (settlement days exceeded per 3.1 data) and "GSTR due in 48h and not marked done".

### 3.5 Real success-story pipeline (M, ongoing)
- In-app milestone prompts (first listing, first order, first payout) → consent flow → short interview template → published with "verified: payout screenshot reviewed" badge. Replaces Phase-0-neutered fake stories with the real thing within a quarter.

### 3.6 Hinglish + WhatsApp (L–XL, after PMF signals)
- i18n scaffold (`next-intl`), `hi-IN` (Hinglish register) starting with: dashboard, journey labels, mentor lines, COD sim already there. Number/currency stays en-IN.
- WhatsApp next-action nudges + weekly digest via Interakt/Gupshup — Pro tier; template approval lead time ~2 weeks, start early.

### 3.7 Monetization wiring (M)
- Razorpay subscriptions (₹299–₹499/mo Pro; annual ₹2,499). Gate: reconciliation history, rate-change alerts, WhatsApp delivery, multi-profile > 2.
- Pricing page: replace "coming soon" toast with wait-list email capture **now** (S — do in Phase 0 while touching trust surfaces).

---

## Sequencing summary

```
Week 1      Phase 0 (all)                      ← nothing else ships first
Weeks 2–3   1.1–1.4 (engine) + 1.7 tests       ← blocks tool copy changes
Weeks 3–4   1.5–1.6 + 2.2–2.5
Weeks 4–5   2.1 design unification
Weeks 6–9   3.1 reconciliation + 3.3 rate pipeline + 3.7 payments
Weeks 8–12  3.2 ritual, 3.4 crisis pack, 3.5 stories, then 3.6
```

Definition of done for the relaunch cut (end of week 5): fresh-account walkthrough shows zero fabricated state, every money number traceable to one engine with tests, all 17 tools carrying freshness badges, crisis flow working, mobile landing clean.

---

## Verification plan

1. **Unit:** golden-number suite (1.7) green in CI.
2. **E2E (Playwright):** signup → onboarding (assert saved profile matches selections, W7) → dashboard (assert real name, no static mentor text) → margin calc vs cashflow parity → crisis chooser → each tool renders non-blank within 500ms (W12 regression).
3. **Manual quarterly:** rate-card verification checklist against sources in TOOLS-PLAN; update `DATA_META.lastVerified`.
