"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { NavigatorGlyph } from "@/components/app-logo";
import { MagneticButton } from "@/components/motion/magnetic-button";

export function LandingHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className="sticky top-4 z-50 flex justify-center px-6">
      <div
        className="flex w-full max-w-[68rem] items-center justify-between gap-6 rounded-2xl px-5 py-2.5 pr-3 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(5,5,5,0.6)" : "rgba(5,5,5,0.4)",
          border: "1px solid var(--border-default)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow: "0 12px 40px -16px rgba(0,0,0,0.9)",
        }}
      >
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-[11px]">
          <span className="grid h-8 w-8 place-items-center rounded-[9px] border border-white/[0.18] bg-[#0c0c0c] shadow-[0_0_20px_-4px_rgba(255,255,255,0.2)]">
            <NavigatorGlyph size={15} />
          </span>
          <span className="text-[15px] font-semibold tracking-[-0.01em] text-white">
            Navigator{" "}
            <span className="font-medium text-[var(--text-faint)]">India</span>
          </span>
        </Link>

        {/* Nav */}
        <nav className="flex items-center gap-1 text-[13.5px] font-medium">
          <a
            href="#route"
            className="hidden rounded-[9px] px-3 py-2 text-[var(--muted)] transition-colors hover:text-white sm:inline-flex"
          >
            The route
          </a>
          <a
            href="#toolkit"
            className="hidden rounded-[9px] px-3 py-2 text-[var(--muted)] transition-colors hover:text-white sm:inline-flex"
          >
            Toolkit
          </a>
          <Link
            href="/pricing"
            className="hidden rounded-[9px] px-3 py-2 text-[var(--muted)] transition-colors hover:text-white sm:inline-flex"
          >
            Pricing
          </Link>
          <Link
            href="/login"
            className="whitespace-nowrap rounded-[10px] border border-white/[0.14] px-3.5 py-2 text-[#d6d6d6] transition-colors hover:border-white/[0.35] hover:text-white"
          >
            Log in
          </Link>
          <MagneticButton
            href="/signup"
            className="inline-block whitespace-nowrap rounded-[10px] bg-white px-4 py-[9px] text-sm font-semibold text-black shadow-[0_0_30px_-6px_rgba(255,255,255,0.4)]"
          >
            Start free
          </MagneticButton>
        </nav>
      </div>
    </header>
  );
}
