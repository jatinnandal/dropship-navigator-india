"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Save,
  Check,
  ShieldAlert,
  ListChecks,
  Trash2,
} from "lucide-react";
import {
  SCORECARD_CRITERIA,
  STAGE_META,
  STAGE_ORDER,
  VERDICT_META,
  evaluateSupplier,
  type CheckStage,
  type ScorecardCriterion,
  type SupplierEvaluation,
  type OptionStatus,
} from "@/lib/supplier-scorecard-data";

const LS_KEY = "dni-supplier-scorecards-v2";

type SavedSupplier = {
  name: string;
  answers: Record<string, string>;
  verdict: SupplierEvaluation["verdict"];
  criticalCleared: number;
  criticalTotal: number;
  answeredCount: number;
  totalCount: number;
  savedAt: string;
};

function optionClass(status: OptionStatus, selected: boolean): string {
  if (!selected) {
    return "border-white/10 bg-white/[0.03] text-[var(--muted)] hover:border-white/20 hover:text-[var(--body-text)]";
  }
  if (status === "good") return "border-[var(--success)]/45 bg-[var(--success)]/15 text-[var(--success)]";
  if (status === "bad") return "border-[var(--danger)]/45 bg-[var(--danger)]/15 text-[var(--danger)]";
  return "border-white/25 bg-white/[0.08] text-white";
}

const TONE_CLASS = {
  neutral: "border-white/[0.14] bg-white/[0.03] text-[var(--muted)]",
  good: "border-[var(--success)]/40 bg-[var(--success)]/10 text-[var(--success)]",
  warn: "border-white/[0.18] bg-white/[0.06] text-white",
  bad: "border-[var(--danger)]/45 bg-[var(--danger)]/12 text-[var(--danger)]",
} as const;

