import type { OnboardingProfile } from "@/lib/mvp-data";
import type { JourneyNode } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";
import { getGstFilingBanner as getGstFilingBannerFromCrisis } from "@/lib/crisis/banners";
import {
  countSubTasksStarted,
  getSubTaskGuide,
  getUnlockWhy,
  personalizeSubTaskWhy,
  SUBTASK_TIME_ESTIMATES,
} from "@/lib/subtask-guides";

export type NextAction = {
  title: string;
  why: string;
  timeEstimate: string;
  href: string;
  moduleId: TaskModuleId;
  subTaskId?: string;
  isLocked?: boolean;
  isFreshStart?: boolean;
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

export { SUBTASK_TIME_ESTIMATES as TIME_ESTIMATES };

export function getNextAction(input: {
  profile: OnboardingProfile;
  nodes: JourneyNode[];
  subTasks?: Record<string, boolean>;
}): NextAction | null {
  const { profile, nodes, subTasks } = input;
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));
  const freshStart = countSubTasksStarted(subTasks) === 0;

  for (const moduleId of MODULE_ORDER) {
    const node = nodeMap.get(moduleId);
    if (!node || node.status === "done") continue;

    if (node.status === "locked" && node.blockedBy.length > 0) {
      const block = node.blockedBy[0];
      return {
        title: `Unlock ${node.title}: ${block.label}`,
        why: getUnlockWhy(block.subTaskId, block.label),
        timeEstimate: SUBTASK_TIME_ESTIMATES[block.subTaskId] ?? "~30 mins",
        href: `/app/tasks/${block.moduleId}`,
        moduleId: block.moduleId,
        subTaskId: block.subTaskId,
        isLocked: true,
        isFreshStart: freshStart,
      };
    }

    const incomplete = node.subTasks.find((st) => !st.done);
    if (incomplete) {
      const guide = getSubTaskGuide(incomplete.id, moduleId);
      return {
        title: incomplete.label,
        why: personalizeSubTaskWhy(incomplete.id, guide.why, profile),
        timeEstimate: SUBTASK_TIME_ESTIMATES[incomplete.id] ?? "~30 mins",
        href: `/app/tasks/${moduleId}`,
        moduleId,
        subTaskId: incomplete.id,
        isFreshStart: freshStart,
      };
    }

    if (node.status === "available" || node.status === "in_progress") {
      return {
        title: `Start ${node.title}`,
        why: "Open the guided walkthrough — each step explains why before asking you to act.",
        timeEstimate: "~45 mins",
        href: `/app/tasks/${moduleId}`,
        moduleId,
        isFreshStart: freshStart,
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
  const banner = getGstFilingBannerFromCrisis(input);
  if (!banner) return null;
  return { message: banner.message, href: banner.href };
}
