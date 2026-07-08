"use client";

type DataMeta = {
  readonly lastVerified: string;
  readonly sources: readonly string[];
};

export function DataFreshness({ meta }: { meta: DataMeta }) {
  const verified = new Date(meta.lastVerified);
  const monthYear = verified.toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });

  const daysSince = Math.floor(
    (Date.now() - verified.getTime()) / 86_400_000,
  );
  const stale = daysSince > 90;

  return (
    <div
      className="font-mono"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        fontSize: "10px",
        letterSpacing: "0.08em",
        color: stale ? "oklch(0.75 0.15 25)" : "var(--text-faint)",
        padding: "4px 10px",
        borderRadius: 999,
        border: `1px solid ${stale ? "oklch(0.65 0.18 25 / 0.3)" : "rgba(255,255,255,0.08)"}`,
        background: stale ? "oklch(0.25 0.05 25 / 0.15)" : "transparent",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: stale ? "oklch(0.7 0.18 25)" : "oklch(0.75 0.16 155)",
          flexShrink: 0,
        }}
      />
      Rates verified {monthYear}
      {stale && " · may be outdated"}
    </div>
  );
}
