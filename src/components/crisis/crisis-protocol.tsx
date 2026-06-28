"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import type { OnboardingProfile } from "@/lib/mvp-data";
import type { ActiveCrisis } from "@/lib/workspace";
import { getCrisisProtocol } from "@/lib/crisis/playbooks";
import {
  advanceCrisisStep,
  resolveCrisis,
  setCrisisStep,
} from "@/app/app/crisis/actions";
import { PaosEditor } from "@/components/crisis/paos-editor";
import { CopyTemplate } from "@/components/copy-template";
import {
  fillTemplate,
  WHATSAPP_CUSTOMER_DELAY,
  WHATSAPP_SUPPLIER_ETA,
} from "@/lib/mentor-templates";

type Props = {
  crisis: ActiveCrisis;
  profile: OnboardingProfile;
  legalBusinessName?: string;
  gstin?: string;
};

function templateForStep(
  templateId: string | undefined,
  profile: OnboardingProfile,
  legalBusinessName?: string,
  gstin?: string,
): string | null {
  const store = legalBusinessName ?? "Your Store";
  const vars: Record<string, string> = {
    store_name: store,
    store: store,
    supplier_name: "Supplier name",
    sku: "Your SKU",
    marketplace: profile.primaryChannel,
    name: "Customer name",
    order: "ORDER_ID",
    product: "Product name",
    eta_days: "3-5",
    legal_name: legalBusinessName ?? store,
    gstin: gstin ?? "YOUR_GSTIN",
  };

  if (templateId === "supplier_eta") {
    return fillTemplate(WHATSAPP_SUPPLIER_ETA, vars);
  }
  if (templateId === "customer_whatsapp") {
    return fillTemplate(WHATSAPP_CUSTOMER_DELAY, vars);
  }
  return null;
}

export function CrisisProtocol({ crisis, profile, legalBusinessName, gstin }: Props) {
  const protocol = getCrisisProtocol(crisis.type);
  const [pending, startTransition] = useTransition();
  const [resolving, setResolving] = useState(false);
  const current = protocol.steps[crisis.currentStepIndex];

  function goToStep(index: number) {
    startTransition(() => setCrisisStep(index));
  }

  function handleAdvance() {
    startTransition(() => advanceCrisisStep());
  }

  async function handleResolve() {
    setResolving(true);
    await resolveCrisis();
    setResolving(false);
  }

  const templateText = templateForStep(current.templateId, profile, legalBusinessName, gstin);

  return (
    <section className="glass-panel mt-4 rounded-xl p-6 sm:p-8">
      <ol className="space-y-3">
        {protocol.steps.map((step, index) => {
          const done = index < crisis.currentStepIndex;
          const active = index === crisis.currentStepIndex;
          return (
            <li
              key={step.title}
              className={`rounded-lg border px-4 py-3 ${
                active
                  ? "border-amber-400/50 bg-amber-400/10"
                  : done
                    ? "border-emerald-500/30 bg-emerald-500/5 opacity-80"
                    : "border-slate-700/50 bg-slate-950/30"
              }`}
            >
              <button
                type="button"
                onClick={() => goToStep(index)}
                className="w-full text-left"
              >
                <span className="text-xs text-muted">Step {index + 1}</span>
                <p className="mt-0.5 text-sm font-semibold text-slate-100">{step.title}</p>
              </button>
            </li>
          );
        })}
      </ol>

      <div className="mt-6 border-t border-slate-700/50 pt-6">
        <h2 className="text-lg font-bold text-slate-100">{current.title}</h2>
        {current.timerLabel ? (
          <p className="meta-tile mt-2 inline-block text-xs text-amber-200">{current.timerLabel}</p>
        ) : null}
        <p className="text-muted mt-3 text-sm leading-6">{current.body}</p>

        {current.actionHref ? (
          <Link
            href={current.actionHref}
            className="btn-ghost mt-4 inline-flex min-h-[44px] items-center rounded-md px-4 py-2 text-sm font-medium"
          >
            {current.actionLabel ?? "Open guide"}
          </Link>
        ) : null}

        {current.templateId === "paos" ? (
          <PaosEditor
            className="mt-4"
            profile={profile}
            legalBusinessName={legalBusinessName}
            gstin={gstin}
          />
        ) : null}

        {templateText ? <CopyTemplate title="Copy & send" text={templateText} className="mt-4" /> : null}

        <div className="mt-8 flex flex-wrap gap-3">
          {crisis.currentStepIndex > 0 ? (
            <button
              type="button"
              disabled={pending}
              onClick={() => goToStep(crisis.currentStepIndex - 1)}
              className="btn-ghost min-h-[44px] rounded-md px-4 py-2 text-sm font-medium"
            >
              Previous step
            </button>
          ) : null}
          {crisis.currentStepIndex < protocol.steps.length - 1 ? (
            <button
              type="button"
              disabled={pending}
              onClick={handleAdvance}
              className="btn-primary min-h-[44px] rounded-md px-5 py-2 text-sm font-medium"
            >
              Next step
            </button>
          ) : (
            <button
              type="button"
              disabled={resolving}
              onClick={() => void handleResolve()}
              className="btn-emerald min-h-[44px] rounded-md px-5 py-2 text-sm font-medium"
            >
              {resolving ? "Closing…" : "Mark as resolved"}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
