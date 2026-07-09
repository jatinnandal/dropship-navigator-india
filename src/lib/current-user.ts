import { redirect } from "next/navigation";
import type { User } from "@supabase/supabase-js";
import { devBypassUserId } from "@/lib/dev-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser(): Promise<User | null> {
  const bypassId = devBypassUserId();
  if (bypassId) {
    return { id: bypassId, email: "dev.bypass@local.test" } as User;
  }

  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user.id;
}

export async function getCurrentUserEmail(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.email ?? null;
}

function displayNameFromEmail(email: string | null): string {
  if (!email) return "there";
  const local = email.split("@")[0]?.trim();
  if (!local) return "there";
  const name = local.split(/[._-]/)[0];
  if (!name) return "there";
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function getDisplayName(): Promise<string> {
  return displayNameFromEmail(await getCurrentUserEmail());
}
