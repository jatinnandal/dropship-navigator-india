"use client";

import { useState, useEffect } from "react";
import { isPremiumUser } from "@/lib/pricing-tiers";
import { Lock, Sparkles } from "lucide-react";
import Link from "next/link";

interface PremiumGateProps {
  feature: string;
  children: React.ReactNode;
}

export function PremiumGate({ feature, children }: PremiumGateProps) {
  const [premium, setPremium] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setPremium(isPremiumUser());
  }, []);

  if (premium) {
    return <>{children}</>;
  }

  if (dismissed) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm">{children}</div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="glass-panel grain mx-4 max-w-sm rounded-xl border border-amber-500/30 p-6 text-center shadow-lg shadow-amber-500/5">
          <div className="mx-auto mb-3 inline-flex rounded-lg border border-amber-500/30 bg-amber-500/10 p-2.5">
            <Lock className="h-5 w-5 text-amber-400" />
          </div>
          <h3 className="font-display text-base font-semibold text-slate-100">
            Premium Feature
          </h3>
          <p className="text-muted mt-1 text-sm">
            <span className="text-amber-300">{feature}</span> is available on
            the Premium plan.
          </p>
          <ul className="mt-3 space-y-1 text-left text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Advanced simulators &amp; scorecards
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-amber-400" />
              Full seasonal calendar &amp; benchmarks
            </li>
            <li className="flex items-center gap-2">
              <Sparkles className="h-3 w-3 text-amber-400" />
              All WhatsApp templates &amp; success stories
            </li>
          </ul>
          <Link
            href="/pricing"
            className="btn-primary mt-4 inline-block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium"
          >
            Unlock Premium — ₹499/month
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-muted mt-2 block w-full text-xs hover:text-slate-300 transition-colors"
          >
            Maybe later
          </button>
          <button
            onClick={() => {
              localStorage.setItem("dni-premium", "true");
              setPremium(true);
            }}
            className="mt-2 block w-full text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
          >
            Enable preview mode (demo)
          </button>
        </div>
      </div>
    </div>
  );
}
