import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { devBypassUserId } from "@/lib/dev-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured, supabaseAnonKey, supabaseUrl } from "@/lib/supabase/config";

/**
 * Client for reading/writing user data tables. Normally the cookie-session
 * client (RLS scopes rows to the signed-in user). Under the dev auth bypass
 * there is no session, so RLS would block everything — use the service-role
 * client instead; row scoping then comes from the bypass user id that
 * getCurrentUserId() feeds into every store query.
 */
export async function createSupabaseDataClient() {
  if (devBypassUserId()) {
    return createSupabaseAdminClient();
  }
  return createSupabaseServerClient();
}

export async function createSupabaseServerClient() {
  if (!isSupabaseConfigured()) {
    return null;
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        } catch {
          // Cookie updates are not available in every server render context.
        }
      },
    },
  });
}
