"use client";

import { useState } from "react";
import { Truck } from "lucide-react";
import { JargonText } from "@/components/jargon-text";
import { CopyTemplate } from "@/components/copy-template";
import { WHATSAPP_ADDRESS_VERIFY } from "@/lib/mentor-templates";

type Scenario = {
  id: string;
  customerMsg: string;
  templateKey?: "address" | "confirm";
  requireCopyOnWrong?: boolean;
  options: {
    id: string;
    label: string;
    correct: boolean;
    feedback: string;
    showLossAnimation?: boolean;
  }[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "incomplete-address",
    customerMsg:
      'New COD order: "Rahul, Near Temple, Bihar" — no house number, no pincode. Customer has not responded to messages.',
    templateKey: "address",
    requireCopyOnWrong: true,
    options: [
      {
        id: "ship",
        label: "Ship anyway — any sale is good",
        correct: false,
        feedback: "Wrong. Incomplete addresses fail delivery 70%+ of the time.",
        showLossAnimation: true,
      },
      {
        id: "verify",
        label: "WhatsApp to verify full address + pincode before dispatch",
        correct: true,
        feedback: "Correct. Never ship COD without a complete, confirmed address.",
      },
      {
        id: "fake",
        label: "Cancel — probably a fake order",
        correct: false,
        feedback: "Only cancel after trying to verify. Real customers often give vague addresses.",
      },
    ],
  },
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
        showLossAnimation: true,
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
  {
    id: "bulk-fake",
    customerMsg:
      "Educational: You got 15 COD orders in 1 hour from the same pincode, all different names, all incomplete addresses.",
    options: [
      {
        id: "celebrate",
        label: "Amazing! Ship all 15 immediately",
        correct: false,
        feedback: "Classic fake-order pattern. Verify each order individually before dispatch.",
        showLossAnimation: true,
      },
      {
        id: "verify-all",
        label: "Pause — verify each order via call/WhatsApp before any dispatch",
        correct: true,
        feedback: "Correct. Bulk fake COD is common. One verification call saves ₹60–90 per fake order.",
      },
      {
        id: "ignore-pattern",
        label: "Ignore the pattern — treat as normal",
        correct: false,
        feedback: "Same pincode + incomplete addresses = red flag. Verify first.",
      },
    ],
  },
  {
    id: "open-before-pay",
    customerMsg:
      "COD delivery attempt: customer refuses to pay until they open and inspect the package on the doorstep.",
    options: [
      {
        id: "allow-open",
        label: "Let them open — close the sale",
        correct: false,
        feedback: "Wrong. Once opened, customers often refuse damaged-looking items or haggle. RTO + product loss likely.",
        showLossAnimation: true,
      },
      {
        id: "policy-prepaid",
        label: "Explain COD policy (no opening before payment) + offer 5% prepaid discount for next order",
        correct: true,
        feedback: "Correct. Firm policy protects you; prepaid incentive converts high-intent buyers without doorstep haggling.",
      },
      {
        id: "cancel",
        label: "Cancel order immediately",
        correct: false,
        feedback: "Only cancel if customer confirms refusal. Try policy + prepaid offer first.",
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
  const [showLoss, setShowLoss] = useState(false);
  const [templateCopied, setTemplateCopied] = useState(false);
  const [done, setDone] = useState(false);

  const scenario = SCENARIOS[scenarioIndex];
  const needsCopy = scenario.requireCopyOnWrong && showLoss && !templateCopied;

  function advance() {
    if (scenarioIndex < SCENARIOS.length - 1) {
      setScenarioIndex((i) => i + 1);
      setFeedback(null);
      setShowLoss(false);
      setTemplateCopied(false);
    } else {
      setDone(true);
    }
  }

  function pick(optionId: string) {
    const opt = scenario.options.find((o) => o.id === optionId);
    if (!opt) return;
    setFeedback(opt.feedback);
    if (opt.showLossAnimation) setShowLoss(true);
    if (opt.correct) {
      setTimeout(advance, 1500);
    }
  }

  function tryAgain() {
    setFeedback(null);
    setShowLoss(false);
    setTemplateCopied(false);
  }

  function handleTemplateCopied() {
    setTemplateCopied(true);
    if (showLoss) {
      setTimeout(advance, 800);
    }
  }

  return (
    <div className="mt-4 space-y-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-4">
      <p className="text-sm font-semibold text-slate-100">NDR / COD confirmation practice</p>

      <div className="rounded-lg border border-cyan-400/30 bg-cyan-400/5 p-3">
        <p className="text-xs text-cyan-200">
          Scenario {scenarioIndex + 1} of {SCENARIOS.length}
        </p>
        <p className="mt-2 text-sm text-slate-200">{scenario.customerMsg}</p>
      </div>

      <div className="grid gap-2">
        {scenario.options.map((opt) => (
          <button
            key={opt.id}
            type="button"
            onClick={() => pick(opt.id)}
            className="surface-hover rounded-lg border border-slate-700/60 px-4 py-3 text-left text-sm text-slate-200"
          >
            {opt.label}
          </button>
        ))}
      </div>

      {feedback && !needsCopy ? (
        <button type="button" onClick={tryAgain} className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold">
          Try again
        </button>
      ) : null}

      {feedback ? (
        <p className="text-sm text-amber-200">
          <JargonText text={feedback} />
        </p>
      ) : null}

      {showLoss ? (
        <div
          className="rounded-lg border border-rose-400/40 bg-rose-400/10 p-4 motion-safe:animate-pulse"
          role="alert"
        >
          <div className="flex items-center gap-3">
            <Truck className="h-8 w-8 text-rose-300 motion-safe:rotate-180" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-rose-200">Delivery failed — RTO charge</p>
              <p className="text-muted mt-1 text-xs">
                Forward + reverse shipping: ₹60–90 lost. Product may be damaged. You earned ₹0.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {(scenario.templateKey === "address" || showLoss) && !done ? (
        <CopyTemplate
          title="Address verification template — copy before continuing"
          text={WHATSAPP_ADDRESS_VERIFY}
        />
      ) : null}

      {needsCopy ? (
        <button
          type="button"
          onClick={handleTemplateCopied}
          className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
        >
          I copied the template — continue
        </button>
      ) : null}

      {done && onComplete ? (
        <button type="button" onClick={onComplete} className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold">
          Practice complete
        </button>
      ) : null}
    </div>
  );
}
