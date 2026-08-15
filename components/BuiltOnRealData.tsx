"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

/* ---------------------------------------------------------------- icons -- */

function Icon({
  path,
  className = "h-full w-full",
}: {
  path: React.ReactNode;
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {path}
    </svg>
  );
}

const WINDOW_ICON = (
  <>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="M3 9h18M7 6.7h.01M10 6.7h.01" />
  </>
);
const SIGNAL_ICON = (
  <>
    <circle cx="12" cy="18" r="2.2" />
    <path d="M8.5 14.5a5 5 0 0 1 7 0M5.5 11a9 9 0 0 1 13 0M2.5 7.5a13 13 0 0 1 19 0" />
  </>
);
const SPARK_ICON = (
  <path d="M12 3.2 14 9.4l6.2 2-6.2 2-2 6.2-2-6.2-6.2-2 6.2-2z" />
);
const STORE_ICON = (
  <>
    <ellipse cx="12" cy="6.4" rx="7.6" ry="3" />
    <path d="M4.4 6.4v11.2c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3V6.4" />
    <path d="M4.4 12c0 1.7 3.4 3 7.6 3s7.6-1.3 7.6-3" />
  </>
);
const LINK_ICON = (
  <>
    <path d="M9.4 14.6 14.6 9.4" />
    <path d="M11.6 6.6 13 5.2a4.3 4.3 0 0 1 6.1 6.1l-1.4 1.4" />
    <path d="M12.4 17.4 11 18.8a4.3 4.3 0 0 1-6.1-6.1l1.4-1.4" />
  </>
);
const DOC_ICON = (
  <>
    <path d="M13.6 3.2H7a2 2 0 0 0-2 2v13.6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8.6z" />
    <path d="M13.4 3.4v5.2h5.2M8.6 13h6.8M8.6 16.6h4.4" />
  </>
);
const BOLT_ICON = <path d="M13.2 2.6 4.8 13.4h6L10.2 21.4l8.6-10.8h-6z" />;
const SHIELD_ICON = (
  <>
    <path d="M12 2.8 4.6 5.9v5.5c0 4.4 3.1 8.4 7.4 9.8 4.3-1.4 7.4-5.4 7.4-9.8V5.9z" />
    <path d="M8.9 12.1 11.2 14.4 15.4 10.2" />
  </>
);

/* ----------------------------------------------------------------- data -- */

const PILLS = [
  { name: "Next.js", sub: "Web app", icon: WINDOW_ICON },
  { name: "Sentinel-2", sub: "Satellite NDVI", icon: SIGNAL_ICON },
  { name: "OpenAI", sub: "Vision analysis", icon: SPARK_ICON },
  { name: "IPFS", sub: "Evidence storage", icon: STORE_ICON },
  { name: "Polygon", sub: "On-chain record", icon: LINK_ICON },
];

const FEATURES = [
  {
    title: "Evidence Trail",
    body: "Every submission keeps its photo, coordinates and scores.",
    icon: DOC_ICON,
  },
  {
    title: "Real Satellite Data",
    body: "Sentinel-2 NDVI, not estimates or self-reports.",
    icon: SIGNAL_ICON,
  },
  {
    title: "Fast Verification",
    body: "From upload to decision in seconds, not weeks.",
    icon: BOLT_ICON,
  },
  {
    title: "Tamper-Evident",
    body: "Once verified, the record lives on Polygon.",
    icon: SHIELD_ICON,
  },
];

const STEP_MS = 70;

/** Shared card chrome: dark, bordered, lifts to an accent border on hover. */
const CARD =
  "h-full rounded-xl border border-white/15 bg-white/[0.03] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_0_20px_-8px_theme(colors.accent/60%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0";

/* ------------------------------------------------------------ connectors -- */

/**
 * Decorative flow lines. Hidden below md: the rows wrap there, so arcs drawn
 * to fixed x positions would point at nothing. preserveAspectRatio="none" lets
 * the arcs stretch to whatever the container is; non-scaling-stroke keeps the
 * line weight even once stretched, and the arrowheads are open chevrons rather
 * than filled triangles so the mild horizontal skew doesn't read as a defect.
 */
