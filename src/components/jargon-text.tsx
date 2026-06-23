"use client";

import { segmentJargon } from "@/lib/jargon";
import { useJargon } from "@/components/jargon-provider";

type Props = {
  text: string;
  className?: string;
};

export function JargonText({ text, className }: Props) {
  const { open } = useJargon();
  const segments = segmentJargon(text);

  return (
    <span className={className}>
      {segments.map((seg, i) =>
        seg.type === "jargon" ? (
          <button
            key={`${seg.value}-${i}`}
            type="button"
            onClick={() => open(seg.entry)}
            className="border-b border-dashed border-amber-300/60 text-amber-100 hover:text-amber-50"
          >
            {seg.value}
          </button>
        ) : (
          <span key={i}>{seg.value}</span>
        ),
      )}
    </span>
  );
}
