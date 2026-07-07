"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { useEffect } from "react";

const ParticleBackground = dynamic(
  () => import("./particle-background").then((m) => m.ParticleBackground),
  { ssr: false }
);

type Props = {
  children: ReactNode;
};

export function LandingPageShell({ children }: Props) {
  useEffect(() => {
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
      <ParticleBackground />
      <div className="ambient-light" />
      {children}
    </div>
  );
}