function Connectors({
  paths,
  heads,
  className,
}: {
  paths: string[];
  heads: string[];
  className?: string;
}) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 110"
      preserveAspectRatio="none"
      className={`w-full text-white/25 ${className ?? ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.4}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
      {heads.map((d) => (
        <path key={d} d={d} vectorEffect="non-scaling-stroke" />
      ))}
    </svg>
  );
}

// Five arcs from the pill row converging toward the centre.
const IN_PATHS = [
  "M120 4C120 52 330 60 600 100",
  "M360 4C360 44 470 66 600 100",
  "M600 4L600 100",
  "M840 4C840 44 730 66 600 100",
  "M1080 4C1080 52 870 60 600 100",
];
const IN_HEADS = [
  "M588 88 601 101 590 106",
  "M590 86 601 101 592 105",
  "M593 90 600 101 607 90",
  "M610 86 599 101 608 105",
  "M612 88 599 101 610 106",
];

// Four arcs spreading back out toward the feature row.
const OUT_PATHS = [
  "M600 6C600 50 380 56 150 100",
  "M600 6C600 46 500 62 420 100",
  "M600 6C600 46 700 62 780 100",
  "M600 6C600 50 820 56 1050 100",
];
const OUT_HEADS = [
  "M160 88 149 101 162 105",
  "M412 88 420 101 430 90",
  "M770 88 780 101 790 90",
  "M1040 88 1051 101 1038 105",
];

/* ----------------------------------------------------------------- view -- */

export default function BuiltOnRealData() {
  const gridRef = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
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
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const reveal = (i: number) => ({
    className: `bord-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
      shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
    }`,
    style: { transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` },
  });

  // Both neighbors (ProofCards above, LiveStatus below) are the same black
  // grain as this section, so both edges use the same trimmed value — the
  // pt-16/pt-24 this used to carry was sized for a neighbor with its own
  // full pb-24, which double-counted the same gap from the other side.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-8 md:pb-10 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.bord-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div ref={gridRef} className="relative mx-auto max-w-7xl px-6 text-center">
        {/* 1. eyebrow */}
        <p className="inline-block -rotate-1 bg-accent px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.2em] text-text-dark">
          Built on Real Data
        </p>

        {/* 2. headline — h2 inherits font-display + uppercase from globals.css */}
        <h2 className="mt-7 text-3xl/[1.2] sm:text-4xl/[1.2] lg:text-5xl/[1.2]">
          <span className="block text-text-light">
            One Verification Pipeline.
          </span>
          <span className="block text-accent">Every Signal.</span>
        </h2>

        {/* 3. subhead */}
        <p className="mx-auto mt-6 max-w-2xl font-display text-sm/[1.7] text-text-light/55 sm:text-base/[1.7]">
          Carbon_Reef cross-checks field evidence against satellite and AI
          signals before anything is written on-chain.
        </p>

        {/* 4. integration pills */}
        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {PILLS.map((pill, i) => (
            <li key={pill.name} {...reveal(i)}>
              <div className={`flex items-center gap-3 p-3.5 text-left ${CARD}`}>
                <span className="block h-5 w-5 shrink-0 text-accent">
                  <Icon path={pill.icon} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate font-display text-sm text-text-light">
                    {pill.name}
                  </span>
                  <span className="block truncate text-[11px] text-text-light/45">
                    {pill.sub}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>

        {/* 5. centrepiece */}
        <Connectors
          paths={IN_PATHS}
          heads={IN_HEADS}
          className="mt-8 hidden h-16 md:block lg:h-20"
        />

        <p className="mt-8 font-display text-4xl tracking-tight sm:text-6xl lg:text-8xl md:mt-4">
          <span className="text-text-light">CARBON_</span>
          <span className="text-accent">REEF</span>
        </p>

        <p className="mt-6 inline-block rotate-1 bg-accent px-4 py-1.5 font-display text-[11px] uppercase tracking-[0.16em] text-text-dark">
          AI-Verified Blue Carbon Registry
        </p>

        <Connectors
          paths={OUT_PATHS}
          heads={OUT_HEADS}
          className="mt-8 hidden h-16 md:block lg:h-20"
        />

        {/* 6. feature cards */}
        <ul className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {FEATURES.map((feature, i) => (
            <li key={feature.title} {...reveal(PILLS.length + i)}>
              <div className={`flex items-start gap-3.5 p-4 text-left ${CARD}`}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-accent/40">
                  <span className="block h-4 w-4 text-accent">
                    <Icon path={feature.icon} />
                  </span>
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-sm text-text-light">
                    {feature.title}
                  </span>
                  <span className="mt-1 block text-[12px]/[1.5] text-text-light/45">
                    {feature.body}
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
