import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getPostAuthRedirect(userId: string): Promise<string> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return "/app/welcome";
  }

  const { data } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();

  return data ? "/app" : "/app/welcome";
}

export async function userHasProfile(userId: string): Promise<boolean> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return false;
  }

  const { data } = await supabase.from("profiles").select("user_id").eq("user_id", userId).maybeSingle();
  return Boolean(data);
}
