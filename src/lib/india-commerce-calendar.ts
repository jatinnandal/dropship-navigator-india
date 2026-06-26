import type { ProductType } from "@/lib/mvp-data";

export type CommerceSeason = {
  id: string;
  name: string;
  /** Approximate start month (1-12) and day */
  startMonth: number;
  startDay: number;
  /** Peak importance for product types */
  relevantFor: ProductType[] | "all";
  prepWeeksAhead: number;
  message: string;
  prepChecklist: string[];
};

export const INDIA_COMMERCE_SEASONS: CommerceSeason[] = [
  {
    id: "republic-day",
    name: "Republic Day fitness peak",
    startMonth: 1,
    startDay: 26,
    relevantFor: ["general", "fashion"],
    prepWeeksAhead: 4,
    message: "Fitness and apparel see a January spike — prep listings and ad budget now.",
    prepChecklist: ["Refresh fitness SKU images", "Check supplier stock for Jan demand", "Test ad creatives early"],
  },
  {
    id: "slow-q1",
    name: "Jan–Mar slow season",
    startMonth: 1,
    startDay: 15,
    relevantFor: "all",
    prepWeeksAhead: 0,
    message: "Q1 is slower for many categories — focus on compliance, sourcing, and unit economics.",
    prepChecklist: ["Don't panic on low sales", "Use time for GST and supplier vetting", "Avoid over-ordering inventory"],
  },
  {
    id: "navratri",
    name: "Navratri",
    startMonth: 9,
    startDay: 22,
    relevantFor: ["fashion", "general"],
    prepWeeksAhead: 6,
    message: "Navratri drives ethnic wear and gifting — list 6 weeks before peak.",
    prepChecklist: ["Ethnic/festive SKUs live early", "Confirm supplier dispatch SLA", "Plan COD confirmation scripts"],
  },
  {
    id: "diwali",
    name: "Diwali",
    startMonth: 10,
    startDay: 20,
    relevantFor: "all",
    prepWeeksAhead: 8,
    message: "Diwali is India's biggest commerce window — inventory and ads need 8-week lead time.",
    prepChecklist: [
      "Stock backup supplier confirmed",
      "Ad budget reserved for Oct–Nov",
      "Dispatch SLA tested under volume",
    ],
  },
];

function daysUntil(month: number, day: number, from: Date): number {
  const year = from.getFullYear();
  let target = new Date(year, month - 1, day);
  if (target < from) {
    target = new Date(year + 1, month - 1, day);
  }
  return Math.ceil((target.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export type SeasonNoticeResult = {
  season: CommerceSeason;
  daysUntil: number;
  weeksUntil: number;
  isRelevant: boolean;
};

export function getSeasonNotice(date: Date, productType: ProductType): SeasonNoticeResult | null {
  let best: SeasonNoticeResult | null = null;

  for (const season of INDIA_COMMERCE_SEASONS) {
    const days = daysUntil(season.startMonth, season.startDay, date);
    const weeks = Math.ceil(days / 7);
    const isRelevant =
      season.relevantFor === "all" ||
      season.relevantFor.includes(productType);

    if (!isRelevant) continue;
    if (days > season.prepWeeksAhead * 7 + 14) continue;

    if (!best || days < best.daysUntil) {
      best = { season, daysUntil: days, weeksUntil: weeks, isRelevant };
    }
  }

  return best;
}
