"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileCheck,
  AlertTriangle,
  Check,
  X,
  Link as LinkIcon,
  ChevronDown,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
} from "lucide-react";
import {
  DOCUMENTS,
  CROSS_VALIDATION_CHECKS,
  CATEGORY_LABELS,
  MARKETPLACE_LABELS,
  type DocumentCategory,
  type DocumentItem,
} from "@/lib/document-checker-data";

const STORAGE_KEY = "dni-doc-checker";

type Marketplace = "amazon" | "flipkart" | "meesho" | "shopify";

type CheckedState = {
  marketplaces: Marketplace[];
  documents: Record<string, boolean>;
};

function loadState(): CheckedState {
  if (typeof window === "undefined") return { marketplaces: [], documents: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { marketplaces: [], documents: {} };
}

function saveState(state: CheckedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

/* ── Marketplace Selector ── */
function MarketplaceSelector({
  selected,
  onToggle,
}: {
  selected: Marketplace[];
  onToggle: (m: Marketplace) => void;
}) {
  const marketplaces: Marketplace[] = ["amazon", "flipkart", "meesho", "shopify"];
  return (
    <div className="flex flex-wrap gap-2">
      {marketplaces.map((m) => {
        const active = selected.includes(m);
        return (
          <button
            key={m}
            onClick={() => onToggle(m)}
            className={`rounded-lg border px-4 py-2 text-sm font-medium transition-all ${
              active
                ? "border-amber-500/50 bg-amber-500/10 text-amber-400"
                : "border-slate-700 bg-slate-800/50 text-slate-400 hover:border-slate-600 hover:text-slate-300"
            }`}
          >
            {MARKETPLACE_LABELS[m]}
          </button>
        );
      })}
    </div>
  );
}

/* ── Expandable Section ── */
function ExpandableSection({
  title,
  items,
  accentClass,
}: {
  title: string;
  items: string[];
  accentClass: string;
}) {
  const [open, setOpen] = useState(false);
  if (items.length === 0) return null;

  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-slate-300 transition-colors"
      >
        <ChevronDown
          className={`h-3 w-3 transition-transform ${open ? "rotate-0" : "-rotate-90"}`}
        />
        {title} ({items.length})
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-1.5 space-y-1 overflow-hidden pl-4"
          >
            {items.map((item, i) => (
              <li key={i} className={`text-xs leading-relaxed ${accentClass}`}>
                &bull; {item}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Document Card ── */
function DocumentCard({
  doc,
  checked,
  onToggle,
  allChecked,
}: {
  doc: DocumentItem;
  checked: boolean;
  onToggle: () => void;
  allChecked: Record<string, boolean>;
}) {
  const crossCheckMissing = (doc.crossCheckWith ?? []).filter(
    (id) => !allChecked[id]
  );

  return (
    <div
      className={`glass-panel-tertiary rounded-lg p-4 transition-all ${
        checked ? "border-emerald-500/30 bg-emerald-500/5" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
            checked
              ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
              : "border-slate-600 text-transparent hover:border-slate-500"
          }`}
          aria-label={checked ? `Unmark ${doc.name}` : `Mark ${doc.name} as ready`}
        >
          <Check className="h-3 w-3" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-slate-200">{doc.name}</h4>
            {doc.requiredFor.map((m) => (
              <span
                key={m}
                className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] text-slate-500"
              >
                {MARKETPLACE_LABELS[m]}
              </span>
            ))}
          </div>
          <p className="text-muted mt-1 text-xs leading-relaxed">
            {doc.description}
          </p>

          {/* Cross-check indicators */}
          {doc.crossCheckWith && doc.crossCheckWith.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 flex-wrap">
              <LinkIcon className="h-3 w-3 text-cyan-400" />
              <span className="text-[10px] text-cyan-400 font-medium">
                Must match:
              </span>
              {doc.crossCheckWith.map((id) => {
                const linked = DOCUMENTS.find((d) => d.id === id);
                const missing = !allChecked[id];
                return (
                  <span
                    key={id}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${
                      missing
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                    }`}
                  >
                    {linked?.name ?? id}
                  </span>
                );
              })}
            </div>
          )}

          {/* Warning if cross-check incomplete */}
          {checked && crossCheckMissing.length > 0 && (
            <div className="mt-2 flex items-center gap-1.5 rounded bg-rose-500/10 border border-rose-500/20 px-2 py-1.5">
              <AlertTriangle className="h-3 w-3 text-rose-400 shrink-0" />
              <span className="text-[10px] text-rose-400">
                Cross-check documents not ready:{" "}
                {crossCheckMissing
                  .map((id) => DOCUMENTS.find((d) => d.id === id)?.name ?? id)
                  .join(", ")}
              </span>
            </div>
          )}

          <ExpandableSection
            title="Common Mistakes"
            items={doc.commonMistakes}
            accentClass="text-rose-400/80"
          />
          <ExpandableSection
            title="Validation Tips"
            items={doc.validationTips}
            accentClass="text-cyan-400/80"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Cross-Check Matrix ── */
function CrossCheckMatrix({ allChecked }: { allChecked: Record<string, boolean> }) {
  return (
    <div className="glass-panel-receded rounded-lg p-4">
      <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-cyan-400" />
        Cross-Validation Matrix
      </h3>
      <div className="space-y-2">
        {CROSS_VALIDATION_CHECKS.map((check) => {
          // Determine if related docs are checked
          const relatedDocIds = getRelatedDocIds(check.id);
          const allRelatedChecked = relatedDocIds.every((id) => allChecked[id]);
          const someRelatedChecked =
            relatedDocIds.some((id) => allChecked[id]) && !allRelatedChecked;

          return (
            <div
              key={check.id}
              className={`rounded-md border px-3 py-2 ${
                allRelatedChecked
                  ? "border-emerald-500/30 bg-emerald-500/5"
                  : someRelatedChecked
                  ? "border-amber-500/30 bg-amber-500/5"
                  : "border-rose-500/30 bg-rose-500/5"
              }`}
            >
              <div className="flex items-center gap-2">
                {check.severity === "critical" ? (
                  <AlertTriangle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      allRelatedChecked ? "text-emerald-400" : "text-rose-400"
                    }`}
                  />
                ) : (
                  <AlertTriangle
                    className={`h-3.5 w-3.5 shrink-0 ${
                      allRelatedChecked ? "text-emerald-400" : "text-amber-400"
                    }`}
                  />
                )}
                <span className="text-xs font-medium text-slate-200">
                  {check.label}
                </span>
                <span
                  className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${
                    check.severity === "critical"
                      ? "bg-rose-500/20 text-rose-400"
                      : "bg-amber-500/20 text-amber-400"
                  }`}
                >
                  {check.severity}
                </span>
              </div>
              <p className="text-muted mt-1 text-[11px] leading-relaxed pl-5">
                {check.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* Helper: map check IDs to document IDs */
function getRelatedDocIds(checkId: string): string[] {
  switch (checkId) {
    case "pan-gst-name":
      return ["pan", "gstin"];
    case "pan-bank-name":
      return ["pan", "bank-statement"];
    case "gst-address-match":
      return ["gstin", "address-proof"];
    case "gst-trade-brand":
      return ["gstin"];
    default:
      return [];
  }
}

/* ── Main Component ── */
export function DocumentChecker() {
  const [state, setState] = useState<CheckedState>({
    marketplaces: [],
    documents: {},
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  const persist = useCallback((next: CheckedState) => {
    setState(next);
    saveState(next);
  }, []);

  const toggleMarketplace = useCallback(
    (m: Marketplace) => {
      const next = { ...state };
      if (next.marketplaces.includes(m)) {
        next.marketplaces = next.marketplaces.filter((x) => x !== m);
      } else {
        next.marketplaces = [...next.marketplaces, m];
      }
      persist(next);
    },
    [state, persist]
  );

  const toggleDocument = useCallback(
    (id: string) => {
      const next = {
        ...state,
        documents: { ...state.documents, [id]: !state.documents[id] },
      };
      persist(next);
    },
    [state, persist]
  );

  // Filter documents by selected marketplaces
  const filteredDocs = useMemo(() => {
    if (state.marketplaces.length === 0) return DOCUMENTS;
    return DOCUMENTS.filter((doc) =>
      doc.requiredFor.some((m) => state.marketplaces.includes(m))
    );
  }, [state.marketplaces]);

  // Group by category
  const grouped = useMemo(() => {
    const groups: Record<DocumentCategory, DocumentItem[]> = {
      identity: [],
      business: [],
      financial: [],
      product: [],
    };
    for (const doc of filteredDocs) {
      groups[doc.category].push(doc);
    }
    return groups;
  }, [filteredDocs]);

  // Progress stats
  const totalDocs = filteredDocs.length;
  const checkedCount = filteredDocs.filter(
    (d) => state.documents[d.id]
  ).length;
  const progress = totalDocs > 0 ? (checkedCount / totalDocs) * 100 : 0;

  // Cross-check warnings
  const crossCheckWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const doc of filteredDocs) {
      if (state.documents[doc.id] && doc.crossCheckWith) {
        for (const linked of doc.crossCheckWith) {
          if (!state.documents[linked]) {
            const linkedDoc = DOCUMENTS.find((d) => d.id === linked);
            if (linkedDoc) {
              warnings.push(
                `${doc.name} is ready but ${linkedDoc.name} is not — names must match`
              );
            }
          }
        }
      }
    }
    // Deduplicate
    return [...new Set(warnings)];
  }, [filteredDocs, state.documents]);

  // Verdict
  const verdict = useMemo(() => {
    if (checkedCount === 0) return "not-ready" as const;
    if (checkedCount === totalDocs && crossCheckWarnings.length === 0)
      return "ready" as const;
    if (crossCheckWarnings.length > 0) return "partial-warning" as const;
    return "partial" as const;
  }, [checkedCount, totalDocs, crossCheckWarnings]);

  if (!mounted) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-32 rounded-lg bg-slate-800/50" />
        <div className="h-64 rounded-lg bg-slate-800/50" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insight */}
      <div className="rounded-lg border border-rose-500/40 bg-rose-500/5 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-rose-300">
              Document name mismatches are the #1 rejection reason on Amazon India
            </p>
            <p className="text-muted mt-1 text-xs leading-relaxed">
              Your name must match <strong className="text-slate-200">CHARACTER-FOR-CHARACTER</strong> across
              PAN, GST certificate, and bank statement. Even &quot;KUMAR&quot; vs
              &quot;Kumar&quot; can trigger rejection.
            </p>
          </div>
        </div>
      </div>

      {/* Marketplace Selector */}
      <div className="glass-panel rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-200 mb-3">
          Which platforms are you applying to?
        </h3>
        <MarketplaceSelector
          selected={state.marketplaces}
          onToggle={toggleMarketplace}
        />
        {state.marketplaces.length === 0 && (
          <p className="text-muted mt-2 text-xs">
            Select platforms to filter documents, or leave empty to see all.
          </p>
        )}
      </div>

      {/* Validation Status Panel */}
      <div className="glass-panel rounded-lg p-4 sticky top-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-amber-400" />
            <span className="text-sm font-semibold text-slate-200">
              {checkedCount} of {totalDocs} documents ready
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {verdict === "ready" && (
              <span className="flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400">
                <ShieldCheck className="h-3 w-3" />
                Ready to submit
              </span>
            )}
            {verdict === "not-ready" && (
              <span className="flex items-center gap-1 rounded-md border border-rose-500/30 bg-rose-500/10 px-2 py-1 text-xs font-medium text-rose-400">
                <ShieldX className="h-3 w-3" />
                Not ready
              </span>
            )}
            {(verdict === "partial" || verdict === "partial-warning") && (
              <span className="flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400">
                <ShieldAlert className="h-3 w-3" />
                Partially ready
              </span>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className="progress-track h-2 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                progress === 100
                  ? "#34d399"
                  : `linear-gradient(90deg, #f59e0b, ${progress > 60 ? "#34d399" : "#f59e0b"})`,
            }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>

        {/* Cross-check warnings */}
        {crossCheckWarnings.length > 0 && (
          <div className="mt-3 space-y-1">
            {crossCheckWarnings.slice(0, 3).map((w, i) => (
              <div
                key={i}
                className="flex items-center gap-1.5 text-[11px] text-rose-400"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {w}
              </div>
            ))}
            {crossCheckWarnings.length > 3 && (
              <p className="text-[10px] text-rose-400/60 pl-4">
                +{crossCheckWarnings.length - 3} more warnings
              </p>
            )}
          </div>
        )}
      </div>

      {/* Document Checklist by Category */}
      <div className="space-y-6">
        {(
          Object.entries(grouped) as [DocumentCategory, DocumentItem[]][]
        ).map(
          ([category, docs]) =>
            docs.length > 0 && (
              <div key={category}>
                <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-amber-400" />
                  {CATEGORY_LABELS[category]}
                </h3>
                <div className="space-y-3">
                  {docs.map((doc) => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      checked={!!state.documents[doc.id]}
                      onToggle={() => toggleDocument(doc.id)}
                      allChecked={state.documents}
                    />
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {/* Cross-Check Matrix */}
      <CrossCheckMatrix allChecked={state.documents} />
    </div>
  );
}
