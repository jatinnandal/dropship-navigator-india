import { headers } from "next/headers";
import { PLAN_LABELS, planCovers, requiredPlanForTool } from "@/lib/entitlements";
import { getCurrentPlan } from "@/lib/plan";
import { UpgradePanel } from "@/components/plan/upgrade-panel";

const TOOL_GATE_COPY: Record<string, { title: string; bullets: string[] }> = {
  "payout-reconciliation": {
    title: "Find the money your marketplace kept",
    bullets: [
      "Upload settlement CSVs — expected vs received, order by order",
      "Unclaimed TCS surfaced every month (most sellers never claim it)",
      "History trends: is your effective fee rate creeping up?",
    ],
  },
};

const DEFAULT_GATE = {
  title: "This tool is part of the full mentor",
  bullets: [
    "Every calculator, simulator and checklist — one plan",
    "Numbers from the same verified rate card as the margin calculator",
    "₹49/month — less than one RTO'd parcel",
  ],
};

export default async function ToolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = (await headers()).get("x-pathname") ?? "";
  const match = pathname.match(/^\/app\/tools\/([^/]+)/);
  const toolSlug = match?.[1];

  if (toolSlug) {
    const required = requiredPlanForTool(toolSlug);
    const plan = await getCurrentPlan();
    if (!planCovers(plan, required) && required !== "free") {
      const copy = TOOL_GATE_COPY[toolSlug] ?? DEFAULT_GATE;
      return (
        <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
          <p className="eyebrow">
            {PLAN_LABELS[required]} tool
          </p>
          <h1 className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-white">
            {toolSlug.replaceAll("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
          </h1>
          <div className="mt-6">
            <UpgradePanel requiredPlan={required} title={copy.title} bullets={copy.bullets} />
          </div>
        </main>
      );
    }
  }

  return <>{children}</>;
}
