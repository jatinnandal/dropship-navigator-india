"use client";

import type { JourneyNode } from "@/lib/journey-graph";
import { JOURNEY_EDGES, type JourneyEdgeKind } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";

const NODE_POSITIONS: Record<TaskModuleId, { x: number; y: number }> = {
  "common-documentation": { x: 80, y: 40 },
  "product-selection": { x: 240, y: 40 },
  "compliance-by-product": { x: 400, y: 40 },
  "supplier-sourcing": { x: 240, y: 140 },
  "channel-launch": { x: 400, y: 140 },
  "ads-growth": { x: 560, y: 100 },
  "tracking-analytics": { x: 560, y: 180 },
};

const STATUS_FILL: Record<JourneyNode["status"], string> = {
  locked: "#475569",
  available: "#0891b2",
  in_progress: "#d97706",
  done: "#059669",
};

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
        const stroke =
          edge.kind === "prerequisite" ? "#f43f5e" : edge.kind === "loop" ? "#a78bfa" : "#64748b";
        const dash = edge.kind === "recommended" ? "6 4" : edge.kind === "loop" ? "4 3" : undefined;
        return (
          <path
            key={`${edge.from}-${edge.to}-${i}`}
            d={d}
            fill="none"
            stroke={stroke}
            strokeWidth={edge.kind === "prerequisite" ? 2 : 1.5}
            strokeDasharray={dash}
            opacity={0.7}
          />
        );
      })}

      {nodes.map((node) => {
        const pos = NODE_POSITIONS[node.id];
        if (!pos) return null;
        const isSelected = selectedId === node.id;
        const warningCount = node.softWarnings.length;

        return (
          <g key={node.id} transform={`translate(${pos.x - 24}, ${pos.y - 24})`}>
            <circle
              r={24}
              cx={24}
              cy={24}
              fill={STATUS_FILL[node.status]}
              stroke={isSelected ? "#fcd34d" : "#1e293b"}
              strokeWidth={isSelected ? 3 : 2}
              className="cursor-pointer"
              onClick={() => onSelect(node.id)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onSelect(node.id);
              }}
            />
            {warningCount > 0 && node.status !== "done" ? (
              <circle cx={40} cy={8} r={8} fill="#d97706" />
            ) : null}
            {warningCount > 0 && node.status !== "done" ? (
              <text x={40} y={11} textAnchor="middle" fill="#0f172a" fontSize={9} fontWeight="bold">
                {warningCount}
              </text>
            ) : null}
            <text
              x={24}
              y={58}
              textAnchor="middle"
              fill="#e2e8f0"
              fontSize={10}
              className="pointer-events-none select-none"
            >
              {node.title.split(" ")[0]}
            </text>
          </g>
        );
      })}

      <text x={8} y={230} fill="#94a3b8" fontSize={9}>
        Solid red = hard lock · Dashed = recommended path · Loop = revisit product
      </text>
    </svg>
  );
}

export function JourneyTimelineMobile({
  nodes,
  selectedId,
  onSelect,
}: Props) {
  return (
    <ol className="space-y-0 md:hidden">
      {nodes.map((node, index) => {
        const isSelected = selectedId === node.id;
        const isLast = index === nodes.length - 1;
        return (
          <li key={node.id} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-0.5 bg-slate-700"
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className={`relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold ${
                node.status === "done"
                  ? "border-emerald-400 bg-emerald-400/20 text-emerald-200"
                  : node.status === "locked"
                    ? "border-slate-600 bg-slate-800 text-slate-400"
                    : node.status === "in_progress"
                      ? "border-amber-400 bg-amber-400/20 text-amber-200"
                      : "border-cyan-400 bg-cyan-400/20 text-cyan-200"
              } ${isSelected ? "ring-2 ring-amber-300" : ""}`}
            >
              {index + 1}
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold text-slate-100">{node.title}</p>
              <p className="text-muted text-xs capitalize">{node.status.replace("_", " ")} · {node.progressPercent}%</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
