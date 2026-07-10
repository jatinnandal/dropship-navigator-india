import { DataFreshness } from "@/components/data-freshness";

type DataMeta = {
  readonly lastVerified: string;
  readonly sources: readonly string[];
};

/** Freshness badge + the accuracy-contract disclaimer, for every money tool. */
export function EstimateDisclaimer({
  meta,
  note = "Estimates — fees vary by account, category and seller tier. Check your rate card in Seller Hub.",
}: {
  meta: DataMeta;
  note?: string;
}) {
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
      <DataFreshness meta={meta} />
      <p className="text-xs leading-5 text-[var(--text-faint)]">{note}</p>
    </div>
  );
}
