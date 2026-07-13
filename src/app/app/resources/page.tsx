"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { RESOURCE_CATALOG } from "@/lib/resources-catalog";

const FILTERS = [
  { id: "all", label: "All" },
  ...RESOURCE_CATALOG.map((c) => ({ id: c.id, label: c.title })),
];

const TAG_COLORS: Record<string, { color: string; border: string }> = {
  "legal-gst": { color: "oklch(0.8 0.13 20)", border: "oklch(0.65 0.18 20 / 0.35)" },
  product: { color: "#c9c9c9", border: "rgba(255,255,255,0.2)" },
  sourcing: { color: "#c9c9c9", border: "rgba(255,255,255,0.2)" },
  shipping: { color: "oklch(0.78 0.12 165)", border: "oklch(0.72 0.13 165 / 0.35)" },
  marketplaces: { color: "#c9c9c9", border: "rgba(255,255,255,0.2)" },
  ads: { color: "#c9c9c9", border: "rgba(255,255,255,0.2)" },
  analytics: { color: "oklch(0.78 0.12 165)", border: "oklch(0.72 0.13 165 / 0.35)" },
};

function useTilt() {
  const ref = useRef<HTMLAnchorElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 90ms linear, border-color 200ms";
    el.style.transform = `perspective(800px) rotateY(${px * 5}deg) rotateX(${-py * 5}deg) translateY(-2px)`;
    el.style.borderColor = "rgba(255,255,255,0.28)";
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 450ms cubic-bezier(0.22,1,0.36,1), border-color 300ms";
    el.style.transform = "none";
    el.style.borderColor = "";
  }, []);
  return { ref, onMove, onLeave };
}

function ResourceCard({ link, categoryId }: { link: { name: string; url: string; description: string }; categoryId: string }) {
  const tilt = useTilt();
  const tag = TAG_COLORS[categoryId] ?? { color: "#c9c9c9", border: "rgba(255,255,255,0.2)" };

  return (
    <a
      ref={tilt.ref}
      onMouseMove={tilt.onMove}
      onMouseLeave={tilt.onLeave}
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: "block",
        textDecoration: "none",
        borderRadius: 16,
        padding: "20px 22px",
        background: "#060606",
        border: "1px solid rgba(255,255,255,0.09)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.05)",
        willChange: "transform",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span className="font-mono" style={{ fontSize: "9.5px", letterSpacing: "0.12em", textTransform: "uppercase", color: tag.color, border: `1px solid ${tag.border}`, borderRadius: 999, padding: "4px 10px" }}>
          {categoryId.replace("-", " & ")}
        </span>
        <ExternalLink size={12} style={{ color: "#4a4a4a" }} />
      </div>
      <h3 style={{ margin: "14px 0 0", fontSize: 15, fontWeight: 600, letterSpacing: "-0.015em", lineHeight: 1.4, color: "#e8e8e8" }}>{link.name}</h3>
      <p style={{ margin: "7px 0 0", fontSize: "12.5px", lineHeight: 1.55, color: "#7a7a7a" }}>{link.description}</p>
    </a>
  );
}

export default function ResourcesPage() {
  const [filter, setFilter] = useState("all");

  const visible = filter === "all" ? RESOURCE_CATALOG : RESOURCE_CATALOG.filter((c) => c.id === filter);

  return (
    <main style={{ flex: 1, position: "relative", zIndex: 1, padding: "26px 32px 60px", boxSizing: "border-box", maxWidth: "76rem", margin: "0 auto", width: "100%" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 20, flexWrap: "wrap", padding: "0 4px 22px" }}>
        <div>
          <p className="eyebrow" style={{ margin: 0, display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ display: "inline-block", width: 28, height: 1, background: "linear-gradient(90deg, #ffffff, rgba(255,255,255,0.2))" }} />
            Resources
          </p>
          <h1 style={{ margin: "10px 0 0", fontSize: 27, fontWeight: 600, letterSpacing: "-0.03em", color: "#ffffff" }}>
            Field guides, <span className="font-serif-accent">not theory.</span>
          </h1>
          <p style={{ margin: "8px 0 0", maxWidth: "40rem", fontSize: 14, lineHeight: 1.65, color: "#8a8a8a" }}>
            Vendor-neutral tools and resources referenced across your launch plan. We are not affiliated - always verify pricing and terms.
          </p>
        </div>
        {/* Filter chips */}
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {FILTERS.map((f) => {
            const sel = filter === f.id;
            return (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                style={{
                  minHeight: 36,
                  padding: "0 15px",
                  borderRadius: 999,
                  fontFamily: "var(--font-sans)",
                  fontSize: "12.5px",
                  fontWeight: 600,
                  cursor: "pointer",
                  color: sel ? "#000000" : "#8a8a8a",
                  background: sel ? "#ffffff" : "rgba(255,255,255,0.03)",
                  border: `1px solid ${sel ? "transparent" : "rgba(255,255,255,0.12)"}`,
                  transition: "border-color 160ms",
                }}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Featured guide */}
      <section style={{ position: "relative", overflow: "hidden", borderRadius: 20, padding: "28px 30px", background: "linear-gradient(165deg, #0c0c0c, #050505)", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 0 60px -24px rgba(255,255,255,0.14), inset 0 1px 0 rgba(255,255,255,0.08)" }}>
        <div className="grid-texture" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />
        <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, flexWrap: "wrap" }}>
          <div style={{ maxWidth: "36rem" }}>
            <p className="font-mono" style={{ margin: 0, fontSize: 10, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a8a8a" }}>Featured · guided module</p>
            <h2 style={{ margin: "10px 0 0", fontSize: 21, fontWeight: 600, letterSpacing: "-0.025em", color: "#ffffff" }}>Pick a first product that survives COD</h2>
            <p style={{ margin: "8px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "#8a8a8a" }}>Demand checks with real data, RTO screening, margin floors and the sample-order step - walked through one step at a time.</p>
          </div>
          <Link href="/app/tasks/product-selection" className="btn-primary" style={{ flexShrink: 0, gap: 9, minHeight: 44, padding: "0 20px", borderRadius: 11, fontSize: "13.5px" }}>Start the module →</Link>
        </div>
      </section>

      {/* Resource grid */}
      <div style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 12 }}>
        {visible.flatMap((category) =>
          category.links.map((link) => (
            <ResourceCard key={link.url} link={link} categoryId={category.id} />
          ))
        )}
      </div>
    </main>
  );
}
