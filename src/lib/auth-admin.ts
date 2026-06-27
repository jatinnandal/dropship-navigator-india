import type { User } from "@supabase/supabase-js";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export function isAdminAuthConfigured(): boolean {
  return createSupabaseAdminClient() !== null;
}

/** Dev/local only — auto-confirms email via admin API. Never enabled in production. */
export function isInstantSignupEnabled(): boolean {
  if (!isAdminAuthConfigured()) {
    return false;
  }

  if (process.env.AUTH_INSTANT_SIGNUP === "true") {
    return true;
  }

  return process.env.NODE_ENV === "development";
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const normalized = email.trim().toLowerCase();
  let page = 1;

  while (page <= 10) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error || !data.users.length) return null;

    const match = data.users.find((u) => u.email?.toLowerCase() === normalized);
    if (match) return match;

    if (data.users.length < 200) break;
    page += 1;
  }

  return null;
}

/** Create or repair a user with a confirmed email so password login works immediately. */
export async function ensureConfirmedUserWithPassword(
  email: string,
  password: string,
): Promise<{ ok: true } | { ok: false; code: string }> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return { ok: false, code: "admin_unavailable" };
  }

  const normalized = email.trim().toLowerCase();

  const { error: createError } = await admin.auth.admin.createUser({
    email: normalized,
    password,
    email_confirm: true,
  });

  if (!createError) {
    return { ok: true };
  }

  const alreadyExists =
    createError.code === "email_exists" ||
    createError.message.toLowerCase().includes("already been registered") ||
    createError.message.toLowerCase().includes("already exists");

  if (!alreadyExists) {
    if (createError.code === "weak_password") return { ok: false, code: "weak_password" };
    return { ok: false, code: "signup_failed" };
  }

  const existing = await findUserByEmail(normalized);
  if (!existing) {
    return { ok: false, code: "signup_failed" };
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(existing.id, {
    email_confirm: true,
    password,
  });

  if (updateError) {
    return { ok: false, code: "signup_failed" };
  }

  return { ok: true };
}

/** If login fails, unconfirmed email is a common cause — confirm and allow retry. */
export async function confirmExistingUserEmail(email: string): Promise<boolean> {
  const admin = createSupabaseAdminClient();
  if (!admin) return false;

  const user = await findUserByEmail(email.trim().toLowerCase());
  if (!user || user.email_confirmed_at) return false;

  const { error } = await admin.auth.admin.updateUserById(user.id, { email_confirm: true });
  return !error;
}
