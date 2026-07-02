import type { OnboardingProfile } from "@/lib/mvp-data";

export type SellerProfile = OnboardingProfile & {
  id: string;
  name: string;
  userId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type SellerProfileSummary = Pick<SellerProfile, "id" | "name" | "primaryChannel" | "productType">;
