"use client";

import { useEffect, useRef, useState } from "react";
import { GRAIN } from "@/lib/grain";

const SERVICES = [
  { name: "Sentinel-2 NDVI", sub: "Live satellite vegetation data" },
  { name: "OpenAI Vision", sub: "Photo classification running" },
  { name: "Polygon Amoy", sub: "Contract deployed" },
  { name: "IPFS Pinning", sub: "Evidence storage active" },
];

const STEP_MS = 70;

export default function LiveStatus() {
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

  // Both neighbours are the same black grain now — the pipeline section above
  // and the audience cards below — so both edges use the trimmed seam value
  // rather than the full bottom padding this carried when the CTA board
  // followed it directly.
  return (
    <section className="relative overflow-hidden bg-background pb-8 pt-8 md:pb-10 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <noscript>
        <style>{`.ls-reveal{opacity:1!important;transform:none!important}`}</style>
      </noscript>

      <div className="relative mx-auto max-w-7xl px-6">
        {/* text-center on the wrapper is what centres the h2 — it is
            inline-block so the brush mark hugs the words, and margin:auto does
            not centre an inline-level box. */}
        <div className="text-center">
          <h2 className="relative inline-block pb-3 text-xl text-text-light sm:text-2xl">
            What&rsquo;s Live Today
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
            />
          </h2>
        </div>

        <ul
          ref={listRef}
          className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4"
        >
          {SERVICES.map((service, i) => (
            <li
              key={service.name}
              className={`ls-reveal transition-[opacity,transform] duration-500 ease-out motion-reduce:transition-none ${
                shown ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
              style={{ transitionDelay: reduced ? "0ms" : `${i * STEP_MS}ms` }}
            >
              <div className="flex h-full items-center gap-3.5 rounded-xl border border-white/15 bg-white/[0.03] p-4 transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-accent hover:shadow-[0_0_20px_-8px_theme(colors.accent/60%)] motion-reduce:transition-none motion-reduce:hover:translate-y-0">
                {/* Expanding ring behind a solid core. The ring is the animated
                    layer, so under reduced motion the dot simply sits still and
                    still reads as a green status light. */}
                <span className="relative flex h-2.5 w-2.5 shrink-0">
                  <span
                    aria-hidden
                    className="absolute inline-flex h-full w-full animate-status-ping rounded-full bg-emerald-400 motion-reduce:animate-none"
                  />
                  <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                </span>

                <span className="min-w-0">
                  <span className="block truncate font-display text-sm text-text-light">
                    {service.name}
                  </span>
                  <span className="mt-0.5 block text-[12px] text-text-light/45">
                    {service.sub}
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
