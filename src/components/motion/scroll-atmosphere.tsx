"use client";

import { motion, useScroll, useTransform } from "framer-motion";

export function ScrollAtmosphere() {
  const { scrollYProgress } = useScroll();
  const gridOpacity = useTransform(scrollYProgress, [0, 0.5, 1], [0.14, 0.09, 0.05]);

  return (
    <div className="scroll-atmosphere pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 app-shell-bg" />
      <motion.div className="scroll-atmosphere-grid absolute inset-0" style={{ opacity: gridOpacity }} />
    </div>
  );
}
