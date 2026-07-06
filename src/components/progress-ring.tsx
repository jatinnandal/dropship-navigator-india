"use client";

import { motion, useReducedMotion } from "framer-motion";
import CountUp from "@/components/CountUp";

type Props = {
  completed: number;
  total: number;
  size?: number;
};

export function ProgressRing({ completed, total, size = 116 }: Props) {
  const reduced = useReducedMotion();
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = total > 0 ? completed / total : 0;
  const targetOffset = circumference * (1 - pct);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{
        width: size,
        height: size,
        filter: pct > 0 ? `drop-shadow(0 0 ${Math.round(20 * pct)}px rgba(255,255,255,${0.15 + pct * 0.25}))` : undefined,
      }}
    >
      <svg width={size} height={size} className="-rotate-90" aria-hidden="true">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#ffffff"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: reduced ? targetOffset : circumference }}
          animate={{ strokeDashoffset: targetOffset }}
          transition={{ duration: reduced ? 0 : 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      <div className="absolute text-center">
        <p className="font-mono text-[21px] font-medium text-white">
          <CountUp to={completed} duration={0.9} />
          <span className="text-[var(--text-faintest)]">/{total}</span>
        </p>
        <p className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-[var(--text-faintest)]">steps</p>
      </div>
      <span className="sr-only">
        {completed} of {total} steps complete
      </span>
    </div>
  );
}
