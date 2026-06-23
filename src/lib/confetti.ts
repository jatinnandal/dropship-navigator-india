"use client";

import confetti from "canvas-confetti";
import type { MilestoneId } from "@/lib/milestones";
import { MILESTONE_LABELS } from "@/lib/milestones";

export function fireMilestoneConfetti(milestoneId: MilestoneId) {
  if (typeof window === "undefined") return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  confetti({
    particleCount: 80,
    spread: 60,
    origin: { y: 0.7 },
    colors: ["#fbbf24", "#34d399", "#22d3ee"],
  });
  return MILESTONE_LABELS[milestoneId];
}
