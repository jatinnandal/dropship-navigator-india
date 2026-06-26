"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";

type Props = {
  title?: string;
  text: string;
  className?: string;
};

export function CopyTemplate({ title, text, className }: Props) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <div className={className}>
      {title ? <p className="mb-2 text-xs uppercase tracking-wide text-amber-200">{title}</p> : null}
      <div className="relative rounded-lg border border-slate-700/60 bg-slate-900/60">
        <pre className="max-h-64 overflow-auto whitespace-pre-wrap p-4 font-mono text-xs leading-5 text-slate-200">
          {text}
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="btn-ghost absolute right-2 top-2 flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5 text-emerald-300" aria-hidden="true" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              Copy
            </>
          )}
        </button>
      </div>
    </div>
  );
}
