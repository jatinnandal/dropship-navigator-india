"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, type PanInfo } from "framer-motion";
import { JargonText } from "@/components/jargon-text";

type SupplierCard = {
  id: string;
  name: string;
  origin: string;
  deliveryDays: number;
  isViable: boolean;
  explanation: string;
};

const CARDS: SupplierCard[] = [
  {
    id: "aliexpress",
    name: "Phone case via AliExpress",
    origin: "China - AliExpress",
    deliveryDays: 25,
    isViable: false,
    explanation:
      "25-day shipping kills COD in India. Customer forgets they ordered, refuses at doorstep. Customs delays add risk.",
  },
  {
    id: "cj",
    name: "Gadget via CJ Dropshipping",
    origin: "China - CJ Dropshipping",
    deliveryDays: 18,
    isViable: false,
    explanation: "Still cross-border. 2-3 week delivery = near 100% RTO on COD. India needs 3-5 day dispatch.",
  },
  {
    id: "1688",
    name: "Home decor via 1688.com agent",
    origin: "China - 1688 agent",
    deliveryDays: 21,
    isViable: false,
    explanation: "Bulk import looks cheap until customs, GST on imports, and 3-week COD delivery destroy conversion.",
  },
  {
    id: "unclear-gst",
    name: "Kitchenware supplier - 'GST optional for small orders'",
    origin: "India - WhatsApp group",
    deliveryDays: 5,
    isViable: false,
    explanation: "No GST invoice = no input credit, marketplace compliance risk, and no legal recourse on disputes.",
  },
  {
    id: "trader-trap",
    name: "Electronics via 'manufacturer' on IndiaMART",
    origin: "India - Mumbai trader",
    deliveryDays: 6,
    isViable: false,
    explanation: "Trader posing as manufacturer. No factory visit, borrowed catalogue photos, markup hidden in 'MOQ deals'.",
  },
  {
    id: "indiamart",
    name: "Kitchen set via IndiaMART verified supplier",
    origin: "India - Delhi NCR",
    deliveryDays: 4,
    isViable: true,
    explanation: "Domestic supplier, 3-5 day delivery. COD customer still remembers the order. Viable for beginners.",
  },
  {
    id: "clout",
    name: "Fashion accessory via Roposo Clout",
    origin: "India - Roposo Clout",
    deliveryDays: 3,
    isViable: true,
    explanation: "Indian B2B platform built for resellers. Fast dispatch, COD-friendly categories.",
  },
  {
    id: "glowroad",
    name: "Home decor via GlowRoad",
    origin: "India - GlowRoad",
    deliveryDays: 3,
    isViable: true,
    explanation: "Domestic sourcing with reseller-friendly MOQs. Matches India COD expectations.",
  },
  {
    id: "meesho-supplier",
    name: "Ethnic wear via Meesho supplier panel",
    origin: "India - Surat",
    deliveryDays: 3,
    isViable: true,
    explanation: "Built for Meesho resellers. Tier 2/3 categories with Valmo-friendly dispatch.",
  },
  {
    id: "delhi-wholesale",
    name: "Fashion jewellery - Delhi wholesale market",
    origin: "India - Sadar Bazar, Delhi",
    deliveryDays: 2,
    isViable: true,
    explanation: "Physical market with GST invoice. 1-2 day dispatch to NCR, 3-4 days pan-India via courier.",
  },
  {
    id: "advance-scam",
    name: "Supplier demands 100% advance, no sample",
    origin: "India - unknown city",
    deliveryDays: 7,
    isViable: false,
    explanation: "100% advance + no sample = classic scam pattern. Never pay full amount before verified dispatch.",
  },
  {
    id: "dropship-claim",
    name: "'We dropship for Amazon sellers' - no GSTIN shared",
    origin: "India - Telegram channel",
    deliveryDays: 4,
    isViable: false,
    explanation: "Legitimate suppliers share GSTIN upfront. Hidden GSTIN often means trader markup or grey-market stock.",
  },
  {
    id: "bangalore-d2c",
    name: "Skincare via Bangalore D2C brand wholesale",
    origin: "India - Bangalore",
    deliveryDays: 4,
    isViable: true,
    explanation: "D2C brand with wholesale program. GST invoice, batch codes, and 3-5 day dispatch - compliance-ready.",
  },
  {
    id: "shein-reseller",
    name: "Fashion dupes sourced from Shein reshipper",
    origin: "China - reshipper",
    deliveryDays: 14,
    isViable: false,
    explanation: "IP risk + slow delivery. Marketplaces suspend accounts for counterfeit listings.",
  },
  {
    id: "tradeindia",
    name: "Storage boxes via TradeIndia verified exporter",
    origin: "India - Ahmedabad",
    deliveryDays: 4,
    isViable: true,
    explanation: "Domestic manufacturer with export credentials. MOQ flexible for test phase, GST invoice provided.",
  },
];

