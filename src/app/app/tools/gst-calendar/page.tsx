import { GstCalendar } from "@/components/tools/gst-calendar";

export default function GstCalendarPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        {/* Breadcrumb */}
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-200">GST Calendar</span>
        </nav>

        <p className="eyebrow inline-block">Compliance tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          GST Filing Calendar
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Never miss a deadline — personalized for your filing frequency
        </p>
      </header>

      <GstCalendar />
    </main>
  );
}
