"use server";

import { redirect } from "next/navigation";
import type { ProductType } from "@/lib/mvp-data";
import { getCurrentEntitlements } from "@/lib/plan";
import { getActiveSellerProfileForCurrentVisitor } from "@/lib/progress-store";
import { parseSettlementCsv } from "@/lib/settlement-recon/adapters";
import { reconcile } from "@/lib/settlement-recon/reconcile";
import type { ReconChannel } from "@/lib/settlement-recon/types";
import { countUploadsThisMonth, insertUpload } from "@/lib/settlement-recon-store";

const MAX_FILE_BYTES = 2 * 1024 * 1024; // 2MB ≈ well past 2,000 orders

const CHANNELS: ReconChannel[] = ["amazon", "flipkart", "meesho"];
const CATEGORIES: ProductType[] = ["general", "food", "beauty", "electronics", "fashion"];

function fail(code: string): never {
  redirect(`/app/tools/payout-reconciliation?error=${code}`);
}

export async function uploadSettlementCsv(formData: FormData) {
  const profile = await getActiveSellerProfileForCurrentVisitor();
  if (!profile) fail("no_profile");

  const channel = String(formData.get("channel") ?? "") as ReconChannel;
  const category = String(formData.get("category") ?? "general") as ProductType;
  const file = formData.get("file");

  if (!CHANNELS.includes(channel)) fail("bad_channel");
  if (!CATEGORIES.includes(category)) fail("bad_category");
  if (!(file instanceof File) || file.size === 0) fail("no_file");
  if (file.size > MAX_FILE_BYTES) fail("too_large");

  const entitlements = await getCurrentEntitlements();
  const used = await countUploadsThisMonth(profile.id);
  if (used >= entitlements.reconPerMonth) fail("limit");

  const text = await file.text();
  const adapter = parseSettlementCsv(channel, text);

  if (adapter.missingFields.length > 0) {
    fail(`columns_${adapter.missingFields.join("-")}`);
  }
  if (adapter.rows.length === 0) fail("no_rows");

  const report = reconcile(channel, category, adapter);
  const uploadId = await insertUpload(profile.id, file.name || null, report);
  if (!uploadId) fail("store_failed");

  redirect(`/app/tools/payout-reconciliation/${uploadId}`);
}
