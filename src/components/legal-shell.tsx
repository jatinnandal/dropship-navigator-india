import type { ReactNode } from "react";
import Link from "next/link";
import { NavigatorGlyph } from "@/components/app-logo";

/**
 * Readable, self-contained shell for public legal pages (Terms, Privacy).
 * Plain prose on the dark public theme.
 */
export function LegalShell({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: ReactNode;
}) {
  return (
    <div style={{ background: "#000", color: "#e6e6e6", minHeight: "100vh", fontFamily: "var(--font-sans)" }}>
      <style>{`
        .legal { max-width: 46rem; margin: 0 auto; padding: 32px 22px 80px; }
        .legal h2 { font-size: 18px; font-weight: 600; color: #fff; margin: 34px 0 10px; letter-spacing: -0.01em; }
        .legal h3 { font-size: 15px; font-weight: 600; color: #f0f0f0; margin: 20px 0 6px; }
        .legal p { font-size: 14.5px; line-height: 1.75; color: #b8b8b8; margin: 0 0 12px; }
        .legal ul { margin: 0 0 12px; padding-left: 20px; }
        .legal li { font-size: 14.5px; line-height: 1.7; color: #b8b8b8; margin: 0 0 6px; }
        .legal strong { color: #eaeaea; }
        .legal a { color: #fff; text-decoration: underline; text-underline-offset: 2px; }
        .legal-callout { border: 1px solid rgba(255,180,180,0.28); background: rgba(255,80,80,0.06); border-radius: 12px; padding: 16px 18px; margin: 18px 0; }
        .legal-callout p { color: #f3c9c9; margin: 0; }
        .legal-callout p + p { margin-top: 8px; }
      `}</style>

      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        <div style={{ maxWidth: "46rem", margin: "0 auto", padding: "18px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 9, textDecoration: "none", color: "#fff" }}>
            <NavigatorGlyph size={16} />
            <span style={{ fontSize: 14.5, fontWeight: 600 }}>Navigator <span style={{ fontWeight: 500, color: "#6e6e6e" }}>India</span></span>
          </Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/terms" style={{ color: "#8a8a8a", textDecoration: "none" }}>Terms</Link>
            <Link href="/privacy" style={{ color: "#8a8a8a", textDecoration: "none" }}>Privacy</Link>
            <Link href="/login" style={{ color: "#8a8a8a", textDecoration: "none" }}>Log in</Link>
          </nav>
        </div>
      </header>

      <main className="legal">
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", letterSpacing: "-0.02em", margin: "10px 0 4px" }}>{title}</h1>
        <p style={{ fontSize: 12.5, color: "#6e6e6e", margin: "0 0 8px" }}>Last updated: {lastUpdated}</p>
        {children}
      </main>
    </div>
  );
}
