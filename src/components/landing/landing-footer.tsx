import Link from "next/link";
import { NavigatorGlyph } from "@/components/app-logo";

const LINKS = [
  { label: "Log in", href: "/login" },
  { label: "Sign up", href: "/signup" },
  { label: "Pricing", href: "/pricing" },
] as const;

export function LandingFooter() {
  return (
    <footer
      style={{
        borderTop: "1px solid rgba(255,255,255,0.08)",
        padding: "36px 0",
      }}
    >
      <style>{`
        .mono-footer-link { color: #5a5a5a; text-decoration: none; font-size: 13.5px; transition: color 0.2s; }
        .mono-footer-link:hover { color: #ffffff; }
      `}</style>
      <div
        style={{
          maxWidth: "76rem",
          margin: "0 auto",
          padding: "0 40px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <NavigatorGlyph size={14} />
          <span
            style={{
              fontSize: 13.5,
              color: "#6e6e6e",
            }}
          >
            Navigator — vendor-neutral seller mentor for India
          </span>
        </div>

        <nav style={{ display: "flex", gap: 22 }}>
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="mono-footer-link"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
