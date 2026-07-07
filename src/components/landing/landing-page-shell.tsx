"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";

type Props = {
  children: ReactNode;
};

export function LandingPageShell({ children }: Props) {
  useEffect(() => {
    // Scroll reveal observer
    const els = document.querySelectorAll("[data-reveal]");
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => {
          if (en.isIntersecting) {
            en.target.classList.add("revealed");
            io.unobserve(en.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-[var(--background)]">
      {/* WebGL background placeholder */}
      <div data-webgl-bg className="pointer-events-none fixed inset-0 z-0" />
      {/* Ambient light layer */}
      <div className="ambient-light" />
      {children}
    </div>
  );
}