type Feedback = { correct: boolean; explanation: string; wasViable: boolean };

type Props = {
  onComplete?: () => void;
};

export function SourcingSwipeGame({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const card = CARDS[index];
  const isLastCard = index >= CARDS.length - 1;
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  function choose(choseViable: boolean) {
    if (feedback || !card) return; // answered - wait for Next
    const correct = choseViable === card.isViable;
    setFeedback({ correct, explanation: card.explanation, wasViable: card.isViable });
    if (correct) setCorrectCount((c) => c + 1);
    x.set(0);
  }

  function next() {
    if (isLastCard) {
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    x.set(0);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (feedback) return;
    if (info.offset.x > 100) choose(true);
    else if (info.offset.x < -100) choose(false);
  }

  if (done) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4">
        <p className="text-sm text-emerald-200">
          Done. You got {correctCount}/{CARDS.length} right. Rule: India COD needs 3-5 day dispatch from a
          domestic supplier.
        </p>
        {onComplete ? (
          <button type="button" onClick={onComplete} className="btn-emerald mt-4 rounded-md px-4 py-2 text-sm font-semibold">
            Continue
          </button>
        ) : null}
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-muted text-xs">
        Tap <span className="font-semibold text-emerald-300">Use this supplier</span> if it is a viable
        India supplier, or <span className="font-semibold text-rose-300">Trap</span> to avoid. On a phone
        you can also swipe the card right (use) or left (trap). ({index + 1}/{CARDS.length})
      </p>

      <motion.div
        style={{ x, rotate }}
        drag={feedback ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="rounded-xl border border-slate-600/50 bg-slate-800/60 p-6 data-[locked=false]:cursor-grab data-[locked=false]:active:cursor-grabbing"
        data-locked={feedback ? "true" : "false"}
      >
        <p className="text-xs uppercase tracking-wide text-amber-200">{card.origin}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-100">{card.name}</h3>
        <p className="text-muted mt-2 text-sm">Delivery: ~{card.deliveryDays} days</p>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => choose(false)}
          disabled={!!feedback}
          className="btn-ghost rounded-md px-6 py-2 text-sm font-semibold text-rose-300 disabled:opacity-40"
        >
          Trap - skip it
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          disabled={!!feedback}
          className="btn-ghost rounded-md px-6 py-2 text-sm font-semibold text-emerald-300 disabled:opacity-40"
        >
          Use this supplier
        </button>
      </div>

      {feedback ? (
        <div
          className={`rounded-lg border p-4 ${
            feedback.correct ? "border-emerald-400/40 bg-emerald-400/10" : "border-rose-400/40 bg-rose-400/10"
          }`}
        >
          <p className={`text-sm font-semibold ${feedback.correct ? "text-emerald-200" : "text-rose-200"}`}>
            {feedback.correct ? "Correct" : "Not quite"} - this supplier is a{" "}
            {feedback.wasViable ? "viable option" : "trap"}.
          </p>
          <p className="text-muted mt-1 text-sm leading-6">
            <JargonText text={feedback.explanation} />
          </p>
          <button
            type="button"
            onClick={next}
            className="btn-primary mt-3 rounded-md px-4 py-2 text-sm font-semibold"
          >
            {isLastCard ? "See my score" : "Next supplier"}
          </button>
        </div>
      ) : null}
    </div>
  );
}
