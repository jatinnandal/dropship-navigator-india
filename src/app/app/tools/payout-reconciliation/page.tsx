import Link from "next/link";
import { Upload, FileWarning } from "lucide-react";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { formatINR } from "@/lib/format";
import { MARKETPLACE_FEES_META } from "@/lib/marketplace-fees";
import { getCurrentEntitlements } from "@/lib/plan";
import { getActiveSellerProfileForCurrentVisitor } from "@/lib/progress-store";
import { countUploadsThisMonth, listUploads } from "@/lib/settlement-recon-store";
import { UpgradePanel } from "@/components/plan/upgrade-panel";
import { uploadSettlementCsv } from "./actions";

const ERROR_MESSAGES: Record<string, string> = {
  no_profile: "Create a seller profile first - the report needs your channel context.",
  bad_channel: "Pick the marketplace the file came from.",
  bad_category: "Pick a product category.",
  no_file: "Choose a settlement CSV file to upload.",
  too_large: "File is over 2MB. Export a single settlement cycle and retry.",
  no_rows: "No order rows found in that file - is it the settlement/payments export?",
  store_failed: "Could not save the report. Try again.",
  limit: "Monthly reconciliation limit reached on your plan.",
};

function errorMessage(code: string | undefined): string | null {
  if (!code) return null;
  if (code.startsWith("columns_")) {
    return `Couldn't find required columns (${code.replace("columns_", "").replaceAll("-", ", ")}). Upload the payments/settlement CSV, not the orders export.`;
  }
  return ERROR_MESSAGES[code] ?? "Something went wrong. Try again.";
}

type SearchParams = Promise<{ error?: string }>;

export default async function PayoutReconciliationPage({ searchParams }: { searchParams: SearchParams }) {
  const [{ error }, profile] = await Promise.all([
    searchParams,
    getActiveSellerProfileForCurrentVisitor(),
  ]);

  const [uploads, usedThisMonth, entitlements] = profile
    ? await Promise.all([
        listUploads(profile.id),
        countUploadsThisMonth(profile.id),
        getCurrentEntitlements(),
      ])
    : [[], 0, await getCurrentEntitlements()];

  const message = errorMessage(error);
  const quota = entitlements.reconPerMonth;
  const unlimited = !Number.isFinite(quota);
  const remaining = unlimited ? Infinity : Math.max(0, quota - usedThisMonth);

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span className="text-white">Payout Reconciliation</span>
        </nav>

        <p className="eyebrow inline-block">Money tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">Payout Reconciliation</h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Upload a settlement CSV - see what the marketplace kept versus what the fee card says it
          should have kept, order by order. Plus the TCS you can claim back this month.
        </p>
        <EstimateDisclaimer
          meta={MARKETPLACE_FEES_META}
          note="Expected fees come from the estimate rate tables - shipping/weight handling isn't modelled, so small deltas are normal. Big ones are worth a Seller Support ticket."
        />
      </header>

      {message ? (
        <div
          className="mb-5 flex items-start gap-2.5 rounded-xl border p-4 text-sm"
          style={{
            color: "oklch(0.8 0.13 20)",
            background: "oklch(0.72 0.17 20 / 0.08)",
            borderColor: "oklch(0.72 0.17 20 / 0.25)",
          }}
        >
          <FileWarning className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          <p>{message}</p>
        </div>
      ) : null}

      {/* Upload form */}
      <section className="panel rounded-2xl p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">New reconciliation</h2>
        <p className="text-muted mt-1 text-sm">
          Export the payments/settlement CSV from Seller Hub, Supplier Panel or Seller Central and
          drop it here. Nothing is shared - rows stay in your account.
        </p>

        {remaining === 0 ? (
          <div className="mt-5">
            <UpgradePanel
              requiredPlan="growth"
              compact
              title="This month's reconciliation is used - Growth removes the limit"
              bullets={[
                "Unlimited settlement uploads, every cycle of every marketplace",
                "History trends: watch your effective fee rate month over month",
                "Rate-change alerts on your saved products",
              ]}
            />
          </div>
        ) : (
        <form action={uploadSettlementCsv} className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="text-muted mb-1.5 block text-xs font-medium">Marketplace</span>
            <select
              name="channel"
              required
              defaultValue={profile?.primaryChannel === "shopify" ? "meesho" : profile?.primaryChannel ?? "meesho"}
              className="auth-input w-full min-h-[44px] px-3 text-sm"
            >
              <option value="meesho">Meesho</option>
              <option value="flipkart">Flipkart</option>
              <option value="amazon">Amazon</option>
            </select>
          </label>

          <label className="block text-sm">
            <span className="text-muted mb-1.5 block text-xs font-medium">Product category (for expected fees)</span>
            <select
              name="category"
              required
              defaultValue={profile?.productType ?? "general"}
              className="auth-input w-full min-h-[44px] px-3 text-sm"
            >
              <option value="general">General / Home / Kitchen</option>
              <option value="fashion">Fashion & Apparel</option>
              <option value="beauty">Beauty & Personal Care</option>
              <option value="electronics">Electronics & Accessories</option>
              <option value="food">Food & Grocery</option>
            </select>
          </label>

          <label className="block text-sm sm:col-span-2">
            <span className="text-muted mb-1.5 block text-xs font-medium">Settlement CSV (max 2MB)</span>
            <input
              type="file"
              name="file"
              accept=".csv,text/csv"
              required
              className="block w-full rounded-[11px] border border-white/[0.14] bg-white/[0.03] px-3 py-2.5 text-sm text-[var(--body-text)] file:mr-3 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-black"
            />
          </label>

          <div className="flex flex-wrap items-center gap-4 sm:col-span-2">
            <button
              type="submit"
              className="btn-primary inline-flex min-h-[44px] items-center gap-2 px-5 text-sm"
            >
              <Upload className="h-4 w-4" aria-hidden="true" />
              Reconcile payout
            </button>
            <p className="font-mono text-[11px] text-[var(--text-faint)]">
              {unlimited
                ? "Unlimited reconciliations on Growth"
                : `${remaining} of ${quota} left this month on ${entitlements.plan === "starter" ? "Starter" : "your plan"}`}
            </p>
          </div>
        </form>
        )}
      </section>

      {/* History */}
      <section className="mt-6">
        <h2 className="px-1 text-base font-semibold text-white">Past reconciliations</h2>
        {uploads.length === 0 ? (
          <div className="panel mt-3 rounded-2xl p-6 text-center">
            <p className="text-sm text-[var(--muted)]">
              No reports yet. Your first upload builds the baseline - month two shows the trend.
            </p>
          </div>
        ) : (
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {uploads.map((u) => (
              <Link
                key={u.id}
                href={`/app/tools/payout-reconciliation/${u.id}`}
                className="panel block rounded-2xl p-4 transition-colors hover:border-white/[0.28]"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold capitalize text-white">
                    {u.channel} · {u.rowCount} orders
                  </p>
                  <p className="font-mono text-[10.5px] text-[var(--text-faint)]">
                    {new Date(u.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </p>
                </div>
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted)]">
                  <span>
                    Settled <span className="text-white">{formatINR(u.summary.totalSettled)}</span>
                  </span>
                  <span>
                    Delta{" "}
                    <span className={u.summary.totalDelta > 0 ? "text-[oklch(0.8_0.13_20)]" : "text-[var(--success)]"}>
                      {formatINR(u.summary.totalDelta)}
                    </span>
                  </span>
                  <span>
                    Flagged <span className="text-white">{u.summary.flaggedCount}</span>
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
