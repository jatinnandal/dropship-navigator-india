import { GstCalendar } from "@/components/tools/gst-calendar";
import { EstimateDisclaimer } from "@/components/estimate-disclaimer";
import { GST_DATA_META } from "@/lib/gst-calendar-data";
import { getStoredProfileForCurrentVisitor } from "@/lib/progress-store";
import { getWorkspaceForCurrentVisitor } from "@/lib/workspace-store";

export default async function GstCalendarPage() {
  const [profile, workspace] = await Promise.all([
    getStoredProfileForCurrentVisitor(),
    getWorkspaceForCurrentVisitor(),
  ]);
  const hasGstin = profile.hasGstin || Boolean(workspace.gstin);

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
          Never miss a deadline - personalized for your filing frequency
        </p>
        <EstimateDisclaimer
          meta={GST_DATA_META}
          note="Dates follow current CBIC notifications - due dates can shift by notification; the portal is authoritative."
        />
      </header>

      <GstCalendar
        hasGstin={hasGstin}
        operatingState={profile.operatingState}
        initialDoneIds={workspace.gstFilingsDone ?? []}
        initialScheme={workspace.gstScheme ?? null}
      />
    </main>
  );
}
