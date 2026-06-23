"use server";

import { revalidatePath } from "next/cache";
import { setModuleCompletionForCurrentVisitor } from "@/lib/progress-store";

export async function updateModuleCompletion(formData: FormData) {
  const moduleId = String(formData.get("moduleId") ?? "");
  const completed = String(formData.get("completed") ?? "") === "true";
  if (!moduleId) {
    return;
  }

  await setModuleCompletionForCurrentVisitor(moduleId, completed);
  revalidatePath("/app/journey");
  revalidatePath("/app");
}
