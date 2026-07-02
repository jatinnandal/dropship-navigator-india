"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { useRef, type ReactNode } from "react";

type ParallaxProps = {
  children: ReactNode;
  /** Negative = slower than scroll, positive = faster */
  speed?: number;
  className?: string;
  /** Disable scale transform (better for text) */
  noScale?: boolean;
};

const PARALLAX_RANGE = 120;

export function Parallax({ children, speed = 0.2, className = "", noScale = false }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [speed * -PARALLAX_RANGE, speed * PARALLAX_RANGE],
  );
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.94, 1, 0.96]);

  if (reduced) {
    return (
      <div ref={ref} className={className}>
        {children}
      </div>
    );
  }

  return (
    <motion.div ref={ref} style={{ y, scale: noScale ? 1 : scale }} className={className}>
      {children}
    </motion.div>
  );
}
