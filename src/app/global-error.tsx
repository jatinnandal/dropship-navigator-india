"use client";

import { useEffect } from "react";
import { reportError } from "@/lib/report-error";

/**
 * Catches errors in the root layout itself (where the normal error boundary
 * can't render). Must include <html> and <body>.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    reportError(error, { boundary: "global", digest: error.digest });
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#000", color: "#e6e6e6", fontFamily: "system-ui, sans-serif" }}>
        <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
          <div style={{ maxWidth: 420, textAlign: "center" }}>
            <h1 style={{ fontSize: 22, fontWeight: 600, color: "#fff", margin: "0 0 8px" }}>Something went wrong</h1>
            <p style={{ fontSize: 14, lineHeight: 1.6, color: "#8a8a8a", margin: "0 0 20px" }}>
              An unexpected error occurred. Please try again.
            </p>
            <button
              onClick={reset}
              style={{ minHeight: 44, borderRadius: 10, padding: "0 22px", fontSize: 14, fontWeight: 600, color: "#000", border: "none", cursor: "pointer", background: "#ffffff" }}
            >
              Try again
            </button>
          </div>
        </main>
      </body>
    </html>
  );
}
