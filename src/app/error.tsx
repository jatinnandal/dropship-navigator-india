"use client";

import { useEffect } from "react";
import Link from "next/link";
import { reportError } from "@/lib/report-error";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "route", digest: error.digest });
  }, [error]);

  return (
    <main style={{ minHeight: "70vh", display: "grid", placeItems: "center", padding: 24, fontFamily: "var(--font-sans)", color: "#e6e6e6" }}>
      <div style={{ maxWidth: 420, textAlign: "center" }}>
        <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>Something went wrong</h1>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#8a8a8a", margin: "0 0 20px" }}>
          An unexpected error occurred. You can try again, or head back to your dashboard.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button
            onClick={reset}
            style={{ minHeight: 44, borderRadius: 10, padding: "0 22px", fontSize: 14, fontWeight: 600, color: "#000", border: "none", cursor: "pointer", fontFamily: "var(--font-sans)", background: "#ffffff" }}
          >
            Try again
          </button>
          <Link
            href="/app"
            style={{ display: "inline-flex", alignItems: "center", minHeight: 44, borderRadius: 10, padding: "0 22px", fontSize: 14, fontWeight: 600, color: "#e6e6e6", textDecoration: "none", border: "1px solid rgba(255,255,255,0.16)" }}
          >
            Go to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
