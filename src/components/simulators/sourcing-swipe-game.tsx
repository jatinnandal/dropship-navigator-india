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
    origin: "China — AliExpress",
    deliveryDays: 25,
    isViable: false,
    explanation:
      "25-day shipping kills COD in India. Customer forgets they ordered, refuses at doorstep. Customs delays add risk.",
  },
  {
    id: "cj",
    name: "Gadget via CJ Dropshipping",
    origin: "China — CJ Dropshipping",
    deliveryDays: 18,
    isViable: false,
    explanation: "Still cross-border. 2–3 week delivery = near 100% RTO on COD. India needs 3–5 day dispatch.",
  },
  {
    id: "indiamart",
    name: "Kitchen set via IndiaMART verified supplier",
    origin: "India — Delhi NCR",
    deliveryDays: 4,
    isViable: true,
    explanation: "Domestic supplier, 3–5 day delivery. COD customer still remembers the order. Viable for beginners.",
  },
  {
    id: "clout",
    name: "Fashion accessory via Roposo Clout",
    origin: "India — Roposo Clout",
    deliveryDays: 3,
    isViable: true,
    explanation: "Indian B2B platform built for resellers. Fast dispatch, COD-friendly categories.",
  },
  {
    id: "glowroad",
    name: "Home decor via GlowRoad",
    origin: "India — GlowRoad",
    deliveryDays: 3,
    isViable: true,
    explanation: "Domestic sourcing with reseller-friendly MOQs. Matches India COD expectations.",
  },
];

type Props = {
  onComplete?: () => void;
};

export function SourcingSwipeGame({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);

  const card = CARDS[index];
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);

  function swipe(direction: "left" | "right") {
    if (feedback || !card) return;
    const choseViable = direction === "right";
    const correct = choseViable === card.isViable;
    setFeedback(card.explanation);
    if (correct) setCorrectCount((c) => c + 1);

    setTimeout(() => {
      if (index < CARDS.length - 1) {
        setIndex((i) => i + 1);
        setFeedback(null);
        x.set(0);
      } else {
        setDone(true);
      }
    }, 2000);
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100) swipe("right");
    else if (info.offset.x < -100) swipe("left");
  }

  if (done) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 p-4">
        <p className="text-sm text-emerald-200">
          Done. You got {correctCount}/{CARDS.length} right. Rule: India COD needs 3–5 day dispatch from a
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
        Swipe right on viable India suppliers. Left on traps. ({index + 1}/{CARDS.length})
      </p>

      <motion.div
        style={{ x, rotate }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleDragEnd}
        className="cursor-grab rounded-xl border border-slate-600/50 bg-slate-800/60 p-6 active:cursor-grabbing"
      >
        <p className="text-xs uppercase tracking-wide text-amber-200">{card.origin}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-100">{card.name}</h3>
        <p className="text-muted mt-2 text-sm">Delivery: ~{card.deliveryDays} days</p>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => swipe("left")}
          disabled={!!feedback}
          className="btn-ghost rounded-md px-6 py-2 text-sm font-semibold text-rose-300"
        >
          Skip (trap)
        </button>
        <button
          type="button"
          onClick={() => swipe("right")}
          disabled={!!feedback}
          className="btn-ghost rounded-md px-6 py-2 text-sm font-semibold text-emerald-300"
        >
          Use this supplier
        </button>
      </div>

      {feedback ? (
        <p className={`text-sm ${card.isViable ? "text-emerald-200" : "text-rose-200"}`}>
          <JargonText text={feedback} />
        </p>
      ) : null}
    </div>
  );
}
