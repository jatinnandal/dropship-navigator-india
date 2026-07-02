"use client";

import { useTransition } from "react";
import { switchActiveProfile } from "@/app/onboarding/actions";
import { useRouter } from "next/navigation";

type Props = {
  profileId: string;
  isActive: boolean;
  children: React.ReactNode;
};

export function SwitchProfileButton({ profileId, isActive, children }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (isActive) return <>{children}</>;

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await switchActiveProfile(profileId);
          router.refresh();
        })
      }
      className="btn-ghost rounded-md px-3 py-1.5 text-xs font-medium disabled:opacity-50"
    >
      {children}
    </button>
  );
}
