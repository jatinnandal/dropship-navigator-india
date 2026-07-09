import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/current-user";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export async function requireUser() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return user;
}
