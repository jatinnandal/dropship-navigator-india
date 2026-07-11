"use client";

import { useState, useEffect } from "react";
import { X, Sparkles } from "lucide-react";
import Link from "next/link";

interface UpgradePromptProps {
  message: string;
  featureHighlight: string;
}

const DISMISS_KEY_PREFIX = "dni-upgrade-dismiss-";
const DISMISS_DAYS = 7;

export function UpgradePrompt({ message, featureHighlight }: UpgradePromptProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const key = DISMISS_KEY_PREFIX + featureHighlight;
    const raw = localStorage.getItem(key);
    if (raw) {
      const expiry = parseInt(raw, 10);
      if (Date.now() < expiry) {
        setVisible(false);
        return;
      }
    }
    setVisible(true);
  }, [featureHighlight]);

  function dismiss() {
    const key = DISMISS_KEY_PREFIX + featureHighlight;
    const expiry = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
    localStorage.setItem(key, String(expiry));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="relative rounded-lg border border-amber-500/30 bg-amber-500/5 p-4">
      <button
        onClick={dismiss}
        className="absolute right-2 top-2 rounded p-1 text-slate-400 hover:text-slate-200 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      <div className="flex items-start gap-3">
        <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
        <div>
          <p className="text-sm text-slate-200">{message}</p>
          <p className="text-muted mt-1 text-xs">
            Upgrade to access{" "}
            <span className="text-amber-300">{featureHighlight}</span> and more.
          </p>
          <Link
            href="/app/plans"
            className="mt-2 inline-block text-xs font-medium text-amber-400 hover:text-amber-300 transition-colors"
          >
            View pricing →
          </Link>
        </div>
      </div>
    </div>
  );
}
