"use client";

import { useState, useMemo, useCallback, useTransition } from "react";
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
  quarterlyGstr3bDueDay,
  filingCarriesLateFee,
  type GstEvent,
} from "@/lib/gst-calendar-data";
import { JargonText } from "@/components/jargon-text";
import { setGstFilingDone, setGstScheme } from "@/app/app/tools/gst-calendar/actions";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function statusColor(status: GstEvent["status"]) {
  switch (status) {
    case "done":
      return "bg-[var(--success)]";
    case "overdue":
      return "bg-[var(--danger)]";
    case "prep":
      return "bg-white/40";
    case "upcoming":
      return "bg-white";
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
  hasGstin = true,
  operatingState,
  initialDoneIds = [],
  initialScheme = null,
}: {
  defaultIsQrmp?: boolean;
  hasGstin?: boolean;
  operatingState?: string;
  initialDoneIds?: string[];
  initialScheme?: "regular" | "qrmp" | null;
}) {
  const [isQrmp, setIsQrmp] = useState(
    initialScheme ? initialScheme === "qrmp" : defaultIsQrmp,
  );
  const [showChooser, setShowChooser] = useState(false);
  const [currentYear, setCurrentYear] = useState(() => new Date().getFullYear());
  const [currentMonth, setCurrentMonth] = useState(() => new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  // Seeded from the account (SSR-consistent); persisted server-side on change.
  const [completedIds, setCompletedIds] = useState<Set<string>>(() => new Set(initialDoneIds));
  const [direction, setDirection] = useState(0);
  const [expandedEvent, setExpandedEvent] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const setScheme = useCallback(
    (qrmp: boolean) => {
      setIsQrmp(qrmp);
      startTransition(() => {
        setGstScheme(qrmp ? "qrmp" : "regular");
      });
    },
    [],
  );

  const monthEvents = useMemo(
    () => getGstEventsForMonth(currentYear, currentMonth, isQrmp, operatingState),
    [currentYear, currentMonth, isQrmp, operatingState],
  );

  const upcomingEvents = useMemo(
    () => getUpcomingGstEvents(isQrmp, completedIds, operatingState).slice(0, 5),
    [isQrmp, completedIds, operatingState],
  );

  const overdueEvents = useMemo(
    () =>
      upcomingEvents.filter(
        (e) => e.status === "overdue" && !completedIds.has(e.id),
      ),
    [upcomingEvents, completedIds],
  );

  // Only penalty-bearing returns belong in a "file now to avoid late fees"
  // warning; IFF/TCS carry no fine and get a neutral note instead.
  const overduePenalty = useMemo(
    () => overdueEvents.filter((e) => filingCarriesLateFee(e.filing)),
    [overdueEvents],
  );
  const overdueOptional = useMemo(
    () => overdueEvents.filter((e) => !filingCarriesLateFee(e.filing)),
    [overdueEvents],
  );

  // The single most urgent thing to do next: soonest overdue, else soonest
  // upcoming that isn't done. Drives the top "your next action" panel.
  const nextAction = useMemo(
    () => upcomingEvents.find((e) => e.status !== "done"),
    [upcomingEvents],
  );

  const selectedDayEvents = useMemo(() => {
    if (selectedDay === null) return [];
    return getEventsForDate(currentYear, currentMonth, selectedDay, isQrmp, operatingState);
  }, [currentYear, currentMonth, selectedDay, isQrmp, operatingState]);

  const markDone = useCallback(
    (id: string) => {
      setCompletedIds((prev) => {
        const next = new Set(prev);
        next.add(id);
        return next;
      });
      startTransition(() => {
        setGstFilingDone(id, true);
      });
    },
    [],
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
      {/* No GSTIN yet: nothing is due */}
      {!hasGstin && (
        <div className="rounded-lg border border-white/[0.14] bg-white/[0.03] p-4">
          <p className="text-sm font-semibold text-white">
            No GSTIN yet - you have no filing obligations.
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            These deadlines start only after your GST registration is active
            (an Enrolment ID for Meesho intra-state selling has no return
            filings either). The calendar below is a preview of what your
            compliance rhythm will look like - deadlines shown are not yours
            yet.
          </p>
        </div>
      )}

      {/* What this is + your single next action */}
      {hasGstin && (
        <div className="rounded-lg border border-white/[0.12] bg-white/[0.03] p-4">
          <p className="text-muted text-[11px] font-medium uppercase tracking-wider">
            What this is
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">
            <JargonText text="Once your GSTIN is active you must file GST returns every period even with zero sales - miss a deadline and a per-day late fee starts. This shows only the deadlines that apply to your scheme and state, with a prep checklist for each." />
          </p>
          {nextAction ? (
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-md border border-white/[0.1] bg-white/[0.02] p-3">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--text-faint)]">
                  Your next filing
                </p>
                <p className="mt-0.5 text-sm font-semibold text-white">
                  <JargonText text={nextAction.filing.name} />
                  <span className={`ml-2 text-xs font-medium ${statusTextClass(nextAction.status)}`}>
                    {nextAction.dueDate.toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    {" · "}
                    {daysLabel(nextAction.daysUntilDue, nextAction.status)}
                  </span>
                </p>
              </div>
              <button
                onClick={() => {
                  setCurrentYear(nextAction.dueDate.getFullYear());
                  setCurrentMonth(nextAction.dueDate.getMonth());
                  setExpandedEvent(nextAction.id);
                }}
                className="rounded-md bg-white/[0.08] px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.12]"
              >
                Show prep steps
              </button>
            </div>
          ) : (
            <p className="mt-3 text-xs text-[var(--muted)]">
              Nothing due in the next 90 days for your scheme. Check back near the start of each month.
            </p>
          )}
        </div>
      )}

      {/* Overdue - only penalty-bearing returns get the late-fee warning */}
      {hasGstin && overduePenalty.length > 0 && (
        <div className="banner-deadline flex items-start gap-3 rounded-lg p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-[var(--danger)]" />
          <div>
            <p className="text-sm font-semibold text-[var(--danger)]">
              {overduePenalty.length} overdue filing
              {overduePenalty.length > 1 ? "s" : ""}
            </p>
            <p className="text-muted mt-1 text-xs">
              <JargonText text={overduePenalty.map((e) => e.filing.name).join(", ")} /> - a per-day
              late fee is accruing. File as soon as possible to stop it growing.
            </p>
          </div>
        </div>
      )}

      {/* Overdue optional items (IFF/TCS) - no fine, so no alarm */}
      {hasGstin && overdueOptional.length > 0 && (
        <div className="rounded-lg border border-white/[0.1] bg-white/[0.02] p-3">
          <p className="text-muted text-xs leading-5">
            <JargonText text={overdueOptional.map((e) => e.filing.name).join(", ")} /> is past its
            usual date. No late fee applies, but doing it keeps your credit and buyer ITC current.
          </p>
        </div>
      )}

      {/* Filing scheme */}
      <div className="glass-panel-receded space-y-3 rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-muted text-xs font-medium uppercase tracking-wider">
            Your filing scheme
          </span>
          <button
            onClick={() => setScheme(false)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              !isQrmp
                ? "bg-white/[0.06] text-white ring-1 ring-white/25"
                : "text-muted hover:text-[var(--body-text)]"
            }`}
          >
            Regular (Monthly)
          </button>
          <button
            onClick={() => setScheme(true)}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
              isQrmp
                ? "bg-white/[0.06] text-white ring-1 ring-white/25"
                : "text-muted hover:text-[var(--body-text)]"
            }`}
          >
            QRMP (Quarterly)
          </button>
          <button
            onClick={() => setShowChooser((s) => !s)}
            className="text-info text-xs hover:underline"
          >
            {showChooser ? "Hide help" : "Not sure which you're on?"}
          </button>
        </div>

        <p className="text-muted text-xs leading-5">
          {isQrmp ? (
            <>
              QRMP: GSTR-1 and GSTR-3B are filed once a quarter (tax is still
              paid monthly via PMT-06)
              {operatingState
                ? `. In ${operatingState}, quarterly GSTR-3B is due the ${quarterlyGstr3bDueDay(operatingState)}th of the month after the quarter.`
                : ". Quarterly GSTR-3B is due the 22nd or 24th depending on your state."}
            </>
          ) : (
            <>
              Regular: GSTR-1 (sales detail, 11th) and GSTR-3B (summary + tax
              payment, 20th) are filed every month.
            </>
          )}
        </p>

        {showChooser && (
          <div className="space-y-2 rounded-md border border-white/[0.1] bg-white/[0.02] p-3 text-xs leading-5 text-[var(--body-text)]">
            <p>
              <span className="font-semibold text-white">1. Turnover above ₹5 crore last year?</span>{" "}
              Then QRMP isn&apos;t available to you - select <span className="font-medium">Regular</span>.
            </p>
            <p>
              <span className="font-semibold text-white">2. At or under ₹5 crore?</span>{" "}
              You can be on either - it depends on what was chosen on the GST
              portal. Check <span className="font-mono">Services → Returns → Opt-in for Quarterly Return</span>{" "}
              on gst.gov.in and match this toggle to what the portal shows.
              QRMP means fewer filings; Regular means monthly ones.
            </p>
            <p className="text-muted">
              This toggle only changes which deadlines the calendar shows - it
              does not change your scheme on the portal.
            </p>
          </div>
        )}
      </div>

      {/* Calendar */}
      <div className="glass-panel rounded-xl p-4 sm:p-6">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={goToPrevMonth}
            className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--body-text)]"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h3 className="font-display text-base font-semibold text-white">
            {monthLabel}
          </h3>
          <button
            onClick={goToNextMonth}
            className="rounded-md p-1.5 text-[var(--muted)] transition-colors hover:bg-white/[0.06] hover:text-[var(--body-text)]"
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
                      ? "bg-white/[0.06] ring-1 ring-white/25"
                      : "hover:bg-white/[0.06]/40"
                  } ${isToday ? "font-bold text-white" : "text-[var(--body-text)]"}`}
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
                <p className="text-xs font-semibold text-[var(--body-text)]">
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
                          done ? "text-safe line-through" : "text-[var(--body-text)]"
                        }
                      >
                        <JargonText text={evt.filing.name} />
                      </span>
                      {!done && (
                        <button
                          onClick={() => markDone(evt.id)}
                          className="rounded px-2 py-0.5 text-xs text-[var(--success)] ring-1 ring-[var(--success)]/40 transition-colors hover:bg-[var(--success)]/20"
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
        <h3 className="font-display flex items-center gap-2 text-base font-semibold text-white">
          <Calendar className="h-4 w-4 text-white" />
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
                      <span className="text-sm font-medium text-white">
                        <JargonText text={evt.filing.name} />
                      </span>
                      <span className="text-muted rounded bg-white/[0.06] px-1.5 py-0.5 text-xs font-mono">
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
                          ? "bg-[var(--danger)]/10"
                          : status === "prep"
                            ? "bg-white/[0.06]"
                            : status === "done"
                              ? "bg-[var(--success)]/10"
                              : "bg-white/[0.06]"
                      }`}
                    >
                      {daysLabel(evt.daysUntilDue, status)}
                    </span>
                    {!done && (
                      <button
                        onClick={() => markDone(evt.id)}
                        className="rounded-md p-1 text-[var(--success)] ring-1 ring-[var(--success)]/30 transition-colors hover:bg-[var(--success)]/20"
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
                          <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-white/20" />
                          <JargonText text={item} />
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
