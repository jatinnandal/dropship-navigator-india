"use client";

import { useEffect, useRef } from "react";
import type { JourneyNode } from "@/lib/journey-graph";
import type { TaskModuleId } from "@/lib/tasks";

/* ── Node layout on the SVG path ── */

const NODE_SHORT_LABELS: Record<TaskModuleId, string> = {
  "common-documentation": "Docs & GST",
  "product-selection": "Product",
  "compliance-by-product": "Compliance",
  "supplier-sourcing": "Supplier",
  "channel-launch": "Launch",
  "ads-growth": "Ads",
  "tracking-analytics": "Payout & P&L",
};

const NODE_POSITIONS: Record<TaskModuleId, { x: number; y: number }> = {
  "product-selection": { x: 60, y: 230 },
  "supplier-sourcing": { x: 200, y: 80 },
  "common-documentation": { x: 370, y: 240 },
  "compliance-by-product": { x: 520, y: 100 },
  "channel-launch": { x: 660, y: 60 },
  "ads-growth": { x: 770, y: 170 },
  "tracking-analytics": { x: 880, y: 230 },
};

const SUB_LABELS: Record<string, string> = {
  done: "completed",
  in_progress: "you are here",
  available: "open",
  locked: "locked",
};

/* Full SVG curve base path */
const BASE_PATH = "M60 230 C 130 230 130 80 200 80 S 290 240 370 240 S 450 100 520 100 S 590 60 660 60 S 730 170 770 170 S 830 230 880 230";

/* Progress path - travelled curve up to the first in-progress or last done node */
function buildProgressPath(nodes: JourneyNode[]): string | null {
  const doneCount = nodes.filter((n) => n.status === "done").length;
  const inProgressIdx = nodes.findIndex((n) => n.status === "in_progress");
  if (doneCount === 0 && inProgressIdx <= 0) return null;

  // Simple approach: progress path goes to the position of the first in-progress or last done node
  const targetIdx = inProgressIdx >= 0 ? inProgressIdx : doneCount - 1;
  const target = nodes[targetIdx];
  if (!target) return null;
  const pos = NODE_POSITIONS[target.id];
  if (!pos) return null;

  // Build a curve from the first node on the route to the target node position
  const firstId = nodes[0]?.id;
  const startPos = firstId ? NODE_POSITIONS[firstId] : undefined;
  if (!startPos || pos.x <= startPos.x) return null;

  return `M${startPos.x} ${startPos.y} C ${startPos.x + 120} ${startPos.y} ${pos.x - 120} ${pos.y} ${pos.x} ${pos.y}`;
}

type Props = {
  nodes: JourneyNode[];
  selectedId: TaskModuleId | null;
  onSelect: (id: TaskModuleId) => void;
  planLockedSet?: Set<string>;
};

