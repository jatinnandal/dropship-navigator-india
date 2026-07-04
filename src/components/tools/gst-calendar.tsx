"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Calendar,
  AlertTriangle,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  getGstEventsForMonth,
  getUpcomingGstEvents,
  getEventsForDate,
  type GstEvent,
} from "@/lib/gst-calendar-data";

const STORAGE_KEY = "dni-gst-completed";

function getCompletedIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveCompletedIds(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function statusColor(status: GstEvent["status"]) {
  switch (status) {
    case "done":
      return "bg-emerald-400";
    case "overdue":
      return "bg-rose-400";
    case "prep":
      return "bg-cyan-400";
    case "upcoming":
      return "bg-amber-400";
  }
}

function statusTextClass(status: GstEvent["status"]) {
  switch (status) {
    case "done":
      return "text-safe";
    case "overdue":
      return "text-danger";
    case "prep":
      return "text-info";
    case "upcoming":
      return "text-mentor";
  }
}

function daysLabel(days: number, status: GstEvent["status"]) {
  if (status === "done") return "Done";
  if (days < 0) return `${Math.abs(days)}d overdue`;
  if (days === 0) return "Due today";
  return `${days}d left`;
}

export function GstCalendar({
  defaultIsQrmp = false,
}: {
  defaultIsQrmp?: boolean;
}) {
  const [isQrmp, setIsQrmp] = useState(defaultIsQrmp);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [direction, setDirection] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);

  useEffect(() => {
    setCompletedIds(getCompletedIds());
  }, []);

  const monthEvents = useMemo(
    () => getGstEventsForMonth(currentYear, currentMonth, isQrmp),
    [currentYear, currentMonth, isQrmp],
  );

  const upcomingEvents = useMemo(
    () => getUpcomingGstEvents(isQrmp, completedIds).slice(0, 5),
    [isQrmp, completedIds],
  );

  const overdueEvents = useMemo(
    () =>
      upcomingEvents.filter(
        (e) => e.status === "overdue" && !completedIds.has(e.id),
      ),
    [upcomingEvents, completedIds],
  );

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return getEventsForDate(currentYear, currentMonth, selectedDay, isQrmp);
  }, [currentYear, currentMonth, selectedDay, isQrmp]);

  const markDone = useCallback(
    (id: string) => {
      const next = new Set(completedIds);
      next.add(id);
      setCompletedIds(next);
      saveCompletedIds(next);
    },
    [completedIds],
  );

  const goToPrevMonth = () => {
    setDirection(-1);
    setSelectedDay(null);
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const goToNextMonth = () => {
    setDirection(1);
    setSelectedDay(null);
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Calendar grid construction
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const monthLabel = new Date(currentYear, currentMonth).toLocaleString(
    "en-IN",
    { month: "long", year: "numeric" },
  );

  // Map day -> events for dot display
  const dayEventsMap = useMemo(() => {
    const map = new Map<number, GstEvent[]>();
    for (const evt of monthEvents) {
      const day = evt.dueDate.getDate();
      const arr = map.get(day) || [];
      // Mark completed
      const adjusted = completedIds.has(evt.id)
        ? { ...evt, status: "done" as const }
        : evt;
      arr.push(adjusted);
      map.set(day, arr);
    }
    return map;
  }, [monthEvents, completedIds]);

  const slideVariants = {
    enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
  };

  return (
    <div className="space-y-6">
      {/* Overdue warning */}
      {overdueEvents.length > 0 && (
        <div className="banner-deadline flex items-start gap-3 rounded-lg p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />
          <div>
            <p className="text-sm font-semibold text-rose-200">
              {overdueEvents.length} overdue filing
              {overdueEvents.length > 1 ? "s" : ""}
            </p>
            <p className="text-muted mt-1 text-xs">
              {overdueEvents.map((e) => e.filing.name).join(", ")} — file
              immediately to minimize late fees.
            </p>
          </div>
        </div>
      )}

      {/* QRMP toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsQrmp(false)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            !isQrmp
              ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
              : "text-muted hover:text-slate-200"
          }`}
        >
          Regular (Monthly)
        </button>
        <button
          onClick={() => setIsQrmp(true)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            isQrmp
              ? "bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40"
              : "text-muted hover:text-slate-200"
          }`}
        >
          QRMP (Quarterly)
        </button>
      </div>

      {/* Calendar */}
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-base font-semibold text-slate-100">
            {monthLabel}
          </h3>
          <button
            onClick={goToNextMonth}
            className="rounded-md p-1.5 text-slate-400 transition-colors hover:bg-slate-700/50 hover:text-slate-200"
            aria-label="Next month"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Day header */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {DAY_NAMES.map((d) => (
            <div
              key={d}
              className="text-muted pb-2 text-xs font-medium uppercase"
            >
              {d}
            </div>
          ))}
        </div>

        {/* Calendar body */}
        <AnimatePresence custom={direction} mode="wait">
          <motion.div
            key={`${currentYear}-${currentMonth}`}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="grid grid-cols-7 gap-1"
          >
            {/* Empty leading cells */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => (
              <div key={`empty-${i}`} className="aspect-square" />
            ))}
            {/* Day cells */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const evts = dayEventsMap.get(day);
              const isSelected = selectedDay === day;
              const isToday =
                day === new Date().getDate() &&
                currentMonth === new Date().getMonth() &&
                currentYear === new Date().getFullYear();

              return (
                <button
                  key={day}
                  onClick={() => setSelectedDay(isSelected ? null : day)}
                  className={`relative flex aspect-square flex-col items-center justify-center rounded-md text-sm transition-colors ${
                    isSelected
                      ? "bg-amber-500/20 ring-1 ring-amber-500/50"
                      : "hover:bg-slate-700/40"
                  } ${isToday ? "font-bold text-amber-400" : "text-slate-300"}`}
                >
                  <span>{day}</span>
                  {evts && evts.length > 0 && (
                    <div className="absolute bottom-1 flex gap-0.5">
                      {evts.slice(0, 3).map((e, idx) => (
                        <span
                          key={idx}
                          className={`h-1.5 w-1.5 rounded-full ${statusColor(e.status)}`}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Selected day detail */}
        <AnimatePresence>
          {selectedDay !== null && selectedDayEvents.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-4 overflow-hidden"
            >
              <div className="glass-panel-receded space-y-2 rounded-lg p-3">
                <p className="text-xs font-semibold text-slate-300">
                  {selectedDay}{" "}
                  {new Date(currentYear, currentMonth).toLocaleString("en-IN", {
                    month: "short",
                  })}
                </p>
                {selectedDayEvents.map((evt) => {
                  const done = completedIds.has(evt.id);
                  return (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between gap-2 text-sm"
                    >
                      <span
                        className={
                          done ? "text-safe line-through" : "text-slate-200"
                        }
                      >
                        {evt.filing.name}
                      </span>
                      {!done && (
                        <button
                          onClick={() => markDone(evt.id)}
                          className="rounded px-2 py-0.5 text-xs text-emerald-400 ring-1 ring-emerald-500/40 transition-colors hover:bg-emerald-500/20"
                        >
                          Done
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Upcoming filings list */}
      <div className="space-y-3">
        <h3 className="font-display flex items-center gap-2 text-base font-semibold text-slate-100">
          <Calendar className="h-4 w-4 text-amber-400" />
          Upcoming Filings
        </h3>
        {upcomingEvents.length === 0 && (
          <p className="text-muted text-sm">
            No upcoming filings in the next 90 days.
          </p>
        )}
        <div className="space-y-3">
          {upcomingEvents.map((evt) => {
            const done = completedIds.has(evt.id);
            const status = done ? "done" : evt.status;
            const isExpanded = expandedEvent === evt.id;

            return (
              <div
                key={evt.id}
                className="glass-panel-receded rounded-lg p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-slate-100">
                        {evt.filing.name}
                      </span>
                      <span className="text-muted rounded bg-slate-700/50 px-1.5 py-0.5 text-xs font-mono">
                        {evt.filing.form}
                      </span>
                    </div>
                    <p className="text-muted mt-1 text-xs">
                      Due{" "}
                      {evt.dueDate.toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusTextClass(status)} ${
                        status === "overdue"
                          ? "bg-rose-500/10"
                          : status === "prep"
                            ? "bg-cyan-500/10"
                            : status === "done"
                              ? "bg-emerald-500/10"
                              : "bg-amber-500/10"
                      }`}
                    >
                      {daysLabel(evt.daysUntilDue, status)}
                    </span>
                    {!done && (
                      <button
                        onClick={() => markDone(evt.id)}
                        className="rounded-md p-1 text-emerald-400 ring-1 ring-emerald-500/30 transition-colors hover:bg-emerald-500/20"
                        aria-label={`Mark ${evt.filing.name} as done`}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable prep checklist */}
                <button
                  onClick={() =>
                    setExpandedEvent(isExpanded ? null : evt.id)
                  }
                  className="text-info mt-2 text-xs hover:underline"
                >
                  {isExpanded ? "Hide" : "Show"} prep checklist
                </button>
                <AnimatePresence>
                  {isExpanded && (
                    <motion.ul
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                      className="mt-2 space-y-1 overflow-hidden pl-3"
                    >
                      {evt.filing.prepChecklist.map((item, idx) => (
                        <li
                          key={idx}
                          className="text-muted flex items-start gap-2 text-xs"
                        >
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-500" />
                          {item}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
