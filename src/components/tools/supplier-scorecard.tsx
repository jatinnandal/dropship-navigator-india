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

  const verdictColor =
    result.overallVerdict === "recommended"
      ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
      : result.overallVerdict === "proceed-with-caution"
        ? "text-amber-400 border-amber-500/40 bg-amber-500/10"
        : "text-rose-400 border-rose-500/40 bg-rose-500/10";

  const verdictLabel =
    result.overallVerdict === "recommended"
      ? "Recommended"
      : result.overallVerdict === "proceed-with-caution"
        ? "Proceed with Caution"
        : "Avoid This Supplier";

  const scoreColor =
    result.totalScore >= 70
      ? "text-emerald-400"
      : result.totalScore >= 40
        ? "text-amber-400"
        : "text-rose-400";

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      {/* ── Main scoring area ── */}
      <div className="space-y-6">
        {/* Supplier name input */}
        <div className="glass-panel grain rounded-xl border p-4">
          <label className="text-sm font-medium text-slate-300">
            Supplier Name
          </label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="e.g., Rajesh Textiles, Surat"
            className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-900/50 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
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
                <div className="inline-flex rounded-lg border border-slate-700 bg-slate-800/50 p-2">
                  <Icon className="h-5 w-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-display text-base font-semibold text-slate-100">
                    {CATEGORY_META[cat].label}
                  </h2>
                  {catResult && (
                    <span
                      className={`text-xs font-medium ${
                        catResult.verdict === "pass"
                          ? "text-emerald-400"
                          : catResult.verdict === "caution"
                            ? "text-amber-400"
                            : "text-rose-400"
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
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/5 p-5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-rose-400 mt-0.5 shrink-0" />
            <div className="space-y-2 text-sm text-slate-300">
              <p className="font-medium text-rose-300">Critical Context</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>
                  IndiaMART has been on the USTR &quot;Notorious Markets&quot; list since 2018
                </li>
                <li>
                  60-70% of early seller failures trace back to supplier issues
                </li>
                <li className="font-medium text-slate-100">
                  ALWAYS order samples before committing to bulk — no exceptions
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Final verdict (mobile/bottom) */}
        <div className="lg:hidden">
          <VerdictCard
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
    <div className="rounded-lg border border-slate-800 bg-slate-900/30 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-200">
            {criterion.question}
          </p>
          <div className="mt-1 flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`h-1.5 w-1.5 rounded-full ${
                  i < criterion.weight ? "bg-amber-400" : "bg-slate-700"
                }`}
              />
            ))}
            <span className="ml-1.5 text-[10px] text-slate-500">
              weight {criterion.weight}
            </span>
          </div>
        </div>
        <button
          onClick={() => onToggle(criterion.id)}
          className="shrink-0 rounded p-1 text-slate-500 hover:text-slate-300 transition-colors"
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
                    ? "border-emerald-500/50 bg-emerald-500/20 text-emerald-300"
                    : opt.value >= 5
                      ? "border-amber-500/50 bg-amber-500/20 text-amber-300"
                      : "border-rose-500/50 bg-rose-500/20 text-rose-300"
                  : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
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
            <div className="mt-3 space-y-2 border-t border-slate-800 pt-3">
              {criterion.redFlags.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-rose-400 font-medium mb-1">
                    Red Flags
                  </p>
                  <ul className="space-y-0.5">
                    {criterion.redFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-xs text-rose-300/80 flex items-start gap-1.5"
                      >
                        <span className="mt-1.5 h-1 w-1 rounded-full bg-rose-400 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {criterion.greenFlags.length > 0 && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-emerald-400 font-medium mb-1">
                    Green Flags
                  </p>
                  <ul className="space-y-0.5">
                    {criterion.greenFlags.map((flag, i) => (
                      <li
                        key={i}
                        className="text-xs text-emerald-300/80 flex items-start gap-1.5"
                      >
                        <CheckCircle2 className="mt-0.5 h-3 w-3 text-emerald-400 shrink-0" />
                        {flag}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex items-start gap-1.5 pt-1">
                <Info className="h-3 w-3 text-cyan-400 mt-0.5 shrink-0" />
                <p className="text-xs text-cyan-300/80">{criterion.tip}</p>
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
}: {
  result: ReturnType<typeof calculateSupplierScore>;
  verdictColor: string;
  verdictLabel: string;
  scoreColor: string;
  supplierName: string;
  onSave: () => void;
  saved: boolean;
}) {
  return (
    <div className="glass-panel grain rounded-xl border p-5 space-y-4">
      {/* Overall score */}
      <div className="text-center">
        <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Overall Score
        </p>
        <motion.p
          className={`font-display text-4xl font-bold ${scoreColor}`}
          key={result.totalScore}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
        >
          {result.totalScore}
          <span className="text-lg text-slate-500">/100</span>
        </motion.p>
      </div>

      {/* Verdict badge */}
      <div className={`rounded-lg border p-3 text-center ${verdictColor}`}>
        <p className="text-sm font-semibold">{verdictLabel}</p>
      </div>

      {/* Per-category bars */}
      <div className="space-y-2">
        <p className="text-xs text-slate-500 uppercase tracking-wider">
          By Category
        </p>
        {result.categories.map((cat) => {
          const barColor =
            cat.verdict === "pass"
              ? "bg-emerald-400"
              : cat.verdict === "caution"
                ? "bg-amber-400"
                : "bg-rose-400";
          return (
            <div key={cat.category} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-24 truncate capitalize">
                {cat.category}
              </span>
              <div className="flex-1 h-2 rounded-full bg-slate-800">
                <motion.div
                  className={`h-2 rounded-full ${barColor}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${(cat.score / 10) * 100}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>
              <span className="text-xs text-slate-500 w-8 text-right">
                {cat.score.toFixed(1)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Critical red flags */}
      {result.criticalRedFlags.length > 0 && (
        <div className="rounded-lg border border-rose-500/30 bg-rose-500/5 p-3">
          <p className="text-xs font-medium text-rose-400 mb-1.5">
            Critical Concerns ({result.criticalRedFlags.length})
          </p>
          <ul className="space-y-1">
            {result.criticalRedFlags.map((flag, i) => (
              <li key={i} className="text-xs text-rose-300/80 flex items-start gap-1.5">
                <AlertTriangle className="h-3 w-3 mt-0.5 shrink-0 text-rose-400" />
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
