"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

/**
 * The accent yellow is unreadable on paper — #e6ff00 on #f0f0eb measures
 * 1.02:1. This is the same hue dropped to 44% value, the first step that
 * clears AA for small text at 4.75:1, so the mark still reads as the brand
 * yellow rather than an arbitrary olive.
 */
const OLIVE = "#657000";

const CARDS = [
  {
    body: "Every photo, coordinate and satellite reading is stitched into one verifiable submission record.",
    title: "Evidence Trail",
    subtitle: "See the full story of any site",
    tilt: "-rotate-[1deg]",
  },
  {
    body: "Real Sentinel-2 vegetation data confirms what the photo claims, before anything is minted.",
    title: "Satellite Cross-Check",
    subtitle: "From upload to proof in seconds",
    tilt: "rotate-[0.5deg]",
  },
  {
    body: "Verified sites are written to Polygon, so the record cannot be quietly edited later.",
    title: "On-Chain Record",
    subtitle: "Tamper-evident by default",
    tilt: "-rotate-[0.5deg]",
  },
];

const STEP_MS = 100;

export default function ProofCards() {
  const listRef = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setShown(true);
      return;
    }
    const el = listRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Both neighbors (DeepInsightsGrid above, BuiltOnRealData below) are the
  // same black grain, so both edges get the same trimmed value rather than
  // the old symmetric py-24 that doubled up against each of them in turn.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-8 md:pb-10 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.pc-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="lg:grid lg:grid-cols-[13rem_1fr_5.5rem] lg:items-center lg:gap-8">
          {/* ---------------------------------------------- left annotation */}
          <aside aria-hidden className="hidden lg:block">
            {/* Sparkle above the ellipse. */}
            <svg
              viewBox="0 0 24 24"
              className="mx-auto h-5 w-5 text-text-light/70"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.4}
              strokeLinejoin="round"
            >
              <path d="M12 3.4 13.7 9l5.6 1.7-5.6 1.7L12 18l-1.7-5.6L4.7 10.7 10.3 9z" />
            </svg>

            <div className="relative mt-2">
              {/* Two passes of a rough ellipse, neither closing cleanly and
                  each bulging differently, so it reads as drawn rather than
                  as a geometric <ellipse>. */}
              <svg
                viewBox="0 0 200 132"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full text-text-light/60"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.6}
                strokeLinecap="round"
              >
                <path
                  d="M98 9C148 6 191 31 193 64C195 97 148 124 98 121C48 118 9 98 7 65C5 32 48 12 98 9"
                  vectorEffect="non-scaling-stroke"
                />
                <path
                  d="M104 15C152 14 186 36 187 64C188 93 145 118 99 117C53 116 15 96 13 67C11 39 51 18 96 14"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>

              <p className="relative px-9 py-11 text-center font-annotate text-[26px]/[1.15] text-text-light">
                Follow the <span className="text-accent">Proof</span> not the
                Hunch
              </p>
            </div>

            {/* Curved arrow pointing right, toward the cards. */}
            <svg
              viewBox="0 0 96 56"
              className="ml-auto mt-1 h-12 w-24 text-text-light/60"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M6 8C14 34 38 49 84 44"
                vectorEffect="non-scaling-stroke"
              />
              <path d="M72 34 86 44 71 50" vectorEffect="non-scaling-stroke" />
            </svg>
          </aside>

          {/* ------------------------------------------------------- cards */}
          <ul
            ref={listRef}
            className="grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6"
          >
            {CARDS.map((card, i) => (
              <li
                key={card.title}
                className={`pc-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                  shown ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
                }`}
                style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
              >
                {/* rotate and the hover lift are both Tailwind transform
                    utilities, so they compose through --tw-rotate /
                    --tw-translate-y instead of overwriting each other. */}
                <div
                  className={`relative flex h-full flex-col rounded-sm bg-paper px-6 pb-6 pt-9 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.85)] transition-[transform,box-shadow] duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_20px_44px_-12px_rgba(0,0,0,0.95)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${card.tilt}`}
                >
                  {/* Tape strip, straddling the card's top edge. */}
                  <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 -rotate-3 border border-white/10 bg-neutral-400/30"
                  />

                  <p
                    className="flex items-center gap-2 font-display text-[11px] uppercase tracking-[0.16em]"
                    style={{ color: OLIVE }}
                  >
                    <span
                      aria-hidden
                      className="block h-1.5 w-1.5 rotate-45"
                      style={{ backgroundColor: OLIVE }}
                    />
                    Carbon_Reef
                  </p>

                  <p className="mt-5 font-display text-[15px]/[1.65] text-text-dark">
                    {card.body}
                  </p>

                  {/* mt-auto pushes the footer down, so the cards agree on a
                      baseline however long the body copy runs. */}
                  <div className="mt-auto pt-12">
                    {/* Special Elite has a single weight, so the title leads on
                        size and full-strength ink rather than a synthesised
                        bold, which smears a typewriter face. */}
                    <p className="font-display text-lg text-text-dark">
                      {card.title}
                    </p>
                    <p className="mt-1 font-display text-xs text-text-dark/55">
                      {card.subtitle}
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>

          {/* --------------------------------------------- right annotation */}
          <aside aria-hidden className="hidden text-accent lg:block">
            <p className="font-annotate text-xl">and more</p>
            <svg
              viewBox="0 0 48 72"
              className="mt-1 h-16 w-12"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.6}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path
                d="M14 6C26 20 30 42 24 62"
                vectorEffect="non-scaling-stroke"
              />
              <path d="M15 52 24 65 34 55" vectorEffect="non-scaling-stroke" />
            </svg>
          </aside>
        </div>
      </div>
    </section>
  );
}
