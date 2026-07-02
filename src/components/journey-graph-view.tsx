"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { JourneyNode } from "@/lib/journey-graph";
import { JOURNEY_EDGES, type JourneyEdgeKind } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";

const NODE_SHORT_LABELS: Record<TaskModuleId, string> = {
  "common-documentation": "Docs",
  "product-selection": "Product",
  "compliance-by-product": "Compliance",
  "supplier-sourcing": "Supplier",
  "channel-launch": "Launch",
  "ads-growth": "Ads",
  "tracking-analytics": "Analytics",
};

const NODE_POSITIONS: Record<TaskModuleId, { x: number; y: number }> = {
  "common-documentation": { x: 80, y: 40 },
  "product-selection": { x: 240, y: 40 },
  "compliance-by-product": { x: 400, y: 40 },
  "supplier-sourcing": { x: 240, y: 140 },
  "channel-launch": { x: 400, y: 140 },
  "ads-growth": { x: 560, y: 100 },
  "tracking-analytics": { x: 560, y: 180 },
};

function graphShortLabel(node: JourneyNode): string {
  if (node.id === "channel-launch" && node.title.startsWith("Launch on ")) {
    return node.title.replace("Launch on ", "");
  }
  if (node.id === "common-documentation" && node.title.startsWith("Validate")) {
    return "Validate";
  }
  return NODE_SHORT_LABELS[node.id];
}

function nodeColors(status: JourneyNode["status"], isSelected: boolean) {
  if (isSelected) {
    return { fill: "rgba(245,158,11,0.25)", stroke: "#fbbf24", labelFill: "#fbbf24", strokeWidth: 2.5, opacity: 1, cssClass: "" };
  }
  switch (status) {
    case "done":
      return { fill: "rgba(52,211,153,0.15)", stroke: "#34d399", labelFill: "#6ee7b7", strokeWidth: 2, opacity: 1, cssClass: "" };
    case "in_progress":
      return { fill: "rgba(245,158,11,0.15)", stroke: "#f59e0b", labelFill: "#fbbf24", strokeWidth: 2, opacity: 1, cssClass: "pulse-active-node" };
    case "available":
      return { fill: "#0c1829", stroke: "#94a3b8", labelFill: "#e2e8f0", strokeWidth: 2, opacity: 1, cssClass: "pulse-available-node" };
    default:
      return { fill: "#1e293b", stroke: "#334155", labelFill: "#64748b", strokeWidth: 1.5, opacity: 0.5, cssClass: "" };
  }
}

function edgeColor(fromStatus: JourneyNode["status"], toStatus: JourneyNode["status"]): string {
  if (fromStatus === "done" && toStatus === "done") return "#34d399";
  if (fromStatus === "done" && (toStatus === "in_progress" || toStatus === "available")) return "#f59e0b";
  if (fromStatus === "in_progress") return "rgba(245,158,11,0.5)";
  return "#334155";
}

type Props = {
  nodes: JourneyNode[];
  selectedId: TaskModuleId | null;
  onSelect: (id: TaskModuleId) => void;
};

function edgePath(from: { x: number; y: number }, to: { x: number; y: number }, kind: JourneyEdgeKind): string {
  if (kind === "loop" && from.x === to.x && from.y === to.y) {
    return `M ${from.x + 28} ${from.y} a 28 28 0 1 1 -56 0`;
  }
  const mx = (from.x + to.x) / 2;
  const my = (from.y + to.y) / 2;
  return `M ${from.x} ${from.y} Q ${mx} ${my - 20} ${to.x} ${to.y}`;
}

