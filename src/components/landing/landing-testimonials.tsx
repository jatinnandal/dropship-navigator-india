"use client";

import { motion } from "framer-motion";
import { SUCCESS_STORIES } from "@/lib/success-stories";

const FEATURED = SUCCESS_STORIES.slice(0, 3);

export function LandingTestimonials() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {FEATURED.map((story, i) => (
        <motion.div
          key={story.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5, delay: i * 0.12 }}
          className="glass-panel grain rounded-xl p-5 space-y-4 border-t-2"
          style={{ borderTopColor: story.accentColor }}
        >
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-md flex items-center justify-center text-xs font-bold text-slate-900"
              style={{ backgroundColor: story.accentColor }}
            >
              {story.initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">{story.name}</p>
              <p className="text-xs text-slate-500">
                {story.city} · {story.channel}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <div className="text-center">
              <p className="text-sm font-bold text-slate-200">{story.stats.monthlyRevenue}</p>
              <p className="text-xs text-slate-500">revenue</p>
            </div>
            <div className="text-center">
              <p className="text-sm font-bold text-emerald-400">{story.stats.profitMargin}</p>
              <p className="text-xs text-slate-500">margin</p>
            </div>
          </div>

          <p className="text-sm text-slate-400 leading-relaxed">{story.journey}</p>
        </motion.div>
      ))}
    </div>
  );
}
