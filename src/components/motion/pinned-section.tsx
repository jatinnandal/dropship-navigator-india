"use client";

import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "framer-motion";
import { useRef, useState, type ReactNode } from "react";

type PinnedSectionProps = {
  children: (progress: number) => ReactNode;
  className?: string;
  /** Total scroll height of the pin zone (e.g. 220vh) */
  pinHeight?: string;
};

export function PinnedSection({
  children,
  className = "",
  pinHeight = "220vh",
}: PinnedSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const [progress, setProgress] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    setProgress(value);
  });

  const displayProgress = reduced ? 0 : progress;

  return (
    <div ref={containerRef} style={{ height: pinHeight }} className={className}>
      <div className="sticky top-0 flex min-h-[85vh] items-center py-8 md:min-h-screen">
        <motion.div
          className="w-full"
          initial={false}
          animate={{ opacity: 1 }}
          transition={{ duration: reduced ? 0 : 0.3 }}
        >
          {children(displayProgress)}
        </motion.div>
      </div>
    </div>
  );
}
