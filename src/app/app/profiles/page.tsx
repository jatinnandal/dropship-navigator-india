import Link from "next/link";
import { Plus } from "lucide-react";
import { DeleteProfileButton } from "@/components/delete-profile-button";
import { SwitchProfileButton } from "@/components/switch-profile-button";
import { channelLabel } from "@/lib/profile-name";
import { getJourneyProgressStats } from "@/lib/journey-engine";
import { getStoredActiveProfileId } from "@/lib/active-profile";
import { getCurrentUserId } from "@/lib/current-user";
import { getCompletedModuleIdsForProfileId } from "@/lib/progress-store";
import { listSellerProfiles } from "@/lib/seller-profile-store";
import { getUserWorkspace } from "@/lib/user-workspace-store";
import { userHasProfile } from "@/lib/auth-routing";
import { redirect } from "next/navigation";

export default async function ProfilesPage() {
  const userId = await getCurrentUserId();
  if (!(await userHasProfile(userId))) {
    redirect("/app/welcome");
  }

  const [profiles, activeProfileId] = await Promise.all([
    listSellerProfiles(userId),
    getStoredActiveProfileId(userId),
  ]);

  const profilesWithProgress = await Promise.all(
    profiles.map(async (profile) => {
      const [completed, workspace] = await Promise.all([
        getCompletedModuleIdsForProfileId(profile.id),
        getUserWorkspace(userId, profile.id),
      ]);
      const stats = getJourneyProgressStats(profile, completed, workspace?.subTasks);
      return { profile, stats };
    }),
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Seller profiles</h1>
          <p className="text-muted mt-2 max-w-2xl text-sm">
            Each profile is a separate launch plan — own marketplace, product niche, journey progress, and
            workspace. Switch anytime from the sidebar.
          </p>
        </div>
        <Link
          href="/onboarding?mode=new&returnTo=/app/profiles"
          className="btn-primary inline-flex min-h-[44px] items-center gap-2 rounded-md px-4 py-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Add launch plan
        </Link>
      </header>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {profilesWithProgress.map(({ profile, stats }) => {
          const isActive = profile.id === activeProfileId;
          const percent = stats.subTaskPercent;
          return (
            <article
              key={profile.id}
              className={`rounded-xl border p-5 ${
                isActive ? "border-neutral-200 bg-neutral-900" : "border-neutral-800 bg-neutral-950"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold text-white">{profile.name}</p>
                  <p className="text-muted mt-1 text-sm">
                    {channelLabel(profile.primaryChannel)} · {profile.productType}
                  </p>
                </div>
                {isActive ? (
                  <span className="rounded-full border border-neutral-600 px-2 py-0.5 text-xs text-neutral-200">
                    Active
                  </span>
                ) : null}
              </div>

              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-neutral-400">
                  <span>Progress</span>
                  <span>
                    {stats.completedSubTasks}/{stats.totalSubTasks} steps ({percent}%)
                  </span>
                </div>
                <div className="progress-track h-1">
                  <div className="progress-fill" style={{ width: `${Math.max(percent, 4)}%` }} />
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                {!isActive ? (
                  <SwitchProfileButton profileId={profile.id} isActive={isActive}>
                    Switch to this plan
                  </SwitchProfileButton>
                ) : (
                  <Link
                    href="/app/journey"
                    className="btn-primary rounded-md px-3 py-1.5 text-xs font-medium"
                  >
                    Open journey
                  </Link>
                )}
                <Link
                  href={`/app/profiles/${profile.id}/edit?returnTo=/app/profiles`}
                  className="btn-ghost rounded-md px-3 py-1.5 text-xs font-medium"
                >
                  Edit inputs
                </Link>
                <DeleteProfileButton
                  profileId={profile.id}
                  profileName={profile.name}
                  canDelete={profiles.length > 1}
                />
              </div>
            </article>
          );
        })}
      </div>
    </main>
  );
}
