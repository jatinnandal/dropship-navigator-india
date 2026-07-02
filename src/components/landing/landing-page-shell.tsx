"use client";

import type { ReactNode } from "react";
import { ScrollAtmosphere } from "@/components/motion/scroll-atmosphere";
import { SmoothScroll } from "@/components/motion/smooth-scroll";

type Props = {
  children: ReactNode;
};

export function LandingPageShell({ children }: Props) {
  return (
    <SmoothScroll>
      <ScrollAtmosphere />
      {children}
    </SmoothScroll>
  );
}
