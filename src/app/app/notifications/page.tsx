import { BellOff, ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { requireUser } from "@/lib/supauth";
import { getVisitorNotifications } from "@/lib/notifications-store";
import { dismissNotification, markAllNotificationsRead } from "@/app/app/notifications/actions";

export const metadata = { title: "Notifications · Navigator" };

const SEVERITY: Record<
  "critical" | "high" | "medium",
  { dot: string; label: string; ring: string }
> = {
  critical: { dot: "bg-[var(--danger)]", label: "text-[var(--danger)]", ring: "border-[var(--danger)]/30" },
  high: { dot: "bg-amber-400", label: "text-amber-300", ring: "border-white/[0.14]" },
  medium: { dot: "bg-white/60", label: "text-[var(--muted)]", ring: "border-white/[0.12]" },
};

export default async function NotificationsPage() {
  await requireUser();
  const notifications = await getVisitorNotifications();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-6 sm:px-6 sm:py-8">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-white">Notifications</h1>
          <p className="mt-1 text-sm text-[var(--text-faint)]">
            Deadlines and money signals from your own numbers - nothing is emailed.
          </p>
        </div>
        {notifications.length > 0 && (
          <form action={markAllNotificationsRead}>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-white/[0.14] bg-white/[0.03] px-3 py-1.5 text-xs font-medium text-[var(--muted)] transition-colors hover:border-white/[0.25] hover:text-white"
            >
              <Check className="h-3.5 w-3.5" /> Mark all read
            </button>
          </form>
        )}
      </div>

      {notifications.length === 0 ? (
        <div className="panel mt-6 flex flex-col items-center rounded-[18px] p-10 text-center">
          <div className="grid h-11 w-11 place-items-center rounded-full border border-white/[0.12] bg-white/[0.03]">
            <BellOff className="h-5 w-5 text-[var(--text-faint)]" />
          </div>
          <p className="mt-3 text-sm font-medium text-white">You&apos;re all caught up</p>
          <p className="mt-1 max-w-xs text-xs leading-5 text-[var(--text-faint)]">
            When a GST deadline nears, a payout looks stale, or marketplace rates change, it shows up here.
          </p>
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {notifications.map((n) => {
            const s = SEVERITY[n.severity];
            return (
              <li key={n.id} className={`panel rounded-[16px] border ${s.ring} p-4`}>
                <div className="flex items-start gap-3">
                  <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.dot}`} />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-white">{n.title}</p>
                    <p className="mt-1 text-[13px] leading-6 text-[var(--muted)]">{n.message}</p>
                    <div className="mt-3 flex items-center gap-4">
                      <Link
                        href={n.href}
                        className="inline-flex items-center gap-1 text-xs font-medium text-white hover:underline"
                      >
                        {n.ctaLabel} <ArrowRight className="h-3.5 w-3.5" />
                      </Link>
                      <form action={dismissNotification.bind(null, n.id)}>
                        <button
                          type="submit"
                          className="text-xs font-medium text-[var(--text-faint)] transition-colors hover:text-white"
                        >
                          Mark read
                        </button>
                      </form>
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </main>
  );
}
