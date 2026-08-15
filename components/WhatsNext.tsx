"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

type Milestone = {
  status: "live" | "planned";
  title: string;
  body: string;
};

const MILESTONES: Milestone[] = [
  {
    status: "live",
    title: "Two-signal verification",
    body: "Sentinel-2 NDVI plus vision-model photo analysis, with the full evidence trail stored per submission.",
  },
  {
    status: "planned",
    title: "Mangrove-specific segmentation",
    body: "Move from general vegetation indices to purpose-trained U-Net models, following recent published remote-sensing research.",
  },
  {
    status: "planned",
    title: "Verifier review layer",
    body: "Let accredited reviewers approve or contest automated decisions before anything is minted.",
  },
  {
    status: "planned",
    title: "Registry alignment",
    body: "Map verified records to established blue-carbon methodologies so credits can be recognised by existing registries.",
  },
];

const STEP_MS = 70;

/** Rail x-position. Dot and connector both centre on it via -translate-x-1/2. */
const RAIL_X = "left-[9px]";

const PILL: Record<Milestone["status"], string> = {
  live: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  planned: "border-white/15 bg-white/[0.03] text-text-light/40",
};

const DOT: Record<Milestone["status"], string> = {
  live: "bg-emerald-400",
  planned: "bg-text-light/25",
};

export default function WhatsNext() {
  const listRef = useRef<HTMLOListElement>(null);
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

  // Both neighbours are the same black grain — the audience cards above and
  // pricing below — so both edges use the trimmed seam value rather than the
  // full bottom padding this carried when the CTA board followed it directly.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-8 md:pb-10 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.wn-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="relative inline-block pb-3 text-xl text-text-light sm:text-2xl">
            What&rsquo;s Next
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
            />
          </h2>
        </div>

        {/* The rail runs down the left of the list; the list itself is a
            centred column, so on narrow screens the whole timeline sits
            centred in the viewport rather than hugging the edge. */}
        <ol ref={listRef} className="mx-auto mt-12 max-w-2xl">
          {MILESTONES.map((milestone, i) => (
            <li
              key={milestone.title}
              className={`wn-reveal relative pb-8 pl-9 last:pb-0 transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
            >
              {/* Connector runs from this dot's centre to the next dot's
                  centre — hence the negative bottom, which reaches 13px into
                  the following item. Omitted on the last entry so the line
                  stops at the final dot instead of trailing past it. The dot
                  is painted after, so it covers the overlap. */}
              {i < MILESTONES.length - 1 && (
                <span
                  aria-hidden
                  className={`absolute ${RAIL_X} -bottom-[13px] top-[13px] w-px -translate-x-1/2 bg-white/15`}
                />
              )}

              <span
                aria-hidden
                className={`absolute ${RAIL_X} top-[7px] h-3 w-3 -translate-x-1/2 rounded-full ${DOT[milestone.status]}`}
              />

              <span
                className={`inline-block rounded-full border px-2.5 py-0.5 font-display text-[10px] uppercase tracking-[0.14em] ${PILL[milestone.status]}`}
              >
                {milestone.status === "live" ? "Live" : "Planned"}
              </span>

              {/* normal-case overrides the global uppercase on headings. */}
              <h3 className="mt-2.5 text-sm normal-case tracking-normal text-text-light">
                {milestone.title}
              </h3>
              <p className="mt-1.5 text-[13px]/[1.55] text-text-light/55">
                {milestone.body}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
