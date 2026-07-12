import { Check } from "lucide-react";
import { mergeProfileSubTaskDefaults } from "@/lib/journey-graph";
import type { OnboardingProfile } from "@/lib/mvp-data";

/**
 * Named journey checkpoints as mono "stamps" - progress as narrative, not a bare
 * percentage. Driven entirely by existing subtask completion state (no new store).
 * The sequence traces the product's tagline: from first doubt to first payout.
 */
const STAMPS: { id: string; label: string }[] = [
  { id: "product-shortlist", label: "Hero product" },
  { id: "supplier-vetted", label: "Supplier locked" },
  { id: "gstin-active", label: "GST ready" },
  { id: "first-listing-live", label: "First listing" },
  { id: "store-linked", label: "Payouts linked" },
  { id: "first-payout-received", label: "First payout" },
];

export function MilestoneStamps({
  profile,
  subTasks,
}: {
  profile: OnboardingProfile;
  subTasks: Record<string, boolean> | undefined;
}) {
  const merged = mergeProfileSubTaskDefaults(profile, subTasks);
  const done = STAMPS.map((s) => merged[s.id] === true);
  const doneCount = done.filter(Boolean).length;

  return (
    <section className="panel mb-6 rounded-2xl p-5" data-reveal>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          Your milestones
        </p>
        <p className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-[var(--muted)]">
          {doneCount}/{STAMPS.length} · first doubt → first payout
        </p>
      </div>

      <ol className="mt-4 flex flex-wrap items-start gap-x-2 gap-y-4">
        {STAMPS.map((s, i) => (
          <li
            key={s.id}
            className="flex min-w-[88px] flex-1 flex-col items-center text-center"
          >
            <span
              className={`grid h-9 w-9 place-items-center rounded-full border ${
                done[i]
                  ? "border-white/[0.28] bg-white text-black shadow-[0_8px_28px_-10px_rgba(255,255,255,0.5)]"
                  : "border-white/[0.12] bg-white/[0.03] text-[var(--text-faintest)]"
              }`}
            >
              {done[i] ? (
                <Check className="h-4 w-4" aria-hidden="true" />
              ) : (
                <span className="font-mono text-xs">{i + 1}</span>
              )}
            </span>
            <span
              className={`mt-2 text-xs leading-4 ${done[i] ? "text-white" : "text-[var(--muted)]"}`}
            >
              {s.label}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
