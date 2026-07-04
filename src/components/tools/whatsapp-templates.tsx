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
      <span key={i} className="text-amber-400 font-semibold">
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
    <div className="bg-emerald-950/40 border border-emerald-800/30 rounded-xl rounded-tl-sm p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-sm font-semibold text-slate-200">
          {template.title}
        </h3>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-slate-700/50 transition-colors text-slate-400 hover:text-slate-200"
          aria-label="Copy template"
        >
          {copied ? (
            <Check className="h-4 w-4 text-emerald-400" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>

      <p className="text-sm leading-relaxed text-slate-300">
        {highlightPlaceholders(template.message)}
      </p>

      <div className="flex items-start gap-2 pt-1">
        <Lightbulb className="h-3.5 w-3.5 mt-0.5 shrink-0 text-cyan-400" />
        <p className="text-xs text-cyan-400 leading-relaxed">
          {template.bestPractice}
        </p>
      </div>

      <div className="flex items-center gap-1.5">
        <Clock className="h-3 w-3 text-slate-500" />
        <span className="text-xs text-slate-500">{template.timing}</span>
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
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-lg border border-slate-700 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-slate-200 placeholder:text-slate-500 focus:border-amber-500/50 focus:outline-none focus:ring-1 focus:ring-amber-500/30"
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
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                : "bg-slate-800/60 text-slate-400 border border-slate-700 hover:text-slate-200"
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
          <p className="text-sm text-slate-500 col-span-full py-8 text-center">
            No templates match your search.
          </p>
        )}
      </div>
    </div>
  );
}
