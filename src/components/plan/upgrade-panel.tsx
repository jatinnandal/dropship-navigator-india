import Link from "next/link";
import { Lock } from "lucide-react";
import { PLAN_LABELS, PLAN_PRICES, type Plan } from "@/lib/entitlements";

/**
 * Contextual upgrade prompt — rendered at the exact moment a plan limit is
 * hit (locked tool, quota reached, profile cap). Mono Depth: white lock,
 * no decorative color.
 */
export function UpgradePanel({
  requiredPlan,
  title,
  bullets,
  compact = false,
}: {
  requiredPlan: Exclude<Plan, "free">;
  title: string;
  bullets: string[];
  compact?: boolean;
}) {
  const price = PLAN_PRICES[requiredPlan];
  return (
    <div
      className={`rounded-2xl border border-white/[0.16] bg-gradient-to-b from-[#0c0c0c] to-[#050505] ${compact ? "p-5" : "p-7"}`}
      style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08)" }}
    >
      <div className="flex items-center gap-2.5">
        <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-white/[0.18] bg-[#111]">
          <Lock className="h-3.5 w-3.5 text-white" aria-hidden="true" />
        </span>
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--text-faint)]">
          {PLAN_LABELS[requiredPlan]} plan
        </span>
      </div>

      <p className={`mt-3 font-semibold text-white ${compact ? "text-[15px]" : "text-[18px]"}`}>{title}</p>

      <ul className="mt-3 flex flex-col gap-1.5">
        {bullets.map((b) => (
          <li key={b} className="flex items-start gap-2 text-[13px] leading-[1.55] text-[var(--body-text)]">
            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-white" aria-hidden="true" />
            {b}
          </li>
        ))}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3.5">
        <Link href="/app/upgrade" className="btn-primary inline-flex min-h-[42px] items-center rounded-[11px] px-5 text-[13.5px]">
          Unlock with {PLAN_LABELS[requiredPlan]} — ₹{price.monthly}/mo
        </Link>
        <span className="font-mono text-[11px] text-[var(--text-faint)]">
          or ₹{price.yearly}/year
        </span>
      </div>
    </div>
  );
}
