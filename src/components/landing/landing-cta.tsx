"use client";

import Link from "next/link";

export function LandingCta() {
  return (
    <section
      style={{
        maxWidth: "76rem",
        margin: "0 auto",
        padding: "0 40px 110px",
      }}
    >
      <div
        data-reveal
        style={{
          position: "relative",
          borderRadius: 28,
          padding: "76px 40px",
          textAlign: "center",
          background: "linear-gradient(165deg, #0d0d0d, #030303)",
          border: "1px solid rgba(255,255,255,0.14)",
          boxShadow:
            "0 40px 100px -40px rgba(0,0,0,0.95), 0 0 80px -30px rgba(255,255,255,0.12)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 90% at 50% -30%, rgba(255,255,255,0.12), transparent)",
            pointerEvents: "none",
          }}
        />

        <h2
          style={{
            position: "relative",
            fontSize: "clamp(2.1rem, 4.2vw, 3.4rem)",
            fontWeight: 600,
            color: "#ffffff",
            lineHeight: 1.15,
            margin: 0,
          }}
        >
          Ready to launch{" "}
          <span className="font-serif-accent">the right way?</span>
        </h2>

        <p
          style={{
            position: "relative",
            fontSize: 16,
            maxWidth: "32rem",
            margin: "20px auto 0",
            color: "#8a8a8a",
            lineHeight: 1.6,
          }}
        >
          A mentor that tells you what to do next, not what to Google. Free to
          start — no credit card required.
        </p>

        <div
          style={{
            position: "relative",
            display: "flex",
            justifyContent: "center",
            gap: 12,
            marginTop: 36,
            flexWrap: "wrap",
          }}
        >
          <Link
            href="/signup"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 32px",
              borderRadius: 10,
              backgroundColor: "#ffffff",
              color: "#000000",
              fontSize: 15,
              fontWeight: 600,
              border: "none",
              cursor: "pointer",
              boxShadow:
                "0 0 30px -4px rgba(255,255,255,0.35), 0 2px 8px rgba(0,0,0,0.4)",
              textDecoration: "none",
            }}
          >
            Chart my route — free
          </Link>

          <Link
            href="/login"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "14px 32px",
              borderRadius: 10,
              backgroundColor: "transparent",
              color: "#ffffff",
              fontSize: 15,
              fontWeight: 500,
              border: "1px solid rgba(255,255,255,0.18)",
              textDecoration: "none",
              cursor: "pointer",
              transition: "border-color 0.2s",
            }}
          >
            Log in
          </Link>
        </div>

        <p
          className="font-mono"
          style={{
            position: "relative",
            fontSize: 12,
            color: "#5a5a5a",
            marginTop: 28,
            letterSpacing: "0.01em",
          }}
        >
          Free to start · no credit card · built for Indian sellers
        </p>
      </div>
    </section>
  );
}
