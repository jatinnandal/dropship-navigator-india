"use client";

import { useRef, useCallback } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { PLAN_CARDS, type PlanCard } from "@/lib/pricing-tiers";
import { NavigatorGlyph } from "@/components/app-logo";

function useTilt() {
  const ref = useRef<HTMLElement>(null);
  const onMove = useCallback((e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transition = "transform 90ms linear";
    el.style.transform = `perspective(1000px) rotateY(${px * 4}deg) rotateX(${-py * 4}deg) translateY(-2px)`;
  }, []);
  const onLeave = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 450ms cubic-bezier(0.22,1,0.36,1)";
    el.style.transform = "none";
  }, []);
  return { ref, onMove, onLeave };
}

function TierCard({ card, children }: { card: PlanCard; children: React.ReactNode }) {
  const tilt = useTilt();
  const base: React.CSSProperties = card.highlight
    ? { position: "relative", borderRadius: 22, padding: "32px 30px", background: "linear-gradient(165deg, #101010, #050505)", border: "1px solid rgba(255,255,255,0.28)", boxShadow: "0 0 60px -20px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.14)", willChange: "transform" }
    : { position: "relative", borderRadius: 22, padding: "32px 30px", background: "#060606", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)", willChange: "transform" };

  return (
    <section ref={tilt.ref as React.Ref<HTMLElement>} onMouseMove={tilt.onMove} onMouseLeave={tilt.onLeave} style={base}>
      {card.highlight ? (
        <span className="font-mono" style={{ position: "absolute", top: -12, left: 30, padding: "4px 12px", borderRadius: 999, background: "#ffffff", color: "#000", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>most popular</span>
      ) : null}
      <p className="font-mono" style={{ margin: 0, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: card.highlight ? "#ffffff" : "#8a8a8a" }}>{card.name}</p>
      <p style={{ margin: "14px 0 0", fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>
        ₹{card.priceMonthly}
        <span style={{ fontSize: 15, fontWeight: 500, color: "#6e6e6e" }}>{card.priceMonthly === 0 ? " / forever" : " / month"}</span>
      </p>
      {card.priceYearly ? (
        <p className="font-mono" style={{ margin: "6px 0 0", fontSize: 11, color: "#6e6e6e" }}>
          or ₹{card.priceYearly}/year, billed once upfront - save {Math.round((1 - card.priceYearly / (card.priceMonthly * 12)) * 100)}%
        </p>
      ) : null}
      <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "#8a8a8a" }}>{card.tagline}</p>
      <div style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 11 }}>
        {card.features.map((f) => (
          <div key={f} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
            <Check size={13} className="shrink-0 mt-0.5" style={{ color: "oklch(0.75 0.12 165)" }} />
            <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.55, color: "#c9c9c9" }}>{f}</p>
          </div>
        ))}
      </div>
      {children}
    </section>
  );
}

export default function PricingPage() {
  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#000000", color: "#f2f2f2", minHeight: "100vh", overflowX: "clip" }}>
      {/* Ambient light */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 55% 45% at 50% -10%, rgba(255,255,255,0.07), transparent 60%)" }} />

      {/* Header */}
      <header style={{ position: "sticky", top: 16, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 16px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, width: "100%", maxWidth: "68rem", padding: "10px 12px 10px 20px", borderRadius: 16, background: "rgba(5,5,5,0.6)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <span style={{ display: "grid", placeItems: "center", height: 32, width: 32, borderRadius: 9, background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 20px -4px rgba(255,255,255,0.2)" }}>
              <NavigatorGlyph size={15} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "#ffffff" }}>Navigator <span style={{ fontWeight: 500, color: "#6e6e6e" }}>India</span></span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "13.5px", fontWeight: 500 }}>
            <Link href="/" className="hidden hover:text-white transition-colors sm:inline-block" style={{ color: "#8a8a8a", textDecoration: "none", padding: "8px 12px" }}>Home</Link>
            <Link href="/login" className="hover:border-white/35 transition-colors" style={{ color: "#d6d6d6", textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)", whiteSpace: "nowrap" }}>Log in</Link>
            <Link href="/signup" style={{ color: "#000", textDecoration: "none", padding: "9px 16px", borderRadius: 10, fontWeight: 600, background: "#ffffff", boxShadow: "0 0 30px -6px rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>Start free</Link>
          </nav>
        </div>
      </header>

      <main style={{ position: "relative", zIndex: 1, maxWidth: "68rem", margin: "0 auto", padding: "70px 32px 100px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center" }}>
          <p style={{ margin: 0, display: "inline-flex", alignItems: "center", gap: 14, fontSize: 12, fontWeight: 600, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9a9a9a" }}>
            <span style={{ display: "inline-block", width: 34, height: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.2), #ffffff)" }} />
            Pricing
            <span style={{ display: "inline-block", width: 34, height: 1, background: "linear-gradient(90deg, #ffffff, rgba(255,255,255,0.2))" }} />
          </p>
          <h1 style={{ margin: "16px auto 0", maxWidth: "40rem", fontSize: "clamp(2.2rem, 4.5vw, 3.4rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.05, color: "#ffffff", textWrap: "balance" }}>
            The full mentor from ₹49. <span className="font-serif-accent">Not ₹20,000.</span>
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: "32rem", fontSize: "15.5px", lineHeight: 1.7, color: "#8a8a8a" }}>
            The ₹20,000 course, replaced by ₹49 a month - with math that&apos;s actually correct.
            Scout for free, upgrade when you&apos;re ready to launch.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {PLAN_CARDS.map((card) => (
            <TierCard key={card.plan} card={card}>
              {card.plan === "free" ? (
                <Link href="/signup" className="hover:-translate-y-px transition-transform" style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 12, fontSize: "14.5px", fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
                  Start free
                </Link>
              ) : null}
              {card.plan === "starter" ? (
                <Link href={`/signup?next=${encodeURIComponent("/app/plans?plan=starter")}`} className="hover:-translate-y-px transition-transform" style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 12, fontSize: "14.5px", fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
                  Get Starter →
                </Link>
              ) : null}
              {card.plan === "growth" ? (
                <Link href={`/signup?next=${encodeURIComponent("/app/plans?plan=growth")}`} className="hover:-translate-y-px transition-transform" style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 12, fontSize: "14.5px", fontWeight: 600, color: "#000", textDecoration: "none", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}>
                  Get Growth →
                </Link>
              ) : null}
            </TierCard>
          ))}
        </div>

      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "36px 0" }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 32px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 500, color: "#6e6e6e" }}>Navigator - vendor-neutral seller mentor for India</p>
          <div style={{ display: "flex", gap: 22, fontSize: "13.5px", fontWeight: 500 }}>
            <Link href="/login" className="hover:text-white transition-colors" style={{ color: "#5a5a5a", textDecoration: "none" }}>Log in</Link>
            <Link href="/signup" className="hover:text-white transition-colors" style={{ color: "#5a5a5a", textDecoration: "none" }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
