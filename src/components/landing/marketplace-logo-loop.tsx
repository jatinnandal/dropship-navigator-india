"use client";

import LogoLoop from "@/components/LogoLoop";

const MARKETPLACES = [
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">Amazon</span> },
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">Flipkart</span> },
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">Meesho</span> },
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">Shiprocket</span> },
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">IndiaMART</span> },
  { node: <span className="font-display text-sm font-semibold tracking-wide text-neutral-400">GST Portal</span> },
];

export function MarketplaceLogoLoop() {
  return (
    <div className="mt-8">
      <p className="mb-4 text-center text-xs uppercase tracking-widest text-neutral-500">
        Built for Indian marketplaces & logistics
      </p>
      <LogoLoop
        logos={MARKETPLACES}
        speed={40}
        logoHeight={20}
        gap={48}
        fadeOut
        fadeOutColor="#0a0a0a"
        pauseOnHover
        ariaLabel="Supported Indian marketplaces and tools"
      />
    </div>
  );
}
