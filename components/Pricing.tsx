import Link from "next/link";
import { GRAIN } from "@/lib/grain";

const FEATURES = [
  "Unlimited submissions",
  "Full evidence trail",
  "On-chain record included",
  "Testnet — no real funds",
];

export default function Pricing() {
  // Bottom keeps its full value — the final CTA below is a distinct board
  // with its own torn edge, not more of this same grain surface. Top is
  // trimmed to match the seam above (see WhatsNext's own comment).
  return (
    <section className="relative overflow-hidden bg-background pb-14 pt-8 md:pb-20 md:pt-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.14]"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative mx-auto max-w-7xl px-6">
        <div className="text-center">
          <h2 className="relative inline-block pb-3 text-xl text-text-light sm:text-2xl">
            Pricing
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
            />
          </h2>
        </div>

        {/* No entrance/hover treatment here — this is the one static offer,
            not a scannable grid, so the reveal/lift language used on the
            other card grids would read as noise rather than affordance. */}
        <div className="mx-auto mt-12 max-w-[480px] rounded-xl border border-accent bg-white/[0.03] p-8 text-center shadow-[0_0_30px_-10px_theme(colors.accent/40%)]">
          <span className="inline-block rounded-full border border-accent/40 bg-accent/10 px-3 py-1 font-display text-[10px] uppercase tracking-[0.16em] text-accent">
            Pilot Phase
          </span>

          <p className="mt-5 font-display text-5xl text-text-light">Free</p>

          <p className="mx-auto mt-3 max-w-sm text-sm/[1.6] text-text-light/55">
            Verification costs are covered while the registry is in pilot.
          </p>

          <ul className="mt-7 space-y-3 text-left">
            {FEATURES.map((feature) => (
              <li key={feature} className="flex items-center gap-2.5">
                <svg
                  aria-hidden
                  viewBox="0 0 10 8"
                  className="h-2.5 w-2.5 shrink-0 stroke-accent"
                  fill="none"
                  strokeWidth={1.6}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 4l3 3 5-6" />
                </svg>
                <span className="text-sm text-text-light/80">{feature}</span>
              </li>
            ))}
          </ul>

          <Link
            href="/submit"
            className="mt-8 inline-block w-full rounded-full bg-accent px-8 py-3.5 font-display text-sm uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90"
          >
            Start Verifying
          </Link>
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-[13px]/[1.6] text-text-light/45">
          Long term, we&rsquo;re exploring a per-verification fee for
          commercial buyers — communities submitting evidence stay free.
        </p>
      </div>
    </section>
  );
}
