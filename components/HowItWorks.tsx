"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

/* ---------------------------------------------------------------- icons -- */

function Icon({ path }: { path: React.ReactNode }) {
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

const UPLOAD_ICON = (
  <>
    <path d="M12 15.5V4.2M8.2 8l3.8-3.8L15.8 8" />
    <path d="M4 15v3.4a1.6 1.6 0 0 0 1.6 1.6h12.8a1.6 1.6 0 0 0 1.6-1.6V15" />
  </>
);
const VERIFY_ICON = (
  <>
    <path d="M12 2.8 4.6 5.9v5.5c0 4.4 3.1 8.4 7.4 9.8 4.3-1.4 7.4-5.4 7.4-9.8V5.9z" />
    <path d="M8.9 12.1 11.2 14.4 15.4 10.2" />
  </>
);
const MINT_ICON = (
  <>
    <path d="M12 2.8 3.5 7.4v9.2L12 21.2l8.5-4.6V7.4z" />
    <path d="M3.5 7.4 12 12l8.5-4.6M12 12v9.2" />
  </>
);
const TRADE_ICON = (
  <>
    <path d="M3.4 8.4h14.2M14.2 5l3.4 3.4-3.4 3.4" />
    <path d="M20.6 15.6H6.4M9.8 12.2l-3.4 3.4 3.4 3.4" />
  </>
);
const PIN_ICON = (
  <>
    <path d="M12 21.2s6.6-6 6.6-11.2a6.6 6.6 0 1 0-13.2 0C5.4 15.2 12 21.2 12 21.2Z" />
    <circle cx="12" cy="10" r="2.4" />
  </>
);

/* ----------------------------------------------------------------- data -- */

type Dot = "green" | "yellow" | "muted";
type Row = {
  label: string;
  value?: string;
  dot?: Dot;
  /** This is the one line still in flight, so its dot pulses. */
  pulse?: boolean;
};

type Panel = {
  heading: string;
  /** Opts this panel out of the hover lift/glow — static content that
   *  doesn't invite interaction (currently just "File"). */
  noHover?: boolean;
} & (
  | { kind: "rows"; rows: Row[]; hoverRows?: boolean }
  | { kind: "coords"; lat: string; lng: string }
  | { kind: "note"; lines: string[] }
  | { kind: "chart"; points: string }
  | { kind: "hash"; hash: string; action: string }
);

type Step = {
  num: string;
  title: string;
  body: string;
  icon: React.ReactNode;
  panels: Panel[];
};

const STEPS: Step[] = [
  {
    num: "01",
    title: "Upload",
    body: "Community members submit geo-tagged photos of mangrove restoration sites.",
    icon: UPLOAD_ICON,
    panels: [
      {
        heading: "Submission Log",
        kind: "rows",
        rows: [
          { label: "Photo captured", value: "09:41:02", dot: "green" },
          {
            label: "GPS locked · 21.94°N, 88.18°E",
            value: "09:41:08",
            dot: "green",
          },
          { label: "Pinned to IPFS", value: "09:41:23", dot: "green" },
          {
            label: "Status: Pending",
            value: "09:41:24",
            dot: "yellow",
            pulse: true,
          },
        ],
      },
      { heading: "Site Location", kind: "coords", lat: "21.94° N", lng: "88.18° E" },
      {
        heading: "File",
        kind: "rows",
        noHover: true,
        rows: [
          { label: "Name", value: "site-4417-a.jpg" },
          { label: "Size", value: "2.4 MB" },
          { label: "Format", value: "JPEG · 4032×3024" },
        ],
      },
      {
        heading: "Queue",
        kind: "rows",
        hoverRows: true,
        rows: [
          { label: "SUB-4417", value: "Pending", dot: "yellow" },
          { label: "SUB-4418", value: "Pending", dot: "yellow" },
          { label: "SUB-4419", value: "Pending", dot: "yellow" },
        ],
      },
    ],
  },
  {
    num: "02",
    title: "Verify",
    body: "Sentinel-2 NDVI data and AI photo analysis cross-check every submission.",
    icon: VERIFY_ICON,
    panels: [
      {
        heading: "Verification Timeline",
        kind: "rows",
        rows: [
          { label: "NDVI request sent", value: "09:42:10", dot: "muted" },
          { label: "Sentinel-2 tile fetched", value: "09:42:31", dot: "muted" },
          { label: "Vision model scoring", value: "09:42:44", dot: "muted" },
          { label: "Decision: Verified", value: "09:42:51", dot: "green" },
        ],
      },
      {
        heading: "Signal Scores",
        kind: "rows",
        rows: [
          { label: "NDVI", value: "0.42 ✓" },
          { label: "Photo confidence", value: "87% ✓" },
          { label: "Threshold", value: "0.30 / 60%" },
        ],
      },
      {
        heading: "Reasoning",
        kind: "note",
        lines: [
          "Dense canopy signature consistent with 3-year mangrove regrowth.",
          "Photo geometry matches tile bounds; no stock-image markers found.",
        ],
      },
      { heading: "NDVI Trend", kind: "chart", points: "2,34 18,31 34,25 50,23 66,16 82,11 98,5" },
    ],
  },
  {
    num: "03",
    title: "Mint",
    body: "Verified sites are recorded on-chain as immutable proof.",
    icon: MINT_ICON,
    panels: [
      {
        heading: "Transaction",
        kind: "rows",
        rows: [
          { label: "Contract", value: "0xce11…94Db" },
          { label: "Token ID", value: "1" },
          { label: "Network", value: "Polygon Amoy" },
          { label: "Status", value: "Confirmed", dot: "green" },
        ],
      },
      { heading: "Tx Hash", kind: "hash", hash: "0x7f3a…c2e9", action: "View on PolygonScan" },
      {
        heading: "Gas",
        kind: "rows",
        rows: [
          { label: "Gas used", value: "142,318" },
          { label: "Cost", value: "0.0041 MATIC" },
        ],
      },
      {
        heading: "Token Metadata",
        kind: "rows",
        rows: [
          { label: "IPFS URI", value: "ipfs://bafy…q7m4" },
          { label: "Minted", value: "2026-08-15 09:44" },
        ],
      },
    ],
  },
  {
    num: "04",
    title: "Trade",
    body: "Verified credits become representable and transferable.",
    icon: TRADE_ICON,
    panels: [
      {
        heading: "Credit Ledger",
        kind: "rows",
        rows: [
          { label: "CR-0001", value: "Verified", dot: "green" },
          { label: "CR-0002", value: "Verified", dot: "green" },
          { label: "CR-0003", value: "Listed", dot: "yellow" },
        ],
      },
      {
        heading: "Holder",
        kind: "rows",
        rows: [{ label: "Wallet", value: "0x8Ae2…31Fc" }],
      },
      {
        heading: "Supply",
        kind: "rows",
        rows: [
          { label: "Total minted", value: "1,200" },
          { label: "Retired", value: "84" },
        ],
      },
      {
        heading: "Transfer Log",
        kind: "rows",
        rows: [
          { label: "CR-0001 → 0x44b1…9002", value: "09:52" },
          { label: "CR-0002 → 0x7c30…aa18", value: "10:07" },
        ],
      },
    ],
  },
];

const STEP_MS = 80;

const DOT_TONE: Record<Dot, string> = {
  green: "bg-emerald-400",
  yellow: "bg-accent",
  muted: "bg-text-light/30",
};

/**
 * True for exactly one render, the first time `tone` is seen going from
 * yellow to green. STEPS is a static const today, so no row in this page ever
 * actually flips — this reacts to the prop rather than simulating the flip
 * with a timer, so it fires correctly the day the data is live without
 * touching this hook.
 */
function useResolvedPulse(tone?: Dot) {
  const prevRef = useRef(tone);
  const [justResolved, setJustResolved] = useState(false);

  useEffect(() => {
    if (prevRef.current === "yellow" && tone === "green") {
      setJustResolved(true);
      const t = setTimeout(() => setJustResolved(false), 300);
      prevRef.current = tone;
      return () => clearTimeout(t);
    }
    prevRef.current = tone;
  }, [tone]);

  return justResolved;
}

function StatusDot({ tone, pulse }: { tone: Dot; pulse?: boolean }) {
  const justResolved = useResolvedPulse(tone);
  return (
    <span
      aria-hidden
      className={`mt-[5px] block h-1.5 w-1.5 shrink-0 rounded-full ${DOT_TONE[tone]} ${
        pulse && tone === "yellow"
          ? "animate-dot-pulse motion-reduce:animate-none"
          : ""
      } ${justResolved ? "animate-dot-resolve motion-reduce:animate-none" : ""}`}
    />
  );
}

/* ----------------------------------------------------------------- view -- */

function PanelBody({ panel }: { panel: Panel }) {
  if (panel.kind === "coords") {
    return (
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-white/20 px-4 py-3.5">
        <span className="block h-6 w-6 shrink-0 text-accent">
          <Icon path={PIN_ICON} />
        </span>
        <div className="font-mono text-[12px] leading-relaxed text-text-light/75">
          <div>{panel.lat}</div>
          <div>{panel.lng}</div>
        </div>
      </div>
    );
  }

  if (panel.kind === "note") {
    return (
      <div className="space-y-1.5">
        {panel.lines.map((line) => (
          <p key={line} className="font-mono text-[11px]/[1.6] text-text-light/45">
            {line}
          </p>
        ))}
      </div>
    );
  }

  if (panel.kind === "chart") {
    return (
      <svg
        aria-hidden
        viewBox="0 0 100 40"
        preserveAspectRatio="none"
        className="h-16 w-full"
        fill="none"
      >
        {[10, 20, 30].map((y) => (
          <line key={y} x1="0" y1={y} x2="100" y2={y} stroke="currentColor" strokeWidth="0.4" className="text-white/10" />
        ))}
        <polyline
          points={panel.points}
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
          className="text-accent"
        />
      </svg>
    );
  }

  if (panel.kind === "hash") {
    return (
      <div>
        <p className="break-all font-mono text-[12px] text-text-light/75">{panel.hash}</p>
        <p className="mt-2 font-mono text-[11px] text-accent underline underline-offset-4">
          {panel.action}
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {panel.rows.map((row) => (
        <li
          key={row.label}
          className={`flex items-start justify-between gap-3 ${
            // Padding lives here at rest, not just on :hover, so the highlight
            // has room to bleed past the text without nudging it — toggling
            // padding only on hover would shift every row on mouseenter.
            panel.hoverRows
              ? "-mx-1.5 rounded-md px-1.5 py-1 transition-colors duration-150 ease-out hover:bg-white/[0.04] motion-reduce:transition-none"
              : ""
          }`}
        >
          <span className="flex min-w-0 items-start gap-2">
            {row.dot && <StatusDot tone={row.dot} pulse={row.pulse} />}
            <span className="font-mono text-[11px]/[1.5] text-text-light/60">
              {row.label}
            </span>
          </span>
          {row.value && (
            <span className="shrink-0 font-mono text-[11px]/[1.5] text-text-light/80">
              {row.value}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}

export default function HowItWorks() {
  const [active, setActive] = useState(0);
  const [shown, setShown] = useState(false);
  const [reduced, setReduced] = useState(false);
  const listRef = useRef<HTMLUListElement>(null);

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

  const step = STEPS[active];

  return (
    <section
      id="how-it-works"
      className="relative scroll-mt-20 overflow-hidden bg-background py-16 md:py-24"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.hiw-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* h2 already picks up font-display + uppercase from globals.css. */}
        <h2 className="inline-block -rotate-[1.5deg] bg-accent px-6 py-3 text-2xl text-text-dark sm:text-3xl">
          How It Works
        </h2>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-[2fr_3fr] md:gap-8">
          {/* Steps: buttons rather than tabs — this swaps a live region below
              instead of paging between panes, and aria-current says "this is
              the selected one in the set" without promising the arrow-key
              behaviour a role="tab" would oblige. */}
          <ul ref={listRef} className="space-y-3">
            {STEPS.map((s, i) => {
              const isActive = i === active;
              return (
                <li
                  key={s.title}
                  className={`hiw-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                    shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
                  }`}
                  style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
                >
                  <button
                    type="button"
                    onClick={() => setActive(i)}
                    aria-current={isActive}
                    className={`w-full rounded-xl border p-4 text-left transition-[border-color,background-color,box-shadow,transform] duration-200 ease-out hover:translate-x-1 motion-reduce:transition-none motion-reduce:hover:translate-x-0 ${
                      isActive
                        ? "border-accent bg-white/[0.06] shadow-[0_0_22px_-6px_theme(colors.accent)]"
                        : "border-white/15 bg-white/[0.03] hover:border-accent/60 hover:shadow-[0_0_22px_-6px_theme(colors.accent/50%)]"
                    }`}
                  >
                    <div className="flex gap-3.5">
                      <span
                        className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border transition-colors duration-200 motion-reduce:transition-none ${
                          isActive
                            ? "border-accent/40 bg-accent/10"
                            : "border-white/15 bg-white/[0.04]"
                        }`}
                      >
                        <span className="block h-4 w-4 text-accent">
                          <Icon path={s.icon} />
                        </span>
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <span className="font-display text-sm uppercase tracking-[0.14em] text-text-light">
                            {s.title}
                          </span>
                          <span className="font-mono text-[10px] text-text-light/35">
                            {s.num}
                          </span>
                        </div>
                        <p className="mt-1.5 text-[13px]/[1.5] text-text-light/55">
                          {s.body}
                        </p>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>

          {/* Re-keyed on `active` so the mount animation replays per switch. */}
          <div
            key={active}
            aria-live="polite"
            className="grid grid-cols-1 gap-4 animate-panel-in sm:grid-cols-2 motion-reduce:animate-none"
          >
            {step.panels.map((panel) => (
              <div
                key={panel.heading}
                className={`rounded-xl border border-white/15 bg-white/[0.03] p-4 ${
                  // File is static metadata, not a live surface, so it opts
                  // out of the hover affordance the other panels get; it
                  // still gets its own entrance below.
                  panel.noHover
                    ? ""
                    : "transition-[border-color,box-shadow,transform] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_0_20px_theme(colors.accent/15%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                } ${
                  // Layered on top of the group's own panel-in: this fires
                  // whenever File specifically (re)mounts — i.e. every time
                  // this step becomes active — a beat behind the rest of the
                  // grid rather than exactly in sync with it.
                  panel.heading === "File"
                    ? "animate-fade-in-up motion-reduce:animate-none"
                    : ""
                }`}
              >
                <h3 className="relative inline-block pb-2.5 text-xs tracking-[0.12em] text-text-light">
                  {panel.heading}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-2 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
                  />
                </h3>
                <div className="mt-4">
                  <PanelBody panel={panel} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
