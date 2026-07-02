"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AppLogo } from "@/components/app-logo";
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
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? "header-scrolled" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <AppLogo href="/" subtitle="Seller operating system for India" />
        <div className="flex items-center gap-2">
          <Link href="/login" className="btn-landing-secondary min-h-[44px] rounded-md px-4 py-2 text-sm font-medium">
            Log in
          </Link>
          <MagneticButton
            href="/signup"
            className="btn-landing-primary min-h-[44px] rounded-md px-4 py-2 text-sm font-medium"
          >
            Get started free
          </MagneticButton>
        </div>
      </div>
    </header>
  );
}
