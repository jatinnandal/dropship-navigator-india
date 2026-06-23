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
| 50 listings at once | 50 compliance issues at once | first 3-5 listings gate |

## 6. ads-growth

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Ads before PMF | Burn budget with no conversion data | ads-readiness gate |
| Unknown break-even ROAS | Celebrate 2x ROAS while losing money | breakeven-roas calculator step |
| Meta personal profile bans | Ads from personal FB = high ban rate | meta-setup for Shopify path |
| New account big spend | ₹50K/day day 1 = suspicious activity flag | gradual budget guidance |
| RTO while scaling ads | Paying to generate returns | cod-rto-ads + rto_impact calculator |

## 7. tracking-analytics

| Pain | Detail | Solution in app |
|------|--------|-----------------|
| Dashboard revenue ≠ bank | 20-30% gone to fees before COGS | revenue-vs-profit step |
| No SKU-level P&L | Winners subsidize losers | pnl-setup + calculator |
| Settlement mismatch | 2-5% silent underpayment | settlement-reconciliation weekly ritual |
| TCS not recovered | 1% left on table every sale | tcs-recovery step |
| RTO reasons ignored | Same pincodes/products repeat | rto-tracking + fix root causes |

## Tool recommendations (vendor-neutral)

Recommend only when the step genuinely needs external help:

- **GST/compliance**: ClearTax, TheGSTCo, IndiaFilings
- **Product research**: Google Trends, Helium 10, SellerSprite
- **Sourcing**: IndiaMART, TradeIndia, BaapStore
- **Ads**: Amazon Ads, Meta Business Manager, Confirmify/Level (COD confirm)
- **Tracking**: eVanik, TrackEcom, eCominess

Always disclose affiliate relationships when links are added.
