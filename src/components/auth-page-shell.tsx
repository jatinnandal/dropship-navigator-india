"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { NavigatorGlyph } from "@/components/app-logo";

type AuthPageShellProps = {
  children: ReactNode;
};

export function AuthPageShell({ children }: AuthPageShellProps) {
  return (
    <div className="flex min-h-screen items-center justify-center overflow-x-clip p-5 sm:p-8" style={{ fontFamily: "var(--font-sans)", background: "#000000", color: "#f2f2f2" }}>
     <div
       className="grid w-full max-w-[1040px] grid-cols-1 overflow-hidden rounded-[26px] lg:grid-cols-2"
       style={{ minHeight: "min(620px, calc(100vh - 64px))", border: "1px solid rgba(255,255,255,0.1)", background: "#050505", boxShadow: "0 40px 90px -40px rgba(0,0,0,0.95), inset 0 1px 0 rgba(255,255,255,0.05)" }}
     >

      {/* Left: brand panel */}
      <aside className="hidden lg:flex" style={{ position: "relative", flexDirection: "column", justifyContent: "space-between", padding: "40px 44px", overflow: "hidden", borderRight: "1px solid rgba(255,255,255,0.08)", boxSizing: "border-box" }}>
        <div style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(ellipse 70% 55% at 30% 20%, rgba(255,255,255,0.07), transparent 60%)" }} />
        <div className="grid-texture" style={{ position: "absolute", inset: 0, pointerEvents: "none" }} />

        <Link href="/" style={{ position: "relative", display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none" }}>
          <span style={{ display: "grid", placeItems: "center", height: 32, width: 32, borderRadius: 9, background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.18)", boxShadow: "0 0 20px -4px rgba(255,255,255,0.2)" }}>
            <NavigatorGlyph size={15} />
          </span>
          <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: "-0.01em", color: "#ffffff" }}>Navigator <span style={{ fontWeight: 500, color: "#6e6e6e" }}>India</span></span>
        </Link>

        <div style={{ position: "relative" }}>
          <h1 style={{ margin: 0, fontSize: "clamp(2rem, 3.2vw, 2.9rem)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.08, color: "#ffffff", maxWidth: "16ch" }}>
            From first doubt to <span className="font-serif-accent">first payout.</span>
          </h1>
          <p style={{ margin: "16px 0 0", maxWidth: "26rem", fontSize: "14.5px", lineHeight: 1.7, color: "#8a8a8a" }}>
            Your route, your progress, your streak - saved to your account, not a browser cookie.
          </p>

          {/* Floating proof chip */}
          <div className="float-y" style={{ marginTop: 30, display: "inline-block" }}>
            <div style={{ borderRadius: 14, padding: "14px 18px", background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.16)", boxShadow: "0 24px 48px -16px rgba(0,0,0,0.9), 0 0 30px -12px rgba(255,255,255,0.2)" }}>
              <p className="font-mono" style={{ margin: 0, fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6e6e6e" }}>Built on</p>
              <p className="font-mono" style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 500, color: "#ffffff" }}>2026 <span style={{ fontSize: 12, color: "#8a8a8a" }}>verified marketplace rates</span></p>
            </div>
          </div>
        </div>

        <p className="font-mono" style={{ position: "relative", margin: 0, fontSize: 11, color: "#4a4a4a" }}>vendor-neutral · no affiliate pushing · your data stays yours</p>
      </aside>

      {/* Right: auth card */}
      <main className="col-span-1" style={{ display: "grid", placeItems: "center", padding: 40, boxSizing: "border-box" }}>
        <div style={{ width: "100%", maxWidth: 380 }}>
          {children}
        </div>
      </main>
     </div>
    </div>
  );
}
