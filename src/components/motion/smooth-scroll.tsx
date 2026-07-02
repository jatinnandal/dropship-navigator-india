"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

/** Smooth scrolling is now handled by CSS `scroll-behavior: smooth` on <html>. */
export function SmoothScroll({ children }: Props) {
  return <>{children}</>;
}
