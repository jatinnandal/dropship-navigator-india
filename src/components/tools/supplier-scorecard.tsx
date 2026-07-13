"use client";

import { useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  Award,
  Clock,
  BadgeDollarSign,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Save,
  Check,
  Info,
} from "lucide-react";
import {
  SCORECARD_CRITERIA,
  CATEGORY_META,
  calculateSupplierScore,
  type ScoreCategory,
  type ScorecardCriterion,
} from "@/lib/supplier-scorecard-data";

/* ── constants ── */
const SCORE_OPTIONS = [
  { value: 0, label: "Fail" },
  { value: 2.5, label: "Poor" },
  { value: 5, label: "OK" },
  { value: 7.5, label: "Good" },
  { value: 10, label: "Excellent" },
] as const;

const CATEGORY_ICONS: Record<ScoreCategory, typeof ShieldCheck> = {
  legitimacy: ShieldCheck,
  quality: Award,
  reliability: Clock,
  pricing: BadgeDollarSign,
  communication: MessageSquare,
};

const CATEGORY_ORDER: ScoreCategory[] = [
  "legitimacy",
  "quality",
  "reliability",
  "pricing",
  "communication",
];

const LS_KEY = "dni-supplier-scorecards";

/* ── component ── */
export function SupplierScorecard() {
  const [supplierName, setSupplierName] = useState("");
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState(false);

  const setScore = useCallback((id: string, value: number) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const result = useMemo(() => calculateSupplierScore(answers), [answers]);
  const answeredCount = Object.keys(answers).length;

  const handleSave = () => {
    if (!supplierName.trim()) return;
    const existing = JSON.parse(localStorage.getItem(LS_KEY) || "[]");
    existing.push({
      name: supplierName,
      answers,
      result,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem(LS_KEY, JSON.stringify(existing));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // Neutral until the user has actually scored something - an unanswered
  // scorecard is not an "Avoid This Supplier" verdict.
  const verdictColor =
    answeredCount === 0
      ? "text-[var(--muted)] border-white/[0.14] bg-white/[0.03]"
      : result.overallVerdict === "recommended"
        ? "text-[var(--success)] border-[var(--success)]/40 bg-[var(--success)]/10"
        : result.overallVerdict === "proceed-with-caution"
          ? "text-white border-white/[0.16] bg-white/[0.06]"
          : "text-[var(--danger)] border-[var(--danger)]/40 bg-[var(--danger)]/10";

  const verdictLabel =
    answeredCount === 0
      ? "Score at least one criterion to get a verdict"
      : result.overallVerdict === "recommended"
        ? "Recommended"
        : result.overallVerdict === "proceed-with-caution"
          ? "Proceed with Caution"
          : "Avoid This Supplier";

  const scoreColor =
    answeredCount === 0
      ? "text-[var(--text-faint)]"
      : result.totalScore >= 70
        ? "text-[var(--success)]"
        : result.totalScore >= 40
          ? "text-white"
          : "text-[var(--danger)]";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ── Main scoring area ── */}
      <div className="space-y-6">
        {/* Supplier name input */}
        <div className="glass-panel grain rounded-xl border p-4">
          <label className="text-sm font-medium text-[var(--body-text)]">
            Supplier Name
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="e.g., Rajesh Textiles, Surat"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[var(--text-faint)] focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/25"
          />
        </div>

        {/* Category sections */}
        {CATEGORY_ORDER.map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          const criteria = SCORECARD_CRITERIA.filter((c) => c.category === cat);
          const catResult = result.categories.find((c) => c.category === cat);

          return (
            <div key={cat} className="glass-panel grain rounded-xl border p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="inline-flex rounded-lg border border-white/10 bg-white/[0.03] p-2">
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-white">
                    {CATEGORY_META[cat].label}
                  </h2>
                  {catResult && (
                    <span
                      className={`text-xs font-medium ${
                        catResult.verdict === "pass"
                          ? "text-[var(--success)]"
                          : catResult.verdict === "caution"
                            ? "text-white"
                            : "text-[var(--danger)]"
                      }`}
                    >
                      {catResult.score.toFixed(1)}/10
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                {criteria.map((criterion) => (
                  <CriterionRow
                    key={criterion.id}
                    criterion={criterion}
                    score={answers[criterion.id]}
                    isExpanded={expanded[criterion.id] || false}
                    onScore={setScore}
                    onToggle={toggleExpand}
                  />
                ))}
              </div>
            </div>
          );
        })}

        {/* Key insight box */}
        <div className="rounded-xl border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-[var(--danger)] mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm text-[var(--body-text)]">
              <p className="font-medium text-[var(--danger)]">Critical Context</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  IndiaMART has been on the USTR &quot;Notorious Markets&quot; list since 2018
                </li>
                <li>
                  Supplier issues are among the most common reasons early sellers fail
                </li>
                <li className="font-medium text-white">
                  ALWAYS order samples before committing to bulk - no exceptions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final verdict (mobile/bottom) */}
        <div className="lg:hidden">
          <VerdictCard
            answeredCount={answeredCount}
            result={result}
            verdictColor={verdictColor}
            verdictLabel={verdictLabel}
            scoreColor={scoreColor}
            supplierName={supplierName}
            onSave={handleSave}
            saved={saved}
          />
        </div>
      </div>

      {/* ── Sticky sidebar (desktop) ── */}
      <div className="hidden lg:block">
        <div className="sticky top-6 space-y-4">
          <VerdictCard
            answeredCount={answeredCount}
            result={result}
            verdictColor={verdictColor}
            verdictLabel={verdictLabel}
            scoreColor={scoreColor}
            supplierName={supplierName}
            onSave={handleSave}
            saved={saved}
          />
        </div>
      </div>
    </div>
  );
}

/* ── Criterion Row ── */
function CriterionRow({
  criterion,
  score,
  isExpanded,
  onScore,
  onToggle,
}: {
  criterion: ScorecardCriterion;
  score: number | undefined;
  isExpanded: boolean;
  onScore: (id: string, value: number) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-[var(--body-text)]">
            {criterion.question}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i < criterion.weight ? "bg-white" : "bg-white/[0.06]"
                }`}
              />
            ))}
            <span className="ml-1.5 text-[10px] text-[var(--text-faint)]">
              weight {criterion.weight}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(criterion.id)}
          className="shrink-0 rounded p-1 text-[var(--text-faint)] hover:text-[var(--body-text)] transition-colors"
          aria-label="Toggle details"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Score selector */}
      <div className="mt-3 flex flex-wrap gap-1.5">
        {SCORE_OPTIONS.map((opt) => {
          const isSelected = score === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => onScore(criterion.id, opt.value)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
                isSelected
                  ? opt.value >= 7.5
                    ? "border-[var(--success)]/40 bg-[var(--success)]/20 text-[var(--success)]"
                    : opt.value >= 5
                      ? "border-white/[0.16] bg-white/[0.06] text-white"
                      : "border-[var(--danger)]/40 bg-[var(--danger)]/20 text-[var(--danger)]"
                  : "border-white/10 bg-white/[0.03] text-[var(--muted)] hover:border-white/10 hover:text-[var(--body-text)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {/* Expanded flags */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
              {criterion.redFlags.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--danger)] font-medium mb-1">
                    Red Flags
                  </p>
                  <ul className="space-y-0.5">
                    {criterion.redFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-xs text-[var(--danger)] flex items-start gap-1.5"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-[var(--danger)] shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {criterion.greenFlags.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-[var(--success)] font-medium mb-1">
                    Green Flags
                  </p>
                  <ul className="space-y-0.5">
                    {criterion.greenFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-xs text-[var(--success)]/80 flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 text-[var(--success)] shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-start gap-1.5 pt-1">
                <Info className="h-3 w-3 text-[var(--muted)] mt-0.5 shrink-0" />
                <p className="text-xs text-[var(--muted)]">{criterion.tip}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Verdict Card (shared sidebar/mobile) ── */
function VerdictCard({
  result,
  verdictColor,
  verdictLabel,
  scoreColor,
  supplierName,
  onSave,
  saved,
  answeredCount = 1,
}: {
  result: ReturnType<typeof calculateSupplierScore>;
  verdictColor: string;
  verdictLabel: string;
  scoreColor: string;
  supplierName: string;
  onSave: () => void;
  saved: boolean;
  answeredCount?: number;
}) {
  return (
    <div className="glass-panel grain rounded-xl border p-5 space-y-4">
      {/* Overall score */}
      <div className="text-center">
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider mb-1">
          Overall Score
        </p>
        <motion.p
          className={`font-display text-4xl font-bold ${scoreColor}`}
          key={result.totalScore}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {answeredCount === 0 ? "-" : result.totalScore}
          <span className="text-lg text-[var(--text-faint)]">/100</span>
        </motion.p>
      </div>

      {/* Verdict badge */}
      <div className={`rounded-lg border p-3 text-center ${verdictColor}`}>
        <p className="text-sm font-semibold">{verdictLabel}</p>
      </div>

      {/* Per-category bars */}
      <div className="space-y-2">
        <p className="text-xs text-[var(--text-faint)] uppercase tracking-wider">
          By Category
        </p>
        {result.categories.map((cat) => {
          const barColor =
            cat.verdict === "pass"
              ? "bg-[var(--success)]"
              : cat.verdict === "caution"
                ? "bg-white"
                : "bg-[var(--danger)]";
          return (
            <div key={cat.category} className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted)] w-24 truncate capitalize">
                {cat.category}
              </span>
              <div className="flex-1 h-2 rounded-full bg-white/[0.03]">
                <motion.div
                  className={`h-2 rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.score / 10) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-[var(--text-faint)] w-8 text-right">
                {cat.score.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Critical red flags */}
      {result.criticalRedFlags.length > 0 && (
        <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3">
          <p className="text-xs font-medium text-[var(--danger)] mb-1.5">
            Critical Concerns ({result.criticalRedFlags.length})
          </p>
          <ul className="space-y-1">
            {result.criticalRedFlags.map((flag, i) => (
              <li key={i} className="text-xs text-[var(--danger)] flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-[var(--danger)]" />
                {flag}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Save button */}
      <button
        onClick={onSave}
        disabled={!supplierName.trim() || saved}
        className="btn-primary w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saved ? (
          <>
            <Check className="h-4 w-4" /> Saved
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Save Scorecard
          </>
        )}
      </button>
    </div>
  );
}
