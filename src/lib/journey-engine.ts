import type { OnboardingProfile } from "@/lib/mvp-data";
import { deriveProfileFacts, type ProfileFacts } from "@/lib/profile-facts";
import {
  ADDITIONAL_REQUIREMENT_RULES,
  ALL_MODULE_IDS,
  BASE_SUBTASK_RULES,
  buildModuleCopy,
  MODULE_LOCK_RULES,
  WARNING_RULES,
  type JourneyRuntime,
  type RequirementSeverity,
} from "@/lib/journey-rules";
import type { TaskModuleId } from "@/lib/tasks";

export type ResolvedSubTask = {
  id: string;
  moduleId: TaskModuleId;
  label: string;
  why: string;
  severity: RequirementSeverity;
};

export type ResolvedModule = {
  id: TaskModuleId;
  title: string;
  description: string;
  outcomes: string[];
  tools: string[];
  isPriority: boolean;
  deprioritized: boolean;
  subTasks: ResolvedSubTask[];
  requiredSubTaskIds: string[];
};

export type JourneyPlan = {
  facts: ProfileFacts;
  modules: ResolvedModule[];
  moduleLocks: Partial<Record<TaskModuleId, { subTaskId: string; moduleId: TaskModuleId; label: string }[]>>;
};

export function mergeProfileSubTaskDefaults(
  profile: OnboardingProfile,
  subTasks: Record<string, boolean> | undefined,
): Record<string, boolean> {
  const merged = { ...(subTasks ?? {}) };
  if (profile.hasGstin) merged["gstin-active"] = true;
  if (profile.experienceLevel === "existing_seller") merged["docs-folder-ready"] = true;
  return merged;
}

function resolveSubTasksForModule(moduleId: TaskModuleId, facts: ProfileFacts): ResolvedSubTask[] {
  const byId = new Map<string, ResolvedSubTask>();

  for (const base of BASE_SUBTASK_RULES) {
    if (base.moduleId !== moduleId) continue;
    if (base.excludeWhen?.(facts)) continue;

    const severity = base.severityWhen?.(facts) ?? base.severity;
    byId.set(base.id, {
      id: base.id,
      moduleId: base.moduleId,
      label: base.label,
      why: base.why,
      severity,
    });
  }

  for (const rule of ADDITIONAL_REQUIREMENT_RULES) {
    if (rule.moduleId !== moduleId) continue;
    if (!rule.appliesWhen(facts)) continue;
    if (byId.has(rule.id)) continue;

    byId.set(rule.id, {
      id: rule.id,
      moduleId: rule.moduleId,
      label: rule.label,
      why: rule.why,
      severity: rule.severity,
    });
  }

  return Array.from(byId.values());
}

function resolveModuleLocks(
  facts: ProfileFacts,
  modules: ResolvedModule[],
): JourneyPlan["moduleLocks"] {
  const locks: JourneyPlan["moduleLocks"] = {};
  const labelFor = (modId: TaskModuleId, subTaskId: string) => {
    const mod = modules.find((m) => m.id === modId);
    const st = mod?.subTasks.find((s) => s.id === subTaskId);
    return st?.label ?? subTaskId;
  };

  for (const moduleId of ALL_MODULE_IDS) {
    const rules = MODULE_LOCK_RULES[moduleId];
    if (!rules) continue;

    const active = rules
      .filter((r) => !r.appliesWhen || r.appliesWhen(facts))
      .map((r) => ({
        subTaskId: r.subTaskId,
        moduleId: r.moduleId,
        label: labelFor(r.moduleId, r.subTaskId),
      }));

    if (active.length > 0) locks[moduleId] = active;
  }

  return locks;
}

export function buildSoftWarnings(
  moduleId: TaskModuleId,
  facts: ProfileFacts,
  runtime: JourneyRuntime,
): string[] {
  return WARNING_RULES.filter((rule) => rule.moduleId === moduleId && rule.appliesWhen(facts, runtime)).map(
    (rule) => (typeof rule.message === "function" ? rule.message(facts, runtime) : rule.message),
  );
}

export function buildJourneyPlan(profile: OnboardingProfile, runtime?: JourneyRuntime): JourneyPlan {
  const facts = deriveProfileFacts(profile);

  const modules: ResolvedModule[] = ALL_MODULE_IDS.map((moduleId) => {
    const copy = buildModuleCopy(moduleId, facts);
    const subTasks = resolveSubTasksForModule(moduleId, facts);
    const requiredSubTaskIds = subTasks.filter((s) => s.severity === "required").map((s) => s.id);

    return {
      id: moduleId,
      title: copy.title,
      description: copy.description,
      outcomes: copy.outcomes,
      tools: copy.tools,
      isPriority: copy.isPriority,
      deprioritized: copy.deprioritized,
      subTasks,
      requiredSubTaskIds,
    };
  });

  return {
    facts,
    modules,
    moduleLocks: resolveModuleLocks(facts, modules),
  };
}

export function getResolvedModule(plan: JourneyPlan, moduleId: TaskModuleId): ResolvedModule | undefined {
  return plan.modules.find((m) => m.id === moduleId);
}

export function getSubTaskProgressForPlan(
  moduleId: TaskModuleId,
  plan: JourneyPlan,
  subTasks: Record<string, boolean> | undefined,
): number {
  const mod = getResolvedModule(plan, moduleId);
  if (!mod || mod.subTasks.length === 0) return 0;
  const done = mod.subTasks.filter((d) => subTasks?.[d.id] === true).length;
  return Math.round((done / mod.subTasks.length) * 100);
}

export function allSubTasksDoneForPlan(
  moduleId: TaskModuleId,
  plan: JourneyPlan,
  subTasks: Record<string, boolean> | undefined,
): boolean {
  const mod = getResolvedModule(plan, moduleId);
  if (!mod || mod.subTasks.length === 0) return false;
  return mod.subTasks.every((d) => subTasks?.[d.id] === true);
}

export function countPlanSubTasks(plan: JourneyPlan): number {
  return plan.modules.reduce((sum, m) => sum + m.subTasks.length, 0);
}

export function countCompletedPlanSubTasks(
  plan: JourneyPlan,
  subTasks: Record<string, boolean> | undefined,
): number {
  return plan.modules.reduce(
    (sum, m) => sum + m.subTasks.filter((s) => subTasks?.[s.id] === true).length,
    0,
  );
}

export type JourneyProgressStats = {
  plan: JourneyPlan;
  totalSubTasks: number;
  completedSubTasks: number;
  subTaskPercent: number;
  totalModules: number;
  completedModules: number;
  modulePercent: number;
};

export function getJourneyProgressStats(
  profile: OnboardingProfile,
  completedModuleIds: Set<string>,
  subTasks: Record<string, boolean> | undefined,
): JourneyProgressStats {
  const plan = buildJourneyPlan(profile);
  const merged = mergeProfileSubTaskDefaults(profile, subTasks);
  const totalSubTasks = countPlanSubTasks(plan);
  const completedSubTasks = countCompletedPlanSubTasks(plan, merged);
  const subTaskPercent = totalSubTasks > 0 ? Math.round((completedSubTasks / totalSubTasks) * 100) : 0;

  const totalModules = plan.modules.length;
  const completedModules = plan.modules.filter(
    (m) =>
      completedModuleIds.has(m.id) ||
      allSubTasksDoneForPlan(m.id, plan, merged),
  ).length;
  const modulePercent = totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

  return {
    plan,
    totalSubTasks,
    completedSubTasks,
    subTaskPercent,
    totalModules,
    completedModules,
    modulePercent,
  };
}
