"use client";

import type { ReactNode, CSSProperties } from "react";
import { useFormStatus } from "react-dom";

/**
 * Submit button that reflects the enclosing <form> action's pending state
 * (disabled + label swap) so every server-action form shows feedback.
 */
export function SubmitButton({
  children, style, className, pendingLabel,
}: {
  children: ReactNode;
  style: CSSProperties;
  className?: string;
  pendingLabel: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      style={{ ...style, cursor: pending ? "wait" : "pointer", opacity: pending ? 0.65 : 1 }}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}
