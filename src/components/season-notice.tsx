import { getSeasonNotice } from "@/lib/india-commerce-calendar";
import type { ProductType } from "@/lib/mvp-data";

type Props = {
  productType: ProductType;
};

export function SeasonNotice({ productType }: Props) {
  const notice = getSeasonNotice(new Date(), productType);
  if (!notice) return null;

  const { season, weeksUntil } = notice;

  return (
    <section className="glass-panel mt-4 rounded-xl border border-cyan-400/20 p-4">
      <p className="text-xs uppercase tracking-wide text-cyan-200">Seasonality alert</p>
      <p className="mt-1 text-sm font-semibold text-slate-100">
        {season.name} is {weeksUntil} week{weeksUntil === 1 ? "" : "s"} away
      </p>
      <p className="text-muted mt-1 text-sm">{season.message}</p>
      <ul className="text-muted mt-2 list-disc space-y-1 pl-5 text-xs">
        {season.prepChecklist.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
