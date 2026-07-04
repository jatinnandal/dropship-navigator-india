import Link from "next/link";
import {
  Calculator,
  Calendar,
  Clock,
  Truck,
  Repeat,
  TrendingUp,
  FileCheck,
  ShieldCheck,
} from "lucide-react";

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
        {TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="glass-panel grain group rounded-xl border p-5 transition-colors hover:border-amber-500/30"
            >
              <div className={`inline-flex rounded-lg border p-2.5 ${tool.accent}`}>
                <Icon className="h-5 w-5" />
              </div>
              <h2 className="mt-3 font-display text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                {tool.title}
              </h2>
              <p className="text-muted mt-1 text-sm leading-relaxed">
                {tool.description}
              </p>
            </Link>
          );
        })}
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
          {DIFFERENTIATOR_TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="glass-panel grain group rounded-xl border p-5 transition-colors hover:border-amber-500/30"
              >
                <div className={`inline-flex rounded-lg border p-2.5 ${tool.accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <h2 className="mt-3 font-display text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-muted mt-1 text-sm leading-relaxed">
                  {tool.description}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
