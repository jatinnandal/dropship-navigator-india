# Rate card changelog

Quarterly verification process (the accuracy contract's editorial half):

1. Re-check every source listed in the current card's `meta.sources`
   (Amazon/Flipkart/Meesho fee pages + TCS notifications).
2. Copy the previous quarter's file to `YYYY-qN.ts`, apply changes, write
   user-readable `meta.changelog` entries (these render in the in-app
   "Rates updated" banner — write them for sellers, not developers).
3. Point `CURRENT_RATES`/`PREVIOUS_RATES` in `index.ts` at the new pair.
4. Run `npm test` — golden fee tests must be updated deliberately, never
   silently. Sign off below.

## 2026-Q3 (verified 2026-07-09)

- Amazon: 0% referral ≤ ₹1,000 in eligible categories (Mar 16, 2026 program);
  electronics excluded. Above ₹1,000 re-verified per category.
- Flipkart / Meesho / TCS / shipping: re-verified, unchanged.
- Signed off: engineering pass, July 2026 (web verification against
  sell.amazon.in, seller.flipkart.com, supplier.meesho.com, taxguru.in).

## 2026-Q1 (baseline, verified 2026-01-15)

- Reconstructed pre-March-2026 card. Exists so early-2026 calculator
  snapshots diff correctly; not used for live computation.
