"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, RotateCcw, CheckCircle2 } from "lucide-react";
import type { DecisionTree, DecisionNode } from "@/lib/decision-trees-data";

function useReducedMotion() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

type HistoryEntry = { nodeId: string };

export function DecisionWizard({ tree }: { tree: DecisionTree }) {
  const [currentNodeId, setCurrentNodeId] = useState(tree.startNodeId);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [direction, setDirection] = useState<1 | -1>(1);

  const reduced = useReducedMotion();

  const currentNode = tree.nodes.find(
    (n) => n.id === currentNodeId
  ) as DecisionNode;

  // Longest path from the start node across ALL options (trees are tiny).
  const estimatedSteps = useMemo(() => {
    const depthFrom = (id: string | null): number => {
      const node = id ? tree.nodes.find((n) => n.id === id) : undefined;
      if (!node) return 0;
      return 1 + Math.max(0, ...node.options.map((o) => depthFrom(o.nextId)));
    };
    return depthFrom(tree.startNodeId);
  }, [tree]);

  const handleChoice = useCallback(
    (option: { label: string; nextId: string | null; recommendation?: string }) => {
      setDirection(1);
      setHistory((h) => [...h, { nodeId: currentNodeId }]);

      if (option.nextId === null) {
        setRecommendation(option.recommendation ?? "No specific recommendation available.");
      } else {
        setCurrentNodeId(option.nextId);
      }
    },
    [currentNodeId]
  );

  const handleBack = useCallback(() => {
    if (history.length === 0) return;
    setDirection(-1);
    const prev = history[history.length - 1];
    setHistory((h) => h.slice(0, -1));
    setRecommendation(null);
    setCurrentNodeId(prev.nodeId);
  }, [history]);

  const handleRestart = useCallback(() => {
    setDirection(-1);
    setHistory([]);
    setRecommendation(null);
    setCurrentNodeId(tree.startNodeId);
  }, [tree.startNodeId]);

  const stepNumber = history.length + 1;

  const variants = reduced
    ? { enter: { opacity: 0 }, center: { opacity: 1 }, exit: { opacity: 0 } }
    : {
        enter: (d: number) => ({ x: d > 0 ? 80 : -80, opacity: 0 }),
        center: { x: 0, opacity: 1 },
        exit: (d: number) => ({ x: d > 0 ? -80 : 80, opacity: 0 }),
      };

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="text-muted text-xs font-medium">
          {recommendation ? "Recommendation" : `Step ${stepNumber} of ~${estimatedSteps}`}
        </div>
        <div className="progress-track h-1.5 flex-1 rounded-full">
          <div
            className="progress-fill h-full rounded-full transition-all duration-300"
            style={{ width: `${recommendation ? 100 : Math.min(100, (stepNumber / estimatedSteps) * 100)}%` }}
          />
        </div>
      </div>

      {/* Main content */}
      <AnimatePresence mode="wait" custom={direction}>
        {recommendation ? (
          <motion.div
            key="result"
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Recommendation */}
            <div className="rounded-xl border border-[var(--success)]/40 bg-[var(--success)]/10 p-6">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[var(--success)]" />
                <div>
                  <h3 className="font-display text-base font-semibold text-[var(--success)]">
                    Our Recommendation
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[var(--body-text)]">
                    {recommendation}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex gap-3">
              <button
                onClick={handleBack}
                className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Go back
              </button>
              <button
                onClick={handleRestart}
                className="btn-ghost inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm"
              >
                <RotateCcw className="h-4 w-4" />
                Start over
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key={currentNodeId}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Question */}
            <div className="mb-6">
              <h2 className="font-display text-xl font-semibold text-white">
                {currentNode.question}
              </h2>
              {currentNode.context && (
                <p className="text-muted mt-2 text-sm leading-relaxed">
                  {currentNode.context}
                </p>
              )}
            </div>

            {/* Option cards */}
            <div className="grid gap-3">
              {currentNode.options.map((option) => (
                <button
                  key={option.label}
                  onClick={() => handleChoice(option)}
                  className="glass-panel group rounded-xl border p-5 text-left transition-all hover:border-white/[0.16] hover:bg-white/[0.04]"
                >
                  <span className="font-display text-sm font-semibold text-white group-hover:text-white transition-colors">
                    {option.label}
                  </span>
                </button>
              ))}
            </div>

            {/* Back button */}
            {history.length > 0 && (
              <button
                onClick={handleBack}
                className="btn-ghost mt-4 inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
