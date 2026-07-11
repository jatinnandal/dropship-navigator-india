import { notFound } from "next/navigation";
import { OnboardingWizard } from "@/components/onboarding-wizard";
import type { OnboardingProfile } from "@/lib/mvp-data";
import { getCurrentUserId } from "@/lib/current-user";
import { countMaterialChangesThisMonth, getSellerProfileById } from "@/lib/seller-profile-store";
import { getCurrentEntitlements } from "@/lib/plan";
import { requireUser } from "@/lib/supauth";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ returnTo?: string; error?: string }>;

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
  const { returnTo, error } = await searchParams;

  const sellerProfile = await getSellerProfileById(userId, id);
  if (!sellerProfile) notFound();

  const [entitlements, changesUsed] = await Promise.all([
    getCurrentEntitlements(),
    countMaterialChangesThisMonth(id),
  ]);
  const changeCap = entitlements.materialProfileChangesPerMonth;
  const changesLeft = Math.max(0, changeCap - changesUsed);

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
      {error === "changes_exhausted" ? (
        <div
          className="mb-6 rounded-xl border p-4 text-sm leading-6"
          style={{
            borderColor: "color-mix(in oklab, var(--danger) 40%, transparent)",
            background: "color-mix(in oklab, var(--danger) 10%, transparent)",
            color: "var(--body-text)",
          }}
        >
          You&apos;ve changed this profile&apos;s key details the maximum of {changeCap} times this
          month. Your last change wasn&apos;t saved. You can still edit the name and budget, or come
          back next month — or run a separate profile for a different setup.
        </div>
      ) : changeCap > 0 ? (
        <p className="text-[var(--text-faint)] mb-4 text-xs">
          Key-detail changes left this month: {changesLeft} of {changeCap}. Name and budget edits are
          unlimited.
        </p>
      ) : null}

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
