import { NextResponse, type NextRequest } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getJourneyProgressStats } from "@/lib/journey-engine";
import { getJourneyNodes } from "@/lib/journey-graph";
import { getNextAction } from "@/lib/next-action";
import { getActiveSellerProfile, getStoredProfile } from "@/lib/profile-store";
import { getCompletedModuleIds } from "@/lib/profile-store";
import { listUploads } from "@/lib/settlement-recon-store";
import { getUserWorkspace } from "@/lib/user-workspace-store";
import { buildWeeklyReview } from "@/lib/weekly-review";
import { sendWeeklyReviewEmail } from "@/lib/weekly-review-email";

/**
 * Monday digest sender. Point a scheduler at this once a week:
 *   - Vercel cron: { "path": "/api/cron/weekly-review", "schedule": "30 3 * * 1" }  (9am IST Monday)
 *   - or Supabase scheduled function hitting the URL.
 * Auth: Authorization: Bearer $CRON_SECRET.
 * No-ops with 503 until RESEND_API_KEY is configured.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const auth = request.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: "RESEND_API_KEY not configured — digest disabled" },
      { status: 503 },
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "service role not configured" }, { status: 503 });
  }

  // Page through every auth user — listUsers caps each page, so a single call
  // silently drops everyone past the first page once the user base grows.
  const PER_PAGE = 500;
  const users: { id: string; email?: string; email_confirmed_at?: string }[] = [];
  for (let page = 1; ; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: PER_PAGE });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    users.push(...data.users);
    if (data.users.length < PER_PAGE) break;
  }

  let sent = 0;
  let skipped = 0;

  // Weekly digest is a paid feature (Starter+).
  const { data: subs } = await admin
    .from("subscriptions")
    .select("user_id,plan,status")
    .in("plan", ["starter", "growth"])
    .neq("status", "cancelled");
  const paidUserIds = new Set((subs ?? []).map((s) => s.user_id));

  for (const user of users) {
    if (!user.email || !user.email_confirmed_at || !paidUserIds.has(user.id)) {
      skipped++;
      continue;
    }

    const [profile, activeProfile, workspace, completed] = await Promise.all([
      getStoredProfile(user.id),
      getActiveSellerProfile(user.id),
      getUserWorkspace(user.id),
      getCompletedModuleIds(user.id),
    ]);
    if (!profile || !activeProfile) {
      skipped++;
      continue;
    }

    const ws = workspace ?? {};
    const hasGstin = profile.hasGstin || Boolean(ws.gstin);
    const nodes = getJourneyNodes({
      completedModules: completed,
      subTasks: ws.subTasks,
      completedSimulators: ws.completedSimulators,
      hasGstin,
      profile,
    });
    const nextAction = getNextAction({ profile, nodes, subTasks: ws.subTasks });
    const progressStats = getJourneyProgressStats(profile, completed, ws.subTasks);
    const latestUpload = (await listUploads(activeProfile.id))[0];

    const review = buildWeeklyReview({
      profile,
      workspace: ws,
      hasGstin,
      currentModuleId: nextAction?.moduleId ?? "product-selection",
      moduleStatus: nextAction
        ? nodes.find((n) => n.id === nextAction.moduleId)?.status ?? "available"
        : "done",
      progress: {
        completedSubTasks: progressStats.completedSubTasks,
        totalSubTasks: progressStats.totalSubTasks,
      },
      recon: latestUpload
        ? {
            uploadedAt: latestUpload.uploadedAt,
            totalDelta: latestUpload.summary.totalDelta,
            flaggedCount: latestUpload.summary.flaggedCount,
            tcsEstimate: latestUpload.summary.tcsEstimate,
          }
        : null,
    });

    const displayName = activeProfile.name || user.email.split("@")[0];
    const ok = await sendWeeklyReviewEmail(user.email, review, displayName);
    if (ok) sent++;
    else skipped++;
  }

  return NextResponse.json({ sent, skipped, total: users.length });
}
