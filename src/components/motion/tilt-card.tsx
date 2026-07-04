"use client";

import { motion, useMotionValue, useReducedMotion, useSpring, useTransform } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

type TiltCardProps = {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
};

export function TiltCard({ children, className = "", maxTilt = 4 }: TiltCardProps) {
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [maxTilt, -maxTilt]), {
    stiffness: 260,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-maxTilt, maxTilt]), {
    stiffness: 260,
    damping: 22,
  });

  function handleMove(event: MouseEvent<HTMLDivElement>) {
    if (reduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left) / rect.width - 0.5);
    y.set((event.clientY - rect.top) / rect.height - 0.5);
  }

  function handleLeave() {
    x.set(0);
    y.set(0);
  }

  function handleSpotlight(event: MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spotlight-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spotlight-y", `${event.clientY - rect.top}px`);
  }

  return (
    <motion.div
      className={`spotlight-card ${className}`.trim()}
      style={reduced ? undefined : { rotateX, rotateY, transformPerspective: 900 }}
      onMouseMove={(event) => {
        handleMove(event);
        handleSpotlight(event);
      }}
      onMouseLeave={handleLeave}
    >
      {children}
    </motion.div>
  );
}
