# Step Pain Points Research (India Dropshipping)

Research-backed barriers and how Dropship Navigator solves them. Sources: Shopify community, seller forums, Meesho/Amazon onboarding guides, GST/RTO/ads articles (2025-2026).

## Cross-cutting

| Pain | What beginners say / do | Our solution |
|------|-------------------------|--------------|
| No clear path | "Nobody tells me the clear path... I am so confused" | 7-module guided walkthroughs with branching, not text dumps |
| Name mismatch | PAN vs bank vs GST vs marketplace spellings differ | Lock legal name once; workspace memory; pre-warn at channel launch |
| Revenue ≠ profit | Celebrate sales while losing money | India profit calculator with fees, TCS, RTO; weekly P&L ritual |

## 1. common-documentation (GST + base docs)

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| GST "optional" myth | Think ₹20L threshold applies on marketplaces | Sec 24(ix) branch: mandatory from day 1 for marketplace |
| GSTIN sync delay | New GSTIN fails verification 24-72h | Trap + retry guidance on validate-status step |
| Blurry KYC scans | Meesho/Flipkart auto-reject dark phone photos | Dedicated scan-quality step |
| Mobile reuse | Number linked to old seller account | mobile-fresh question + fix branch |
| REG-03 missed | Clarification notice ignored → auto-reject | track-arn + handle-reg03 steps |
| Address proof wrong | Rented/shared needs NOC; Amazon wants utility bill | Premises branching in registration track |

## 2. product-selection

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Viral product picks | Instagram trends ≠ marketplace demand | demand-check with Google Trends + best-seller guidance |
| No margin math | Only compare cost vs price | Embedded margin calculator with India fees |
| RTO-heavy categories | Fashion 30-40% RTO on COD | product-risk screener + conservative RTO default |
| Bulk before sample | Order inventory before testing | sample-commit step (non-negotiable) |
| 3x markup ignored | Thin margin + ads = guaranteed loss | markup-gate question + fix branch |
| Abstract RTO risk | Can't feel margin erosion | product swipe game + RTO reality slider simulators |

## 3. compliance-by-product

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| One template for all | Food/electronics/beauty need different certs | Branch by productType, imports, prepackaged |
| FSSAI skipped | Food listings blocked without license | fssai step for food profile |
| BIS unknown | Electronics seized without CRS cert | bis-check + action branch |
| Legal Metrology | Pre-packaged missing MRP/net qty | legal-metrology step when sellsPrepackagedGoods |
| Wrong HSN | Listing suppression, wrong tax | gst-config + HSN mapping guidance |

## 4. supplier-sourcing

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| IndiaMART scams | 100% advance, off-platform payment | red-flag-screener question + detail step |
| Trader vs manufacturer | Middleman markup + quality risk | manufacturer-check question |
| Catalogue-only trust | Photos borrowed from other brands | sample-order step + factory verification |
| No written terms | Defects become seller's loss | negotiate-terms step |
| No backup supplier | Stockout = zero sales overnight | backup-supplier step |

## 5. channel-launch

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Multi-channel day 1 | Spread thin across Amazon+Flipkart+Meesho | one-channel focus from profile.primaryChannel |
| KYC mismatch repeat | Same name issues as GST | Reuse workspace; nameMismatchWarning at launch |
| Weak listings | Generic titles, bad images | listing-quality checklist |
| 50 listings at once | 50 compliance issues at once | one hero listing first, expand after validation |
| PG rejected (Shopify) | Razorpay/Cashfree reject new dropship stores | Zero-PG branch: COD-only, UPI QR, Meesho parallel, PG re-apply checklist |
| COD without practice | First RTO from bad confirmation call | NDR caller simulator in launch + ads modules |

## 6. ads-growth

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Ads before PMF | Burn budget with no conversion data | ads-readiness gate |
| Unknown break-even ROAS | Celebrate 2x ROAS while losing money | breakeven-roas calculator step |
| Meta personal profile bans | Ads from personal FB = high ban rate | meta-setup for Shopify path |
| New account big spend | ₹50K/day day 1 = suspicious activity flag | gradual budget guidance |
| RTO while scaling ads | Paying to generate returns | cod-rto-ads + rto_impact calculator |
| Cashflow dead zone | Ad spend today, COD cash day 5-7 | cashflow_timeline simulator |
| NDR fear | Won't call customers to confirm COD | ndr_caller simulator + WhatsApp templates |

## 7. tracking-analytics

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Dashboard revenue ≠ bank | 20-30% gone to fees before COGS | revenue-vs-profit step |
| No SKU-level P&L | Winners subsidize losers | pnl-setup + calculator |
| Settlement mismatch | 2-5% silent underpayment | settlement-reconciliation weekly ritual |
| TCS not recovered | 1% left on table every sale | tcs-recovery step |
| RTO reasons ignored | Same pincodes/products repeat | rto-tracking + fix root causes |
| Cash timing blind spot | Profitable on paper, broke in bank | cashflow-review simulator in tracking module |

## UX audit additions (journey map)

| Theme | Implementation |
|-------|----------------|
| Non-linear skill tree | `journey-graph.ts` + `JourneyMap` with prerequisite locks on ads |
| Simulators | RTO slider, cashflow timeline, NDR caller, product swipe game |
| Jargon help | Global `JargonProvider` + dashed underline terms |
| Zero-PG Shopify | COD-only + UPI QR + Meesho parallel in channel-launch task |
| Gamification | `TaskToggle` sub-tasks, milestone confetti, product re-pick loop |

