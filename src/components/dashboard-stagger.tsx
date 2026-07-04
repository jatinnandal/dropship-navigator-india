"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

const container = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export function StaggerGrid({ children, className }: { children: ReactNode; className?: string }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={container}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children }: { children: ReactNode }) {
  const reduced = useReducedMotion();

  if (reduced) {
    return <>{children}</>;
  }

  return <motion.div variants={item}>{children}</motion.div>;
}
