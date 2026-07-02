import type { OnboardingProfile, PrimaryChannel, ProductType } from "@/lib/mvp-data";

export const CHANNEL_LABELS: Record<PrimaryChannel, string> = {
  meesho: "Meesho",
  amazon: "Amazon",
  flipkart: "Flipkart",
  shopify: "Shopify",
};

const PRODUCT_LABELS: Record<ProductType, string> = {
  general: "General",
  food: "Food",
  beauty: "Beauty",
  electronics: "Electronics",
  fashion: "Fashion",
};

export function defaultProfileName(profile: Pick<OnboardingProfile, "primaryChannel" | "productType">): string {
  return `${CHANNEL_LABELS[profile.primaryChannel]} · ${PRODUCT_LABELS[profile.productType]}`;
}

export function channelLabel(channel: PrimaryChannel): string {
  return CHANNEL_LABELS[channel];
}

export function getEditProfileHref(profileId: string, returnTo?: string): string {
  const base = `/app/profiles/${profileId}/edit`;
  if (!returnTo) return base;
  return `${base}?returnTo=${encodeURIComponent(returnTo)}`;
}
