"use client";

import { useState, useCallback, useRef } from "react";
import { ShieldCheck, ShieldAlert, RotateCcw, Trophy, ChevronRight, Flame, X } from "lucide-react";
import { SOURCING_CARDS, type SupplierCard, type CardVerdict } from "@/lib/sourcing-cards";

type GamePhase = "menu" | "playing" | "reveal" | "done";

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function SourcingGame() {
  const [phase, setPhase] = useState<GamePhase>("menu");
  const [deck, setDeck] = useState<SupplierCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [lastAnswer, setLastAnswer] = useState<{ correct: boolean; card: SupplierCard } | null>(null);
  const [answers, setAnswers] = useState<{ card: SupplierCard; correct: boolean; chose: CardVerdict }[]>([]);
  const cardRef = useRef<HTMLDivElement>(null);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | null>(null);

  function startGame() {
    const shuffled = shuffleArray(SOURCING_CARDS);
    setDeck(shuffled);
    setCurrentIndex(0);
    setScore(0);
    setStreak(0);
    setBestStreak(0);
    setLastAnswer(null);
    setAnswers([]);
    setPhase("playing");
  }

  const handleSwipe = useCallback(
    (choice: CardVerdict) => {
      const card = deck[currentIndex];
      const correct = choice === card.verdict;

      setSwipeDir(choice === "legit" ? "right" : "left");
      setTimeout(() => setSwipeDir(null), 300);

      const newStreak = correct ? streak + 1 : 0;
      const newBest = Math.max(bestStreak, newStreak);

      setScore((s) => s + (correct ? 1 : 0));
      setStreak(newStreak);
      setBestStreak(newBest);
      setLastAnswer({ correct, card });
      setAnswers((prev) => [...prev, { card, correct, chose: choice }]);
      setPhase("reveal");
    },
    [deck, currentIndex, streak, bestStreak],
  );

  function nextCard() {
    if (currentIndex + 1 >= deck.length) {
      setPhase("done");
    } else {
      setCurrentIndex((i) => i + 1);
      setLastAnswer(null);
      setPhase("playing");
    }
  }

  if (phase === "menu") {
    return <MenuScreen onStart={startGame} />;
  }

  if (phase === "done") {
    return (
      <ResultsScreen
        score={score}
        total={deck.length}
        bestStreak={bestStreak}
        answers={answers}
        onReplay={startGame}
      />
    );
  }

  const card = deck[currentIndex];

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-1.5 flex-1 rounded-full bg-white/[0.03] overflow-hidden">
          <div
            className="h-full rounded-full bg-white/40 transition-all duration-300"
            style={{ width: `${((currentIndex + (phase === "reveal" ? 1 : 0)) / deck.length) * 100}%` }}
          />
        </div>
        <span className="font-mono text-xs text-[var(--text-faint)]">
          {currentIndex + 1}/{deck.length}
        </span>
      </div>

      {/* Stats row */}
      <div className="flex gap-3">
        <div className="flex items-center gap-1.5 rounded-md border border-white/10 px-3 py-1.5">
          <ShieldCheck className="h-3.5 w-3.5 text-[var(--success)]" />
          <span className="font-mono text-xs text-[var(--body-text)]">{score}</span>
        </div>
        {streak > 1 && (
          <div className="flex items-center gap-1.5 rounded-md border border-white/[0.16] bg-white/[0.04] px-3 py-1.5">
            <Flame className="h-3.5 w-3.5 text-white" />
            <span className="font-mono text-xs text-white">{streak} streak</span>
          </div>
        )}
      </div>

      {/* Card */}
      <div
        ref={cardRef}
        className={`glass-panel grain rounded-xl p-5 sm:p-6 transition-transform duration-200 ${
          swipeDir === "left" ? "-translate-x-4 opacity-80" : swipeDir === "right" ? "translate-x-4 opacity-80" : ""
        }`}
      >
        {/* Supplier header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-base font-bold text-white">
              {card.supplierName}
            </h3>
            <div className="mt-1 flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-[var(--text-faint)]">
                {card.platform}
              </span>
              <span className="text-[var(--text-faintest)]">·</span>
              <span className="text-xs text-[var(--muted)]">{card.product}</span>
            </div>
          </div>
        </div>

        {/* Chat snippet */}
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-4">
          <p className="text-sm leading-relaxed text-[var(--body-text)] italic">
            &ldquo;{card.chatSnippet}&rdquo;
          </p>
        </div>

        {phase === "playing" && (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => handleSwipe("trap")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 py-3 text-sm font-semibold text-[var(--danger)] transition-colors hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/40"
            >
              <ShieldAlert className="h-4 w-4" />
              Trap
            </button>
            <button
              type="button"
              onClick={() => handleSwipe("legit")}
              className="flex items-center justify-center gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 py-3 text-sm font-semibold text-[var(--success)] transition-colors hover:bg-[var(--success)]/10 hover:border-[var(--success)]/40"
            >
              <ShieldCheck className="h-4 w-4" />
              Legit
            </button>
          </div>
        )}

        {phase === "reveal" && lastAnswer && (
          <div className="mt-5 space-y-3">
            {/* Result banner */}
            <div
              className={`rounded-lg border p-3 text-center text-sm font-semibold ${
                lastAnswer.correct
                  ? "border-[var(--success)]/30 bg-[var(--success)]/10 text-[var(--success)]"
                  : "border-[var(--danger)]/30 bg-[var(--danger)]/10 text-[var(--danger)]"
              }`}
            >
              {lastAnswer.correct ? "Correct!" : `Wrong - this was ${lastAnswer.card.verdict === "legit" ? "a legit supplier" : "a trap"}`}
            </div>

            {/* Explanation */}
            <p className="text-sm leading-relaxed text-[var(--muted)]">
              {lastAnswer.card.explanation}
            </p>

            {/* Flags */}
            <div className="flex flex-wrap gap-2">
              {lastAnswer.card.redFlags.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--danger)]/20 bg-[var(--danger)]/10 px-2.5 py-1 text-[11px] text-[var(--danger)]"
                >
                  <X className="h-3 w-3" />
                  {f}
                </span>
              ))}
              {lastAnswer.card.greenFlags.map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1 rounded-full border border-[var(--success)]/20 bg-[var(--success)]/10 px-2.5 py-1 text-[11px] text-[var(--success)]"
                >
                  <ShieldCheck className="h-3 w-3" />
                  {f}
                </span>
              ))}
            </div>

            <button
              type="button"
              onClick={nextCard}
              className="btn-primary mt-2 flex w-full items-center justify-center gap-2 min-h-[44px] rounded-md px-4 py-2.5 text-sm font-medium"
            >
              {currentIndex + 1 >= deck.length ? "See Results" : "Next Card"}
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function MenuScreen({ onStart }: { onStart: () => void }) {
  return (
    <div className="mx-auto max-w-md space-y-6 text-center">
      <div className="glass-panel grain rounded-xl p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
          <ShieldAlert className="h-8 w-8 text-white" />
        </div>

        <h2 className="font-display mt-5 text-xl font-bold text-white">
          Spot the Trap
        </h2>
        <p className="text-muted mt-2 text-sm leading-relaxed">
          20 real supplier conversations from IndiaMART, Alibaba, and more.
          Read the chat, decide: legit supplier or trap? Build a streak to prove your eye.
        </p>

        <div className="mt-5 grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-white/10 p-3">
            <p className="font-mono text-lg font-bold text-white">20</p>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Cards</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="font-mono text-lg font-bold text-white">~5</p>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Minutes</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="font-mono text-lg font-bold text-[var(--success)]">10</p>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Legit</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onStart}
          className="btn-primary mt-6 flex w-full items-center justify-center gap-2 min-h-[48px] rounded-lg px-6 py-3 text-base font-semibold"
        >
          Start Game
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}

