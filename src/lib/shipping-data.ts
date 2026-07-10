export const SHIPPING_DATA_META = {
  lastVerified: "2026-07-07",
  sources: [
    "shiprocket.in/pricing",
    "delhivery.com/pricing",
    "bluedart.com/rates",
    "ecomexpress.in/pricing",
  ],
} as const;

export type ShippingZone = "local" | "regional" | "national" | "metro";

export type CarrierRate = {
  carrier: string;
  emoji: string;
  baseRate: Record<ShippingZone, number>; // per 500g
  additionalPerKg: Record<ShippingZone, number>;
  codHandlingFee: number;
  codPercentFee: number;
  supportsCod: boolean;
  gstPercent: number;
  fuelSurchargePercent: number;
  rtoCharges: "full-round-trip" | "one-way-return" | "free-return";
  avgDeliveryDays: Record<ShippingZone, string>;
  minWeightGrams: number;
  features: string[];
};

export type ShippingCostResult = {
  baseCharge: number;
  weightSurcharge: number;
  codFee: number;
  gst: number;
  fuelSurcharge: number;
  totalCost: number;
  rtoRiskLabel: string;
};

export const ZONE_LABELS: Record<ShippingZone, string> = {
  local: "Local (Same city)",
  regional: "Regional (Same state)",
  national: "National (Cross-state)",
  metro: "Metro (Metro-to-metro)",
};

export const CARRIERS: CarrierRate[] = [
  {
    carrier: "Shiprocket",
    emoji: "\u{1F680}",
    baseRate: { local: 26, regional: 32, national: 38, metro: 28 },
    additionalPerKg: { local: 20, regional: 25, national: 30, metro: 22 },
    codHandlingFee: 25,
    codPercentFee: 2.0,
    supportsCod: true,
    gstPercent: 18,
    fuelSurchargePercent: 15,
    rtoCharges: "full-round-trip",
    avgDeliveryDays: { local: "2-3", regional: "3-4", national: "4-6", metro: "2-3" },
    minWeightGrams: 500,
    features: ["Cheapest advertised", "Multi-courier", "Auto NDR"],
  },
  {
    carrier: "Delhivery",
    emoji: "\u{1F4E6}",
    baseRate: { local: 40, regional: 48, national: 55, metro: 42 },
    additionalPerKg: { local: 25, regional: 30, national: 35, metro: 28 },
    codHandlingFee: 25,
    codPercentFee: 1.5,
    supportsCod: true,
    gstPercent: 18,
    fuelSurchargePercent: 10,
    rtoCharges: "full-round-trip",
    avgDeliveryDays: { local: "2-3", regional: "3-5", national: "5-7", metro: "2-4" },
    minWeightGrams: 500,
    features: ["Reliable tracking", "Good for heavy items", "Pan-India reach"],
  },
  {
    carrier: "Blue Dart",
    emoji: "✈️",
    baseRate: { local: 60, regional: 70, national: 80, metro: 65 },
    additionalPerKg: { local: 35, regional: 40, national: 50, metro: 38 },
    codHandlingFee: 35,
    codPercentFee: 2.5,
    supportsCod: true,
    gstPercent: 18,
    fuelSurchargePercent: 12,
    rtoCharges: "full-round-trip",
    avgDeliveryDays: { local: "1-2", regional: "2-3", national: "3-5", metro: "1-2" },
    minWeightGrams: 500,
    features: ["Fastest delivery", "Premium handling", "Best for fragile"],
  },
  {
    carrier: "India Post",
    emoji: "\u{1F3E3}",
    baseRate: { local: 20, regional: 25, national: 30, metro: 22 },
    additionalPerKg: { local: 15, regional: 18, national: 22, metro: 16 },
    codHandlingFee: 0,
    codPercentFee: 0,
    supportsCod: false,
    gstPercent: 18,
    fuelSurchargePercent: 0,
    rtoCharges: "one-way-return",
    avgDeliveryDays: { local: "3-5", regional: "5-7", national: "7-15", metro: "4-6" },
    minWeightGrams: 250,
    features: ["Cheapest actual", "No COD", "Slow but reliable"],
  },
  {
    carrier: "Ecom Express",
    emoji: "⚡",
    baseRate: { local: 35, regional: 42, national: 48, metro: 38 },
    additionalPerKg: { local: 22, regional: 28, national: 32, metro: 25 },
    codHandlingFee: 28,
    codPercentFee: 1.5,
    supportsCod: true,
    gstPercent: 18,
    fuelSurchargePercent: 12,
    rtoCharges: "full-round-trip",
    avgDeliveryDays: { local: "2-3", regional: "3-5", national: "4-6", metro: "2-3" },
    minWeightGrams: 500,
    features: ["Good COD handling", "Mid-range pricing", "Tier 2-3 reach"],
  },
];

export function calculateShippingCost(inputs: {
  carrier: CarrierRate;
  weightGrams: number;
  zone: ShippingZone;
  isCod: boolean;
  orderValue: number;
}): ShippingCostResult {
  const { carrier, weightGrams, zone, isCod } = inputs;

  // Base charge for first 500g
  const baseCharge = carrier.baseRate[zone];

  // Weight surcharge for anything above 500g
  const effectiveWeight = Math.max(weightGrams, carrier.minWeightGrams);
  const extraGrams = Math.max(0, effectiveWeight - 500);
  const extraKgs = Math.ceil(extraGrams / 1000);
  const weightSurcharge = extraKgs * carrier.additionalPerKg[zone];

  // COD fee
  const codFee = isCod
    ? Math.max(carrier.codHandlingFee, (carrier.codPercentFee / 100) * inputs.orderValue)
    : 0;

  // GST on (base + weight + cod)
  const gst = ((baseCharge + weightSurcharge + codFee) * carrier.gstPercent) / 100;

  // Fuel surcharge on base charge
  const fuelSurcharge = (baseCharge * carrier.fuelSurchargePercent) / 100;

  // Total
  const totalCost = baseCharge + weightSurcharge + codFee + gst + fuelSurcharge;

  // RTO risk label
  let rtoRiskLabel: string;
  switch (carrier.rtoCharges) {
    case "full-round-trip":
      rtoRiskLabel = "RTO = 2x shipping cost";
      break;
    case "one-way-return":
      rtoRiskLabel = "RTO = 1x return only";
      break;
    case "free-return":
      rtoRiskLabel = "Free return on RTO";
      break;
  }

  return {
    baseCharge,
    weightSurcharge,
    codFee,
    gst: Math.round(gst * 100) / 100,
    fuelSurcharge: Math.round(fuelSurcharge * 100) / 100,
    totalCost: Math.round(totalCost * 100) / 100,
    rtoRiskLabel,
  };
}
