"use client";

import { useRef, useCallback } from "react";

const STOPS = [
  { left: "7%", top: "62%", label: "Docs & GST", sub: "done", labelColor: "oklch(0.8 0.12 165)", border: "oklch(0.72 0.13 165 / 0.45)", glow: "oklch(0.72 0.13 165 / 0.45)" },
  { left: "33%", top: "14%", label: "Product", sub: "you are here", labelColor: "#ffffff", border: "rgba(255,255,255,0.5)", glow: "rgba(255,255,255,0.5)" },
  { left: "62%", top: "64%", label: "Supplier", sub: "next", labelColor: "#d6d6d6", border: "rgba(255,255,255,0.25)", glow: undefined },
  { left: "73%", top: "36%", label: "Compliance", sub: "open", labelColor: "#8a8a8a", border: "rgba(255,255,255,0.16)", glow: undefined },
  { left: "86%", top: "8%", label: "Launch", sub: "open", labelColor: "#8a8a8a", border: "rgba(255,255,255,0.16)", glow: undefined },
  { left: "95%", top: "42%", label: "Payout", sub: "goal", labelColor: "#6e6e6e", border: "rgba(255,255,255,0.12)", glow: undefined },
];

export function LandingRouteMap() {
  const mapRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const el = mapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.transform = `rotateX(${46 + y * -10}deg) rotateZ(${x * 4}deg)`;
  }, []);

  const handleMouseLeave = useCallback(() => {
    const el = mapRef.current;
    if (!el) return;
    el.style.transform = "rotateX(46deg) rotateZ(0deg)";
  }, []);

  return (
    <section
      id="route"
      style={{
        padding: "100px 0",
        maxWidth: 1100,
        margin: "0 auto",
        paddingLeft: 24,
        paddingRight: 24,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <p className="eyebrow" style={{ marginBottom: 14, justifyContent: "center" }}>
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
          The route
          <span
            style={{
              display: "inline-block",
              width: 24,
              height: 1,
              background: "rgba(255,255,255,0.25)",
              verticalAlign: "middle",
              marginLeft: 10,
            }}
          />
        </p>
        <h2
          style={{
            fontSize: "clamp(28px, 3.2vw, 42px)",
            fontWeight: 600,
            lineHeight: 1.15,
            letterSpacing: "-0.03em",
            color: "#ffffff",
            margin: "0 auto",
            maxWidth: 620,
            fontFamily: "var(--font-sans)",
          }}
        >
          One lit path from paperwork to{" "}
          <span className="font-serif-accent">payout.</span>
        </h2>
        <p
          style={{
            fontSize: 14.5,
            lineHeight: 1.6,
            color: "#8a8a8a",
            maxWidth: 480,
            margin: "16px auto 0",
          }}
        >
          Six checkpoints. Each one unlocks only after the previous is verified —
          so you never skip ahead into a trap.
        </p>
      </div>

      <div
        style={{
          perspective: 900,
          perspectiveOrigin: "50% 30%",
        }}
      >
        <div
          ref={mapRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            position: "relative",
            width: "100%",
            height: 380,
            background: "#070707",
            borderRadius: 18,
            border: "1px solid rgba(255,255,255,0.1)",
            transform: "rotateX(46deg) rotateZ(0deg)",
            transformStyle: "preserve-3d",
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)",
            overflow: "hidden",
          }}
        >
          <div
            className="grid-texture"
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 18,
              pointerEvents: "none",
              opacity: 0.5,
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse 60% 50% at 35% 40%, rgba(255,255,255,0.07), transparent 70%)",
              pointerEvents: "none",
              borderRadius: 18,
            }}
          />

          <svg
            viewBox="0 0 1000 380"
            fill="none"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              pointerEvents: "none",
            }}
          >
            <path
              d="M 70 240 Q 200 60, 330 60 T 620 250 T 730 140 T 860 40 T 950 160"
              stroke="#333"
              strokeWidth="2"
              fill="none"
            />
            <path
              d="M 70 240 Q 200 60, 330 60 T 620 250 T 730 140 T 860 40 T 950 160"
              stroke="rgba(255,255,255,0.7)"
              strokeWidth="2"
              fill="none"
              strokeDasharray="8 6"
              style={{ animation: "dashFlow 18s linear infinite" }}
            />
          </svg>

          {STOPS.map((stop) => (
            <div
              key={stop.label}
              style={{
                position: "absolute",
                left: stop.left,
                top: stop.top,
                transform: "translate(-50%, -50%)",
                zIndex: 2,
              }}
            >
              <div
                style={{
                  background: "#0a0a0a",
                  border: `1px solid ${stop.border}`,
                  borderRadius: 10,
                  padding: "7px 12px",
                  whiteSpace: "nowrap" as const,
                  boxShadow: stop.glow ? `0 0 16px ${stop.glow}` : undefined,
                }}
              >
                <span
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: stop.labelColor,
                    fontFamily: "var(--font-sans)",
                  }}
                >
                  {stop.label}
                </span>
                <span
                  className="mono-label-sm"
                  style={{
                    display: "block",
                    fontSize: 10,
                    color: stop.labelColor,
                    opacity: 0.65,
                    marginTop: 1,
                  }}
                >
                  {stop.sub}
                </span>
              </div>
              <div
                style={{
                  width: 1,
                  height: 18,
                  background: stop.border,
                  margin: "0 auto",
                }}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
