import { cookies } from "next/headers";
import { emptyWorkspace, parseWorkspace, type Workspace } from "@/lib/workspace";

const WORKSPACE_COOKIE = "dsi_workspace";

const COOKIE_OPTIONS = {
  path: "/",
  sameSite: "lax" as const,
  maxAge: 60 * 60 * 24 * 365,
  httpOnly: false,
};

export async function getLocalWorkspace(): Promise<Workspace> {
  const store = await cookies();
  return parseWorkspace(store.get(WORKSPACE_COOKIE)?.value);
}

export async function saveLocalWorkspace(workspace: Workspace) {
  const store = await cookies();
  store.set(WORKSPACE_COOKIE, JSON.stringify(workspace), COOKIE_OPTIONS);
}

export async function patchLocalWorkspace(patch: Partial<Workspace>): Promise<Workspace> {
  const current = await getLocalWorkspace();
  const next: Workspace = { ...current, ...patch };
  await saveLocalWorkspace(next);
  return next;
}

export { emptyWorkspace };