export function JourneyGraphView({ nodes, selectedId, onSelect }: Props) {
  const reduced = useReducedMotion();

  return (
    <svg
      viewBox="0 0 640 240"
      className="hidden w-full md:block"
      role="img"
      aria-label="Launch plan dependency graph"
    >
      {JOURNEY_EDGES.map((edge, i) => {
        const from = NODE_POSITIONS[edge.from];
        const to = NODE_POSITIONS[edge.to];
        if (!from || !to) return null;
        const d = edgePath(from, to, edge.kind);
        const fromNode = nodes.find((n) => n.id === edge.from);
        const toNode = nodes.find((n) => n.id === edge.to);
        const fromStatus = fromNode?.status ?? "locked";
        const toStatus = toNode?.status ?? "locked";
        const stroke = edge.kind === "loop" ? "#334155" : edgeColor(fromStatus, toStatus);
        const dash = edge.kind === "recommended" ? "6 4" : edge.kind === "loop" ? "4 3" : undefined;
        return (
          <motion.path
            key={`${edge.from}-${edge.to}-${i}`}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={edge.kind === "prerequisite" ? 2 : 1.5}
            strokeDasharray={dash}
            initial={reduced ? false : { opacity: 0 }}
            animate={{ opacity: edge.kind === "prerequisite" ? 0.9 : 0.55 }}
            transition={{ duration: reduced ? 0 : 0.4, delay: reduced ? 0 : i * 0.03 }}
          />
        );
      })}

      <style>{`
        .pulse-available-node { animation: pulse-available 2.5s ease-in-out infinite; }
        .pulse-active-node { animation: pulse-active 2s ease-in-out infinite; }
        @keyframes pulse-available { 0%,100% { filter: drop-shadow(0 0 0px rgba(148,163,184,0)); } 50% { filter: drop-shadow(0 0 6px rgba(148,163,184,0.4)); } }
        @keyframes pulse-active { 0%,100% { filter: drop-shadow(0 0 4px rgba(245,158,11,0.2)); } 50% { filter: drop-shadow(0 0 12px rgba(245,158,11,0.5)); } }
        @media (prefers-reduced-motion: reduce) { .pulse-available-node, .pulse-active-node { animation: none; } }
      `}</style>
      {nodes.map((node, index) => {
        const pos = NODE_POSITIONS[node.id];
        if (!pos) return null;
        const isSelected = selectedId === node.id;
        const colors = nodeColors(node.status, isSelected);
        const warningCount = node.softWarnings.length;
        const isDone = node.status === "done";

        return (
          <g key={node.id} transform={`translate(${pos.x - 24}, ${pos.y - 24})`} opacity={colors.opacity}>
            <motion.g
              className={colors.cssClass}
              initial={reduced ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: reduced ? 0 : 0.35, delay: reduced ? 0 : 0.1 + index * 0.04 }}
            >
              <circle
                r={24}
                cx={24}
                cy={24}
                fill={colors.fill}
                stroke={colors.stroke}
                strokeWidth={colors.strokeWidth}
                className="cursor-pointer transition-[stroke,fill] duration-200"
                onClick={() => onSelect(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(node.id);
                }}
              />
              {isDone ? (
                <path
                  d="M17 24 L22 29 L31 19"
                  fill="none"
                  stroke="#34d399"
                  strokeWidth={2.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="pointer-events-none"
                />
              ) : (
                <text
                  x={24}
                  y={28}
                  textAnchor="middle"
                  fill={colors.labelFill}
                  fontSize={11}
                  fontWeight="600"
                  className="pointer-events-none select-none"
                >
                  {index + 1}
                </text>
              )}
              {warningCount > 0 && !isDone ? (
                <circle cx={40} cy={8} r={8} fill="#f59e0b" stroke="#0c1829" strokeWidth={1} />
              ) : null}
              {warningCount > 0 && !isDone ? (
                <text x={40} y={11} textAnchor="middle" fill="#0c1829" fontSize={9} fontWeight="bold">
                  {warningCount}
                </text>
              ) : null}
              <title>{node.title}</title>
              <text
                x={24}
                y={58}
                textAnchor="middle"
                fill={isDone ? "#6ee7b7" : isSelected ? "#fbbf24" : colors.labelFill}
                fontSize={9}
                fontWeight={isSelected ? "600" : "400"}
                className="pointer-events-none select-none"
              >
                {graphShortLabel(node)}
              </text>
            </motion.g>
          </g>
        );
      })}

      <text x={8} y={230} fill="#64748b" fontSize={9}>
        Emerald = done · Amber = active · Gray = locked · Dashed = recommended
      </text>
    </svg>
  );
}

export function JourneyTimelineMobile({ nodes, selectedId, onSelect }: Props) {
  const reduced = useReducedMotion();

  function mobileNodeStyle(status: JourneyNode["status"], isSelected: boolean) {
    if (isSelected) return { borderColor: "#fbbf24", bg: "rgba(245,158,11,0.2)", color: "#fbbf24" };
    switch (status) {
      case "done": return { borderColor: "#34d399", bg: "rgba(52,211,153,0.15)", color: "#6ee7b7" };
      case "in_progress": return { borderColor: "#f59e0b", bg: "rgba(245,158,11,0.12)", color: "#fbbf24" };
      case "available": return { borderColor: "#94a3b8", bg: "#0c1829", color: "#e2e8f0" };
      default: return { borderColor: "#334155", bg: "#1e293b", color: "#64748b" };
    }
  }

  function lineColor(status: JourneyNode["status"]) {
    switch (status) {
      case "done": return "#34d399";
      case "in_progress": return "#f59e0b";
      default: return "#334155";
    }
  }

  return (
    <ol className="space-y-0 md:hidden">
      {nodes.map((node, index) => {
        const isSelected = selectedId === node.id;
        const isLast = index === nodes.length - 1;
        const colors = nodeColors(node.status, isSelected);
        const style = mobileNodeStyle(node.status, isSelected);
        const isDone = node.status === "done";

        return (
          <motion.li
            key={node.id}
            className="relative flex gap-4 pb-6"
            style={{ opacity: colors.opacity }}
            initial={reduced ? false : { opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: reduced ? 0 : 0.3, delay: reduced ? 0 : index * 0.04 }}
          >
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px"
                style={{ backgroundColor: lineColor(node.status) }}
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold"
              style={{ borderColor: style.borderColor, backgroundColor: style.bg, color: style.color }}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7 L6 10 L11 4" stroke="#34d399" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`text-sm font-semibold ${isDone ? "text-emerald-300" : isSelected ? "text-amber-300" : "text-neutral-200"}`}>
                {node.title}
              </p>
              <p className="text-muted text-xs capitalize">
                {node.status.replace("_", " ")} · {node.progressPercent}%
              </p>
            </div>
          </motion.li>
        );
      })}
    </ol>
  );
}
