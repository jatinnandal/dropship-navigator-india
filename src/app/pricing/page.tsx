"use client";

import { useRef, useCallback, useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { FEATURES, PRICE_INR } from "@/lib/pricing-tiers";
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

const FREE_FEATURES = FEATURES.filter((f) => f.freeIncluded);
const PRO_FEATURES = FEATURES.filter((f) => f.premiumIncluded);

export default function PricingPage() {
  const [toast, setToast] = useState(false);
  const freeTilt = useTilt();
  const proTilt = useTilt();

  function handleStartPremium() {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", background: "#000000", color: "#f2f2f2", minHeight: "100vh", overflowX: "clip" }}>
      {/* Ambient light */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0, background: "radial-gradient(ellipse 55% 45% at 50% -10%, rgba(255,255,255,0.07), transparent 60%)" }} />

      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2" style={{ borderRadius: 14, padding: "10px 20px", background: "#060606", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 24px 48px -16px rgba(0,0,0,0.9)", fontSize: "13px", color: "#b8b8b8" }}>
          Coming soon — launching in August 2026
        </div>
      )}

      {/* Header */}
      <header style={{ position: "sticky", top: 16, zIndex: 50, display: "flex", justifyContent: "center", padding: "0 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24, width: "100%", maxWidth: "68rem", padding: "10px 12px 10px 20px", borderRadius: 16, background: "rgba(5,5,5,0.6)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(20px)" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
            <span style={{ display: "grid", placeItems: "center", height: 32, width: 32, borderRadius: 9, background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 20px -4px rgba(255,255,255,0.2)" }}>
              <NavigatorGlyph size={15} />
            </span>
            <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "#ffffff" }}>Navigator <span style={{ fontWeight: 500, color: "#6e6e6e" }}>India</span></span>
          </Link>
          <nav style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "13.5px", fontWeight: 500 }}>
            <Link href="/" className="hover:text-white transition-colors" style={{ color: "#8a8a8a", textDecoration: "none", padding: "8px 12px" }}>Home</Link>
            <Link href="/login" className="hover:border-white/35 transition-colors" style={{ color: "#d6d6d6", textDecoration: "none", padding: "8px 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.14)" }}>Log in</Link>
            <Link href="/signup" style={{ color: "#000", textDecoration: "none", padding: "9px 16px", borderRadius: 10, fontWeight: 600, background: "#ffffff", boxShadow: "0 0 30px -6px rgba(255,255,255,0.4)" }}>Start free</Link>
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
            Free until you&apos;re earning. <span className="font-serif-accent">Fair after.</span>
          </h1>
          <p style={{ margin: "16px auto 0", maxWidth: "32rem", fontSize: "15.5px", lineHeight: 1.7, color: "#8a8a8a" }}>
            The full route to your first payout costs nothing. Pro exists for when you&apos;re scaling — not before.
          </p>
        </div>

        {/* Tier cards */}
        <div style={{ marginTop: 52, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16, maxWidth: "54rem", marginLeft: "auto", marginRight: "auto" }}>
          {/* Free */}
          <section
            ref={freeTilt.ref as React.Ref<HTMLElement>}
            onMouseMove={freeTilt.onMove}
            onMouseLeave={freeTilt.onLeave}
            style={{ borderRadius: 22, padding: "32px 30px", background: "#060606", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)", willChange: "transform" }}
          >
            <p className="font-mono" style={{ margin: 0, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#8a8a8a" }}>Launch</p>
            <p style={{ margin: "14px 0 0", fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>₹0<span style={{ fontSize: 15, fontWeight: 500, color: "#6e6e6e" }}> / forever</span></p>
            <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "#8a8a8a" }}>Everything you need to get from zero to first payout.</p>
            <div style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 11 }}>
              {FREE_FEATURES.map((f) => (
                <div key={f.id} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Check size={13} className="shrink-0 mt-0.5" style={{ color: "oklch(0.75 0.12 165)" }} />
                  <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.55, color: "#c9c9c9" }}>{f.label}</p>
                </div>
              ))}
            </div>
            <Link href="/signup" className="hover:border-white/40 hover:text-white transition-colors" style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", minHeight: 48, borderRadius: 12, fontSize: "14.5px", fontWeight: 600, color: "#d6d6d6", textDecoration: "none", border: "1px solid rgba(255,255,255,0.18)", background: "rgba(255,255,255,0.03)" }}>
              Start free
            </Link>
          </section>

          {/* Pro */}
          <section
            ref={proTilt.ref as React.Ref<HTMLElement>}
            onMouseMove={proTilt.onMove}
            onMouseLeave={proTilt.onLeave}
            style={{ position: "relative", borderRadius: 22, padding: "32px 30px", background: "linear-gradient(165deg, #101010, #050505)", border: "1px solid rgba(255,255,255,0.28)", boxShadow: "0 0 60px -20px rgba(255,255,255,0.25), inset 0 1px 0 rgba(255,255,255,0.14)", willChange: "transform" }}
          >
            <span className="font-mono" style={{ position: "absolute", top: -12, left: 30, padding: "4px 12px", borderRadius: 999, background: "#ffffff", color: "#000", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>when you&apos;re scaling</span>
            <p className="font-mono" style={{ margin: 0, fontSize: 11, letterSpacing: "0.16em", textTransform: "uppercase", color: "#ffffff" }}>Navigator Pro</p>
            <p style={{ margin: "14px 0 0", fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", color: "#ffffff" }}>₹{PRICE_INR}<span style={{ fontSize: 15, fontWeight: 500, color: "#6e6e6e" }}> / month</span></p>
            <p style={{ margin: "10px 0 0", fontSize: "13.5px", lineHeight: 1.65, color: "#8a8a8a" }}>For sellers past first payout — deeper tools, more plans, priority help.</p>
            <div style={{ margin: "22px 0 0", display: "flex", flexDirection: "column", gap: 11 }}>
              {PRO_FEATURES.map((f) => (
                <div key={f.id} style={{ display: "flex", gap: 11, alignItems: "flex-start" }}>
                  <Check size={13} className="shrink-0 mt-0.5" style={{ color: "#ffffff" }} />
                  <p style={{ margin: 0, fontSize: "13.5px", lineHeight: 1.55, color: "#e0e0e0" }}>{f.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={handleStartPremium}
              className="hover:-translate-y-px transition-transform"
              style={{ marginTop: 26, display: "flex", alignItems: "center", justifyContent: "center", width: "100%", minHeight: 48, borderRadius: 12, fontSize: "14.5px", fontWeight: 600, color: "#000", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", background: "#ffffff", boxShadow: "0 8px 36px -10px rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.12)" }}
            >
              Upgrade to Pro
            </button>
            <p className="font-mono" style={{ margin: "12px 0 0", textAlign: "center", fontSize: 11, color: "#5a5a5a" }}>cancel anytime · no card for free plan</p>
          </section>
        </div>

        {/* Honesty note */}
        <div style={{ margin: "40px auto 0", maxWidth: "34rem", display: "flex", gap: 12, borderRadius: 14, padding: "16px 20px", background: "#060606", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ flexShrink: 0, display: "grid", placeItems: "center", width: 32, height: 32, borderRadius: "50%", background: "#ffffff", color: "#000", fontSize: 14 }}>🧭</div>
          <p style={{ margin: 0, fontSize: 13, lineHeight: 1.7, color: "#b8b8b8" }}>
            <span className="font-serif-accent" style={{ fontSize: "14.5px", color: "#ffffff" }}>&ldquo;Don&apos;t buy Pro yet.</span> Seriously — if you haven&apos;t launched, the free plan is the whole mentor. Upgrade when reconciling settlements starts eating your evenings.&rdquo;
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ position: "relative", zIndex: 1, borderTop: "1px solid rgba(255,255,255,0.08)", padding: "36px 0" }}>
        <div style={{ maxWidth: "68rem", margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, padding: "0 32px", flexWrap: "wrap" }}>
          <p style={{ margin: 0, fontSize: "13.5px", fontWeight: 500, color: "#6e6e6e" }}>Navigator — vendor-neutral seller mentor for India</p>
          <div style={{ display: "flex", gap: 22, fontSize: "13.5px", fontWeight: 500 }}>
            <Link href="/login" className="hover:text-white transition-colors" style={{ color: "#5a5a5a", textDecoration: "none" }}>Log in</Link>
            <Link href="/signup" className="hover:text-white transition-colors" style={{ color: "#5a5a5a", textDecoration: "none" }}>Sign up</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
