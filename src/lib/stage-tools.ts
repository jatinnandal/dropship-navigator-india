import type { TaskModuleId } from "@/lib/tasks";

export type StageTool = { label: string; href: string; emoji: string };

/** In-app tools most relevant to each journey module, shown on the dashboard rail. */
export const STAGE_TOOLS: Record<TaskModuleId, StageTool[]> = {
  "common-documentation": [
    { label: "Document checker", href: "/app/tools/document-checker", emoji: "📁" },
    { label: "GST filing calendar", href: "/app/tools/gst-calendar", emoji: "📅" },
  ],
  "product-selection": [
    { label: "Margin calculator", href: "/app/tools/margin-calculator", emoji: "🧮" },
    { label: "Shipping estimator", href: "/app/tools/shipping-estimator", emoji: "📦" },
  ],
  "compliance-by-product": [
    { label: "Document checker", href: "/app/tools/document-checker", emoji: "📁" },
    { label: "GST filing calendar", href: "/app/tools/gst-calendar", emoji: "📅" },
  ],
  "supplier-sourcing": [
    { label: "Supplier scorecard", href: "/app/tools/supplier-scorecard", emoji: "🛡️" },
    { label: "Sourcing swipe game", href: "/app/tools/sourcing-game", emoji: "🎮" },
  ],
  "channel-launch": [
    { label: "COD call simulator", href: "/app/tools/cod-simulator", emoji: "📞" },
    { label: "WhatsApp templates", href: "/app/tools/whatsapp-templates", emoji: "💬" },
    { label: "Settlement timeline", href: "/app/tools/settlement-timeline", emoji: "🧾" },
  ],
  "ads-growth": [
    { label: "Break-even ROAS", href: "/app/tools/breakeven-roas", emoji: "📈" },
    { label: "Cashflow simulator", href: "/app/tools/cashflow-simulator", emoji: "📊" },
  ],
  "tracking-analytics": [
    { label: "Settlement timeline", href: "/app/tools/settlement-timeline", emoji: "🧾" },
    { label: "COD vs prepaid impact", href: "/app/tools/cod-prepaid-simulator", emoji: "🔁" },
  ],
};
