"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import CountUp from "@/components/CountUp";
import { MagneticButton } from "@/components/motion/magnetic-button";

export function LandingHero() {
  const heroCardRef = useRef<HTMLDivElement>(null);
  const smoothRef = useRef({ x: 0, y: 0 });
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouseRef.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("mousemove", onMouseMove);

    let raf: number;
    const loop = () => {
      smoothRef.current.x +=
        (mouseRef.current.x - smoothRef.current.x) * 0.06;
      smoothRef.current.y +=
        (mouseRef.current.y - smoothRef.current.y) * 0.06;
      if (heroCardRef.current) {
        heroCardRef.current.style.transform = `rotateY(${smoothRef.current.x * 9}deg) rotateX(${-smoothRef.current.y * 7}deg)`;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="relative z-[1]">
      <div className="mx-auto box-border grid min-h-[88vh] max-w-[76rem] grid-cols-1 items-center gap-10 px-5 pb-10 pt-[84px] sm:px-8 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:px-10">
        {/* Left column */}
        <div>
          {/* Eyebrow */}
          <p data-reveal className="eyebrow m-0">
            India-first mentor for new and growing online sellers
          </p>

          {/* Headline */}
          <h1
            data-reveal
            className="display-xl mt-6 text-white"
            style={{ textWrap: "balance" }}
          >
            From first doubt to
            <span
              className="font-serif-accent"
              style={{
                letterSpacing: "-0.01em",
                background: "linear-gradient(180deg, #ffffff 40%, #6a6a6a)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              {" "}
              first payout.
            </span>
          </h1>

          {/* Body */}
          <p
            data-reveal
            className="mt-6 max-w-[34rem] text-[17px] leading-[1.7] text-[var(--muted)]"
          >
            GST rejections, COD returns, supplier scams - most Indian sellers
            quit before money ever reaches their bank. Not a course you forget,
            not a YouTube rabbit hole, not an agency that owns your store -
            Navigator is a mentor that tells you the next step, not what to
            Google, and warns you before every trap.
          </p>

          {/* CTAs */}
          <div
            data-reveal
            className="mt-9 flex flex-wrap items-center gap-3"
          >
            <MagneticButton
              href="/signup"
              className="btn-primary inline-flex min-h-[52px] items-center gap-2.5 rounded-[13px] px-7 text-[15.5px] font-semibold"
            >
              Chart my route - free
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
              >
                <path
                  d="M2 8 H13 M9 3.5 L13.5 8 L9 12.5"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </MagneticButton>
            <Link
              href="#route"
              className="btn-ghost inline-flex min-h-[52px] items-center gap-2 rounded-[13px] px-[22px] text-[15px]"
              style={{ backdropFilter: "blur(10px)" }}
            >
              See how it works
            </Link>
          </div>

          {/* Risk reversal */}
          <p data-reveal className="font-mono mt-3.5 text-[12.5px] text-[#5a5a5a]">
            Free to start · no credit card · your first seller profile is free
          </p>

          {/* Stats row */}
          <div
            data-reveal
            className="mt-11 flex items-stretch gap-5 sm:gap-9"
          >
            <div>
              <p className="font-mono m-0 text-[25px] font-medium text-white">
                <CountUp to={4} duration={1.6} />
              </p>
              <p className="mono-label-sm mt-1">channels covered</p>
            </div>
            <div
              className="w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div>
              <p className="font-mono m-0 text-[25px] font-medium text-white">
                <CountUp to={7} duration={1.6} />
                -stage
              </p>
              <p className="mono-label-sm mt-1">launch route</p>
            </div>
            <div
              className="w-px"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div>
              <p className="font-mono m-0 text-[25px] font-medium text-white">
                ₹<CountUp to={0} duration={1.6} />
              </p>
              <p className="mono-label-sm mt-1">to start</p>
            </div>
          </div>
        </div>

        {/* Right column - 3D hero card (desktop only; its floating chips can't fit narrow screens) */}
        <div className="hidden lg:block" style={{ perspective: "1400px", position: "relative" }}>
          <div
            ref={heroCardRef}
            style={{
              transformStyle: "preserve-3d",
              willChange: "transform",
              position: "relative",
            }}
          >
            {/* Base panel */}
            <div
              className="relative overflow-hidden rounded-[22px]"
              style={{
                background: "linear-gradient(165deg, #0e0e0e, #050505)",
                border: "1px solid rgba(255,255,255,0.14)",
                boxShadow:
                  "0 60px 120px -30px rgba(0,0,0,0.95), 0 0 60px -20px rgba(255,255,255,0.12), inset 0 1px 0 rgba(255,255,255,0.12)",
                padding: "26px",
              }}
            >
              {/* Radial light */}
              <div
                className="pointer-events-none absolute"
                style={{
                  top: "-50%",
                  left: "20%",
                  width: "60%",
                  height: "100%",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.07), transparent 65%)",
                }}
              />
              {/* Grid texture */}
              <div
                className="pointer-events-none absolute inset-0"
                style={{
                  backgroundImage:
                    "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)",
                  backgroundSize: "34px 34px",
                }}
              />

              {/* Header row */}
              <div className="relative flex items-center justify-between">
                <div>
                  <p className="mono-label-sm m-0" style={{ letterSpacing: "0.16em" }}>
                    Your route · Stage 2 of 7
                  </p>
                  <p className="m-0 mt-1.5 text-[19px] font-semibold tracking-[-0.02em] text-white">
                    Pick your hero product
                  </p>
                </div>
                <div
                  className="grid h-[54px] w-[54px] place-items-center rounded-full"
                  style={{
                    background:
                      "conic-gradient(#ffffff 0deg 137deg, rgba(255,255,255,0.1) 137deg 360deg)",
                    boxShadow: "0 0 30px -8px rgba(255,255,255,0.35)",
                  }}
                >
                  <div className="font-mono grid h-[42px] w-[42px] place-items-center rounded-full bg-[#060606] text-xs text-white">
                    <CountUp to={38} duration={1.6} />%
                  </div>
                </div>
              </div>

              {/* Mini route SVG */}
              <div
                className="relative mt-5"
                style={{
                  height: "96px",
                  transform: "translateZ(30px)",
                }}
              >
                <svg
                  viewBox="0 0 380 96"
                  className="block h-full w-full"
                >
                  <path
                    d="M16 70 C 90 70 90 28 165 28 S 250 70 320 70"
                    fill="none"
                    stroke="rgba(255,255,255,0.12)"
                    strokeWidth="2.5"
                  />
                  <path
                    d="M16 70 C 90 70 90 28 140 28"
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth="2.5"
                    strokeDasharray="6 6"
                    style={{
                      animation: "dashFlow 1.6s linear infinite",
                      filter:
                        "drop-shadow(0 0 4px rgba(255,255,255,0.6))",
                    }}
                  />
                  <circle
                    cx="16"
                    cy="70"
                    r="9"
                    fill="oklch(0.72 0.13 165)"
                  />
                  <path
                    d="M12 70 L15 73 L21 66"
                    stroke="#03140d"
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <circle
                    cx="140"
                    cy="30"
                    r="11"
                    fill="#ffffff"
                    style={{
                      animation: "pulseGlow 2.4s ease-in-out infinite",
                    }}
                  />
                  <circle
                    cx="140"
                    cy="30"
                    r="16"
                    fill="none"
                    stroke="rgba(255,255,255,0.4)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="245"
                    cy="58"
                    r="8"
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="320"
                    cy="70"
                    r="8"
                    fill="rgba(255,255,255,0.1)"
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1.5"
                  />
                  <text
                    x="16"
                    y="92"
                    textAnchor="middle"
                    fill="oklch(0.72 0.13 165)"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    GST
                  </text>
                  <text
                    x="140"
                    y="12"
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize="10"
                    fontWeight="600"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Product
                  </text>
                  <text
                    x="245"
                    y="82"
                    textAnchor="middle"
                    fill="#6e6e6e"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Supplier
                  </text>
                  <text
                    x="320"
                    y="92"
                    textAnchor="middle"
                    fill="#6e6e6e"
                    fontSize="10"
                    fontWeight="500"
                    fontFamily="'IBM Plex Mono', monospace"
                  >
                    Launch
                  </text>
                </svg>
              </div>

              {/* Mentor note */}
              <div
                className="mt-3 flex gap-3 rounded-[14px] border border-white/[0.16] bg-[#0a0a0a] p-[14px_16px]"
                style={{
                  transform: "translateZ(55px)",
                  boxShadow: "0 24px 50px -16px rgba(0,0,0,0.9)",
                }}
              >
                <div className="grid h-[34px] w-[34px] shrink-0 place-items-center rounded-full bg-white text-[15px] text-black">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                </div>
                <div>
                  <p className="mono-label-sm m-0">Mentor note</p>
                  <p className="m-0 mt-1 text-[13px] leading-[1.55] text-[#c9c9c9]">
                    Skip the sample order and a bad first review can quietly
                    kill the listing. Order it today -{" "}
                    <span className="font-mono text-white">₹280, 4 days</span>.
                  </p>
                </div>
              </div>
            </div>

            {/* Floating chip: Break-even ROAS */}
            <div
              className="float-y absolute rounded-[14px] border border-white/[0.2] bg-[#0a0a0a] p-[13px_16px]"
              style={{
                top: "-26px",
                right: "-30px",
                transform: "translateZ(95px)",
                boxShadow:
                  "0 30px 60px -18px rgba(0,0,0,0.95), 0 0 34px -10px rgba(255,255,255,0.25)",
              }}
            >
              <p className="mono-label-sm m-0" style={{ letterSpacing: "0.12em" }}>
                Break-even ROAS
              </p>
              <p className="font-mono m-0 mt-1 text-[21px] font-medium text-white">
                2.4x
              </p>
            </div>

            {/* Floating chip: RTO-safe margin */}
            <div
              className="absolute rounded-[14px] bg-[#0a0a0a] p-[13px_16px]"
              style={{
                bottom: "-24px",
                left: "-34px",
                transform: "translateZ(80px)",
                animation: "floatY 7s ease-in-out 0.8s infinite",
                border: "1px solid oklch(0.72 0.13 165 / 0.45)",
                boxShadow:
                  "0 30px 60px -18px rgba(0,0,0,0.95), 0 0 34px -10px oklch(0.72 0.13 165 / 0.35)",
              }}
            >
              <p className="mono-label-sm m-0" style={{ letterSpacing: "0.12em" }}>
                RTO-safe margin
              </p>
              <p className="font-mono m-0 mt-1 text-[21px] font-medium" style={{ color: "oklch(0.78 0.12 165)" }}>
                ₹112
              </p>
            </div>

            {/* Floating chip: RTO alert */}
            <div
              className="absolute flex items-center gap-2 rounded-[10px] bg-[#0a0a0a] p-[9px_15px]"
              style={{
                top: "42%",
                right: "-46px",
                transform: "translateZ(65px)",
                animation: "floatY 5.5s ease-in-out 1.6s infinite",
                border: "1px solid oklch(0.72 0.17 20 / 0.5)",
                boxShadow: "0 24px 50px -16px rgba(0,0,0,0.95)",
              }}
            >
              <span
                className="pulse-glow h-[7px] w-[7px] rounded-full"
                style={{ background: "oklch(0.72 0.17 20)" }}
              />
              <p className="font-mono m-0 text-[11px] font-medium" style={{ color: "oklch(0.85 0.13 20)" }}>
                RTO alert: 32% in your pincode band
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Trust band */}
      <div className="mx-auto max-w-[64rem] px-5 pb-2 sm:px-10">
        <p className="text-center text-[14px] leading-[1.7] text-[var(--muted)]">
          Fee math built on a real, dated 2026 marketplace rate card - not a
          guru&apos;s guesstimate. Vendor-neutral: no supplier kickbacks, and your
          data stays yours.
        </p>
      </div>

      {/* Marquee */}
      <div className="mx-auto max-w-[76rem] px-5 pb-[72px] sm:px-10">
        <p className="mono-label-sm mb-3.5 text-center" style={{ letterSpacing: "0.18em" }}>
          Guidance for every major Indian channel
        </p>
        <div
          className="overflow-hidden"
          style={{
            maskImage:
              "linear-gradient(90deg, transparent, black 15%, black 85%, transparent)",
          }}
        >
          <div
            className="flex w-max gap-14 text-base font-semibold tracking-[0.02em] text-[#3d3d3d]"
            style={{ animation: "marqueeSlide 26s linear infinite" }}
          >
            <span>MEESHO</span>
            <span>AMAZON.IN</span>
            <span>FLIPKART</span>
            <span>SHOPIFY</span>
            <span>INDIAMART</span>
            <span>MYNTRA</span>
            <span>JIOMART</span>
            <span>MEESHO</span>
            <span>AMAZON.IN</span>
            <span>FLIPKART</span>
            <span>SHOPIFY</span>
            <span>INDIAMART</span>
            <span>MYNTRA</span>
            <span>JIOMART</span>
          </div>
        </div>
      </div>
    </section>
  );
}