function ResultsScreen({
  score,
  total,
  bestStreak,
  answers,
  onReplay,
}: {
  score: number;
  total: number;
  bestStreak: number;
  answers: { card: SupplierCard; correct: boolean; chose: CardVerdict }[];
  onReplay: () => void;
}) {
  const pct = Math.round((score / total) * 100);
  const wrong = answers.filter((a) => !a.correct);

  let verdict: string;
  let verdictColor: string;
  if (pct >= 90) {
    verdict = "Sourcing Expert";
    verdictColor = "text-[var(--success)]";
  } else if (pct >= 70) {
    verdict = "Sharp Eye";
    verdictColor = "text-white";
  } else if (pct >= 50) {
    verdict = "Learning Fast";
    verdictColor = "text-white";
  } else {
    verdict = "Needs Practice";
    verdictColor = "text-[var(--danger)]";
  }

  return (
    <div className="space-y-6">
      {/* Hero result */}
      <div className="glass-panel grain rounded-xl p-6 sm:p-8 text-center">
        <Trophy className="mx-auto h-10 w-10 text-white" />
        <p className={`mt-3 text-2xl font-bold ${verdictColor}`}>{verdict}</p>
        <p className="mt-2 text-4xl font-bold text-white tabular-nums">
          {score}/{total}
        </p>
        <p className="text-sm text-[var(--text-faint)] mt-1">{pct}% accuracy</p>

        <div className="mt-5 grid grid-cols-2 gap-3 max-w-xs mx-auto">
          <div className="rounded-lg border border-white/10 p-3">
            <p className="font-mono text-lg font-bold text-white">{bestStreak}</p>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Best streak</p>
          </div>
          <div className="rounded-lg border border-white/10 p-3">
            <p className="font-mono text-lg font-bold text-[var(--danger)]">{total - score}</p>
            <p className="text-[10px] text-[var(--text-faint)] uppercase tracking-wider">Missed</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onReplay}
          className="btn-primary mt-6 inline-flex items-center gap-2 min-h-[44px] rounded-md px-6 py-2.5 text-sm font-medium"
        >
          <RotateCcw className="h-4 w-4" />
          Play Again
        </button>
      </div>

      {/* Mistakes review */}
      {wrong.length > 0 && (
        <div className="glass-panel grain rounded-xl p-5 sm:p-6">
          <h3 className="font-display text-sm font-bold text-[var(--body-text)]">
            Review Your Mistakes
          </h3>
          <div className="mt-3 space-y-3">
            {wrong.map(({ card, chose }) => (
              <div key={card.id} className="rounded-lg border border-white/10 p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-[var(--body-text)]">{card.supplierName}</p>
                  <div className="flex gap-2">
                    <span className="font-mono text-[10px] text-[var(--danger)] uppercase">
                      you: {chose}
                    </span>
                    <span className="font-mono text-[10px] text-[var(--success)] uppercase">
                      was: {card.verdict}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-xs text-[var(--muted)] leading-relaxed">
                  {card.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
