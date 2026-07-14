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
    explanation: "Low price, light, solves daily problem - perfect for impulsive COD buyers.",
  },
  {
    id: "hoodie",
    name: "Oversized hoodie (6 sizes)",
    price: 899,
    category: "Fashion",
    isWinner: false,
    explanation: "Six sizes means size and fit returns, which run high on fashion. Hard for a beginner to win.",
  },
  {
    id: "organizer",
    name: "Desk cable organizer",
    price: 349,
    category: "Accessories",
    isWinner: true,
    explanation: "Light, useful, low return rate, easy to ship - strong marketplace SKU.",
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

type Feedback = { correct: boolean; pickedWinner: boolean; explanation: string };

type Props = {
  onComplete?: () => void;
};

export function ProductSwipeGame({ onComplete }: Props) {
  const [index, setIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-12, 12]);
  const opacity = useTransform(x, [-200, -80, 0, 80, 200], [0.5, 1, 1, 1, 0.5]);

  const card = CARDS[index];
  const isLastCard = index >= CARDS.length - 1;

  function choose(pickedWinner: boolean) {
    if (!card || feedback) return; // already answered this card - wait for Next
    const correct = pickedWinner === card.isWinner;
    if (correct) setScore((s) => s + 1);
    setFeedback({ correct, pickedWinner, explanation: card.explanation });
    // Snap the card back to centre; feedback stays until the user taps Next.
    x.set(0);
  }

  function next() {
    if (isLastCard) {
      setFinished(true);
      return;
    }
    setIndex((i) => i + 1);
    setFeedback(null);
    x.set(0);
  }

  function onDragEnd(_: unknown, info: PanInfo) {
    if (feedback) return;
    if (info.offset.x > 100) choose(true);
    else if (info.offset.x < -100) choose(false);
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
        Tap <span className="font-semibold text-emerald-300">Good pick</span> if this is a smart
        beginner product for India COD, or <span className="font-semibold text-slate-300">Trap</span> if
        it is one to avoid. On a phone you can also swipe the card right (good) or left (trap).
      </p>

      <motion.div
        style={{ x, rotate, opacity }}
        drag={feedback ? false : "x"}
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={onDragEnd}
        className="glass-panel touch-none rounded-xl border border-amber-300/30 p-6 data-[locked=false]:cursor-grab data-[locked=false]:active:cursor-grabbing"
        data-locked={feedback ? "true" : "false"}
      >
        <p className="text-xs uppercase tracking-wide text-amber-200">{card.category}</p>
        <h3 className="mt-2 text-xl font-bold text-slate-100">{card.name}</h3>
        <p className="text-muted mt-1 text-sm">₹{card.price}</p>
      </motion.div>

      <div className="flex justify-center gap-4">
        <button
          type="button"
          onClick={() => choose(false)}
          disabled={!!feedback}
          className="btn-ghost rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Trap - skip it
        </button>
        <button
          type="button"
          onClick={() => choose(true)}
          disabled={!!feedback}
          className="btn-emerald rounded-md px-5 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Good pick
        </button>
      </div>

      {feedback ? (
        <div
          className={`rounded-lg border p-4 ${
            feedback.correct
              ? "border-emerald-400/40 bg-emerald-400/10"
              : "border-amber-400/40 bg-amber-400/10"
          }`}
        >
          <p className={`text-sm font-semibold ${feedback.correct ? "text-emerald-200" : "text-amber-200"}`}>
            {feedback.correct ? "Correct" : "Not quite"} - this one is a{" "}
            {card.isWinner ? "good pick" : "trap"}.
          </p>
          <p className="text-muted mt-1 text-sm leading-6">{feedback.explanation}</p>
          <button
            type="button"
            onClick={next}
            className="btn-primary mt-3 rounded-md px-4 py-2 text-sm font-semibold"
          >
            {isLastCard ? "See my score" : "Next product"}
          </button>
        </div>
      ) : null}

      <p className="text-muted text-center text-xs">
        {index + 1} / {CARDS.length}
      </p>
    </div>
  );
}
