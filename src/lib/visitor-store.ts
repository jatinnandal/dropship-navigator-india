import { cookies } from "next/headers";

const VISITOR_COOKIE = "dsi_visitor_id";

const VISITOR_COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
};

export async function getVisitorId(): Promise<string | null> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  return null;
}

export async function getOrCreateVisitorId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(VISITOR_COOKIE)?.value;
  if (existing) {
    return existing;
  }
  const visitorId = crypto.randomUUID();
  store.set(VISITOR_COOKIE, visitorId, VISITOR_COOKIE_OPTIONS);
  return visitorId;
}
