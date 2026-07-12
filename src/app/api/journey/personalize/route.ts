import { NextResponse } from "next/server";
import { ensureModulePlan } from "@/app/app/journey/actions";

/**
 * Background personalization endpoint. The auto-loader hits this with a plain
 * fetch (not a server action) so a slow generation never blocks router
 * navigation - the seller can leave the page while it runs, and the fetch
 * survives client-side navigation. Idempotent + capped inside ensureModulePlan.
 */
export async function POST(request: Request) {
  let moduleId: unknown;
  try {
    ({ moduleId } = await request.json());
  } catch {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }
  if (typeof moduleId !== "string") {
    return NextResponse.json({ ok: false, reason: "bad_request" }, { status: 400 });
  }

  const result = await ensureModulePlan(moduleId);
  return NextResponse.json(result);
}
