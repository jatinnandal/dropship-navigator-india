"use client";

import { motion, useReducedMotion, type HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";

type RevealDirection = "up" | "left" | "right";

type RevealProps = HTMLMotionProps<"div"> & {
  children: ReactNode;
  delay?: number;
  /** Legacy vertical offset when from="up" */
  y?: number;
  /** Horizontal offset magnitude when from="left" or "right" */
  x?: number;
  from?: RevealDirection;
  once?: boolean;
};

function getInitial(
  reduced: boolean | null,
  from: RevealDirection,
  y: number,
  x: number,
): { opacity: number; x?: number; y?: number } | false {
  if (reduced) {
    return { opacity: 0 };
  }

  if (from === "left") {
    return { opacity: 0, x: -x };
  }
  if (from === "right") {
    return { opacity: 0, x };
  }
  return { opacity: 0, y };
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  x = 48,
  from = "up",
  once = true,
  className,
  ...rest
}: RevealProps) {
  const reduced = useReducedMotion();
  const initial = getInitial(reduced, from, y, x);

  return (
    <motion.div
      initial={initial}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once, margin: "-60px" }}
      transition={{
        duration: reduced ? 0.35 : 0.5,
        delay: reduced ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}
