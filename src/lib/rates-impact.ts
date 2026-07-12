import { CURRENT_RATES, PREVIOUS_RATES } from "@/data/rates";
import { getFeesForProduct } from "@/lib/marketplace-fees";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { calculateProfit, defaultRtoForProductType } from "@/lib/profit-math";
import type { Workspace } from "@/lib/workspace";

export type RatesImpact = {
  fromVersion: string;
  toVersion: string;
  oldNetMarginPercent: number;
  newNetMarginPercent: number;
  /** newMargin - oldMargin, in percentage points. */
  deltaPoints: number;
  oldNetProfit: number;
  newNetProfit: number;
  /** Fee-component changes relevant to this user's product. */
  changes: string[];
  /** Card-level changelog (all changes, not just this user's). */
  changelog: string[];
};

/**
 * Diffs the user's saved unit economics between the previous and current rate
 * cards. Returns null when there is nothing to say: no saved numbers, no new
 * card version, or the new card doesn't move this user's numbers.
 */
export function computeRatesImpact(input: {
  profile: OnboardingProfile;
  workspace: Workspace;
}): RatesImpact | null {
  const { profile, workspace } = input;

  if (CURRENT_RATES.meta.version === PREVIOUS_RATES.meta.version) return null;
  if (!workspace.targetSellingPrice || workspace.productCost === undefined) return null;

  const base = {
    sellingPrice: workspace.targetSellingPrice,
    productCost: workspace.productCost,
    shippingCost: workspace.shippingCost ?? 70,
    adCostPerOrder: 0,
    rtoRatePercent: workspace.estimatedRtoRate ?? defaultRtoForProductType(profile.productType),
    channel: profile.primaryChannel,
    category: profile.productType,
    isCod: true,
  };

  const oldResult = calculateProfit({ ...base, rates: PREVIOUS_RATES });
  const newResult = calculateProfit({ ...base, rates: CURRENT_RATES });

  const changes = describeFeeChanges(input);
  const deltaPoints = newResult.netMarginPercent - oldResult.netMarginPercent;

  // Nothing moved for this user - stay silent.
  if (changes.length === 0 && Math.abs(deltaPoints) < 0.05) return null;

  return {
    fromVersion: PREVIOUS_RATES.meta.version,
    toVersion: CURRENT_RATES.meta.version,
    oldNetMarginPercent: oldResult.netMarginPercent,
    newNetMarginPercent: newResult.netMarginPercent,
    deltaPoints,
    oldNetProfit: oldResult.netProfit,
    newNetProfit: newResult.netProfit,
    changes,
    changelog: CURRENT_RATES.meta.changelog,
  };
}

/** Compare fee components at the user's price point, channel and category. */
function describeFeeChanges(input: {
  profile: OnboardingProfile;
  workspace: Workspace;
}): string[] {
  const { profile, workspace } = input;
  const price = workspace.targetSellingPrice ?? 0;
  const category = profile.productType;
  const channel = profile.primaryChannel;

  const before = getFeesForProduct(channel, category, price, true, PREVIOUS_RATES);
  const after = getFeesForProduct(channel, category, price, true, CURRENT_RATES);

  const changes: string[] = [];
  const pct = (v: number) => `${v}%`;
  const rup = (v: number) => `₹${Math.round(v)}`;

  if (before.referralPercent !== after.referralPercent) {
    changes.push(
      `${after.name} referral/commission on your price band: ${pct(before.referralPercent)} → ${pct(after.referralPercent)}`,
    );
  }
  if (before.closingFee !== after.closingFee) {
    changes.push(`${after.name} closing fee on your band: ${rup(before.closingFee)} → ${rup(after.closingFee)}`);
  }
  if (before.fixedFee !== after.fixedFee) {
    changes.push(`${after.name} fixed fee on your band: ${rup(before.fixedFee)} → ${rup(after.fixedFee)}`);
  }
  if (before.codCollectionFee !== after.codCollectionFee) {
    changes.push(
      `${after.name} COD collection fee on your band: ${rup(before.codCollectionFee)} → ${rup(after.codCollectionFee)}`,
    );
  }
  if (before.platformFee !== after.platformFee) {
    changes.push(`${after.name} platform fee: ${rup(before.platformFee)} → ${rup(after.platformFee)}`);
  }
  if (before.tcsPercent !== after.tcsPercent) {
    changes.push(`TCS: ${pct(before.tcsPercent)} → ${pct(after.tcsPercent)}`);
  }

  return changes;
}
