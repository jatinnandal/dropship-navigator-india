"use server";

import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { joinProWaitlist } from "@/lib/waitlist-store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export async function joinWaitlist(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim();
  if (!EMAIL_RE.test(email)) {
    redirect("/pricing?waitlist=invalid");
  }

  const user = await getCurrentUser();
  const result = await joinProWaitlist(email, user?.id);
  redirect(result === "ok" ? "/pricing?waitlist=joined" : "/pricing?waitlist=error");
}
