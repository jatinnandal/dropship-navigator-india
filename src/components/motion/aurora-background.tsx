"use client";

import { motion, useReducedMotion } from "framer-motion";

type AuroraBackgroundProps = {
  className?: string;
  colorStops?: string[];
};

export function AuroraBackground({
  className = "",
  colorStops = ["#0ea5e9", "#f59e0b", "#10b981"],
}: AuroraBackgroundProps) {
  const reduced = useReducedMotion();

  const gradientBg = `linear-gradient(135deg, ${colorStops[0]}18 0%, ${colorStops[1]}18 50%, ${colorStops[2]}18 100%)`;

  if (reduced) {
    return (
      <div
        aria-hidden
        className={`ambient-hero-bg ${className}`}
        style={{ background: gradientBg }}
      />
    );
  }

  return (
    <div aria-hidden className={`ambient-hero-bg overflow-hidden ${className}`}>
      <motion.div
        className="absolute inset-0 opacity-70"
        style={{ background: gradientBg }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Infinity,
        }}
      />
    </div>
  );
}
