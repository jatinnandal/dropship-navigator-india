"use client";

import { useMemo, useState } from "react";
import { CopyTemplate } from "@/components/copy-template";

type Props = {
  defaultState?: string;
  defaultOrderTarget?: number;
  onComplete?: () => void;
};

export function PincodePilotPlanner({ defaultState = "Maharashtra", defaultOrderTarget = 100, onComplete }: Props) {
  const [state, setState] = useState(defaultState);
  const [pincode1, setPincode1] = useState("");
  const [pincode2, setPincode2] = useState("");
  const [pincode3, setPincode3] = useState("");
  const [orderTarget, setOrderTarget] = useState(defaultOrderTarget);
  const [rtoCutoff, setRtoCutoff] = useState(20);
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});

  const pilotPlan = useMemo(() => {
    const pincodes = [pincode1, pincode2, pincode3].filter((p) => p.trim().length === 6);
    return `Pincode pilot plan — ${state}

Phase 1: Test zone (${orderTarget} orders max)
Pilot pincodes: ${pincodes.length > 0 ? pincodes.join(", ") : "[add 3 pincodes]"}

Rules:
- Ship ONLY to pilot pincodes for first ${orderTarget} orders
- Track RTO % weekly per pincode
- Expand only to pincodes with RTO below ${rtoCutoff}%
- Pause ads to any pincode above ${rtoCutoff + 5}% RTO

Weekly log columns:
| Pincode | Orders | Delivered | RTO | NDR | Return | Notes |

Courier: benchmark 2 aggregators on same pincode pair before committing volume.
Supplier SLA: dispatch within 48h or pause ads.

Expand trigger: 2 consecutive weeks RTO < ${rtoCutoff}% on a pincode → add adjacent pincodes.`;
  }, [state, pincode1, pincode2, pincode3, orderTarget, rtoCutoff]);

  const items = [
    "3 pilot pincodes selected (home state + 1 metro + 1 tier-2)",
    "Courier benchmark done on test route",
    "Supplier confirmed 48h dispatch SLA in writing",
    "RTO log spreadsheet created with pincode column",
    "Ads geo-targeted to pilot pincodes only",
  ];

  const allChecked = items.every((_, i) => checklist[`item-${i}`]);

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">Pincode pilot planner</p>
      <p className="text-muted text-xs">
        Don&apos;t ship all-India on day 1. Run a controlled pincode pilot before scaling.
      </p>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm">
          <span className="text-muted">Home state</span>
          <input
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Order target before expand</span>
          <input
            type="number"
            value={orderTarget}
            onChange={(e) => setOrderTarget(Number(e.target.value) || 50)}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Pilot pincode 1</span>
          <input
            type="text"
            maxLength={6}
            value={pincode1}
            onChange={(e) => setPincode1(e.target.value.replace(/\D/g, ""))}
            placeholder="400001"
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Pilot pincode 2</span>
          <input
            type="text"
            maxLength={6}
            value={pincode2}
            onChange={(e) => setPincode2(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">Pilot pincode 3</span>
          <input
            type="text"
            maxLength={6}
            value={pincode3}
            onChange={(e) => setPincode3(e.target.value.replace(/\D/g, ""))}
            className="mt-1 w-full rounded-md border border-slate-600 bg-slate-900/60 px-3 py-2 text-slate-100"
          />
        </label>
        <label className="text-sm">
          <span className="text-muted">RTO cutoff to expand (%): {rtoCutoff}</span>
          <input
            type="range"
            min={10}
            max={30}
            value={rtoCutoff}
            onChange={(e) => setRtoCutoff(Number(e.target.value))}
            className="mt-2 w-full accent-amber-400"
          />
        </label>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wide text-amber-200">Pre-flight checklist</p>
        {items.map((item, i) => (
          <label key={item} className="flex items-start gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={checklist[`item-${i}`] ?? false}
              onChange={(e) => setChecklist((prev) => ({ ...prev, [`item-${i}`]: e.target.checked }))}
              className="mt-1 accent-amber-400"
            />
            {item}
          </label>
        ))}
      </div>

      <CopyTemplate title="Your pilot plan (copy to notes)" text={pilotPlan} />

      {onComplete ? (
        <button
          type="button"
          onClick={onComplete}
          disabled={!allChecked}
          className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold disabled:opacity-50"
        >
          Pilot plan ready
        </button>
      ) : null}
    </div>
  );
}
