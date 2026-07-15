"use client";

import { useCallback, useState } from "react";
import { MessageSquarePlus, ThumbsUp, ThumbsDown, X, Check, Loader2 } from "lucide-react";
import { submitFeedback } from "@/app/feedback/actions";

type State = "idle" | "sending" | "done" | "error";

/**
 * Central, reusable feedback control. Drop it on any tool, module step, or page:
 *   <FeedbackButton source="tool:margin-calculator" />
 * It captures a 👍/👎 and an optional note, plus the current page path, and posts
 * to the feedback table via the submitFeedback server action.
 */
export function FeedbackButton({
  source,
  label = "Feedback",
  className = "",
  openUp = false,
}: {
  source: string;
  label?: string;
  className?: string;
  /** Open the popover above the button (for buttons pinned to the bottom). */
  openUp?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<"up" | "down" | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<State>("idle");
  const [err, setErr] = useState("");

  const reset = useCallback(() => {
    setRating(null);
    setMessage("");
    setState("idle");
    setErr("");
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    // Let the fade finish before wiping the form.
    setTimeout(reset, 200);
  }, [reset]);

  const send = useCallback(async () => {
    if (!rating && !message.trim()) {
      setErr("Add a rating or a note first.");
      return;
    }
    setState("sending");
    setErr("");
    const pagePath = typeof window !== "undefined" ? window.location.pathname : "";
    const res = await submitFeedback({ source, rating, message, pagePath });
    if (res.ok) {
      setState("done");
      setTimeout(close, 1400);
    } else {
      setState("error");
      setErr(res.error ?? "Something went wrong.");
    }
  }, [rating, message, source, close]);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        className="inline-flex items-center gap-1.5 rounded-md border border-neutral-800 bg-neutral-950 px-2.5 py-1.5 text-xs font-medium text-neutral-400 transition hover:border-neutral-600 hover:text-neutral-200"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" aria-hidden="true" />
        {label}
      </button>

      {open ? (
        <>
          {/* click-away backdrop */}
          <div className="fixed inset-0 z-40" onClick={close} aria-hidden="true" />
          <div
            className={`absolute right-0 z-50 w-72 rounded-xl border border-neutral-800 bg-neutral-950 p-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] ${
              openUp ? "bottom-full mb-2" : "mt-2"
            }`}
          >
            {state === "done" ? (
              <div className="flex items-center gap-2 py-2 text-sm text-emerald-300">
                <Check className="h-4 w-4" /> Thanks - this helps us improve.
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-white">How is this working for you?</p>
                  <button type="button" onClick={close} className="text-neutral-500 hover:text-white" aria-label="Close feedback">
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>

                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRating((r) => (r === "up" ? null : "up"))}
                    aria-pressed={rating === "up"}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      rating === "up"
                        ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200"
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <ThumbsUp className="h-3.5 w-3.5" /> Helpful
                  </button>
                  <button
                    type="button"
                    onClick={() => setRating((r) => (r === "down" ? null : "down"))}
                    aria-pressed={rating === "down"}
                    className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      rating === "down"
                        ? "border-rose-400/50 bg-rose-400/10 text-rose-200"
                        : "border-neutral-800 text-neutral-400 hover:border-neutral-600"
                    }`}
                  >
                    <ThumbsDown className="h-3.5 w-3.5" /> Not really
                  </button>
                </div>

                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What worked, what didn't, what's missing? (optional)"
                  rows={3}
                  maxLength={2000}
                  className="mt-3 w-full rounded-md border border-neutral-800 bg-black px-3 py-2 text-xs text-white placeholder:text-neutral-600"
                />

                {err ? <p className="mt-2 text-xs text-rose-300">{err}</p> : null}

                <button
                  type="button"
                  onClick={send}
                  disabled={state === "sending"}
                  className="btn-primary mt-3 flex w-full items-center justify-center gap-2 rounded-md px-3 py-2 text-xs font-semibold disabled:opacity-60"
                >
                  {state === "sending" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                  Send feedback
                </button>
              </>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
