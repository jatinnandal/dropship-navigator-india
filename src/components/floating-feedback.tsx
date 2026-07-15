"use client";

import { usePathname } from "next/navigation";
import { FeedbackButton } from "@/components/feedback-button";

/**
 * Always-available feedback, pinned to the corner on every authenticated page.
 * The source is the current path, so the founder sees exactly which screen
 * (dashboard, a tool, a walkthrough module) the note came from.
 */
export function FloatingFeedback() {
  const pathname = usePathname() || "";
  return (
    <div className="fixed bottom-[84px] right-4 z-30 md:bottom-5 md:right-6">
      <FeedbackButton source={`page:${pathname}`} label="Feedback" openUp />
    </div>
  );
}
