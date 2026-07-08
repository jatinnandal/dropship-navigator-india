"use client";

import { useRef, useCallback } from "react";
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
  CalendarDays,
  GitBranch,
  ClipboardCheck,
  MessageSquare,
  Flame,
  TreeDeciduous,
  DollarSign,
  BarChart3,
  Phone,
  Target,
  CreditCard,
  FolderCheck,
  Receipt,
  Gamepad2,
} from "lucide-react";

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
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
  MessageSquare,
  Flame,
  TreeDeciduous,
  DollarSign,
  BarChart3,
  Phone,
  Target,
  CreditCard,
  FolderCheck,
  Receipt,
  Gamepad2,
};

type Props = {
  href?: string;
  title: string;
  description: string;
  icon: string;
  status?: "open" | "due-soon" | "done" | "locked";
  statusLabel?: string;
  locked?: boolean;
};

function StatusBadge({ status, statusLabel }: Pick<Props, "status" | "statusLabel">) {
  if (!status) return null;

  let color: string;
  let text: string;

  switch (status) {
    case "open":
      color = "var(--text-faint)";
      text = "Open";
      break;
    case "due-soon":
      color = "var(--danger-text)";
      text = statusLabel ?? "Due soon";
      break;
    case "done":
      color = "var(--success-text)";
      text = "done ✓";
      break;
    case "locked":
      color = "var(--text-ghost)";
      text = statusLabel ?? "Locked";
      break;
  }

  return (
    <span
      className="font-mono uppercase leading-none"
      style={{
        fontSize: "9.5px",
        letterSpacing: "0.1em",
        color,
      }}
    >
      {text}
    </span>
  );
}

export function ToolCard({
  href,
  title,
  description,
  icon,
  status,
  statusLabel,
  locked,
}: Props) {
  const Icon = ICON_MAP[icon] ?? Calculator;
  const cardRef = useRef<HTMLDivElement>(null);
  const prefersReduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (prefersReduced) return;
      const el = cardRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const midX = rect.width / 2;
      const midY = rect.height / 2;
      const rotateY = ((x - midX) / midX) * 6;
      const rotateX = ((midY - y) / midY) * 6;
      el.style.transform = `perspective(800px) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`;
      el.style.borderColor = "rgba(255,255,255,0.28)";
    },
    [prefersReduced],
  );

  const handleMouseLeave = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = "";
    el.style.borderColor = "";
  }, []);

  const inner = (
      <div
        ref={cardRef}
        onMouseMove={href ? handleMouseMove : undefined}
        onMouseLeave={href ? handleMouseLeave : undefined}
        className="panel spotlight-card h-full"
        style={{
          borderRadius: "15px",
          padding: "18px 20px",
          background: "var(--card)",
          border: "1px solid var(--border-default)",
          boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
          transition: "transform 0.2s cubic-bezier(0.22,1,0.36,1), border-color 0.2s ease",
          willChange: "transform",
        }}
      >
        {/* Top row: icon tile + status badge */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          {/* Icon tile */}
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 10,
              background: "#101010",
              border: "1px solid rgba(255,255,255,0.12)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Icon size={16} className="text-white" />
          </div>

          <StatusBadge status={status} statusLabel={statusLabel} />
        </div>

        {/* Title */}
        <h2
          style={{
            marginTop: 13,
            fontSize: "14.5px",
            fontWeight: 600,
            letterSpacing: "-0.015em",
            color: "#e8e8e8",
            lineHeight: 1.3,
          }}
        >
          {title}
        </h2>

        {/* Description */}
        <p
          style={{
            marginTop: 6,
            fontSize: "12.5px",
            lineHeight: 1.55,
            color: "#7a7a7a",
          }}
        >
          {description}
        </p>
      </div>
  );

  if (!href) {
    return (
      <div className="block h-full" style={{ opacity: 0.55, cursor: "default" }} aria-disabled="true">
        {inner}
      </div>
    );
  }

  return (
    <Link href={href} className="block h-full" style={locked ? { opacity: 0.55 } : undefined}>
      {inner}
    </Link>
  );
}
