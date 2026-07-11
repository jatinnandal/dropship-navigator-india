import type { PrimaryChannel, ProductType } from "@/lib/mvp-data";

/**
 * A versioned marketplace rate card. All fee tables the engine uses live in
 * one immutable object per quarter under src/data/rates/ — the quarterly
 * verification pass produces a new file plus changelog entries, never an
 * in-place edit. `Infinity` marks an unbounded top band.
 */
export type ReferralEntry = { maxPrice: number; percent: number };
export type FeeBand = { maxPrice: number; fee: number };
export type WeightBracket = "light" | "medium" | "heavy";

export type RateCardMeta = {
  /** e.g. "2026-Q3" — compared against workspace.seenRatesVersion. */
  version: string;
  lastVerified: string;
  sources: string[];
  /** Human-readable changes vs the previous card (shown in the banner). */
  changelog: string[];
};

export type RateCard = {
  meta: RateCardMeta;
  amazonReferral: Record<ProductType, ReferralEntry[]>;
  amazonClosingFee: FeeBand[];
  flipkartCommission: Record<ProductType, number>;
  flipkartFixedFee: FeeBand[];
  flipkartCodCollection: FeeBand[];
  flipkartPrepaidCollectionPercent: number;
  meeshoPlatformFee: number;
  shopifyGatewayPercent: number;
  tcsPercent: number;
  gstOnFees: number;
  typicalShipping: Record<PrimaryChannel, Record<WeightBracket, number>>;
};
