"use client";

import { useState, useMemo } from "react";
import { SUCCESS_STORIES, type SuccessStory } from "@/lib/success-stories";
import type { PrimaryChannel } from "@/lib/mvp-data";

const CHANNEL_FILTERS: { id: PrimaryChannel | "all"; label: string }[] = [
  { id: "all", label: "All" },
  { id: "meesho", label: "Meesho" },
  { id: "amazon", label: "Amazon" },
  { id: "flipkart", label: "Flipkart" },
  { id: "shopify", label: "Shopify" },
];

function StoryCard({ story }: { story: SuccessStory }) {
  return (
    <div className="glass-panel grain rounded-xl p-5 space-y-4 border-l-2" style={{ borderLeftColor: story.accentColor }}>
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-md flex items-center justify-center text-sm font-bold text-slate-900"
          style={{ backgroundColor: story.accentColor }}
        >
          {story.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-200">{story.name}</p>
          <p className="text-xs text-slate-500">{story.city} · {story.monthsActive} months</p>
        </div>
        <span className="ml-auto rounded-md bg-slate-800 border border-slate-700 px-2 py-0.5 text-xs text-slate-400 capitalize">
          {story.channel}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-slate-900/60 p-2 text-center">
          <p className="text-xs text-slate-500">Revenue</p>
          <p className="text-sm font-semibold text-slate-200">{story.stats.monthlyRevenue}</p>
        </div>
        <div className="rounded-md bg-slate-900/60 p-2 text-center">
          <p className="text-xs text-slate-500">Margin</p>
          <p className="text-sm font-semibold text-emerald-400">{story.stats.profitMargin}</p>
        </div>
        <div className="rounded-md bg-slate-900/60 p-2 text-center">
          <p className="text-xs text-slate-500">Orders/day</p>
          <p className="text-sm font-semibold text-slate-200">{story.stats.ordersPerDay}</p>
        </div>
      </div>

      <p className="text-sm text-slate-400 leading-relaxed">{story.journey}</p>

      <p className="text-xs text-cyan-400 leading-relaxed">
        <span className="font-semibold">Tip:</span> {story.tip}
      </p>
    </div>
  );
}

export function SuccessStoriesGrid() {
  const [channelFilter, setChannelFilter] = useState<PrimaryChannel | "all">("all");

  const filtered = useMemo(() => {
    if (channelFilter === "all") return SUCCESS_STORIES;
    return SUCCESS_STORIES.filter((s) => s.channel === channelFilter);
  }, [channelFilter]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {CHANNEL_FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setChannelFilter(f.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              channelFilter === f.id
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
        {filtered.map((story) => (
          <StoryCard key={story.id} story={story} />
        ))}
      </div>
    </div>
  );
}
