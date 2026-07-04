"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";

type Props = {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  badge?: string;
};

export function ToolCard({ href, title, description, icon: Icon, accent, badge }: Props) {
  const reduced = useReducedMotion();

  return (
    <Link href={href} className="block h-full">
      <motion.div
        whileHover={reduced ? undefined : { y: -3 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
        className="glass-panel grain group rounded-xl border p-5 transition-colors hover:border-amber-500/30 h-full"
      >
        <div className={`inline-flex rounded-lg border p-2.5 ${accent}`}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="mt-3 flex items-center gap-2">
          <h2 className="font-display text-base font-semibold text-slate-100 group-hover:text-amber-300 transition-colors">
            {title}
          </h2>
          {badge && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 text-[10px] font-semibold text-amber-400">
              {badge}
            </span>
          )}
        </div>
        <p className="text-muted mt-1 text-sm leading-relaxed">{description}</p>
      </motion.div>
    </Link>
  );
}
