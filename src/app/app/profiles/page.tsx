import Link from "next/link";
import { Plus, LogOut, ArrowUpRight, LayoutDashboard, Pencil } from "lucide-react";
import { SwitchProfileButton } from "@/components/switch-profile-button";
import { channelLabel } from "@/lib/profile-name";
import { getJourneyProgressStats } from "@/lib/journey-engine";
import { getStoredActiveProfileId } from "@/lib/active-profile";
import { getCurrentUserId, getCurrentUserEmail } from "@/lib/current-user";
import { getCompletedModuleIdsForProfileId } from "@/lib/progress-store";
import { listSellerProfiles } from "@/lib/seller-profile-store";
import { getUserWorkspace } from "@/lib/user-workspace-store";
import { userHasProfile } from "@/lib/auth-routing";
import { redirect } from "next/navigation";
import { signOut } from "@/app/login/actions";

export default async function ProfilesPage() {
  const userId = await getCurrentUserId();
  if (!(await userHasProfile(userId))) {
    redirect("/app/welcome");
  }

  const [profiles, activeProfileId, email] = await Promise.all([
    listSellerProfiles(userId),
    getStoredActiveProfileId(userId),
    getCurrentUserEmail(),
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

  const userInitial = email ? email[0]?.toUpperCase() : "U";

  return (
    <main className="page-reveal mx-auto w-full max-w-[72rem] px-4 py-0 sm:px-8">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-5 px-1 pb-[22px]">
        <div>
          <p className="eyebrow">Profiles</p>
          <h1 className="mt-2.5 text-[27px] font-semibold text-white" style={{ letterSpacing: "-0.03em" }}>
            Your business <span className="font-serif-accent">plans.</span>
          </h1>
          <p className="mt-2 max-w-[38rem] text-sm leading-[1.65] text-[var(--muted)]">
            Each plan is a separate route with its own answers, progress, and streak. Switch anytime — nothing is lost.
          </p>
        </div>
        <Link
          href="/onboarding?mode=new&returnTo=/app/profiles"
          className="btn-primary inline-flex min-h-[44px] items-center gap-[9px] rounded-[11px] px-5 text-[13.5px] font-semibold no-underline"
        >
          + New plan
        </Link>
      </div>

      {/* Plan cards grid */}
      <div className="grid gap-3.5" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
        {profilesWithProgress.map(({ profile, stats }) => {
          const isActive = profile.id === activeProfileId;
          const percent = stats.subTaskPercent;
          return (
            <article
              key={profile.id}
              className="relative rounded-[20px] p-6 will-change-transform"
              style={{
                background: isActive ? "var(--card-raised)" : "var(--card)",
                border: `1px solid ${isActive ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.1)"}`,
                boxShadow: isActive
                  ? "0 0 50px -20px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.08)"
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
              }}
            >
              {/* Top row: icon + name + active badge */}
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span
                    className="grid place-items-center w-10 h-10 rounded-[11px] text-[17px]"
                    style={{
                      background: "#101010",
                      border: "1px solid rgba(255,255,255,0.14)",
                    }}
                  >
                    <LayoutDashboard className="h-[18px] w-[18px] text-white/70" />
                  </span>
                  <div>
                    <p className="text-[16px] font-semibold text-white" style={{ letterSpacing: "-0.02em" }}>
                      {profile.name}
                    </p>
                    <p className="mt-0.5 font-mono text-[11px] text-[var(--text-faint)]">
                      {channelLabel(profile.primaryChannel)} &middot; {profile.productType}
                    </p>
                  </div>
                </div>
                {isActive ? (
                  <span
                    className="inline-flex items-center gap-[7px] rounded-full px-2.5 py-1 font-mono text-[9.5px] font-medium uppercase text-white"
                    style={{
                      letterSpacing: "0.12em",
                      border: "1px solid rgba(255,255,255,0.25)",
                    }}
                  >
                    <span className="w-[5px] h-[5px] rounded-full bg-white" />
                    active
                  </span>
                ) : null}
              </div>

              {/* Progress bar */}
              <div className="mt-[18px] flex items-center gap-3.5">
                <div className="flex-1 h-[5px] rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div
                    className="h-full rounded-full"
                    style={{
                      background: isActive ? "#ffffff" : "rgba(255,255,255,0.35)",
                      width: `${Math.max(percent, 3)}%`,
                    }}
                  />
                </div>
                <span className="font-mono text-xs text-[var(--muted)]">{percent}%</span>
              </div>
              <p className="mt-2 text-[12.5px] text-[var(--text-faint)]">
                {stats.completedSubTasks}/{stats.totalSubTasks} steps completed
              </p>

              {/* Actions */}
              <div className="mt-[18px] flex gap-2">
                {isActive ? (
                  <Link
                    href="/app/journey"
                    className="btn-primary inline-flex min-h-[38px] items-center rounded-[10px] px-4 text-[13px] font-semibold no-underline"
                  >
                    Open dashboard
                  </Link>
                ) : (
                  <SwitchProfileButton profileId={profile.id} isActive={isActive}>
                    Switch to this plan
                  </SwitchProfileButton>
                )}
                <Link
                  href={`/app/profiles/${profile.id}/edit?returnTo=/app/profiles`}
                  className="inline-flex items-center min-h-[38px] px-3.5 rounded-[10px] text-[13px] font-medium text-[var(--muted)] no-underline hover:text-white"
                  style={{ border: "1px solid rgba(255,255,255,0.1)" }}
                >
                  <Pencil className="h-3.5 w-3.5 mr-1.5" />
                  Edit answers
                </Link>
              </div>
            </article>
          );
        })}

        {/* Ghost "Start another business" card */}
        <Link
          href="/onboarding?mode=new&returnTo=/app/profiles"
          className="grid place-items-center min-h-[210px] rounded-[20px] no-underline transition-[border-color,background] duration-200 hover:bg-white/[0.02]"
          style={{
            background: "transparent",
            border: "1px dashed rgba(255,255,255,0.16)",
          }}
        >
          <div className="text-center">
            <span
              className="inline-grid place-items-center w-11 h-11 rounded-full text-xl text-[var(--muted)]"
              style={{ border: "1px solid rgba(255,255,255,0.2)" }}
            >
              <Plus className="h-5 w-5" />
            </span>
            <p className="mt-3 text-sm font-semibold text-[var(--muted)]">Start another business</p>
            <p className="mt-1 font-mono text-[11px] text-[var(--text-ghost)]">new route &middot; new answers</p>
          </div>
        </Link>
      </div>

      {/* Account section */}
      <section
        className="mt-[30px] max-w-[44rem] rounded-[20px] p-6"
        style={{
          background: "var(--card)",
          border: "1px solid rgba(255,255,255,0.1)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        }}
      >
        <p className="mono-label mb-4" style={{ fontSize: "10px" }}>Account</p>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-[13px]">
            <span
              className="grid place-items-center w-[42px] h-[42px] rounded-full text-[15px] font-semibold text-white"
              style={{
                background: "#111111",
                border: "1px solid rgba(255,255,255,0.16)",
              }}
            >
              {userInitial}
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{email ?? "Account"}</p>
              <p className="mt-0.5 font-mono text-[11.5px] text-[var(--text-faint)]">free plan</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              href="/pricing"
              className="inline-flex items-center min-h-[38px] px-4 rounded-[10px] text-[13px] font-semibold text-[#e8e8e8] no-underline hover:border-white/[0.4]"
              style={{ border: "1px solid rgba(255,255,255,0.18)" }}
            >
              Upgrade
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Link>
            <form action={signOut}>
              <button
                type="submit"
                className="inline-flex items-center min-h-[38px] px-4 rounded-[10px] text-[13px] font-medium text-[var(--muted)] hover:text-white cursor-pointer bg-transparent"
                style={{ border: "1px solid rgba(255,255,255,0.1)", fontFamily: "var(--font-instrument-sans), system-ui, sans-serif" }}
              >
                <LogOut className="h-3.5 w-3.5 mr-1.5" />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
