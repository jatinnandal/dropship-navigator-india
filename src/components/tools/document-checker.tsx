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
import { matchGstinPan, validateGSTIN, validatePAN } from "@/lib/validators";

const STORAGE_KEY = "dni-doc-checker";

type Marketplace = "amazon" | "flipkart" | "meesho" | "shopify";

type IdentityState = {
  gstin: string;
  pan: string;
  namePan: string;
  nameGst: string;
  nameBank: string;
};

const EMPTY_IDENTITY: IdentityState = { gstin: "", pan: "", namePan: "", nameGst: "", nameBank: "" };

type CheckedState = {
  marketplaces: Marketplace[];
  documents: Record<string, boolean>;
  identity: IdentityState;
};

function loadState(): CheckedState {
  if (typeof window === "undefined") return { marketplaces: [], documents: {}, identity: EMPTY_IDENTITY };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return { marketplaces: [], documents: {}, ...parsed, identity: { ...EMPTY_IDENTITY, ...(parsed.identity ?? {}) } };
    }
  } catch {}
  return { marketplaces: [], documents: {}, identity: EMPTY_IDENTITY };
}

/* ── Identity verification (the checks marketplaces actually run) ── */

const normSpace = (s: string) => s.trim().replace(/\s+/g, " ");

type NameCompare = "match" | "case-only" | "mismatch" | "incomplete";

function compareNames(a: string, b: string): NameCompare {
  const na = normSpace(a);
  const nb = normSpace(b);
  if (!na || !nb) return "incomplete";
  if (na === nb) return "match";
  if (na.toLowerCase() === nb.toLowerCase()) return "case-only";
  return "mismatch";
}

export type IdentityVerification = {
  gstin: ReturnType<typeof validateGSTIN> | null;
  pan: ReturnType<typeof validatePAN> | null;
  /** PAN characters embedded inside the GSTIN match the entered PAN. */
  panInGstin: boolean | null;
  panGstName: NameCompare;
  panBankName: NameCompare;
};

function verifyIdentity(id: IdentityState): IdentityVerification {
  const gstin = id.gstin ? validateGSTIN(id.gstin.toUpperCase()) : null;
  const pan = id.pan ? validatePAN(id.pan.toUpperCase()) : null;
  const panInGstin =
    gstin?.valid && pan?.valid ? matchGstinPan(id.gstin.toUpperCase(), id.pan.toUpperCase()) : null;
  return {
    gstin,
    pan,
    panInGstin,
    panGstName: compareNames(id.namePan, id.nameGst),
    panBankName: compareNames(id.namePan, id.nameBank),
  };
}

