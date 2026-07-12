"use client";

import { useSearchParams } from "next/navigation";
import { changePassword } from "@/app/app/account/actions";
import { SubmitButton } from "@/components/submit-button";

const ERRORS: Record<string, string> = {
  missing_current: "Enter your current password.",
  weak_password: "Choose a stronger password — at least 6 characters.",
  password_mismatch: "New passwords do not match.",
  same_password: "Your new password must be different from the current one.",
  wrong_current: "Your current password is incorrect.",
  unavailable: "Something went wrong. Please try again in a moment.",
};

const inputClass =
  "w-full min-h-[44px] rounded-[10px] px-3.5 text-sm text-white bg-white/[0.03] border border-white/[0.14] outline-none focus:border-white/40 focus:bg-white/[0.05] box-border";
const labelClass =
  "block mb-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--text-faint)]";

function Field({ label, name, autoComplete }: { label: string; name: string; autoComplete: string }) {
  return (
    <div>
      <label className={labelClass}>{label}</label>
      <input name={name} type="password" autoComplete={autoComplete} required placeholder="••••••••" className={inputClass} />
    </div>
  );
}

export function ChangePasswordForm() {
  const params = useSearchParams();
  const errorCode = params.get("error");
  const success = params.get("message") === "password_changed";
  const errorMessage = errorCode ? (ERRORS[errorCode] ?? ERRORS.unavailable) : null;

  return (
    <div>
      {success && (
        <div className="mb-4 rounded-[11px] px-3.5 py-2.5 text-[13px] leading-6" style={{ color: "var(--success)", background: "color-mix(in oklab, var(--success) 8%, transparent)", border: "1px solid color-mix(in oklab, var(--success) 22%, transparent)" }}>
          Password updated.
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 rounded-[11px] px-3.5 py-2.5 text-[13px] leading-6" style={{ color: "oklch(0.8 0.13 20)", background: "oklch(0.72 0.17 20 / 0.08)", border: "1px solid oklch(0.72 0.17 20 / 0.2)" }}>
          {errorMessage}
        </div>
      )}

      <form action={changePassword} className="flex flex-col gap-3">
        <Field label="Current password" name="current_password" autoComplete="current-password" />
        <Field label="New password" name="new_password" autoComplete="new-password" />
        <Field label="Confirm new password" name="confirm_password" autoComplete="new-password" />
        <SubmitButton
          className="hover:-translate-y-px transition-transform"
          pendingLabel="Updating…"
          style={{ marginTop: 6, alignSelf: "flex-start", minHeight: 44, borderRadius: 10, padding: "0 22px", fontSize: 14, fontWeight: 600, color: "#000", border: "none", fontFamily: "var(--font-sans)", background: "#ffffff" }}
        >
          Update password
        </SubmitButton>
      </form>
    </div>
  );
}
