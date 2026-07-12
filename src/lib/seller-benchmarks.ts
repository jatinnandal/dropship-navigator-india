export type StageBenchmark = {
  stage: "beginner" | "growing" | "established" | "scaling";
  label: string;
  monthsRange: string;
  metrics: {
    ordersPerDay: string;
    monthlyRevenue: string;
    netMargin: string;
    rtoRate: string;
    adSpend: string;
  };
  milestones: string[];
  commonMistakes: string[];
};

export const BENCHMARKS: StageBenchmark[] = [
  {
    stage: "beginner",
    label: "Beginner",
    monthsRange: "0-3 months",
    metrics: {
      ordersPerDay: "1-5",
      monthlyRevenue: "₹10K-₹50K",
      netMargin: "10-15%",
      rtoRate: "25-40%",
      adSpend: "₹0-₹5K/month",
    },
    milestones: [
      "First 10 orders fulfilled",
      "Supplier relationship established",
      "Listing optimization done",
      "RTO rate tracked",
    ],
    commonMistakes: [
      "Listing too many SKUs before validating demand",
      "Ignoring RTO patterns on COD orders",
      "Not tracking actual profit after all fees",
      "Copying competitor pricing without knowing their cost structure",
    ],
  },
  {
    stage: "growing",
    label: "Growing",
    monthsRange: "3-6 months",
    metrics: {
      ordersPerDay: "5-15",
      monthlyRevenue: "₹50K-₹2L",
      netMargin: "15-22%",
      rtoRate: "15-25%",
      adSpend: "₹5K-₹20K/month",
    },
    milestones: [
      "Consistent daily orders",
      "RTO below 20%",
      "Second supplier onboarded",
      "Basic ad campaigns running",
    ],
    commonMistakes: [
      "Scaling ads before fixing RTO",
      "Not negotiating shipping rates at volume",
      "Ignoring negative reviews instead of addressing root cause",
      "Expanding categories too fast",
    ],
  },
  {
    stage: "established",
    label: "Established",
    monthsRange: "6-12 months",
    metrics: {
      ordersPerDay: "15-30",
      monthlyRevenue: "₹2L-₹5L",
      netMargin: "18-28%",
      rtoRate: "10-15%",
      adSpend: "₹20K-₹50K/month",
    },
    milestones: [
      "Multi-channel presence",
      "RTO below 12%",
      "Repeat customer base forming",
      "Hired first helper for packing",
    ],
    commonMistakes: [
      "Not registering GST leading to account suspension",
      "Cash flow crunch from delayed settlements",
      "Over-dependence on single supplier",
      "Neglecting customer service as volume grows",
    ],
  },
  {
    stage: "scaling",
    label: "Scaling",
    monthsRange: "12+ months",
    metrics: {
      ordersPerDay: "30+",
      monthlyRevenue: "₹5L+",
      netMargin: "15-25%",
      rtoRate: "5-10%",
      adSpend: "₹50K+/month",
    },
    milestones: [
      "Own brand/private label launched",
      "Team of 3+ people",
      "Multiple warehouses or 3PL",
      "Profit reinvestment system",
    ],
    commonMistakes: [
      "Not building a brand - staying commodity forever",
      "Tax compliance gaps catching up",
      "Burning cash on branding without unit economics",
      "Founder bottleneck on all decisions",
    ],
  },
];

export function estimateUserStage(
  ordersPerDay: number,
  monthsActive: number
): StageBenchmark {
  if (ordersPerDay >= 30 && monthsActive >= 12) return BENCHMARKS[3];
  if (ordersPerDay >= 15 && monthsActive >= 6) return BENCHMARKS[2];
  if (ordersPerDay >= 5 && monthsActive >= 3) return BENCHMARKS[1];
  return BENCHMARKS[0];
}
