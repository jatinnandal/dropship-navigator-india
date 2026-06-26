import type { PrimaryChannel } from "@/lib/mvp-data";

export type SettlementLine = {
  label: string;
  amount: number;
  note?: string;
};

export function buildSettlementExample(channel: PrimaryChannel, orderValue = 1000): SettlementLine[] {
  const commissionRate =
    channel === "amazon" ? 0.12 : channel === "flipkart" ? 0.13 : channel === "meesho" ? 0.08 : 0.02;
  const commission = orderValue * commissionRate;
  const paymentFee = orderValue * 0.02;
  const gstOnFees = (commission + paymentFee) * 0.18;
  const tcs = channel === "meesho" ? 0 : orderValue * 0.01;
  const shipping = 60;
  const payout = orderValue - commission - paymentFee - gstOnFees - tcs - shipping;

  return [
    { label: "Order value (what customer paid)", amount: orderValue },
    { label: "Marketplace commission", amount: -commission, note: `${(commissionRate * 100).toFixed(0)}% of order` },
    { label: "Payment / collection fee", amount: -paymentFee, note: "~2%" },
    { label: "GST on platform fees (18%)", amount: -gstOnFees, note: "On commission + payment fee" },
    {
      label: "TCS (Tax Collected at Source)",
      amount: -tcs,
      note: tcs > 0 ? "1% — credited to your GSTIN via GSTR-2A" : "Meesho may handle differently",
    },
    { label: "Shipping / logistics deduction", amount: -shipping, note: "If platform logistics" },
    { label: "Net payout to bank", amount: payout, note: "What actually hits your account" },
  ];
}

type Props = {
  channel: PrimaryChannel;
  orderValue?: number;
};

export function SettlementBreakdown({ channel, orderValue = 1000 }: Props) {
  const lines = buildSettlementExample(channel, orderValue);

  return (
    <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">
        Worked example: ₹{orderValue.toLocaleString("en-IN")} order → payout
      </p>
      <p className="text-muted mt-1 text-xs">
        TCS is credited to your GSTIN (claim in GSTR-3B). TDS on commission, if deducted, is claimed in ITR.
      </p>
      <ul className="mt-3 space-y-2">
        {lines.map((line) => (
          <li
            key={line.label}
            className={`flex flex-wrap items-baseline justify-between gap-2 text-sm ${
              line.label.includes("Net payout") ? "border-t border-slate-600 pt-2 font-semibold text-emerald-200" : ""
            }`}
          >
            <span className="text-slate-200">{line.label}</span>
            <span className={line.amount >= 0 ? "text-slate-100" : "text-rose-200"}>
              {line.amount >= 0 ? "" : "−"}₹{Math.abs(line.amount).toFixed(0)}
            </span>
            {line.note ? <span className="text-muted w-full text-xs">{line.note}</span> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