export function SupplierScorecard() {
  const [supplierName, setSupplierName] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<SavedSupplier[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    // Deferred so the setState lands after commit (matches the codebase's
    // localStorage-hydration pattern and keeps SSR markup stable).
    const t = setTimeout(() => {
      try {
        const raw = localStorage.getItem(LS_KEY);
        if (raw) setSaved(JSON.parse(raw) as SavedSupplier[]);
      } catch {
        // localStorage unavailable - comparison list stays empty
      }
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const setAnswer = useCallback((id: string, value: string) => {
    setAnswers((prev) => {
      // Tapping the selected option again clears it back to "not verified".
      if (prev[id] === value) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: value };
    });
  }, []);

  const toggleExpand = useCallback((id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }, []);

  const evaln = useMemo(() => evaluateSupplier(answers), [answers]);

  const persist = useCallback((list: SavedSupplier[]) => {
    setSaved(list);
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(list));
    } catch {
      // ignore - stays in memory for this session
    }
  }, []);

  const handleSave = useCallback(() => {
    if (!supplierName.trim()) return;
    const entry: SavedSupplier = {
      name: supplierName.trim(),
      answers,
      verdict: evaln.verdict,
      criticalCleared: evaln.criticalCleared,
      criticalTotal: evaln.criticalTotal,
      answeredCount: evaln.answeredCount,
      totalCount: evaln.totalCount,
      savedAt: new Date().toISOString(),
    };
    // Replace an existing card for the same name, else append.
    const rest = saved.filter((s) => s.name.toLowerCase() !== entry.name.toLowerCase());
    persist([...rest, entry].slice(-8));
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }, [supplierName, answers, evaln, saved, persist]);

  const loadSaved = useCallback((s: SavedSupplier) => {
    setSupplierName(s.name);
    setAnswers(s.answers);
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const removeSaved = useCallback(
    (name: string) => persist(saved.filter((s) => s.name !== name)),
    [saved, persist],
  );

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
      {/* ── Checks ── */}
      <div className="space-y-6">
        <div className="glass-panel grain rounded-xl border p-4">
          <label className="text-sm font-medium text-[var(--body-text)]">Supplier name</label>
          <input
            type="text"
            value={supplierName}
            onChange={(e) => setSupplierName(e.target.value)}
            placeholder="e.g. Rajesh Textiles, Surat"
            className="mt-2 w-full rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-white placeholder:text-[var(--text-faint)] focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/25"
          />
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            Work top to bottom - you can only answer the later stages once you&apos;ve talked to
            them and seen a sample. Skipped checks become your to-do list, not a low score.
          </p>
        </div>

        {STAGE_ORDER.map((stage) => (
          <StageSection
            key={stage}
            stage={stage}
            answers={answers}
            expanded={expanded}
            onAnswer={setAnswer}
            onToggle={toggleExpand}
          />
        ))}

        {/* Mobile verdict */}
        <div className="lg:hidden">
          <VerdictCard
            evaln={evaln}
            supplierName={supplierName}
            onSave={handleSave}
            justSaved={justSaved}
          />
        </div>

        {saved.length > 0 && (
          <CompareTable saved={saved} onLoad={loadSaved} onRemove={removeSaved} />
        )}
      </div>

      {/* ── Sticky verdict (desktop) ── */}
      <div className="hidden lg:block">
        <div className="sticky top-6">
          <VerdictCard
            evaln={evaln}
            supplierName={supplierName}
            onSave={handleSave}
            justSaved={justSaved}
          />
        </div>
      </div>
    </div>
  );
}

function StageSection({
  stage,
  answers,
  expanded,
  onAnswer,
  onToggle,
}: {
  stage: CheckStage;
  answers: Record<string, string>;
  expanded: Record<string, boolean>;
  onAnswer: (id: string, value: string) => void;
  onToggle: (id: string) => void;
}) {
  const criteria = SCORECARD_CRITERIA.filter((c) => c.stage === stage);
  const meta = STAGE_META[stage];
  return (
    <div className="glass-panel grain rounded-xl border p-5">
      <div className="mb-4">
        <h2 className="font-display text-base font-semibold text-white">{meta.label}</h2>
        <p className="mt-0.5 text-xs text-[var(--muted)]">{meta.caption}</p>
      </div>
      <div className="space-y-3">
        {criteria.map((c) => (
          <CriterionRow
            key={c.id}
            criterion={c}
            selected={answers[c.id]}
            isExpanded={expanded[c.id] || false}
            onAnswer={onAnswer}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}

function CriterionRow({
  criterion,
  selected,
  isExpanded,
  onAnswer,
  onToggle,
}: {
  criterion: ScorecardCriterion;
  selected: string | undefined;
  isExpanded: boolean;
  onAnswer: (id: string, value: string) => void;
  onToggle: (id: string) => void;
}) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="flex-1 text-sm font-medium text-[var(--body-text)]">
          {criterion.question}
          {criterion.critical && (
            <span className="ml-2 inline-flex items-center gap-1 align-middle text-[10px] font-semibold uppercase tracking-wider text-[var(--danger)]">
              <ShieldAlert className="h-3 w-3" /> must pass
            </span>
          )}
        </p>
        <button
          onClick={() => onToggle(criterion.id)}
          className="shrink-0 rounded p-1 text-[var(--text-faint)] transition-colors hover:text-[var(--body-text)]"
          aria-label="How to check this"
        >
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </button>
      </div>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {criterion.options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onAnswer(criterion.id, opt.value)}
            className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${optionClass(opt.status, selected === opt.value)}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <p className="mt-3 border-t border-white/10 pt-3 text-xs leading-5 text-[var(--muted)]">
              <span className="font-medium text-[var(--body-text)]">How to check: </span>
              {criterion.howToVerify}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function VerdictCard({
  evaln,
  supplierName,
  onSave,
  justSaved,
}: {
  evaln: SupplierEvaluation;
  supplierName: string;
  onSave: () => void;
  justSaved: boolean;
}) {
  const v = VERDICT_META[evaln.verdict];
  return (
    <div className="glass-panel grain space-y-4 rounded-xl border p-5">
      <div className={`rounded-lg border p-4 text-center ${TONE_CLASS[v.tone]}`}>
        <p className="text-base font-semibold">{v.label}</p>
        <p className="mt-1 text-xs leading-5 opacity-90">{v.blurb}</p>
      </div>

      {/* Progress: checks done + critical cleared */}
      <div className="grid grid-cols-2 gap-2 text-center">
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
          <p className="text-lg font-semibold text-white">
            {evaln.answeredCount}
            <span className="text-sm text-[var(--text-faint)]">/{evaln.totalCount}</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">checks done</p>
        </div>
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-2.5">
          <p
            className={`text-lg font-semibold ${
              evaln.criticalCleared === evaln.criticalTotal
                ? "text-[var(--success)]"
                : "text-white"
            }`}
          >
            {evaln.criticalCleared}
            <span className="text-sm text-[var(--text-faint)]">/{evaln.criticalTotal}</span>
          </p>
          <p className="text-[10px] uppercase tracking-wider text-[var(--text-faint)]">must-pass cleared</p>
        </div>
      </div>

      {/* Red flags */}
      {evaln.redFlags.length > 0 && (
        <div className="rounded-lg border border-[var(--danger)]/30 bg-[var(--danger)]/10 p-3">
          <p className="mb-1.5 text-xs font-medium text-[var(--danger)]">
            Red flags ({evaln.redFlags.length})
          </p>
          <ul className="space-y-1">
            {evaln.redFlags.map((f) => (
              <li key={f.id} className="flex items-start gap-1.5 text-xs text-[var(--danger)]">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                <span>
                  {f.question}
                  {f.critical && <span className="font-semibold"> (dealbreaker)</span>}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Still to verify - the to-do list */}
      {evaln.toVerify.length > 0 && (
        <div className="rounded-lg border border-white/10 bg-white/[0.02] p-3">
          <p className="mb-1.5 flex items-center gap-1.5 text-xs font-medium text-[var(--body-text)]">
            <ListChecks className="h-3.5 w-3.5" /> Still to verify ({evaln.toVerify.length})
          </p>
          <ul className="space-y-1">
            {evaln.toVerify.slice(0, 6).map((t) => (
              <li key={t.id} className="flex items-start gap-1.5 text-xs text-[var(--muted)]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-white/25" />
                {t.question}
              </li>
            ))}
            {evaln.toVerify.length > 6 && (
              <li className="text-[11px] text-[var(--text-faint)]">
                +{evaln.toVerify.length - 6} more below
              </li>
            )}
          </ul>
        </div>
      )}

      <button
        onClick={onSave}
        disabled={!supplierName.trim() || justSaved}
        className="btn-primary flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50"
      >
        {justSaved ? (
          <>
            <Check className="h-4 w-4" /> Saved
          </>
        ) : (
          <>
            <Save className="h-4 w-4" /> Save to compare
          </>
        )}
      </button>
    </div>
  );
}

function CompareTable({
  saved,
  onLoad,
  onRemove,
}: {
  saved: SavedSupplier[];
  onLoad: (s: SavedSupplier) => void;
  onRemove: (name: string) => void;
}) {
  return (
    <div className="glass-panel grain rounded-xl border p-5">
      <h2 className="font-display text-base font-semibold text-white">Compare suppliers</h2>
      <p className="mt-0.5 text-xs text-[var(--muted)]">
        Vet a few, then pick the one with the most must-pass checks cleared and no dealbreakers.
      </p>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-[var(--text-faint)]">
              <th className="pb-2 pr-3 font-medium">Supplier</th>
              <th className="pb-2 pr-3 font-medium">Verdict</th>
              <th className="pb-2 pr-3 font-medium">Must-pass</th>
              <th className="pb-2 pr-3 font-medium">Checks</th>
              <th className="pb-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {saved.map((s) => {
              const v = VERDICT_META[s.verdict];
              return (
                <tr key={s.name} className="border-b border-white/[0.06]">
                  <td className="py-2.5 pr-3">
                    <button
                      onClick={() => onLoad(s)}
                      className="font-medium text-white hover:underline"
                    >
                      {s.name}
                    </button>
                  </td>
                  <td className="py-2.5 pr-3">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${TONE_CLASS[v.tone]}`}
                    >
                      {v.label}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {s.criticalCleared}/{s.criticalTotal}
                  </td>
                  <td className="py-2.5 pr-3 text-[var(--muted)]">
                    {s.answeredCount}/{s.totalCount}
                  </td>
                  <td className="py-2.5 text-right">
                    <button
                      onClick={() => onRemove(s.name)}
                      className="rounded p-1 text-[var(--text-faint)] transition-colors hover:text-[var(--danger)]"
                      aria-label={`Remove ${s.name}`}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
