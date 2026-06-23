"use client";

import { useState } from "react";
import { JargonText } from "@/components/jargon-text";

const WHATSAPP_TEMPLATE = `Hi {{name}}, this is {{store}} confirming your COD order #{{order}} for ₹{{amount}}.

Please reply YES to confirm delivery or CANCEL to cancel.

Delivery address: {{address}}`;

type Scenario = {
  id: string;
  customerMsg: string;
  options: { id: string; label: string; correct: boolean; feedback: string }[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "confirm",
    customerMsg: "Customer placed COD order 12 minutes ago. No response yet.",
    options: [
      {
        id: "wait",
        label: "Wait — they'll probably accept",
        correct: false,
        feedback: "Wrong. After 30 min, confirmation rates drop 40%. Message NOW.",
      },
      {
        id: "whatsapp",
        label: "Send WhatsApp confirmation within 30 min",
        correct: true,
        feedback: "Correct. This cuts RTO from ~26% to ~14% for many stores.",
      },
      {
        id: "ship",
        label: "Ship immediately to beat competition",
        correct: false,
        feedback: "Shipping unconfirmed COD = paying for returns. Confirm first.",
      },
    ],
  },
  {
    id: "ndr",
    customerMsg: "Courier reports NDR: customer not available at address.",
    options: [
      {
        id: "ignore",
        label: "Ignore — courier will retry",
        correct: false,
        feedback: "One retry often fails. Call/WhatsApp within 24h or it's RTO.",
      },
      {
        id: "call",
        label: "Call + WhatsApp to verify address and delivery window",
        correct: true,
        feedback: "Correct. NDR follow-up saves 30–50% of would-be RTO orders.",
      },
      {
        id: "cancel",
        label: "Cancel order immediately",
        correct: false,
        feedback: "Only cancel if customer confirms they don't want it.",
      },
    ],
  },
];

type Props = {
  onComplete?: () => void;
};

export function NdrCallerSimulator({ onComplete }: Props) {
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [copied, setCopied] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];

  function pick(optionId: string) {
    const opt = scenario.options.find((o) => o.id === optionId);
    if (!opt) return;
    setFeedback(opt.feedback);
    if (opt.correct && scenarioIndex < SCENARIOS.length - 1) {
      setTimeout(() => {
        setScenarioIndex((i) => i + 1);
        setFeedback(null);
      }, 1500);
    } else if (opt.correct) {
      setDone(true);
    }
  }

  function copyTemplate() {
    void navigator.clipboard.writeText(WHATSAPP_TEMPLATE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">NDR / COD confirmation practice</p>

      <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
        <p className="text-xs text-cyan-200">Scenario {scenarioIndex + 1} of {SCENARIOS.length}</p>
        <p className="mt-2 text-sm text-slate-200">{scenario.customerMsg}</p>
      </div>

      <div className="grid gap-2">
        {scenario.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt.id)}
            disabled={!!feedback}
            className="surface-hover rounded-lg border border-slate-700/60 px-4 py-3 text-left text-sm text-slate-200 disabled:opacity-60"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {feedback ? (
        <p className="text-sm text-amber-200">
          <JargonText text={feedback} />
        </p>
      ) : null}

      <div className="rounded-lg border border-slate-700/60 bg-slate-900/40 p-3">
        <p className="text-xs font-semibold text-slate-200">WhatsApp template (copy-paste)</p>
        <pre className="text-muted mt-2 whitespace-pre-wrap text-xs">{WHATSAPP_TEMPLATE}</pre>
        <button type="button" onClick={copyTemplate} className="btn-ghost mt-2 rounded-md px-3 py-1.5 text-xs font-semibold">
          {copied ? "Copied" : "Copy template"}
        </button>
      </div>

      {done && onComplete ? (
        <button type="button" onClick={onComplete} className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold">
          Practice complete
        </button>
      ) : null}
    </div>
  );
}
