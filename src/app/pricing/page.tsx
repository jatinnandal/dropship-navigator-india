"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, X, ChevronDown } from "lucide-react";
import { FEATURES, PRICE_INR } from "@/lib/pricing-tiers";

const FAQ = [
  {
    q: "Can I try Premium features before paying?",
    a: "Yes — use the preview mode toggle on any gated tool to explore the full experience before committing.",
  },
  {
    q: "Is there a yearly plan?",
    a: "We're launching annual billing (₹3,999/year — save 33%) in September 2026.",
  },
  {
    q: "What payment methods do you accept?",
    a: "UPI, cards, net banking, and wallets via Razorpay. All prices include GST.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes. Cancel from your account settings — you keep access until the billing period ends.",
  },
];

export default function PricingPage() {
  const [toast, setToast] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  function handleStartPremium() {
    setToast(true);
    setTimeout(() => setToast(false), 3500);
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Toast */}
      {toast && (
        <div className="fixed left-1/2 top-6 z-50 -translate-x-1/2 rounded-lg border border-amber-500/30 bg-slate-900/95 px-5 py-3 text-sm text-amber-300 shadow-lg shadow-amber-500/10">
          Coming soon — launching in August 2026
        </div>
      )}

      <div className="text-center">
        <div className="eyebrow mb-2 text-xs">Pricing</div>
        <h1 className="font-display text-3xl font-bold text-slate-100 sm:text-4xl">
          Simple, transparent pricing
        </h1>
        <p className="text-muted mx-auto mt-3 max-w-lg text-sm">
          Start free with everything you need to launch. Upgrade when you want
          advanced simulators, full data access, and premium templates.
        </p>
      </div>

      {/* Pricing cards */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {/* Free tier */}
        <div className="glass-panel grain rounded-xl border p-6">
          <div className="inline-flex rounded-md bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
            ₹0 forever
          </div>
          <h2 className="font-display mt-4 text-xl font-bold text-slate-100">
            Free
          </h2>
          <p className="text-muted mt-1 text-sm">
            All the essentials to start your dropshipping business in India.
          </p>
          <Link
            href="/signup"
            className="btn-ghost mt-6 block w-full rounded-md border border-slate-600 px-4 py-2.5 text-center text-sm font-medium text-slate-200 transition-colors hover:border-slate-400"
          >
            Get started free
          </Link>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.id} className="flex items-center gap-2.5 text-sm">
                {f.freeIncluded ? (
                  <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                ) : (
                  <X className="h-4 w-4 shrink-0 text-slate-600" />
                )}
                <span className={f.freeIncluded ? "text-slate-200" : "text-slate-500"}>
                  {f.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Premium tier */}
        <div className="glass-panel grain relative rounded-xl border border-amber-500/30 p-6 shadow-lg shadow-amber-500/5">
          <div className="inline-flex rounded-md bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-400">
            ₹{PRICE_INR}/month
          </div>
          <h2 className="font-display mt-4 text-xl font-bold text-slate-100">
            Premium
          </h2>
          <p className="text-muted mt-1 text-sm">
            Advanced tools, full data access, and everything to scale past ₹1L/month.
          </p>
          <button
            onClick={handleStartPremium}
            className="btn-primary mt-6 block w-full rounded-md px-4 py-2.5 text-center text-sm font-medium"
          >
            Start Premium
          </button>
          <ul className="mt-6 space-y-3">
            {FEATURES.map((f) => (
              <li key={f.id} className="flex items-center gap-2.5 text-sm">
                <Check className="h-4 w-4 shrink-0 text-emerald-400" />
                <span className="text-slate-200">{f.label}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* FAQ */}
      <div className="mt-16">
        <h2 className="font-display text-center text-xl font-bold text-slate-100">
          Frequently asked questions
        </h2>
        <div className="mx-auto mt-8 max-w-2xl space-y-2">
          {FAQ.map((item, i) => (
            <div
              key={i}
              className="glass-panel-tertiary rounded-lg border p-4"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between text-left text-sm font-medium text-slate-200"
              >
                {item.q}
                <ChevronDown
                  className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${
                    openFaq === i ? "rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === i && (
                <p className="text-muted mt-2 text-sm">{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
