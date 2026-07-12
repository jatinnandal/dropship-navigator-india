"use client";

import { useRef, useCallback } from "react";

const TRAPS = [
  {
    span: 7,
    stat: "35%",
    statLabel: "RTO rate on COD",
    title: "COD & RTO eat your margin",
    desc: "20-35 % of COD orders return unpaid. One bad confirmation call costs you ₹60-90 in forward + reverse shipping - Navigator makes you practice the call before your first real order.",
    danger: true,
  },
  {
    span: 5,
    stat: "₹0",
    statLabel: "hits your bank",
    title: "Revenue is not profit",
    desc: "Marketplace fees, TCS, RTO losses, and ad spend disappear before money lands. Dashboard sales lie - the built-in profit math doesn’t.",
    danger: true,
  },
  {
    span: 4,
    stat: "GST",
    statLabel: "blocked KYC",
    title: "GST maze from day one",
    desc: "Name mismatches between PAN, bank, and GST block KYC for weeks. We check yours first.",
    danger: false,
  },
  {
    span: 4,
    stat: "100%",
    statLabel: "advance demanded",
    title: "Supplier traps everywhere",
    desc: "AliExpress delivery kills COD. IndiaMART traders demand full advance with no samples. Vet with a scorecard, not vibes.",
    danger: false,
  },
  {
    span: 4,
    stat: "D-7",
    statLabel: "cash arrives late",
    title: "Cashflow dead zone",
    desc: "Meta bills today; COD cash arrives day 5-7. The cashflow simulator shows if you’ll survive week one.",
    danger: false,
  },
];

function TrapCard({
  trap,
}: {
  trap: (typeof TRAPS)[number];
}) {
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

  const dotColor = trap.danger ? "oklch(0.72 0.17 20)" : "#5a5a5a";
  const accentColor = trap.danger ? "oklch(0.8 0.13 20)" : "#8a8a8a";

  // Tailwind needs static class names - map the 12-col span, applied only at lg+.
  const spanClass =
    trap.span === 7 ? "lg:col-span-7" : trap.span === 5 ? "lg:col-span-5" : "lg:col-span-4";

  return (
    <div
      ref={cardRef}
      data-reveal
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={spanClass}
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

      <div
        style={{
          position: "absolute",
          top: -10,
          right: 16,
          fontSize: 110,
          fontWeight: 800,
          lineHeight: 1,
          color: "rgba(255,255,255,0.05)",
          pointerEvents: "none",
          userSelect: "none",
          fontFamily: "var(--font-sans)",
        }}
      >
        {trap.stat}
      </div>

      <div style={{ position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 4 }}>
          <span
            style={{
              fontSize: 38,
              fontWeight: 700,
              letterSpacing: "-0.04em",
              lineHeight: 1.1,
              color: accentColor,
              fontFamily: "var(--font-sans)",
            }}
          >
            {trap.stat}
          </span>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              letterSpacing: "0.04em",
              textTransform: "uppercase" as const,
              color: accentColor,
              fontFamily: "var(--font-mono)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: dotColor,
                flexShrink: 0,
              }}
            />
            {trap.statLabel}
          </span>
        </div>

        <h3
          style={{
            fontSize: 18,
            fontWeight: 600,
            color: "#ffffff",
            marginTop: 14,
            marginBottom: 8,
            fontFamily: "var(--font-sans)",
          }}
        >
          {trap.title}
        </h3>

        <p
          style={{
            fontSize: 13.5,
            lineHeight: 1.55,
            color: "#8a8a8a",
            margin: 0,
          }}
        >
          {trap.desc}
        </p>
      </div>
    </div>
  );
}

export function LandingTraps() {
  return (
    <section
      style={{
        padding: "100px 0",
        maxWidth: 1100,
        margin: "0 auto",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 48,
          marginBottom: 56,
          flexWrap: "wrap" as const,
        }}
      >
        <div style={{ flex: "1 1 520px" }}>
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
            The traps
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
            India e-commerce is not a{" "}
            <span className="font-serif-accent">YouTube tutorial.</span>
          </h2>
        </div>

        <p
          style={{
            flex: "0 1 340px",
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "#8a8a8a",
            paddingTop: 32,
            margin: 0,
          }}
        >
          Every trap below has burned real sellers - most within their first month.
          Navigator flags them before they cost you money.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-12">
        {TRAPS.map((trap) => (
          <TrapCard key={trap.stat} trap={trap} />
        ))}
      </div>
    </section>
  );
}
