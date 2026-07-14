import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Landmark, PackageX, TriangleAlert } from "lucide-react";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { formatINR } from "@/lib/format";
import { MARKETPLACE_FEES_META } from "@/lib/marketplace-fees";
import { getActiveSellerProfileForCurrentVisitor } from "@/lib/progress-store";
import { getUpload } from "@/lib/settlement-recon-store";

type Params = Promise<{ uploadId: string }>;

function StatTile({ label, value, tone }: { label: string; value: string; tone?: "danger" | "success" }) {
  const color = tone === "danger" ? "oklch(0.8 0.13 20)" : tone === "success" ? "var(--success)" : "#ffffff";
  return (
    <div className="panel rounded-2xl p-4">
      <p className="font-mono text-[10.5px] uppercase tracking-[0.14em] text-[var(--text-faint)]">{label}</p>
      <p className="mt-1.5 text-xl font-bold tabular-nums" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

export default async function ReconReportPage({ params }: { params: Params }) {
  const [{ uploadId }, profile] = await Promise.all([
    params,
    getActiveSellerProfileForCurrentVisitor(),
  ]);
  if (!profile) notFound();

  const upload = await getUpload(profile.id, uploadId);
  if (!upload) notFound();

  const s = upload.summary;
  const flagged = upload.rows.filter((r) => r.flagged);
  const returns = upload.rows.filter((r) => r.isReturn);
  // Order-level rows are purged past the plan's retention window; the compact
  // summary is kept. Detect that so we don't render an empty table as "clean".
  const rowsPurged = upload.rows.length === 0 && upload.rowCount > 0;

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <nav className="text-muted mb-3 text-xs">
          <Link href="/app/tools/payout-reconciliation" className="hover:text-white transition-colors">
            Payout Reconciliation
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-white">Report</span>
        </nav>

        <p className="eyebrow inline-block capitalize">{upload.channel} · {upload.rowCount} orders</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">Where your payout went</h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          {upload.filename ?? "Settlement file"} ·{" "}
          {new Date(upload.uploadedAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}{" "}
          · adapter {upload.adapterVersion}
        </p>
        <EstimateDisclaimer
          meta={MARKETPLACE_FEES_META}
          note={
            (s.shippingAllowancePerOrder ?? 0) > 0
              ? `Expected deductions include a ${formatINR(s.shippingAllowancePerOrder ?? 0)}/order shipping allowance (lightest slab - your file doesn't carry weights). Heavier parcels can still show small positive deltas; investigate the big ones.`
              : "Expected fees exclude shipping/weight handling (not in the CSV). Deltas near your shipping cost are usually courier charges - investigate the big ones, not the small ones."
          }
        />
        {rowsPurged ? (
          <p className="text-muted mt-3 rounded-xl border border-white/[0.1] bg-white/[0.02] px-4 py-3 text-xs leading-5">
            Order-level detail for this reconciliation has passed your plan&apos;s
            retention window and was cleared to save space. The totals above are
            kept permanently - upgrade for a longer history window.
          </p>
        ) : null}
      </header>

      {/* Summary tiles */}
      <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile label="Gross sales (delivered)" value={formatINR(s.grossSales)} />
        <StatTile label="Actually settled" value={formatINR(s.totalSettled)} />
        <StatTile label="Expected deductions" value={formatINR(s.totalExpectedFees)} />
        <StatTile
          label="Unexplained delta"
          value={formatINR(s.totalDelta)}
          tone={s.totalDelta > Math.max(50, s.grossSales * 0.01) ? "danger" : "success"}
        />
      </section>

      {/* Pending settlements */}
      {(s.pendingCount ?? 0) > 0 ? (
        <section className="panel mt-4 rounded-2xl p-4">
          <p className="text-sm text-[var(--body-text)]">
            <strong className="text-white">{s.pendingCount} order{(s.pendingCount ?? 0) > 1 ? "s" : ""} pending settlement</strong>{" "}
            ({formatINR(s.pendingSales ?? 0)} in sales) - the payout hasn&apos;t posted yet, so they&apos;re
            excluded from every number above instead of being counted as money the marketplace kept.
            Re-upload a newer settlement file once they pay out.
          </p>
        </section>
      ) : null}

      {/* TCS card */}
      <section className="panel-raised mt-5 rounded-2xl p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[10px] border border-white/[0.16] bg-[#111]">
              <Landmark className="h-4 w-4 text-white" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">
                ~{formatINR(s.tcsEstimate)} TCS collected on these sales
              </p>
              <p className="text-muted mt-1 max-w-xl text-xs leading-5">
                The marketplace deposited this against your GSTIN. Accept it in the{" "}
                <strong className="text-white">TDS/TCS credit received</strong> statement on the GST
                portal - it offsets your GST payable. Most sellers never claim it.
              </p>
            </div>
          </div>
          <a
            href="https://services.gst.gov.in/services/login"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost rounded-[10px] px-4 py-2 text-xs font-semibold"
          >
            Open GST portal →
          </a>
        </div>
      </section>

      {/* Flagged orders */}
      <section className="mt-6">
        <div className="flex items-center gap-2 px-1">
          <TriangleAlert className="h-4 w-4 text-[oklch(0.8_0.13_20)]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">
            Flagged orders - deduction above expectation ({s.flaggedCount})
          </h2>
        </div>

        {rowsPurged ? (
          <div className="panel mt-3 rounded-2xl p-6">
            <p className="text-muted text-sm leading-6">
              {s.flaggedCount > 0
                ? `${s.flaggedCount} order${s.flaggedCount > 1 ? "s were" : " was"} flagged in this settlement, but the order-level rows have passed your plan's retention window. Re-upload the file to inspect them again.`
                : "No orders were flagged in this settlement. Order-level rows have passed your plan's retention window; the summary above is kept."}
            </p>
          </div>
        ) : flagged.length === 0 ? (
          <div className="panel mt-3 rounded-2xl p-6">
            <p className="text-sm text-[var(--success)]">
              Nothing flagged - every delivered order&apos;s deduction is within the expected band. That&apos;s
              what a clean settlement looks like.
            </p>
          </div>
        ) : (
          <div className="panel mt-3 overflow-x-auto rounded-2xl">
            <table className="w-full min-w-[560px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.1] text-[11px] uppercase tracking-[0.1em] text-[var(--text-faint)]">
                  <th className="px-4 py-3 font-medium">Order</th>
                  <th className="px-4 py-3 font-medium">Sale</th>
                  <th className="px-4 py-3 font-medium">Settled</th>
                  <th className="px-4 py-3 font-medium">Kept</th>
                  <th className="px-4 py-3 font-medium">Expected</th>
                  <th className="px-4 py-3 font-medium">Delta</th>
                </tr>
              </thead>
              <tbody>
                {flagged.slice(0, 50).map((r) => (
                  <tr key={r.orderRef} className="border-b border-white/[0.06]">
                    <td className="px-4 py-2.5 font-mono text-xs text-[var(--body-text)]">{r.orderRef}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--body-text)]">{formatINR(r.saleAmount)}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--body-text)]">{formatINR(r.settledAmount, { decimals: true })}</td>
                    <td className="px-4 py-2.5 tabular-nums text-white">{formatINR(r.actualDeduction, { decimals: true })}</td>
                    <td className="px-4 py-2.5 tabular-nums text-[var(--muted)]">{formatINR(r.expectedFees, { decimals: true })}</td>
                    <td className="px-4 py-2.5 font-semibold tabular-nums" style={{ color: "oklch(0.8 0.13 20)" }}>
                      +{formatINR(r.delta, { decimals: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {flagged.length > 50 ? (
              <p className="px-4 py-3 text-xs text-[var(--text-faint)]">Showing top 50 of {flagged.length}.</p>
            ) : null}
          </div>
        )}
        <p className="text-muted mt-2 px-1 text-xs leading-5">
          Next step for genuine outliers: raise a Seller Support ticket quoting the order ID and ask
          for the fee breakup. Weight-handling disputes (wrong weight slab) are the most commonly
          refunded.
        </p>
      </section>

      {/* Returns */}
      <section className="mt-6">
        <div className="flex items-center gap-2 px-1">
          <PackageX className="h-4 w-4 text-[var(--muted)]" aria-hidden="true" />
          <h2 className="text-base font-semibold text-white">Returns & RTO ({s.returnCount})</h2>
        </div>
        <div className="panel mt-3 rounded-2xl p-5">
          {rowsPurged ? (
            <p className="text-sm text-[var(--muted)]">
              {s.returnCount > 0
                ? `${s.returnCount} return${s.returnCount > 1 ? "s" : ""} in this settlement - order-level detail has passed your plan's retention window.`
                : "No returned orders in this settlement."}
            </p>
          ) : returns.length === 0 ? (
            <p className="text-sm text-[var(--muted)]">No returned orders in this settlement.</p>
          ) : (
            <>
              <p className="text-sm text-[var(--body-text)]">
                {returns.length} order{returns.length > 1 ? "s" : ""} reversed. Charged on top of the
                reversed sale value:{" "}
                <strong className="text-white">
                  {formatINR(returns.reduce((sum, r) => sum + Math.max(0, -r.settledAmount), 0), { decimals: true })}
                </strong>{" "}
                (negative settlements = return shipping and non-refundable fees).
              </p>
              <p className="text-muted mt-2 text-xs leading-5">
                Each return is auto-checked: you should lose at most the non-refundable fees
                {(s.shippingAllowancePerOrder ?? 0) > 0 ? " plus the shipping allowance" : ""} - commission/referral
                should be reversed.{" "}
                {(s.flaggedReturnCount ?? 0) > 0 ? (
                  <strong className="text-white">
                    {s.flaggedReturnCount} return{(s.flaggedReturnCount ?? 0) > 1 ? "s" : ""} exceeded that and appear
                    {(s.flaggedReturnCount ?? 0) > 1 ? "" : "s"} in the flagged table above - each one is a Seller
                    Support ticket.
                  </strong>
                ) : (
                  "None exceeded that in this file."
                )}
              </p>
            </>
          )}
        </div>
      </section>

      {/* Drift notice */}
      {s.unmappedHeaders.length > 0 ? (
        <p className="text-muted mt-6 px-1 text-xs leading-5">
          Columns in your file we didn&apos;t use: {s.unmappedHeaders.slice(0, 8).join(", ")}
          {s.unmappedHeaders.length > 8 ? "…" : ""}. If the report looks off, the export format may
          have changed - tell us.
        </p>
      ) : null}

      <div className="mt-8">
        <Link
          href="/app/tools/payout-reconciliation"
          className="btn-ghost inline-flex items-center gap-2 rounded-[10px] px-4 py-2 text-sm font-semibold"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          All reconciliations
        </Link>
      </div>
    </main>
  );
}
