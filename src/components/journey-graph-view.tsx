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
    return { fill: "#ffffff", stroke: "#ffffff", labelFill: "#0a0a0a", strokeWidth: 2.5, opacity: 1 };
  }
  switch (status) {
    case "done":
      return { fill: "#0a0a0a", stroke: "#ffffff", labelFill: "#fafafa", strokeWidth: 2, opacity: 1 };
    case "in_progress":
      return { fill: "#171717", stroke: "#ffffff", labelFill: "#fafafa", strokeWidth: 2, opacity: 1 };
    case "available":
      return { fill: "#0a0a0a", stroke: "#d4d4d4", labelFill: "#e5e5e5", strokeWidth: 2, opacity: 1 };
    default:
      return { fill: "#0a0a0a", stroke: "#525252", labelFill: "#737373", strokeWidth: 1.5, opacity: 0.55 };
  }
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
        const touchesSelection = selectedId === edge.from || selectedId === edge.to;
        const stroke =
          edge.kind === "prerequisite"
            ? touchesSelection
              ? "#ffffff"
              : "#a3a3a3"
            : edge.kind === "loop"
              ? "#737373"
              : touchesSelection
                ? "#d4d4d4"
                : "#404040";
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

      {nodes.map((node, index) => {
        const pos = NODE_POSITIONS[node.id];
        if (!pos) return null;
        const isSelected = selectedId === node.id;
        const colors = nodeColors(node.status, isSelected);
        const warningCount = node.softWarnings.length;

        return (
          <g key={node.id} transform={`translate(${pos.x - 24}, ${pos.y - 24})`} opacity={colors.opacity}>
            <motion.g
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
              {warningCount > 0 && node.status !== "done" ? (
                <circle cx={40} cy={8} r={8} fill="#ffffff" stroke="#0a0a0a" strokeWidth={1} />
              ) : null}
              {warningCount > 0 && node.status !== "done" ? (
                <text x={40} y={11} textAnchor="middle" fill="#0a0a0a" fontSize={9} fontWeight="bold">
                  {warningCount}
                </text>
              ) : null}
              <title>{node.title}</title>
              <text
                x={24}
                y={58}
                textAnchor="middle"
                fill={isSelected ? "#ffffff" : "#a3a3a3"}
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

      <text x={8} y={230} fill="#737373" fontSize={9}>
        Solid white = hard lock · Dashed = recommended · Loop = revisit product
      </text>
    </svg>
  );
}

export function JourneyTimelineMobile({ nodes, selectedId, onSelect }: Props) {
  const reduced = useReducedMotion();

  return (
    <ol className="space-y-0 md:hidden">
      {nodes.map((node, index) => {
        const isSelected = selectedId === node.id;
        const isLast = index === nodes.length - 1;
        const colors = nodeColors(node.status, isSelected);

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
              <span className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px bg-neutral-700" aria-hidden="true" />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold ${
                isSelected ? "border-white bg-white text-black" : "border-neutral-500 bg-neutral-950 text-neutral-200"
              }`}
              style={
                !isSelected
                  ? { borderColor: colors.stroke, color: colors.labelFill }
                  : undefined
              }
            >
              {index + 1}
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className={`text-sm font-semibold ${isSelected ? "text-white" : "text-neutral-200"}`}>
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
