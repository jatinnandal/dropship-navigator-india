import { VerificationChecklist } from "@/components/tools/verification-checklist";

export default function VerificationChecklistPage() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <nav className="text-muted mb-3 text-xs">
          <span>Tools</span>
          <span className="mx-1.5">/</span>
          <span className="text-slate-200">Verification Checklist</span>
        </nav>

        <p className="eyebrow inline-block">Onboarding tool</p>
        <h1 className="headline-gradient mt-2 text-3xl font-bold">
          Smart Verification Checklist
        </h1>
        <p className="text-muted mt-3 max-w-2xl text-sm leading-6">
          Don&apos;t just check boxes — verify your registrations are actually
          complete and formatted correctly.
        </p>
      </header>

      <VerificationChecklist />
    </main>
  );
}
