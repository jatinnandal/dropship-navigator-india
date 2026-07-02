import { notFound } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { getCurrentUserId } from "@/lib/current-user";
import { getSellerProfileById } from "@/lib/seller-profile-store";
import { requireUser } from "@/lib/supauth";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ returnTo?: string }>;

export default async function EditProfilePage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  await requireUser();
  const userId = await getCurrentUserId();
  const { id } = await params;
  const { returnTo } = await searchParams;

  const sellerProfile = await getSellerProfileById(userId, id);
  if (!sellerProfile) notFound();

  const onboardingProfile: OnboardingProfile = {
    experienceLevel: sellerProfile.experienceLevel,
    budgetBand: sellerProfile.budgetBand,
    primaryChannel: sellerProfile.primaryChannel,
    hasGstin: sellerProfile.hasGstin,
    operatingState: sellerProfile.operatingState,
    productType: sellerProfile.productType,
    businessType: sellerProfile.businessType,
    salesModel: sellerProfile.salesModel,
    importsProducts: sellerProfile.importsProducts,
    sellsPrepackagedGoods: sellerProfile.sellsPrepackagedGoods,
  };

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <OnboardingWizard
        profile={onboardingProfile}
        mode="edit"
        profileId={sellerProfile.id}
        profileName={sellerProfile.name}
        originalChannel={onboardingProfile.primaryChannel}
        returnTo={returnTo ?? "/app/profiles"}
        title="Edit launch plan"
        introDescription="Update your seller inputs. Changing marketplace affects channel launch and ads copy; your completed checkmarks stay unless you reset those modules."
        skipIntroOnEdit
      />
    </main>
  );
}
