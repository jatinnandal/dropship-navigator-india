"use client";

import { deleteProfile } from "@/app/onboarding/actions";
import { useTransition } from "react";

type Props = {
  profileId: string;
  profileName: string;
  canDelete: boolean;
};

export function DeleteProfileButton({ profileId, profileName, canDelete }: Props) {
  const [pending, startTransition] = useTransition();

  if (!canDelete) return null;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (
          !window.confirm(
            `Delete "${profileName}"? This removes its journey progress and workspace data. This cannot be undone.`,
          )
        ) {
          return;
        }
        startTransition(() => deleteProfile(profileId));
      }}
      className="btn-ghost rounded-md px-3 py-1.5 text-xs font-medium text-red-300 hover:text-red-200 disabled:opacity-50"
    >
      {pending ? "Deleting…" : "Delete"}
    </button>
  );
}
