import { buildCrisisWarnings, type CrisisDetectorInput } from "@/lib/crisis/detectors";
import type { CrisisWarning, DashboardMode } from "@/lib/crisis/types";
import type { Workspace } from "@/lib/workspace";

export type DashboardState = {
  mode: DashboardMode;
  warnings: CrisisWarning[];
  activeCrisis: Workspace["activeCrisis"];
};

export function getDashboardMode(workspace: Workspace, warnings: CrisisWarning[]): DashboardMode {
  if (workspace.activeCrisis) return "crisis";
  if (warnings.length > 0) return "at_risk";
  return "normal";
}

export function getDashboardState(input: CrisisDetectorInput): DashboardState {
  const warnings = buildCrisisWarnings(input);
  const mode = getDashboardMode(input.workspace, warnings);
  return {
    mode,
    warnings,
    activeCrisis: input.workspace.activeCrisis,
  };
}