/** First point of divergence highlighted on both strings. */
function NameDiff({ a, b }: { a: string; b: string }) {
  const na = normSpace(a);
  const nb = normSpace(b);
  let prefix = 0;
  while (prefix < na.length && prefix < nb.length && na[prefix] === nb[prefix]) prefix++;
  let suffix = 0;
  while (
    suffix < na.length - prefix &&
    suffix < nb.length - prefix &&
    na[na.length - 1 - suffix] === nb[nb.length - 1 - suffix]
  )
    suffix++;

  const render = (s: string) => (
    <span className="font-mono text-[11px]">
      <span className="text-[var(--body-text)]">{s.slice(0, prefix)}</span>
      <span className="rounded-sm bg-[var(--danger)]/25 px-0.5 text-[var(--danger)]">
        {s.slice(prefix, s.length - suffix) || "∅"}
      </span>
      <span className="text-[var(--body-text)]">{s.slice(s.length - suffix)}</span>
    </span>
  );

  return (
    <div className="mt-1 space-y-0.5 pl-4">
      <div>{render(na)}</div>
      <div>{render(nb)}</div>
    </div>
  );
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
                ? "border-white/[0.16] bg-white/[0.06] text-white"
                : "border-white/[0.12] bg-white/[0.04] text-[var(--muted)] hover:border-white/[0.2] hover:text-[var(--body-text)]"
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
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--muted)] hover:text-[var(--body-text)] transition-colors"
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
      className={`panel-chip rounded-lg p-4 transition-all ${
        checked ? "border-[var(--success)]/30 bg-[var(--success)]/10" : ""
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={onToggle}
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all ${
            checked
              ? "border-[var(--success)]/40 bg-[var(--success)]/20 text-[var(--success)]"
              : "border-white/[0.2] text-transparent hover:border-white/[0.35]"
          }`}
          aria-label={checked ? `Unmark ${doc.name}` : `Mark ${doc.name} as ready`}
        >
          <Check className="h-3 w-3" />
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-white">{doc.name}</h4>
            {doc.requiredFor.map((m) => (
              <span
                key={m}
                className="rounded bg-white/[0.06] px-1.5 py-0.5 text-[10px] text-[var(--text-faint)]"
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
              <LinkIcon className="h-3 w-3 text-[var(--muted)]" />
              <span className="text-[10px] text-[var(--muted)] font-medium">
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
                        ? "bg-[var(--danger)]/10 text-[var(--danger)] border border-[var(--danger)]/30"
                        : "bg-[var(--success)]/10 text-[var(--success)] border border-[var(--success)]/30"
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
            <div className="mt-2 flex items-center gap-1.5 rounded bg-[var(--danger)]/10 border border-[var(--danger)]/20 px-2 py-1.5">
              <AlertTriangle className="h-3 w-3 text-[var(--danger)] shrink-0" />
              <span className="text-[10px] text-[var(--danger)]">
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
            accentClass="text-[var(--danger)]/80"
          />
          <ExpandableSection
            title="Validation Tips"
            items={doc.validationTips}
            accentClass="text-[var(--muted)]/80"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Identity verifier panel ── */
function IdentityField({
  label,
  value,
  placeholder,
  onChange,
  mono,
  status,
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (v: string) => void;
  mono?: boolean;
  status?: { ok: boolean; text: string } | null;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-[var(--body-text)]">{label}</label>
      <input
        type="text"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`mt-1.5 w-full min-h-[40px] rounded-md border border-white/10 bg-white/[0.03] px-3 py-2 text-sm text-[var(--body-text)] transition-colors focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/25 ${
          mono ? "font-mono uppercase tracking-wide" : ""
        }`}
      />
      {status && (
        <p className={`mt-1 flex items-center gap-1 text-[11px] ${status.ok ? "text-[var(--success)]" : "text-[var(--danger)]"}`}>
          {status.ok ? <Check className="h-3 w-3 shrink-0" /> : <X className="h-3 w-3 shrink-0" />}
          {status.text}
        </p>
      )}
    </div>
  );
}

function nameStatusLine(cmp: NameCompare): { ok: boolean; text: string } | null {
  switch (cmp) {
    case "match":
      return { ok: true, text: "Matches character-for-character" };
    case "case-only":
      return { ok: false, text: "Differs only in casing/spacing - marketplaces can still reject this, make them identical" };
    case "mismatch":
      return { ok: false, text: "Names differ - the highlighted part is where they diverge" };
    default:
      return null;
  }
}

function IdentityVerifier({
  identity,
  verification,
  onChange,
}: {
  identity: IdentityState;
  verification: IdentityVerification;
  onChange: (next: IdentityState) => void;
}) {
  const set = (field: keyof IdentityState) => (v: string) => onChange({ ...identity, [field]: v });
  const v = verification;

  return (
    <div className="panel rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-1">Verify your identity block</h3>
      <p className="text-muted mb-4 text-xs leading-relaxed">
        This is the check the marketplace KYC actually runs. Type the values exactly as printed on
        each document - we validate the numbers and diff the names character by character. Nothing
        you type here leaves your browser.
      </p>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <IdentityField
          label="PAN"
          value={identity.pan}
          placeholder="ABCDE1234F"
          onChange={set("pan")}
          mono
          status={
            v.pan === null
              ? null
              : v.pan.valid
                ? { ok: true, text: "Valid PAN format" }
                : { ok: false, text: v.pan.error ?? "Invalid PAN" }
          }
        />
        <IdentityField
          label="GSTIN (skip if you don't have one yet)"
          value={identity.gstin}
          placeholder="27ABCDE1234F1Z5"
          onChange={set("gstin")}
          mono
          status={
            v.gstin === null
              ? null
              : !v.gstin.valid
                ? { ok: false, text: v.gstin.error ?? "Invalid GSTIN" }
                : v.panInGstin === null
                  ? { ok: true, text: "Valid GSTIN (enter PAN to cross-check)" }
                  : v.panInGstin
                    ? { ok: true, text: "Valid - and characters 3-12 match your PAN" }
                    : { ok: false, text: "Valid format, but this GSTIN embeds a DIFFERENT PAN - one of the two has a typo" }
          }
        />
        <IdentityField
          label="Name as printed on PAN"
          value={identity.namePan}
          placeholder="RAHUL KUMAR SHARMA"
          onChange={set("namePan")}
        />
        <IdentityField
          label="Legal name on GST certificate"
          value={identity.nameGst}
          placeholder="RAHUL KUMAR SHARMA"
          onChange={set("nameGst")}
          status={nameStatusLine(v.panGstName)}
        />
        <IdentityField
          label="Bank account holder name"
          value={identity.nameBank}
          placeholder="RAHUL KUMAR SHARMA"
          onChange={set("nameBank")}
          status={nameStatusLine(v.panBankName)}
        />
      </div>

      {v.panGstName === "mismatch" && <NameDiff a={identity.namePan} b={identity.nameGst} />}
      {v.panBankName === "mismatch" && <NameDiff a={identity.namePan} b={identity.nameBank} />}
    </div>
  );
}

/* ── Cross-Check Matrix ── */
type MatrixStatus = {
  tone: "verified" | "failed" | "unverified" | "manual";
  note: string;
};

/**
 * Green ONLY on a verified match - never on document possession alone.
 * Possessing a PAN and a GST certificate proves nothing about whether the
 * names on them agree, which is the thing marketplaces reject on.
 */
function matrixStatus(
  checkId: string,
  allChecked: Record<string, boolean>,
  v: IdentityVerification,
): MatrixStatus {
  const docsPossessed = getRelatedDocIds(checkId).every((id) => allChecked[id]);

  switch (checkId) {
    case "pan-gst-name": {
      if (v.panInGstin === false)
        return { tone: "failed", note: "The PAN embedded in your GSTIN is different from the PAN you entered - fix the typo before anything else." };
      if (v.panGstName === "mismatch")
        return { tone: "failed", note: "Names on PAN and GST certificate differ - this is the #1 KYC rejection. Fix via a GST amendment (core field) before applying." };
      if (v.panGstName === "case-only")
        return { tone: "failed", note: "Names differ only in casing/spacing - still risky, make them identical." };
      if (v.panGstName === "match" && v.panInGstin === true)
        return { tone: "verified", note: "Verified: names match character-for-character and the GSTIN embeds this PAN." };
      if (v.panGstName === "match")
        return { tone: "verified", note: "Names match character-for-character. Enter your GSTIN above to also cross-check the embedded PAN." };
      return { tone: "unverified", note: "Not verified yet - enter both names in the identity block above. Ticking the checkboxes doesn't prove the names match." };
    }
    case "pan-bank-name": {
      if (v.panBankName === "mismatch")
        return { tone: "failed", note: "Bank account holder name differs from PAN - payouts and KYC will bounce. Fix the bank record or use the matching account." };
      if (v.panBankName === "case-only")
        return { tone: "failed", note: "Differs only in casing/spacing - align them to be safe." };
      if (v.panBankName === "match")
        return { tone: "verified", note: "Verified: bank account holder name matches your PAN name exactly." };
      return { tone: "unverified", note: "Not verified yet - enter your PAN name and bank account holder name above." };
    }
    default:
      // Address/brand consistency can't be auto-verified from typed fields.
      return docsPossessed
        ? { tone: "manual", note: "We can't verify this automatically - compare the two documents side by side before you submit." }
        : { tone: "unverified", note: "Mark the related documents ready, then compare them manually - this one can't be auto-verified." };
  }
}

const MATRIX_TONE_STYLES: Record<MatrixStatus["tone"], { box: string; icon: string; chip: string; chipText: string }> = {
  verified: {
    box: "border-[var(--success)]/30 bg-[var(--success)]/10",
    icon: "text-[var(--success)]",
    chip: "bg-[var(--success)]/20 text-[var(--success)]",
    chipText: "verified",
  },
  failed: {
    box: "border-[var(--danger)]/30 bg-[var(--danger)]/10",
    icon: "text-[var(--danger)]",
    chip: "bg-[var(--danger)]/20 text-[var(--danger)]",
    chipText: "mismatch",
  },
  unverified: {
    box: "border-white/[0.12] bg-white/[0.03]",
    icon: "text-[var(--muted)]",
    chip: "bg-white/[0.06] text-[var(--muted)]",
    chipText: "not verified",
  },
  manual: {
    box: "border-white/[0.16] bg-white/[0.04]",
    icon: "text-white",
    chip: "bg-white/[0.08] text-white",
    chipText: "manual check",
  },
};

function CrossCheckMatrix({
  allChecked,
  verification,
}: {
  allChecked: Record<string, boolean>;
  verification: IdentityVerification;
}) {
  return (
    <div className="panel rounded-lg p-4">
      <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
        <LinkIcon className="h-4 w-4 text-[var(--muted)]" />
        Cross-Validation Matrix
      </h3>
      <div className="space-y-2">
        {CROSS_VALIDATION_CHECKS.map((check) => {
          const status = matrixStatus(check.id, allChecked, verification);
          const t = MATRIX_TONE_STYLES[status.tone];
          return (
            <div key={check.id} className={`rounded-md border px-3 py-2 ${t.box}`}>
              <div className="flex items-center gap-2">
                {status.tone === "verified" ? (
                  <ShieldCheck className={`h-3.5 w-3.5 shrink-0 ${t.icon}`} />
                ) : (
                  <AlertTriangle className={`h-3.5 w-3.5 shrink-0 ${t.icon}`} />
                )}
                <span className="text-xs font-medium text-white">{check.label}</span>
                <span className={`ml-auto rounded px-1.5 py-0.5 text-[10px] font-medium ${t.chip}`}>
                  {t.chipText}
                </span>
              </div>
              <p className="text-muted mt-1 text-[11px] leading-relaxed pl-5">{check.description}</p>
              <p className={`mt-1 pl-5 text-[11px] leading-relaxed ${status.tone === "failed" ? "text-[var(--danger)]" : status.tone === "verified" ? "text-[var(--success)]" : "text-[var(--muted)]"}`}>
                {status.note}
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
    identity: EMPTY_IDENTITY,
  });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Deferred so SSR markup and first client render match (localStorage is
    // client-only); the skeleton below covers the single pre-hydration frame.
    const frame = requestAnimationFrame(() => {
      setState(loadState());
      setMounted(true);
    });
    return () => cancelAnimationFrame(frame);
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

  const setIdentity = useCallback(
    (identity: IdentityState) => persist({ ...state, identity }),
    [state, persist]
  );

  const verification = useMemo(() => verifyIdentity(state.identity), [state.identity]);

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

  // Cross-check warnings (possession gaps + verified identity mismatches)
  const crossCheckWarnings = useMemo(() => {
    const warnings: string[] = [];
    for (const doc of filteredDocs) {
      if (state.documents[doc.id] && doc.crossCheckWith) {
        for (const linked of doc.crossCheckWith) {
          if (!state.documents[linked]) {
            const linkedDoc = DOCUMENTS.find((d) => d.id === linked);
            if (linkedDoc) {
              warnings.push(
                `${doc.name} is ready but ${linkedDoc.name} is not - names must match`
              );
            }
          }
        }
      }
    }
    if (verification.panInGstin === false)
      warnings.push("Your GSTIN embeds a different PAN than the one entered - typo in one of them");
    if (verification.panGstName === "mismatch" || verification.panGstName === "case-only")
      warnings.push("PAN name and GST legal name don't match exactly");
    if (verification.panBankName === "mismatch" || verification.panBankName === "case-only")
      warnings.push("PAN name and bank account holder name don't match exactly");
    // Deduplicate
    return [...new Set(warnings)];
  }, [filteredDocs, state.documents, verification]);

  // Verdict - a verified identity mismatch blocks "ready" regardless of ticks.
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
        <div className="h-32 rounded-lg bg-white/[0.04]" />
        <div className="h-64 rounded-lg bg-white/[0.04]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Insight */}
      <div className="rounded-lg border border-[var(--danger)]/40 bg-[var(--danger)]/10 p-4">
        <div className="flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-[var(--danger)] shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-[var(--danger)]">
              Document name mismatches are the #1 rejection reason on Amazon India
            </p>
            <p className="text-muted mt-1 text-xs leading-relaxed">
              Your name must match <strong className="text-white">CHARACTER-FOR-CHARACTER</strong> across
              PAN, GST certificate, and bank statement. Even &quot;KUMAR&quot; vs
              &quot;Kumar&quot; can trigger rejection.
            </p>
          </div>
        </div>
      </div>

      {/* Marketplace Selector */}
      <div className="panel rounded-lg p-4">
        <h3 className="text-sm font-semibold text-white mb-3">
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

      {/* Identity verification */}
      <IdentityVerifier
        identity={state.identity}
        verification={verification}
        onChange={setIdentity}
      />

      {/* Validation Status Panel */}
      <div className="panel rounded-lg p-4 sticky top-4 z-10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileCheck className="h-4 w-4 text-white" />
            <span className="text-sm font-semibold text-white">
              {checkedCount} of {totalDocs} documents ready
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {verdict === "ready" && (
              <span className="flex items-center gap-1 rounded-md border border-[var(--success)]/30 bg-[var(--success)]/10 px-2 py-1 text-xs font-medium text-[var(--success)]">
                <ShieldCheck className="h-3 w-3" />
                Ready to submit
              </span>
            )}
            {verdict === "not-ready" && (
              <span className="flex items-center gap-1 rounded-md border border-[var(--danger)]/30 bg-[var(--danger)]/10 px-2 py-1 text-xs font-medium text-[var(--danger)]">
                <ShieldX className="h-3 w-3" />
                Not ready
              </span>
            )}
            {(verdict === "partial" || verdict === "partial-warning") && (
              <span className="flex items-center gap-1 rounded-md border border-white/[0.16] bg-white/[0.06] px-2 py-1 text-xs font-medium text-white">
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
                className="flex items-center gap-1.5 text-[11px] text-[var(--danger)]"
              >
                <AlertTriangle className="h-3 w-3 shrink-0" />
                {w}
              </div>
            ))}
            {crossCheckWarnings.length > 3 && (
              <p className="text-[10px] text-[var(--danger)]/60 pl-4">
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
                <h3 className="text-sm font-semibold text-[var(--body-text)] mb-3 flex items-center gap-2">
                  <span className="h-1 w-1 rounded-full bg-white" />
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
      <CrossCheckMatrix allChecked={state.documents} verification={verification} />
    </div>
  );
}
