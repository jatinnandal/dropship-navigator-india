"use server";

import { revalidatePath } from "next/cache";
import { CURRENT_RATES } from "@/data/rates";
import { patchWorkspaceForCurrentVisitor } from "@/lib/workspace-store";

export async function dismissRatesUpdate() {
  await patchWorkspaceForCurrentVisitor({
    seenRatesVersion: CURRENT_RATES.meta.version,
  });
  revalidatePath("/app");
}
