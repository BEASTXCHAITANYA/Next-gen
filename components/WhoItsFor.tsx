"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

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

const PEOPLE_ICON = (
  <>
    <circle cx="9.2" cy="8.4" r="3.2" />
    <path d="M2.6 19.6c0-3.4 2.9-5.6 6.6-5.6s6.6 2.2 6.6 5.6" />
    <path d="M16.4 5.6a3.2 3.2 0 0 1 0 5.7M18.2 19.6c0-2.1-.7-3.8-1.9-5" />
  </>
);
const CLIPBOARD_ICON = (
  <>
    <path d="M9 4.4H7a2 2 0 0 0-2 2v12.2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6.4a2 2 0 0 0-2-2h-2" />
    <rect x="9" y="2.8" width="6" height="3.2" rx="1" />
    <path d="M8.8 13.4 10.9 15.5 15.2 11.2" />
  </>
);
const INSPECT_ICON = (
  <>
    <circle cx="10.8" cy="10.8" r="6.2" />
    <path d="M15.4 15.4 20.6 20.6" />
    <path d="M8.2 10.8h5.2M10.8 8.2v5.2" />
  </>
);

const AUDIENCES = [
  {
    title: "Coastal Communities",
    body: "Submit geo-tagged evidence straight from the field. No paperwork, no intermediaries, and every submission keeps its own proof.",
    icon: PEOPLE_ICON,
  },
  {
    title: "NGOs & Verifiers",
    body: "Review submissions with the full evidence trail attached — photo, coordinates, satellite reading and model reasoning in one place.",
    icon: CLIPBOARD_ICON,
  },
  {
    title: "Buyers & Registries",
    body: "Inspect provenance before anything changes hands. Every verified site links to an on-chain record that cannot be quietly edited.",
    icon: INSPECT_ICON,
  },
];

const STEP_MS = 70;

export default function WhoItsFor() {
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

  // Both neighbours are the same black grain — the status row above and the
  // roadmap timeline below — so both edges use the trimmed seam value rather
  // than the full bottom padding this carried when the CTA board followed it.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-8 md:pb-10 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.wf-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* text-center on the wrapper centres the h2 — it is inline-block so
            the brush mark hugs the words, and margin:auto cannot centre an
            inline-level box. */}
        <div className="text-center">
          <h2 className="relative inline-block pb-3 text-xl text-text-light sm:text-2xl">
            Who It&rsquo;s For
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
            />
          </h2>
        </div>

        <ul
          ref={listRef}
          className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-3"
        >
          {AUDIENCES.map((audience, i) => (
            <li
              key={audience.title}
              className={`wf-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
            >
              <div className="h-full rounded-xl border border-white/15 bg-white/[0.03] p-5 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_0_20px_-8px_theme(colors.accent/60%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                <span className="block h-6 w-6 text-accent">
                  <Icon path={audience.icon} />
                </span>
                {/* normal-case overrides the global uppercase on headings. */}
                <h3 className="mt-4 text-sm normal-case tracking-normal text-text-light">
                  {audience.title}
                </h3>
                <p className="mt-2 text-[13px]/[1.55] text-text-light/55">
                  {audience.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