export function JourneyGraphView({ nodes, selectedId, onSelect, planLockedSet = new Set() }: Props) {
  const zoneRef = useRef<HTMLDivElement>(null);
  const planeRef = useRef<HTMLDivElement>(null);

  /* 3D tilt on mousemove */
  useEffect(() => {
    const zone = zoneRef.current;
    const plane = planeRef.current;
    if (!zone || !plane) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    function onMove(e: MouseEvent) {
      const r = zone!.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      plane!.style.transition = "transform 120ms linear";
      plane!.style.transform = `rotateX(${14 - py * 7}deg) rotateZ(${-px * 2.5}deg)`;
    }

    function onLeave() {
      plane!.style.transition = "transform 600ms cubic-bezier(0.22,1,0.36,1)";
      plane!.style.transform = "rotateX(14deg) rotateZ(0deg)";
    }

    zone.addEventListener("mousemove", onMove);
    zone.addEventListener("mouseleave", onLeave);
    return () => {
      zone.removeEventListener("mousemove", onMove);
      zone.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  const progressPath = buildProgressPath(nodes);

  return (
    <div ref={zoneRef} style={{ perspective: "1500px" }}>
      <section
        ref={planeRef}
        className="panel-raised grid-texture"
        style={{
          transform: "rotateX(14deg)",
          transformStyle: "preserve-3d",
          willChange: "transform",
          position: "relative",
          overflow: "visible",
          borderRadius: "22px",
          padding: "28px 26px 16px",
          background: "linear-gradient(165deg, #0b0b0b, #030303)",
          border: "1px solid rgba(255,255,255,0.12)",
          boxShadow: "0 60px 100px -40px rgba(0,0,0,0.98), 0 0 80px -30px rgba(255,255,255,0.1), inset 0 1px 0 rgba(255,255,255,0.1)",
        }}
      >
        {/* Extra ambient glow overlay */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: "22px",
            overflow: "hidden",
          }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: "radial-gradient(ellipse 50% 60% at 30% 30%, rgba(255,255,255,0.05), transparent 60%)",
            }}
          />
        </div>

        <svg viewBox="0 0 920 300" className="relative block w-full">
          {/* Base path */}
          <path
            d={BASE_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="3.5"
          />

          {/* Animated progress path */}
          {progressPath ? (
            <path
              d={progressPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="3.5"
              strokeDasharray="9 8"
              style={{
                animation: "dashFlow 1.9s linear infinite",
                filter: "drop-shadow(0 0 6px rgba(255,255,255,0.6))",
              }}
            />
          ) : null}

          {/* Nodes */}
          {nodes.map((node) => {
            const pos = NODE_POSITIONS[node.id];
            if (!pos) return null;
            const isSel = selectedId === node.id;
            const done = node.status === "done";
            const active = node.status === "in_progress";
            const locked = node.status === "locked" || planLockedSet.has(node.id);
            const r = active ? 15 : done ? 13 : 11;

            const fill = done
              ? "oklch(0.72 0.13 165)"
              : active
                ? "#ffffff"
                : locked
                  ? "rgba(255,255,255,0.05)"
                  : "#0a0a0a";
            const stroke = isSel
              ? "#ffffff"
              : done
                ? "oklch(0.72 0.13 165 / 0.5)"
                : active
                  ? "rgba(255,255,255,0.5)"
                  : locked
                    ? "rgba(255,255,255,0.14)"
                    : "rgba(255,255,255,0.32)";

            const labelAbove = pos.y > 150;
            const labelY = labelAbove ? pos.y - (r + 14) : pos.y + r + 20;
            const subLabelY = labelAbove ? pos.y - (r + 28) : pos.y + r + 35;

            const haloR = isSel ? r + 7 : active ? r + 6 : 0;
            const haloStroke = isSel ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.3)";

            const numColor = active ? "#000000" : "#c9c9c9";
            const labelColor = isSel
              ? "#ffffff"
              : done
                ? "oklch(0.8 0.12 165)"
                : active
                  ? "#ffffff"
                  : locked
                    ? "#3d3d3d"
                    : "#c9c9c9";
            const labelWeight = isSel || active ? "700" : "500";

            const moduleIndex = nodes.findIndex((n) => n.id === node.id);
            const num = moduleIndex + 1;

            return (
              <g
                key={node.id}
                onClick={() => onSelect(node.id)}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") onSelect(node.id);
                }}
                aria-label={`${NODE_SHORT_LABELS[node.id]} - ${SUB_LABELS[node.status]}`}
              >
                {/* Halo */}
                {haloR > 0 ? (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={haloR}
                    fill="none"
                    stroke={haloStroke}
                    strokeWidth="1.5"
                    className={active && !isSel ? "pulse-glow" : ""}
                  />
                ) : null}

                {/* Main circle */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={r}
                  fill={fill}
                  stroke={stroke}
                  strokeWidth="2"
                />

                {/* Done checkmark */}
                {done ? (
                  <path
                    d={`M${pos.x - 6} ${pos.y} L${pos.x - 1.5} ${pos.y + 4.5} L${pos.x + 6.5} ${pos.y - 5}`}
                    fill="none"
                    stroke="#03140d"
                    strokeWidth="2.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="pointer-events-none"
                  />
                ) : null}

                {/* Lock icon text */}
                {locked ? (
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fontSize="12"
                    className="pointer-events-none"
                    fill="#6e6e6e"
                  >
                    &#x1F512;
                  </text>
                ) : null}

                {/* Number */}
                {!done && !locked ? (
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fill={numColor}
                    fontSize="13"
                    fontWeight="700"
                    fontFamily="'IBM Plex Mono', monospace"
                    className="pointer-events-none"
                  >
                    {num}
                  </text>
                ) : null}

                {/* Label */}
                <text
                  x={pos.x}
                  y={labelY}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize="13"
                  fontWeight={labelWeight}
                  fontFamily="'Instrument Sans', sans-serif"
                  className="pointer-events-none"
                >
                  {NODE_SHORT_LABELS[node.id]}
                </text>

                {/* Sub-label */}
                <text
                  x={pos.x}
                  y={subLabelY}
                  textAnchor="middle"
                  fill="#5a5a5a"
                  fontSize="10"
                  fontWeight="500"
                  fontFamily="'IBM Plex Mono', monospace"
                  className="pointer-events-none"
                >
                  {SUB_LABELS[node.status]}
                </text>
              </g>
            );
          })}
        </svg>

        <p
          className="mono-label-sm relative"
          style={{ margin: "4px 4px 6px", color: "#5a5a5a" }}
        >
          Tap a milestone to see its steps &middot; solid line = travelled &middot; one hard lock: ads need a live listing
        </p>
      </section>
    </div>
  );
}

/* ── Mobile timeline ── */

export function JourneyTimelineMobile({ nodes, selectedId, onSelect, planLockedSet = new Set() }: Props) {
  return (
    <ol className="space-y-0 md:hidden">
      {nodes.map((node, index) => {
        const isSelected = selectedId === node.id;
        const isLast = index === nodes.length - 1;
        const isDone = node.status === "done";
        const isActive = node.status === "in_progress";
        const locked = node.status === "locked" || planLockedSet.has(node.id);

        const circleBg = isDone
          ? "oklch(0.72 0.13 165)"
          : isActive
            ? "#ffffff"
            : locked
              ? "rgba(255,255,255,0.05)"
              : "#0a0a0a";
        const circleBorder = isSelected
          ? "#ffffff"
          : isDone
            ? "oklch(0.72 0.13 165 / 0.5)"
            : isActive
              ? "rgba(255,255,255,0.5)"
              : "rgba(255,255,255,0.2)";
        const textColor = isDone
          ? "oklch(0.8 0.12 165)"
          : isActive || isSelected
            ? "#ffffff"
            : locked
              ? "#5a5a5a"
              : "#b8b8b8";

        return (
          <li key={node.id} className="relative flex gap-4 pb-6">
            {!isLast ? (
              <span
                className="absolute left-[15px] top-8 h-[calc(100%-16px)] w-px"
                style={{
                  backgroundColor: isDone
                    ? "oklch(0.72 0.13 165 / 0.4)"
                    : "rgba(255,255,255,0.1)",
                }}
                aria-hidden="true"
              />
            ) : null}
            <button
              type="button"
              onClick={() => onSelect(node.id)}
              className="relative z-10 flex h-8 w-8 flex-none items-center justify-center rounded-full border-2 text-xs font-bold font-mono"
              style={{
                borderColor: circleBorder,
                backgroundColor: circleBg,
                color: isDone ? "#03140d" : isActive ? "#000" : "#b8b8b8",
              }}
            >
              {isDone ? (
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M3 7 L6 10 L11 4" stroke="#03140d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                index + 1
              )}
            </button>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="text-sm font-semibold" style={{ color: textColor }}>
                {node.title}
              </p>
              <p className="mono-label-sm mt-0.5">
                {SUB_LABELS[node.status]} &middot; {node.progressPercent}%
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
