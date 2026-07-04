import { SeasonalCalendar } from "@/components/tools/seasonal-calendar";

export default function SeasonalCalendarPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        {/* Breadcrumb */}
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-200">Seasonal Calendar</span>
        </nav>

        <p className="eyebrow inline-block">Planning tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Seasonal Sales Calendar
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          20 peak selling periods with prep timelines and ad budget guidance
        </p>
      </header>

      <SeasonalCalendar />
    </main>
  );
}
