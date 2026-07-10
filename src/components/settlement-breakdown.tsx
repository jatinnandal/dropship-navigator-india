import type { PrimaryChannel } from "@/lib/mvp-data";
import { getFeesForProduct, getShippingForWeight } from "@/lib/marketplace-fees";

export type SettlementLine = {
  label: string;
  amount: number;
  note?: string;
};

export function buildSettlementExample(channel: PrimaryChannel, orderValue = 1000): SettlementLine[] {
  const fees = getFeesForProduct(channel, "general", orderValue, false);
  const shipping = getShippingForWeight(channel, "light");
  const fixedFees = fees.closingFee + fees.fixedFee + fees.platformFee + fees.codCollectionFee;
  const payout = orderValue - fees.totalFees - shipping;

  return [
    { label: "Order value (what customer paid)", amount: orderValue },
    {
      label: "Marketplace commission",
      amount: -fees.referralFee,
      note: fees.referralPercent > 0 ? `${fees.referralPercent}% of order` : "0% on this channel/price band",
    },
    {
      label: "Fixed / closing / platform fee",
      amount: -fixedFees,
      note: "Per-order flat fees",
    },
    {
      label: "Payment / collection fee",
      amount: -fees.paymentGatewayFee,
      note: fees.paymentGatewayPercent > 0 ? `~${fees.paymentGatewayPercent}%` : undefined,
    },
    { label: "GST on platform fees (18%)", amount: -fees.gstOnFees, note: "On all fees above" },
    {
      label: "TCS (Tax Collected at Source)",
      amount: -fees.tcs,
      note: fees.tcs > 0 ? "0.5% — accept via TDS/TCS credit received statement" : "No TCS on your own website",
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
        TCS is credited to your GSTIN — accept it in the TDS/TCS credit received statement. TDS on commission, if deducted, is claimed in ITR.
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
