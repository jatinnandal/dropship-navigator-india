const inrWhole = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
const inrPrecise = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** Indian-grouped rupee string: 100000 → "₹1,00,000". */
export function formatINR(value: number, opts?: { decimals?: boolean }): string {
  const fmt = opts?.decimals ? inrPrecise : inrWhole;
  const sign = value < 0 ? "−" : "";
  return `${sign}₹${fmt.format(Math.abs(value))}`;
}

export function formatDateIN(date: Date = new Date()): string {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}
