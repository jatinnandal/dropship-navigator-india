"use client";

import { useState, useMemo } from "react";
import { Copy, Check, Clock, Lightbulb, Search } from "lucide-react";
import {
  WHATSAPP_TEMPLATES,
  WHATSAPP_CATEGORIES,
  type WhatsAppTemplate,
} from "@/lib/whatsapp-templates";

function highlightPlaceholders(message: string) {
  const parts = message.split(/(\{\{[^}]+\}\})/g);
  return parts.map((part, i) =>
    part.startsWith("{{") ? (
      <span key={i} className="text-white font-semibold">
        {part}
      </span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function TemplateBubble({ template }: { template: WhatsAppTemplate }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(template.message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[var(--success)]/10 border border-[var(--success)]/30 rounded-xl rounded-tl-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-[var(--body-text)]">
          {template.title}
        </h3>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-white/[0.06] transition-colors text-[var(--muted)] hover:text-[var(--body-text)]"
          aria-label="Copy template"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--success)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-sm leading-relaxed text-[var(--body-text)]">
        {highlightPlaceholders(template.message)}
      </p>

      <div className="flex items-start gap-2 pt-1">
        <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-[var(--muted)]" />
        <p className="text-xs text-[var(--muted)] leading-relaxed">
          {template.bestPractice}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-[var(--text-faint)]" />
        <span className="text-xs text-[var(--text-faint)]">{template.timing}</span>
      </div>
    </div>
  );
}

export function WhatsAppTemplateViewer() {
  const [activeCategory, setActiveCategory] = useState<
    WhatsAppTemplate["category"]
  >("order-confirm");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let templates = WHATSAPP_TEMPLATES.filter(
      (t) => t.category === activeCategory
    );
    if (search.trim()) {
      const q = search.toLowerCase();
      templates = templates.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          t.message.toLowerCase().includes(q)
      );
    }
    return templates;
  }, [activeCategory, search]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-faint)]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-lg border border-white/10 bg-white/[0.03] py-2.5 pl-10 pr-4 text-sm text-[var(--body-text)] placeholder:text-[var(--text-faint)] focus:border-white/[0.16] focus:outline-none focus:ring-1 focus:ring-white/25"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-2">
        {WHATSAPP_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              activeCategory === cat.id
                ? "bg-white/[0.06] text-white border border-white/[0.16]"
                : "bg-white/[0.03] text-[var(--muted)] border border-white/10 hover:text-[var(--body-text)]"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Templates */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filtered.map((t) => (
          <TemplateBubble key={t.id} template={t} />
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-[var(--text-faint)] col-span-full py-8 text-center">
            No templates match your search.
          </p>
        )}
      </div>
    </div>
  );
}
