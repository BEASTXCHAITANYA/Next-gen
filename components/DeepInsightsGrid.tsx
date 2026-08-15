"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

type IconProps = { path: React.ReactNode };

function Icon({ path }: IconProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-full w-full"
    >
      {path}
    </svg>
  );
}

const SIGNAL_ICON = (
  <>
    <circle cx="12" cy="18" r="2.2" />
    <path d="M8.5 14.5a5 5 0 0 1 7 0M5.5 11a9 9 0 0 1 13 0M2.5 7.5a13 13 0 0 1 19 0" />
  </>
);
const CAMERA_ICON = (
  <>
    <path d="M3 8.5h3.2L8 6.2h8l1.8 2.3H21v10.5H3z" />
    <circle cx="12" cy="13.5" r="3.4" />
  </>
);
const CUBE_ICON = (
  <>
    <path d="M12 2.8 3.5 7.4v9.2L12 21.2l8.5-4.6V7.4z" />
    <path d="M3.5 7.4 12 12l8.5-4.6M12 12v9.2" />
  </>
);
const PEOPLE_ICON = (
  <>
    <circle cx="9.2" cy="8.4" r="3.2" />
    <path d="M2.6 19.6c0-3.4 2.9-5.6 6.6-5.6s6.6 2.2 6.6 5.6" />
    <path d="M16.4 5.6a3.2 3.2 0 0 1 0 5.7M18.2 19.6c0-2.1-.7-3.8-1.9-5" />
  </>
);
const EYE_ICON = (
  <>
    <path d="M2.2 12S5.9 6.2 12 6.2 21.8 12 21.8 12 18.1 17.8 12 17.8 2.2 12 2.2 12Z" />
    <circle cx="12" cy="12" r="3.1" />
  </>
);
const SPARK_ICON = (
  <path d="M12 3.2 14 9.4l6.2 2-6.2 2-2 6.2-2-6.2-6.2-2 6.2-2z" />
);
const LINK_ICON = (
  <>
    <path d="M9.4 14.6 14.6 9.4" />
    <path d="M11.6 6.6 13 5.2a4.3 4.3 0 0 1 6.1 6.1l-1.4 1.4" />
    <path d="M12.4 17.4 11 18.8a4.3 4.3 0 0 1-6.1-6.1l1.4-1.4" />
  </>
);

const FEATURES = [
  {
    title: "Satellite Verified",
    body: "Every site is checked against real Sentinel-2 vegetation data, not self-reports.",
    icon: SIGNAL_ICON,
  },
  {
    title: "AI Photo Analysis",
    body: "Vision models confirm mangrove presence in every submitted photo.",
    icon: CAMERA_ICON,
  },
  {
    title: "On-Chain Record",
    body: "Verified sites are written to Polygon as tamper-evident proof.",
    icon: CUBE_ICON,
  },
  {
    title: "Community First",
    body: "Coastal communities submit evidence directly from the field.",
    icon: PEOPLE_ICON,
  },
  {
    title: "Open by Default",
    body: "Every verification decision and its evidence trail is inspectable.",
    icon: EYE_ICON,
  },
];

const SIGNALS = [
  { label: "Photos", sub: "Geo-tagged field evidence", icon: CAMERA_ICON },
  { label: "Satellite", sub: "Sentinel-2 NDVI", icon: SIGNAL_ICON },
  { label: "AI", sub: "Vision classification", icon: SPARK_ICON },
  { label: "Chain", sub: "Polygon record", icon: LINK_ICON },
];

/** Entrance stagger between cards. */
const STEP_MS = 80;

export default function DeepInsightsGrid() {
  const gridRef = useRef<HTMLUListElement>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    // Reduced motion short-circuits the observer entirely: reveal at once so
    // nothing depends on an animation that is never going to run.
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setReduced(true);
      setShown(true);
      return;
    }

    const el = gridRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setShown(true);
          io.disconnect();
        }
      },
      // Fires a touch before the grid is fully in view so the stagger has
      // finished by the time the reader's eye reaches the last card.
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Top keeps its full value — the section above is the quote's photo
  // background, a real visual break where extra breathing room is earned.
  // Bottom is trimmed: ProofCards below is the same black grain, and the old
  // 96+96px of stacked padding at that seam left a ~320px void.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-16 md:pb-10 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      {/* Without JS the observer never runs, so the cards would stay at
          opacity-0 forever. */}
      <noscript>
        <style>{`.di-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* h2 already picks up font-display + uppercase from globals.css. */}
        <h2 className="relative inline-block pb-3 text-2xl text-text-light sm:text-3xl">
          Real Data. Real Proof.
          <span
            aria-hidden
            className="absolute inset-x-0 bottom-0 h-3 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
          />
        </h2>

        {/* Entrance (opacity/translate, 500ms + stagger) rides on the li, hover
            (lift/border, 200ms) on the inner card — two elements so the two
            transforms compose instead of fighting over one transition. */}
        <ul
          ref={gridRef}
          className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5"
        >
          {FEATURES.map((feature, i) => (
            <li
              key={feature.title}
              className={`di-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
            >
              <div className="h-full rounded-xl border border-white/15 bg-white/[0.03] p-5 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="block h-6 w-6 text-accent">
                  <Icon path={feature.icon} />
                </span>
                <h3 className="mt-4 text-sm normal-case tracking-normal text-text-light">
                  {feature.title}
                </h3>
                <p className="mt-2 text-[13px]/[1.55] text-text-light/55">
                  {feature.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <p className="mt-14 text-center font-display text-[11px] uppercase tracking-[0.18em] text-accent">
          One Pipeline &middot; Every Signal
        </p>

        <ul className="mt-5 flex flex-wrap items-center justify-center gap-3">
          {SIGNALS.map((signal) => (
            <li key={signal.label}>
              <div className="flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.03] px-4 py-2.5 transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="block h-4 w-4 shrink-0 text-accent">
                  <Icon path={signal.icon} />
                </span>
                {/* Special Elite ships a single weight, so the label leads on
                    case and full-strength colour rather than a synthesised
                    bold, which would smear a typewriter face. */}
                <span className="font-display text-xs uppercase tracking-wide text-text-light">
                  {signal.label}
                </span>
                <span className="text-[11px] text-text-light/45">
                  {signal.sub}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
