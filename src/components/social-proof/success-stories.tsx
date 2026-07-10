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
    <div className="panel rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-3">
        <div
          className="h-10 w-10 rounded-md flex items-center justify-center text-sm font-bold text-black"
          style={{ background: "linear-gradient(135deg, #ffffff, #d6d6d6)" }}
        >
          {story.initials}
        </div>
        <div>
          <p className="text-sm font-semibold text-white">{story.name}</p>
          <p className="text-xs text-[var(--text-faint)]">{story.city} · {story.monthsActive} months</p>
        </div>
        <span className="ml-auto rounded-md bg-white/[0.06] border border-white/[0.12] px-2 py-0.5 text-xs text-[var(--muted)] capitalize">
          {story.channel}
        </span>
      </div>

      <p className="font-mono inline-block rounded border border-white/[0.12] bg-white/[0.03] px-2 py-0.5 text-[10px] uppercase tracking-[0.12em] text-[var(--text-faint)]">
        Illustrative scenario
      </p>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-md bg-white/[0.03] p-2 text-center">
          <p className="text-xs text-[var(--text-faint)]">Revenue</p>
          <p className="text-sm font-semibold text-white">{story.stats.monthlyRevenue}</p>
        </div>
        <div className="rounded-md bg-white/[0.03] p-2 text-center">
          <p className="text-xs text-[var(--text-faint)]">Margin</p>
          <p className="text-sm font-semibold text-emerald-400">{story.stats.profitMargin}</p>
        </div>
        <div className="rounded-md bg-white/[0.03] p-2 text-center">
          <p className="text-xs text-[var(--text-faint)]">Orders/day</p>
          <p className="text-sm font-semibold text-white">{story.stats.ordersPerDay}</p>
        </div>
      </div>

      <p className="text-sm text-[var(--muted)] leading-relaxed">{story.journey}</p>

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
                : "bg-white/[0.05] text-[var(--muted)] border border-white/[0.12] hover:text-white"
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
