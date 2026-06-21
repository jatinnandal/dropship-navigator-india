"use server";

import { revalidatePath } from "next/cache";
import { setModuleCompletion } from "@/lib/profile-store";
import { requireUser } from "@/lib/supauth";

export async function updateModuleCompletion(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    return;
  }

  const moduleId = String(formData.get("moduleId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!moduleId) {
    return;
  }

  await setModuleCompletion(user.id, moduleId, completed);
  revalidatePath("/app/journey");
}
