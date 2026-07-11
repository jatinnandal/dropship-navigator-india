import type { CrisisType } from "@/lib/crisis/types";

export type Plan = "free" | "starter" | "growth";

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Scout",
  starter: "Starter",
  growth: "Growth",
};

export const PLAN_PRICES = {
  starter: { monthly: 49, yearly: 399 },
  growth: { monthly: 199, yearly: 1599 },
} as const;

export type Entitlements = {
  plan: Plan;
  maxProfiles: number;
  /** Payout reconciliations per calendar month. Infinity = unlimited. */
  reconPerMonth: number;
  /** Free tier gets only the first journey module. */
  allJourneyModules: boolean;
  /** Crisis protocols usable on this plan ("all" for growth). */
  crisisProtocols: CrisisType[] | "all";
  weeklyDigest: boolean;
  rateAlerts: boolean;
};

const STARTER_CRISIS: CrisisType[] = ["account_suspended", "supplier_oos"];

const ENTITLEMENTS: Record<Plan, Entitlements> = {
  free: {
    plan: "free",
    maxProfiles: 1,
    reconPerMonth: 0,
    allJourneyModules: false,
    crisisProtocols: [],
    weeklyDigest: false,
    rateAlerts: false,
  },
  starter: {
    plan: "starter",
    maxProfiles: 1,
    reconPerMonth: 1,
    allJourneyModules: true,
    crisisProtocols: STARTER_CRISIS,
    weeklyDigest: true,
    rateAlerts: false,
  },
  growth: {
    plan: "growth",
    maxProfiles: 5,
    reconPerMonth: Infinity,
    allJourneyModules: true,
    crisisProtocols: "all",
    weeklyDigest: true,
    rateAlerts: true,
  },
};

export function entitlementsFor(plan: Plan): Entitlements {
  return ENTITLEMENTS[plan];
}

export function canUseCrisisProtocol(plan: Plan, type: CrisisType): boolean {
  const allowed = ENTITLEMENTS[plan].crisisProtocols;
  return allowed === "all" || allowed.includes(type);
}

export function requiredPlanForCrisis(type: CrisisType): Exclude<Plan, "free"> {
  return STARTER_CRISIS.includes(type) ? "starter" : "growth";
}

/** The journey module every plan (incl. free) can run. */
export const FREE_JOURNEY_MODULE = "product-selection";

export function canUseJourneyModule(plan: Plan, moduleId: string): boolean {
  return ENTITLEMENTS[plan].allJourneyModules || moduleId === FREE_JOURNEY_MODULE;
}

/**
 * Tool access by route segment under /app/tools/. Free "Scout" keeps the
 * taste-of-correctness tools; everything else needs Starter; the money-
 * recovery suite needs Growth.
 */
const FREE_TOOLS = new Set(["margin-calculator", "verification-checklist", "seasonal-calendar"]);

export function requiredPlanForTool(toolSlug: string): Plan {
  if (FREE_TOOLS.has(toolSlug)) return "free";
  // Reconciliation is Starter-visible (1/month quota); unlimited is the
  // Growth upsell enforced in the upload action, not at the door.
  return "starter";
}

const PLAN_ORDER: Record<Plan, number> = { free: 0, starter: 1, growth: 2 };

export function planCovers(userPlan: Plan, required: Plan): boolean {
  return PLAN_ORDER[userPlan] >= PLAN_ORDER[required];
}
