import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/**
 * Pro-waitlist writes use the service-role client directly: the pricing page
 * is public (often no session), and the table's RLS denies anon by design.
 */
export async function joinProWaitlist(
  email: string,
  userId?: string | null,
): Promise<"ok" | "unavailable"> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) return "unavailable";

  const { error } = await supabase.from("pro_waitlist").upsert(
    {
      email: email.toLowerCase(),
      user_id: userId ?? null,
      source: "pricing",
    },
    { onConflict: "email" },
  );

  return error ? "unavailable" : "ok";
}
