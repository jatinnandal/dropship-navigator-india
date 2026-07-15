"use server";

import { getCurrentUserId } from "@/lib/current-user";
import { getCurrentPlan } from "@/lib/plan";
import { createSupabaseDataClient } from "@/lib/supabase/server";

export type FeedbackInput = {
  source: string;
  rating?: "up" | "down" | null;
  message?: string;
  pagePath?: string;
};

/**
 * Central feedback sink. Any component drops a <FeedbackButton source="..." />
 * and the note lands in the `feedback` table with metadata about where it came
 * from. The founder reads it in Supabase; users never read each other's rows.
 */
export async function submitFeedback(input: FeedbackInput): Promise<{ ok: boolean; error?: string }> {
  const source = (input.source ?? "").trim().slice(0, 120);
  const message = (input.message ?? "").trim().slice(0, 2000);
  const rating = input.rating === "up" || input.rating === "down" ? input.rating : null;

  if (!source) return { ok: false, error: "Missing source." };
  if (!rating && !message) return { ok: false, error: "Add a rating or a note first." };

  const supabase = await createSupabaseDataClient();
  if (!supabase) return { ok: false, error: "Feedback is temporarily unavailable." };

  const userId = await getCurrentUserId();
  if (!userId) return { ok: false, error: "Please sign in to send feedback." };

  let plan: string | null = null;
  try {
    plan = await getCurrentPlan();
  } catch {
    plan = null;
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: userId,
    source,
    rating,
    message: message || null,
    page_path: (input.pagePath ?? "").trim().slice(0, 300) || null,
    plan,
  });

  if (error) return { ok: false, error: "Could not save feedback. Please try again." };
  return { ok: true };
}
