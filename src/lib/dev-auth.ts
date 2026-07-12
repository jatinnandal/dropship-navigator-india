/**
 * Development-only auth bypass.
 *
 * Set DEV_AUTH_BYPASS_USER_ID in .env.local to the UUID of a real auth user
 * (e.g. a seeded test account) to browse the authenticated app without
 * logging in. Ignored entirely in production builds - never set it there.
 */
export function devBypassUserId(): string | null {
  if (process.env.NODE_ENV === "production") return null;
  const id = process.env.DEV_AUTH_BYPASS_USER_ID?.trim();
  return id ? id : null;
}