## Mentor maturity pass (Jun 2026)

| Problem | Solution in app |
|---------|-----------------|
| Fake COD / incomplete address | NDR sim: incomplete address scenario, ₹60–90 loss animation, address-verify template |
| RTO at realistic defaults | Will I Survive? slider — fashion 35%, general 25%, selling price slider |
| COD vs prepaid mix | `cod_prepaid_mix` simulator in ads-growth |
| AliExpress / China sourcing trap | `sourcing_swipe` game in supplier-sourcing |
| Returns ≠ RTO (fashion) | `returns-vs-rto` lesson + fashion profile branches (size chart, return buffer) |
| Pincode pilot / courier SLA | `pincode_pilot` planner + courier benchmark + SLA templates |
| Payout holds / appeals | `payout-holds`, `appeal-pack` steps + copy-paste escalation templates |
| GSTR-8 reconciliation | `gstr8-reconcile` step alongside TCS recovery |
| PG rejection (individuals) | Business-entity check + mobile-first Zero-PG checkout on Shopify |
| Soft gates | Journey map amber warnings (simulators recommended, not hard-locked) |

## Critical audit fix pass (Jun 2026 — 16 issues)

| # | Issue | Fix in app |
|---|-------|------------|
| 01 | Onboarding form dump | `onboarding-steps.ts` + `OnboardingWizard` — one question per screen |
| 02 | Dashboard no next action | `next-action.ts` + pinned "Do this now" hero on `/app` |
| 03 | RTO/COD depth | Prepaid incentive + pincode blacklist steps in channel-launch; NDR 24h callout |
| 04 | Account suspension | protect-account, shipping-sla, invoice/IP steps + `PAOS_APPEAL_TEMPLATE` |
| 05 | GST filing calendar | `gst-filing-calendar` step + dashboard banner via `getGstFilingBanner()` |
| 06 | Margin calculator | Monthly projections + break-even orders in `profit-calculator.tsx` |
| 07 | Passive module voice | `mentor-voice.ts` on journey module pages |
| 08 | Skill tree label | `JourneyGraphView` SVG + "Your launch plan" copy |
| 09 | Sub-task how-to | `subtask-guides.ts` + expandable `TaskToggle` |
| 10 | Settlement depth | Channel payment timelines in `settlement-reconciliation` |
| 11 | Logistics selection | `logistics-selection` step (channel-aware) |
| 12 | Festival seasonality | `india-commerce-calendar.ts` + `SeasonNotice` on dashboard |
| 13 | TCS/TDS explainer | `SettlementBreakdown` component (₹1000 → payout example) |
| 14 | Too few locks | Extended soft warnings in `journey-graph.ts` (HSN, GSTIN, supplier, ROAS) |
| 15 | Supplier failures | OOS, price hike, quality playbook steps |
| 16 | Mobile optimization | 44px touch targets, mobile timeline, `AppMobileNav` bottom bar |

## PDF v2 design feedback pass (Jun 2026)

| Theme | Implementation |
|-------|----------------|
| Per-sub-task dashboard why | `why` on every entry in `subtask-guides.ts`; `getNextAction()` + fresh-start hero copy on `/app` |
| SVG short labels | `NODE_SHORT_LABELS` in `journey-graph-view.tsx` (Docs/Product/Compliance/etc.) |
| How-to discoverability | `TaskToggle`: tappable label row + amber "How to do this" link + expand animation |
| Onboarding mentor voice | `mentorNote` + `ack` on all steps; wizard shows ~mins left + acknowledgement banner |
| Dashboard progress ring | `ProgressRing` component replaces linear bar as primary progress indicator |
| Journey next-step callout | Pinned incomplete sub-task + time estimate in `journey-map.tsx` module panel |
| Glass hierarchy + semantics | `glass-panel-primary/tertiary`, `banner-deadline`, checkbox bounce, expand grid animation |
| Meesho playbook depth | Meesho branch in `step-details.ts` (Valmo, catalog rank, price control) |
| Calendar expansion | Holi, Eid, Mother's Day, Independence Day, Meesho Mega Sale in `india-commerce-calendar.ts` |
| NDR scenario 5 | Open-before-pay COD scenario in `ndr-caller-simulator.tsx` |
| Sourcing deck depth | 15 cards in `sourcing-swipe-game.tsx` (China traps, GST scams, domestic viable) |
| Margin calculator UX | Sliders for price/RTO/ads + `<15%` thin-margin warning banner |
| Mentor copy pass | Module completion messages, lean-budget ads traps, zero-progress dashboard hero |

## Tool recommendations (vendor-neutral)

Recommend only when the step genuinely needs external help:

- **GST/compliance**: ClearTax, TheGSTCo, IndiaFilings
- **Product research**: Google Trends, Helium 10, SellerSprite
- **Sourcing**: IndiaMART, TradeIndia, BaapStore
- **Ads**: Amazon Ads, Meta Business Manager, Confirmify/Level (COD confirm)
- **Tracking**: eVanik, TrackEcom, eCominess

Always disclose affiliate relationships when links are added.
