"use client";

import { useState } from "react";
import { motion, useMotionValue, useTransform, PanInfo } from "framer-motion";

type ProductCard = {
  id: string;
  name: string;
  price: number;
  category: string;
  isWinner: boolean;
  explanation: string;
};

const CARDS: ProductCard[] = [
  {
    id: "watch",
    name: "Premium smartwatch",
    price: 4999,
    category: "Electronics",
    isWinner: false,
    explanation: "High price + electronics = low COD impulse + BIS risk + high RTO on returns.",
  },
  {
    id: "brush",
    name: "Kitchen cleaning brush set",
    price: 499,
    category: "Home",
    isWinner: true,
    explanation: "Low price, light, solves daily problem — perfect for impulsive COD buyers.",
  },
  {
    id: "hoodie",
    name: "Oversized hoodie (6 sizes)",
    price: 899,
    category: "Fashion",
    isWinner: false,
    explanation: "Size issues drive 30–40% RTO on fashion. Avoid as a beginner.",
  },
  {
    id: "organizer",
    name: "Desk cable organizer",
    price: 349,
    category: "Accessories",
    isWinner: true,
    explanation: "Light, useful, low return rate, easy to ship — strong marketplace SKU.",
  },
  {
    id: "glass",
    name: "Decorative glass vase",
    price: 1299,
    category: "Fragile",
    isWinner: false,
    explanation: "Fragile = breakage in transit + angry customers + RTO losses.",
  },
];

type Props = {
  onComplete?: () => void;
};

export function ProductSwipeGame({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [lastFeedback, setLastFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.5, 1, 1, 1, 0.5]);

  const card = CARDS[index];

  function handleSwipe(direction: "left" | "right") {
    if (!card) return;
    const pickedWinner = direction === "right";
    const correct = pickedWinner === card.isWinner;
    if (correct) setScore((s) => s + 1);
    setLastFeedback(
      correct
        ? `Correct! ${card.explanation}`
        : `Not quite. ${card.explanation}`,
    );

    setTimeout(() => {
      if (index >= CARDS.length - 1) {
        setFinished(true);
      } else {
        setIndex((i) => i + 1);
        setLastFeedback(null);
        x.set(0);
      }
    }, 1200);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.x > 100) handleSwipe("right");
    else if (info.offset.x < -100) handleSwipe("left");
  }

  if (finished) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-400/30 bg-emerald-400/5 p-6 text-center">
        <p className="text-lg font-semibold text-emerald-200">Score: {score}/{CARDS.length}</p>
        <p className="text-muted mt-2 text-sm">
          You are learning to pick low-RTO, high-impulse products for Indian COD buyers.
        </p>
        {onComplete ? (
          <button type="button" onClick={onComplete} className="btn-primary mt-4 rounded-md px-4 py-2 text-sm font-semibold">
            Continue to margin check
          </button>
        ) : null}
      </div>
    );
  }

  if (!card) return null;

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-slate-200">
        Swipe right if this is a good beginner product for India COD. Left if it is a trap.
      </p>

      <motion.div
        style={{ x, rotate, opacity }}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        className="glass-panel cursor-grab touch-none rounded-xl border border-amber-300/30 p-6 active:cursor-grabbing"
      >
        <p className="text-xs uppercase tracking-wide text-amber-200">{card.category}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-100">{card.name}</h3>
        <p className="text-muted mt-1 text-sm">₹{card.price}</p>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => handleSwipe("left")}
          className="btn-ghost rounded-md px-4 py-2 text-sm font-semibold"
        >
          Skip (trap)
        </button>
        <button
          type="button"
          onClick={() => handleSwipe("right")}
          className="btn-emerald rounded-md px-4 py-2 text-sm font-semibold"
        >
          Winner
        </button>
      </div>

      {lastFeedback ? <p className="text-sm text-amber-200">{lastFeedback}</p> : null}
      <p className="text-muted text-center text-xs">
        {index + 1} / {CARDS.length}
      </p>
    </div>
  );
}
