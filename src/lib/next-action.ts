import type { OnboardingProfile } from "@/lib/mvp-data";
import type { JourneyNode } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";

export type NextAction = {
  title: string;
  why: string;
  timeEstimate: string;
  href: string;
  moduleId: TaskModuleId;
  subTaskId?: string;
  isLocked?: boolean;
};

const MODULE_ORDER: TaskModuleId[] = [
  "common-documentation",
  "product-selection",
  "compliance-by-product",
  "supplier-sourcing",
  "channel-launch",
  "ads-growth",
  "tracking-analytics",
];

const TIME_ESTIMATES: Record<string, string> = {
  "docs-folder-ready": "~30 mins",
  "gstin-active": "~2–5 days",
  "bank-matched": "~15 mins",
  "product-shortlist": "~45 mins",
  "samples-ordered": "~3–5 days",
  "hsn-mapped": "~20 mins",
  "category-certs": "~1–7 days",
  "supplier-vetted": "~2–3 days",
  "backup-supplier": "~1 day",
  "domestic-supplier-confirmed": "~15 mins",
  "seller-account-live": "~3–7 days",
  "first-listing-live": "~1–2 days",
  "store-linked": "~30 mins",
  "cod-practice-done": "~15 mins",
  "first-payout-received": "~7–14 days",
  "breakeven-roas-known": "~20 mins",
  "first-ad-test": "~1 day",
  "pnl-sheet-ready": "~30 mins",
  "settlement-reconcile": "~45 mins",
  "appeal-pack-ready": "~20 mins",
  "gstr8-reviewed": "~30 mins",
  "gst-filing-understood": "~15 mins",
};

export function getNextAction(input: {
  profile: OnboardingProfile;
  nodes: JourneyNode[];
}): NextAction | null {
  const nodeMap = new Map(input.nodes.map((n) => [n.id, n]));

  for (const moduleId of MODULE_ORDER) {
    const node = nodeMap.get(moduleId);
    if (!node || node.status === "done") continue;

    if (node.status === "locked" && node.blockedBy.length > 0) {
      const block = node.blockedBy[0];
      return {
        title: `Unlock ${node.title}: ${block.label}`,
        why: `Complete this prerequisite before starting ${node.title.toLowerCase()}.`,
        timeEstimate: TIME_ESTIMATES[block.subTaskId] ?? "~30 mins",
        href: `/app/tasks/${block.moduleId}`,
        moduleId: block.moduleId,
        subTaskId: block.subTaskId,
        isLocked: true,
      };
    }

    const incomplete = node.subTasks.find((st) => !st.done);
    if (incomplete) {
      return {
        title: incomplete.label,
        why: `Your next step in ${node.title} — one action at a time.`,
        timeEstimate: TIME_ESTIMATES[incomplete.id] ?? "~30 mins",
        href: `/app/tasks/${moduleId}`,
        moduleId,
        subTaskId: incomplete.id,
      };
    }

    if (node.status === "available" || node.status === "in_progress") {
      return {
        title: `Start ${node.title}`,
        why: "Open the guided walkthrough and work through it step by step.",
        timeEstimate: "~45 mins",
        href: `/app/tasks/${moduleId}`,
        moduleId,
      };
    }
  }

  return {
    title: "Review your launch plan",
    why: "You've completed all sub-tasks. Review progress and pick a module to refine.",
    timeEstimate: "~10 mins",
    href: "/app/journey",
    moduleId: "tracking-analytics",
  };
}

export function getGstFilingBanner(input: {
  hasGstin: boolean;
  subTasks?: Record<string, boolean>;
}): { message: string; href: string } | null {
  if (!input.hasGstin) return null;
  if (input.subTasks?.["gst-filing-understood"]) return null;
  return {
    message:
      "You have a GSTIN — remember GSTR-1 and GSTR-3B filings are due monthly or quarterly. Missing filings suspends your GSTIN and blocks marketplaces.",
    href: "/app/tasks/common-documentation",
  };
}
