"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { JargonEntry } from "@/lib/jargon";

type JargonContextValue = {
  active: JargonEntry | null;
  open: (entry: JargonEntry) => void;
  close: () => void;
};

const JargonContext = createContext<JargonContextValue | null>(null);

export function JargonProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<JargonEntry | null>(null);
  const open = useCallback((entry: JargonEntry) => setActive(entry), []);
  const close = useCallback(() => setActive(null), []);

  return (
    <JargonContext.Provider value={{ active, open, close }}>
      {children}
      {active ? (
        <div
          className="fixed inset-0 z-50 flex justify-end bg-slate-950/60 backdrop-blur-sm"
          role="presentation"
          onClick={close}
        >
          <aside
            className="glass-panel h-full w-full max-w-md border-l border-slate-700/60 p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-label={`Definition of ${active.term}`}
          >
            <button
              type="button"
              onClick={close}
              className="text-muted text-sm hover:text-slate-200"
            >
              Close
            </button>
            <p className="eyebrow mt-4 inline-block">Plain English</p>
            <h2 className="headline-gradient mt-2 text-2xl font-bold">{active.term}</h2>
            <p className="mt-4 text-sm leading-6 text-slate-200">{active.short}</p>
            {active.example ? (
              <p className="text-muted mt-4 rounded-lg border border-slate-700/60 bg-slate-800/40 p-3 text-sm">
                Example: {active.example}
              </p>
            ) : null}
          </aside>
        </div>
      ) : null}
    </JargonContext.Provider>
  );
}

export function useJargon() {
  const ctx = useContext(JargonContext);
  if (!ctx) throw new Error("useJargon must be used within JargonProvider");
  return ctx;
}
