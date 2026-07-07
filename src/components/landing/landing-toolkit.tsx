"use client";

import { useRef, useCallback } from "react";

const TOOLS = [
  {
    icon: "🧮",
    title: "Profit margin calculator",
    desc: "Real margins across Amazon, Flipkart, Meesho & Shopify — fees, TCS and RTO weighting included.",
  },
  {
    icon: "📞",
    title: "COD call simulator",
    desc: "Practice the confirmation call that decides whether an order ships or returns.",
  },
  {
    icon: "🛡️",
    title: "Supplier scorecard",
    desc: "Vet IndiaMART suppliers systematically — catch the red flags that kill 60% of sellers.",
  },
  {
    icon: "📅",
    title: "GST filing calendar",
    desc: "GSTR-1, GSTR-3B, TCS reconciliation — with prep checklists so you never miss a deadline.",
  },
];

function ToolCard({ tool }: { tool: (typeof TOOLS)[number] }) {
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const cx = rect.width / 2;
    const cy = rect.height / 2;
    const rotateY = ((x - cx) / cx) * 6;
    const rotateX = ((cy - y) / cy) * 4;
    card.style.setProperty("--sx", `${x}px`);
    card.style.setProperty("--sy", `${y}px`);
    card.style.transform = `perspective(600px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = "perspective(600px) rotateX(0deg) rotateY(0deg)";
  }, []);

  return (
    <div
      ref={cardRef}
      data-reveal
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        background: "#070707",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: 18,
        padding: 28,
        position: "relative",
        overflow: "hidden",
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1)",
        willChange: "transform",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(400px circle at var(--sx, 50%) var(--sy, 50%), rgba(255,255,255,0.06), transparent 60%)",
          pointerEvents: "none",
          borderRadius: 18,
        }}
      />

      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.16)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            marginBottom: 18,
            boxShadow: "0 0 20px rgba(255,255,255,0.04)",
          }}
        >
          {tool.icon}
        </div>

        <h3
          style={{
            fontSize: 16.5,
            fontWeight: 600,
            color: "#ffffff",
            margin: "0 0 8px 0",
            fontFamily: "var(--font-sans)",
          }}
        >
          {tool.title}
        </h3>

        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "#8a8a8a",
            margin: 0,
          }}
        >
          {tool.desc}
        </p>
      </div>
    </div>
  );
}

export function LandingToolkit() {
  return (
    <section
      id="toolkit"
      style={{
        padding: "100px 0",
        maxWidth: 1100,
        margin: "0 auto",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ marginBottom: 56 }}>
        <p className="eyebrow" style={{ marginBottom: 14 }}>
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 1,
              background: "rgba(255,255,255,0.25)",
              verticalAlign: "middle",
              marginRight: 10,
            }}
          />
          The toolkit
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 3.2vw, 42px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            margin: 0,
            fontFamily: "var(--font-sans)",
          }}
        >
          Practice the expensive lessons{" "}
          <span className="font-serif-accent">for free.</span>
        </h2>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
        }}
      >
        {TOOLS.map((tool) => (
          <ToolCard key={tool.title} tool={tool} />
        ))}
      </div>
    </section>
  );
}
