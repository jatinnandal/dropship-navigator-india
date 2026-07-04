export type HabitCategory = "compliance" | "operations" | "marketing" | "learning";

export type SellerHabit = {
  id: string;
  label: string;
  category: HabitCategory;
  frequency: "daily" | "weekly" | "monthly";
  description: string;
  impact: string;
};

export type StreakState = {
  habits: Record<string, { lastCompleted: string; streak: number; longestStreak: number }>;
};

export const SELLER_HABITS: SellerHabit[] = [
  {
    id: "file-gst-return",
    label: "File GST return",
    category: "compliance",
    frequency: "monthly",
    description: "Submit your GSTR-1/3B before the deadline",
    impact: "Missing = ₹50/day penalty",
  },
  {
    id: "check-policy-updates",
    label: "Check marketplace policy updates",
    category: "compliance",
    frequency: "weekly",
    description: "Review latest platform policy changes",
    impact: "Policy violations can suspend your account",
  },
  {
    id: "process-pending-orders",
    label: "Process pending orders",
    category: "operations",
    frequency: "daily",
    description: "Ship all orders within SLA window",
    impact: "Same-day dispatch improves seller rating",
  },
  {
    id: "review-rto-returns",
    label: "Review RTO/returns",
    category: "operations",
    frequency: "weekly",
    description: "Analyze return patterns and RTO reasons",
    impact: "Identify patterns before they become costly",
  },
  {
    id: "check-ad-performance",
    label: "Check ad performance",
    category: "marketing",
    frequency: "weekly",
    description: "Review ROAS, CPC, and conversion rates",
    impact: "Catch underperforming ads before they drain budget",
  },
  {
    id: "review-ratings",
    label: "Review product reviews/ratings",
    category: "marketing",
    frequency: "weekly",
    description: "Monitor new reviews and respond to complaints",
    impact: "Address complaints before they tank your listing",
  },
  {
    id: "complete-journey-task",
    label: "Complete one journey task",
    category: "learning",
    frequency: "weekly",
    description: "Make progress on your seller journey",
    impact: "Consistent progress beats sporadic bursts",
  },
];

const FREQUENCY_WINDOWS: Record<SellerHabit["frequency"], number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
};

function getHabitById(id: string): SellerHabit | undefined {
  return SELLER_HABITS.find((h) => h.id === id);
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a);
  const dateB = new Date(b);
  return Math.floor((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export function checkIn(state: StreakState, habitId: string): StreakState {
  const today = todayStr();
  const existing = state.habits[habitId];
  const habit = getHabitById(habitId);
  if (!habit) return state;

  const window = FREQUENCY_WINDOWS[habit.frequency];

  if (existing) {
    const daysSinceLast = daysBetween(existing.lastCompleted, today);
    if (daysSinceLast === 0) return state; // already checked in today

    const streakContinued = daysSinceLast <= window;
    const newStreak = streakContinued ? existing.streak + 1 : 1;
    const longestStreak = Math.max(existing.longestStreak, newStreak);

    return {
      ...state,
      habits: {
        ...state.habits,
        [habitId]: { lastCompleted: today, streak: newStreak, longestStreak },
      },
    };
  }

  return {
    ...state,
    habits: {
      ...state.habits,
      [habitId]: { lastCompleted: today, streak: 1, longestStreak: 1 },
    },
  };
}

export function getActiveStreaks(
  state: StreakState
): { habit: SellerHabit; streak: number; isAtRisk: boolean; isBroken: boolean }[] {
  const today = todayStr();

  return SELLER_HABITS.map((habit) => {
    const entry = state.habits[habit.id];
    if (!entry) {
      return { habit, streak: 0, isAtRisk: false, isBroken: false };
    }

    const window = FREQUENCY_WINDOWS[habit.frequency];
    const daysSince = daysBetween(entry.lastCompleted, today);
    const isBroken = daysSince > window;
    const isAtRisk = !isBroken && daysSince >= window - 1 && daysSince <= window;

    return {
      habit,
      streak: isBroken ? 0 : entry.streak,
      isAtRisk,
      isBroken,
    };
  });
}

export function getStreakStats(state: StreakState): {
  totalActive: number;
  longestCurrent: number;
  atRisk: number;
} {
  const streaks = getActiveStreaks(state);
  const active = streaks.filter((s) => s.streak > 0 && !s.isBroken);
  const atRisk = streaks.filter((s) => s.isAtRisk);
  const longestCurrent = active.reduce((max, s) => Math.max(max, s.streak), 0);

  return { totalActive: active.length, longestCurrent, atRisk: atRisk.length };
}
