"use client";

import { useState, useMemo } from "react";
import {
  Calendar,
  ChevronRight,
  Clock,
  TrendingUp,
  Filter,
  AlertTriangle,
} from "lucide-react";
import {
  getUpcomingEvents,
  getEventsForMonth,
  SALE_EVENTS,
  type SaleEvent,
} from "@/lib/seasonal-calendar-data";

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const MONTH_FULL_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const CATEGORY_STYLES: Record<SaleEvent["category"], { bg: string; text: string; border: string; label: string }> = {
  mega: { bg: "bg-amber-400/10", text: "text-amber-400", border: "border-amber-400/30", label: "Mega" },
  major: { bg: "bg-cyan-400/10", text: "text-cyan-400", border: "border-cyan-400/30", label: "Major" },
  moderate: { bg: "bg-emerald-400/10", text: "text-emerald-400", border: "border-emerald-400/30", label: "Moderate" },
  niche: { bg: "bg-slate-400/10", text: "text-slate-400", border: "border-slate-600/30", label: "Niche" },
};

const PLATFORM_BADGES: Record<string, string> = {
  amazon: "bg-orange-400/10 text-orange-400 border-orange-400/20",
  flipkart: "bg-blue-400/10 text-blue-400 border-blue-400/20",
  meesho: "bg-pink-400/10 text-pink-400 border-pink-400/20",
  all: "bg-slate-400/10 text-slate-300 border-slate-600/20",
};

export function SeasonalCalendar() {
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [platformFilter, setPlatformFilter] = useState<string>("all");

  const today = useMemo(() => new Date(), []);
  const upcoming = useMemo(() => getUpcomingEvents(today, 5), [today]);

  const filteredByMonth = useMemo(() => {
    const months: { month: number; events: SaleEvent[] }[] = [];
    for (let m = 0; m < 12; m++) {
      let events = getEventsForMonth(m);
      if (platformFilter !== "all") {
        events = events.filter(
          (e) => e.platforms.includes(platformFilter as "amazon" | "flipkart" | "meesho") || e.platforms.includes("all")
        );
      }
      if (events.length > 0) {
        months.push({ month: m, events });
      }
    }
    return months;
  }, [platformFilter]);

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <section className="space-y-3">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-400" />
          <h2 className="text-sm font-semibold text-slate-100">Upcoming Sales</h2>
        </div>

        <div className="space-y-2">
          {upcoming.map((event) => {
            const style = CATEGORY_STYLES[event.category];
            return (
              <div
                key={event.id + "-upcoming"}
                className={`rounded-lg border ${style.border} ${style.bg} p-3`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className={`text-xs font-bold ${style.text}`}>
                      {event.daysUntil === 0 ? "TODAY" : `${event.daysUntil}d`}
                    </span>
                    <span className="text-sm font-medium text-slate-100">{event.name}</span>
                    {event.inPrepWindow && (
                      <span className="flex items-center gap-1 rounded border border-amber-400/30 bg-amber-400/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
                        <AlertTriangle className="h-2.5 w-2.5" />
                        Prep now
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${style.border} ${style.text}`}>
                      {style.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {MONTH_NAMES[event.startMonth]} {event.startDay}
                    </span>
                  </div>
                </div>
                {event.inPrepWindow && (
                  <p className="mt-2 text-xs text-amber-300/80">
                    Start preparing — {event.prepWeeks} weeks recommended lead time
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Platform Filter */}
      <div className="flex items-center gap-2">
        <Filter className="h-3.5 w-3.5 text-slate-500" />
        <div className="flex gap-1.5">
          {["all", "amazon", "flipkart", "meesho"].map((p) => (
            <button
              key={p}
              onClick={() => setPlatformFilter(p)}
              className={`rounded-md border px-2.5 py-1 text-[11px] font-medium transition-colors ${
                platformFilter === p
                  ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                  : "border-slate-700/50 bg-slate-800/30 text-slate-400 hover:text-slate-200"
              }`}
            >
              {p === "all" ? "All Platforms" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Monthly Timeline */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-semibold text-slate-100">12-Month Calendar</h2>
        </div>

        <div className="space-y-3">
          {filteredByMonth.map(({ month, events }) => (
            <div key={month} className="rounded-lg border border-slate-700/40 bg-slate-900/40 p-3">
              <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {MONTH_FULL_NAMES[month]}
              </h3>
              <div className="flex flex-wrap gap-1.5">
                {events.map((event) => {
                  const style = CATEGORY_STYLES[event.category];
                  const isExpanded = expandedEvent === event.id;
                  return (
                    <div key={event.id} className="w-full">
                      <button
                        onClick={() => setExpandedEvent(isExpanded ? null : event.id)}
                        className={`flex w-full items-center justify-between rounded-md border px-2.5 py-1.5 text-left transition-colors ${style.border} ${style.bg} hover:brightness-110`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${style.text}`}>{event.name}</span>
                          <span className="text-[10px] text-slate-500">
                            {event.startDay} {MONTH_NAMES[month]} · {event.durationDays}d
                          </span>
                        </div>
                        <ChevronRight
                          className={`h-3.5 w-3.5 text-slate-500 transition-transform ${isExpanded ? "rotate-90" : ""}`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="mt-2 space-y-3 rounded-md border border-slate-700/30 bg-slate-800/40 p-3">
                          {/* Platforms */}
                          <div className="flex items-center gap-1.5">
                            {event.platforms.map((p) => (
                              <span
                                key={p}
                                className={`rounded border px-1.5 py-0.5 text-[10px] font-medium ${PLATFORM_BADGES[p]}`}
                              >
                                {p === "all" ? "All Platforms" : p.charAt(0).toUpperCase() + p.slice(1)}
                              </span>
                            ))}
                          </div>

                          {/* Prep timeline */}
                          <div className="flex items-center gap-2">
                            <Clock className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs text-slate-300">
                              {event.prepWeeks} weeks prep time · {event.durationDays} day event
                            </span>
                          </div>

                          {/* Ad budget */}
                          <div className="flex items-center gap-2">
                            <TrendingUp className="h-3.5 w-3.5 text-slate-500" />
                            <span className="text-xs text-slate-300">
                              Ad budget: <span className={`font-semibold ${style.text}`}>{event.adBudgetMultiplier}x</span> normal
                            </span>
                          </div>

                          {/* Tips */}
                          <div className="space-y-1">
                            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-500">
                              Prep Tips
                            </p>
                            <ul className="space-y-1">
                              {event.tips.map((tip, i) => (
                                <li key={i} className="flex items-start gap-1.5 text-xs text-slate-300">
                                  <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
