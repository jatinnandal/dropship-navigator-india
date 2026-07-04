import {
  Calculator,
  Calendar,
  Clock,
  Truck,
  Repeat,
  TrendingUp,
  FileCheck,
  ShieldCheck,
  CalendarDays,
  GitBranch,
  ClipboardCheck,
} from "lucide-react";
import { ToolCard } from "@/components/tool-card";
import { getToolTier } from "@/lib/pricing-tiers";

const TOOLS = [
  {
    href: "/app/tools/margin-calculator",
    title: "Profit Margin Calculator",
    description: "Compare real margins across Amazon, Flipkart, Meesho & Shopify with full fee breakdown.",
    icon: Calculator,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  },
  {
    href: "/app/tools/gst-calendar",
    title: "GST Filing Calendar",
    description: "Never miss a deadline — GSTR-1, GSTR-3B, TCS reconciliation with prep checklists.",
    icon: Calendar,
    accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
  },
  {
    href: "/app/tools/settlement-timeline",
    title: "Settlement Timeline",
    description: "See when marketplaces actually pay you and how much working capital you need.",
    icon: Clock,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  },
  {
    href: "/app/tools/shipping-estimator",
    title: "Shipping Cost Estimator",
    description: "Compare REAL carrier costs — not advertised rates. Includes COD, GST & fuel surcharges.",
    icon: Truck,
    accent: "text-rose-400 border-rose-500/30 bg-rose-500/5",
  },
];

const DIFFERENTIATOR_TOOLS = [
  {
    href: "/app/tools/supplier-scorecard",
    title: "Supplier Vetting Scorecard",
    description: "Evaluate IndiaMART & other suppliers systematically — catch the red flags that kill 60% of sellers.",
    icon: ShieldCheck,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  },
  {
    href: "/app/tools/reorder-planner",
    title: "Reorder Planner",
    description: "Know exactly when to reorder based on lead times, sales velocity & safety stock math.",
    icon: Repeat,
    accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
  },
  {
    href: "/app/tools/growth-tracker",
    title: "Growth Tracker",
    description: "Track week-over-week metrics that actually matter — not vanity numbers.",
    icon: TrendingUp,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  },
  {
    href: "/app/tools/compliance-checker",
    title: "Compliance Checker",
    description: "Verify your listings meet marketplace requirements before they get suppressed.",
    icon: FileCheck,
    accent: "text-rose-400 border-rose-500/30 bg-rose-500/5",
  },
];

const ENGAGEMENT_TOOLS = [
  {
    href: "/app/tools/gst-calendar",
    title: "Seasonal Calendar",
    description: "Plan inventory and promotions around Indian festivals, sales events, and seasonal demand spikes.",
    icon: CalendarDays,
    accent: "text-amber-400 border-amber-500/30 bg-amber-500/5",
  },
  {
    href: "/app/tools/decision-trees",
    title: "Decision Tree Wizards",
    description: "Answer a few questions, get a data-backed recommendation — marketplace, fulfillment, niche, and COD strategy.",
    icon: GitBranch,
    accent: "text-cyan-400 border-cyan-500/30 bg-cyan-500/5",
  },
  {
    href: "/app/tools/verification-checklist",
    title: "Verification Checklist",
    description: "Don't just check boxes — verify your GSTIN, PAN, bank details, and listings are actually correct.",
    icon: ClipboardCheck,
    accent: "text-emerald-400 border-emerald-500/30 bg-emerald-500/5",
  },
];

export default function ToolsIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="eyebrow mb-2 text-xs">Interactive Tools</div>
      <h1 className="font-display text-2xl font-bold text-slate-100">
        Seller Tools
      </h1>
      <p className="text-muted mt-1 text-sm">
        Calculate, plan, and validate before you spend a single rupee.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {TOOLS.map((tool) => (
          <ToolCard key={tool.href} {...tool} badge={getToolTier(tool.href) === "premium" ? "Premium" : undefined} />
        ))}
      </div>

      {/* Core Differentiators */}
      <div className="mt-12">
        <div className="eyebrow mb-2 text-xs">Core Differentiators</div>
        <h2 className="font-display text-xl font-bold text-slate-100">
          Sourcing &amp; Growth Tools
        </h2>
        <p className="text-muted mt-1 text-sm">
          Tools that address the real reasons Indian sellers fail — supplier issues, compliance gaps, and growth blindness.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {DIFFERENTIATOR_TOOLS.map((tool) => (
            <ToolCard key={tool.href} {...tool} badge={getToolTier(tool.href) === "premium" ? "Premium" : undefined} />
          ))}
        </div>
      </div>

      {/* Engagement & Growth */}
      <div className="mt-12">
        <div className="eyebrow mb-2 text-xs">Engagement &amp; Growth</div>
        <h2 className="font-display text-xl font-bold text-slate-100">
          Planning &amp; Verification
        </h2>
        <p className="text-muted mt-1 text-sm">
          Interactive wizards and checklists to keep you on track from day one.
        </p>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {ENGAGEMENT_TOOLS.map((tool) => (
            <ToolCard key={tool.href} {...tool} badge={getToolTier(tool.href) === "premium" ? "Premium" : undefined} />
          ))}
        </div>
      </div>
    </div>
  );
}
