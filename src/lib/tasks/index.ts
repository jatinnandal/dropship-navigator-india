import type { OnboardingProfile } from "@/lib/mvp-data";
import type { Workspace } from "@/lib/workspace";
import { buildAdsTask } from "@/lib/tasks/ads-growth";
import { buildChannelLaunchTask } from "@/lib/tasks/channel-launch";
import { buildComplianceTask } from "@/lib/tasks/compliance";
import { buildDocumentationTask } from "@/lib/tasks/documentation";
import { buildProductSelectionTask } from "@/lib/tasks/product-selection";
import { buildSourcingTask } from "@/lib/tasks/supplier-sourcing";
import { buildTrackingTask } from "@/lib/tasks/tracking-analytics";
import type { Task } from "@/lib/tasks/types";

export const TASK_MODULE_IDS = [
  "common-documentation",
  "product-selection",
  "compliance-by-product",
  "supplier-sourcing",
  "channel-launch",
  "ads-growth",
  "tracking-analytics",
] as const;

export type TaskModuleId = (typeof TASK_MODULE_IDS)[number];

export function isSupportedTaskId(id: string): id is TaskModuleId {
  return (TASK_MODULE_IDS as readonly string[]).includes(id);
}

type TaskBuilder = (
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
) => Task;

const TASK_BUILDERS: Record<TaskModuleId, TaskBuilder> = {
  "common-documentation": buildDocumentationTask,
  "product-selection": buildProductSelectionTask,
  "compliance-by-product": buildComplianceTask,
  "supplier-sourcing": buildSourcingTask,
  "channel-launch": buildChannelLaunchTask,
  "ads-growth": buildAdsTask,
  "tracking-analytics": buildTrackingTask,
};

/** Legacy alias: gst-registration maps to common-documentation */
const TASK_ALIASES: Record<string, TaskModuleId> = {
  "gst-registration": "common-documentation",
};

export function resolveTaskId(taskId: string): TaskModuleId | null {
  if (isSupportedTaskId(taskId)) return taskId;
  return TASK_ALIASES[taskId] ?? null;
}

export function buildTask(
  taskId: string,
  profile: OnboardingProfile,
  answers: Record<string, string>,
  workspace: Workspace,
): Task | null {
  const resolved = resolveTaskId(taskId);
  if (!resolved) return null;
  const builder = TASK_BUILDERS[resolved];
  const task = builder(profile, answers, workspace);
  if (taskId !== resolved && taskId === "gst-registration") {
    return {
      ...task,
      id: "gst-registration",
      title: "GST registration, done with you",
    };
  }
  return task;
}

export function getTaskTitle(taskId: string): string {
  const resolved = resolveTaskId(taskId);
  if (!resolved) return "Guided walkthrough";
  const titles: Record<TaskModuleId, string> = {
    "common-documentation": "Business docs + GST, done with you",
    "product-selection": "Find winning products, step by step",
    "compliance-by-product": "Product compliance, personalized to you",
    "supplier-sourcing": "Find and vet suppliers safely",
    "channel-launch": "Launch on your channel, step by step",
    "ads-growth": "Run ads without burning money",
    "tracking-analytics": "Track real profit, not just sales",
  };
  return titles[resolved];
}
