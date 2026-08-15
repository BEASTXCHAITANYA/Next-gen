import Link from "next/link";
import DeepInsightsGrid from "@/components/DeepInsightsGrid";
import BuiltOnRealData from "@/components/BuiltOnRealData";
import HowItWorks from "@/components/HowItWorks";
import LiveStatus from "@/components/LiveStatus";
import ProofCards from "@/components/ProofCards";
import SectionImage from "@/components/SectionImage";
import Pricing from "@/components/Pricing";
import WhatsNext from "@/components/WhatsNext";
import WhoItsFor from "@/components/WhoItsFor";

/** Hero trust strip, kept to a single line — see the ul's own comment for how. */
const HERO_FEATURES = [
  "Real Satellite Data",
  "AI Photo Verification",
  "On-Chain Proof",
  "Open Source",
];

const CTA_TRUST = [
  "No signup required",
  "Real satellite data",
  "Testnet — no real funds",
];

export default function Home() {
  return (
    <>
      {/* 1. HERO — paper-white artwork, so content is dark and the scrim is off. */}
      <SectionImage
        /* hero-bg.png is opaque — its own ~248-tone paper sat inside the
           illustration frame while paper-texture-crop.png (~210-tone, and a
           heavier grain) covered the rest of the hero, and no amount of edge
           feathering fully hid a ~38-value gap between two different busy
           textures; the mask below only softened the cliff into a visible
           blurred band, not a real blend. hero-bg-cutout.png is a derived
           alpha version (same min-channel 'distance from white' technique as
           the brush marks and navbar mark) with its own paper dropped to
           transparent, so the frame just shows the shared paper-texture-crop
           backdrop through it everywhere — one paper tone across the whole
           hero, so there's nothing left to seam. */
        src="/images/hero-bg-cutout.png"
        alt=""
        priority
        overlayOpacity={0}
        /* paper-texture.png is a 1376x768 canvas with the torn card inset well
           inside a wide black margin (card is only x 12-88%, y 8-93% of the
           frame). object-cover on the raw file showed that margin at both
           side edges of the hero — right where the text column sits, making
           dark text unreadable on dark. paper-texture-crop.png trims the
           margin down to a thin ragged fringe, so cover only ever shows paper
           there; object-top keeps the torn edge in frame at the top (matching
           how the other sections already use a torn top edge) and lets excess
           height crop from the bottom instead. */
        bgSrc="/images/paper-texture-crop.png"
        bgClassName="object-cover object-top"
        /* bg-black is only the pre-load fallback — the crop's own backdrop
           fringe is near-black, so this avoids a white flash before it
           decodes, matching the page's own bg-background (#000) either way.
           -mt/pt cancel out for layout (content ends up exactly where it was)
           but let the section's own box — and so its bgSrc backdrop — start
           65px higher, behind the sticky/blurred header, matching the offset
           already established by the how-it-works anchor's scroll-mt-20. */
        className="-mt-[65px] bg-black pt-[65px]"
        /* hero-bg is a portrait 768x1376 asset whose drawing occupies only the
           middle band (source y 376-1113); the rest is blank paper. Covering a
           wide section with it meant scaling ~1.9x to fill the width, which cut
           away everything but the mascot. From md up the artwork instead gets a
           fixed-aspect crop window in its own right-hand column: 768x817 is the
           drawing plus even margins, so cover is always width-driven and the
           frame never crops horizontally however tall the section gets. The
           column is inset from the edge to give the sapling and pot clearance.
           No mask needed on this edge anymore — with the asset's own paper cut
           to transparent (see the src comment above) there's no second tone
           at the frame boundary for a mask to have to dissolve. */
        frameClassName="inset-0 md:bottom-auto md:left-auto md:top-1/2 md:right-10 md:w-[58%] md:max-w-[700px] md:-translate-y-1/2 md:aspect-[768/817] lg:right-14 lg:w-[52%]"
        /* 60% lands that 817px window on the drawing, not the blank margins. */
        imageClassName="object-cover object-[50%_60%]"
        sizes="(min-width: 768px) 52vw, 100vw"
        /* The floor keeps the crop window (max 700px wide, so 745px tall) inside
           the section on short windows, where 90vh alone would clip it. */
        contentClassName="mx-auto flex min-h-[85vh] max-w-7xl items-start px-4 pt-10 md:min-h-[max(90vh,760px)] md:items-center md:px-6 md:pt-0"
      >
        {/* The artwork's blank area is short on narrow screens, so the copy
            gets a paper scrim on mobile and sits on bare paper from md up. */}
        <div className="w-full max-w-sm rounded-xl bg-paper/85 p-5 md:w-1/3 md:max-w-none md:rounded-none md:bg-transparent md:p-0">
          {/* inline-block keeps the mark the width of the words. brush-accent.png
              ships as an opaque stroke on a white canvas, not a transparent
              PNG — a plain background-image would paint that white canvas as a
              solid box. brush-accent-cutout.png is a derived alpha version
              (white canvas dropped, yellow stroke kept) generated from it, so
              this is just a normal transparent background-image. (Tried
              mix-blend-multiply against the source PNG first to fake the cutout
              without a derived asset; it silently blended against white instead
              of the page, because the content wrapper's own z-10 stacking
              context stops a blend from reaching backgrounds painted outside
              it, several DOM levels up at the section root — a hard limit of
              the technique, not a tuning issue.) */}
          <p className="relative inline-block pb-2.5 font-display text-sm uppercase tracking-[0.18em] text-text-dark">
            AI-Native Verification
            <span
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
            />
          </p>

          {/* normal-case overrides the global uppercase on headings: Special
              Elite is a typewriter face whose letterforms flatten out in caps.
              Each line is its own block so the break is deterministic at every
              width rather than depending on a max-width tuned to one viewport;
              the marker is inline-block so its padded box hugs the word and
              sits on the baseline beside "Leaves". */}
          {/* Leading rides on each size step: a bare leading-* utility loses to
              the sm/lg text-* variants, which set line-height themselves. */}
          {/* pb reserves room for the scribble, which is absolutely positioned
              and so overflows the h1's own box — without it the subhead sat
              4px off the pen strokes. */}
          <h1 className="mt-5 pb-2 text-3xl/[1.15] normal-case text-text-dark sm:text-4xl/[1.15] lg:text-5xl/[1.15]">
            {/* Splitting after "Mangrove" leaves both lines short enough to fit
                the third-width column at 1440 unaided, so the old trick of
                spilling a ~537px line into the blank paper beside the column is
                gone. nowrap is still wanted from md, where the column narrows
                to ~240px and line one would otherwise stack a word per line —
                there it spills into that same blank paper, but only by ~37px. */}
            <span className="block md:whitespace-nowrap">Every Mangrove</span>
            {/* The mark is a solid #000 layer shaped by the brush art, rather
                than the brush art painted as a background-image. Two reasons:
                the fill is then guaranteed opaque regardless of what the PNG's
                alpha does, and a background-COLOR cannot be clipped by a
                background-image's alpha — it always fills the whole padding
                box, so putting black behind the image would just restore the
                sharp rectangle. mask-image is what actually transfers the
                ragged silhouette onto the black.
                brush-slab-mask.png is cropped tight to the stroke: the
                un-cropped cutout kept the source's big empty margins, and with
                mask/background-size 100% 100% those margins scaled with it, so
                the stroke only ever covered the middle ~38% of the box height
                while the text sat centred and overflowed it — which is what
                read as a faint smudge rather than a dense mark. */}
            <span className="block md:whitespace-nowrap">
              Leaves{" "}
              <span className="relative inline-block px-5 py-2">
                <span
                  aria-hidden
                  className="absolute inset-0 bg-black [mask-image:url('/images/brush-slab-mask.png')] [mask-repeat:no-repeat] [mask-size:100%_100%] [-webkit-mask-image:url('/images/brush-slab-mask.png')] [-webkit-mask-repeat:no-repeat] [-webkit-mask-size:100%_100%]"
                />
                <span className="relative text-accent">Proof.</span>
                {/* Two passes of a quick pen underline, deliberately not
                    parallel — they cross near the middle and diverge at the
                    ends, which is what stops it reading as a ruled double rule.
                    Anchored to the marker (top-full) so it tracks the slab's
                    bottom edge at any type size, and inset negatively so it
                    runs a little past the word on both sides.
                    preserveAspectRatio none lets it stretch to whatever the
                    word's width is; non-scaling-stroke keeps the nib weight
                    even once it has been stretched. Width is calc'd off the
                    marker rather than left+right insets: an svg is a replaced
                    element, so width:auto resolves from the viewBox's intrinsic
                    ratio and ignores a right inset entirely — which had it
                    landing 26px short of the word instead of past it. */}
                <svg
                  aria-hidden
                  viewBox="0 0 220 18"
                  preserveAspectRatio="none"
                  className="absolute -left-2 top-full mt-1 h-3 w-[calc(100%+28px)] overflow-visible text-text-dark sm:h-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                >
                  {/* Both strokes drift up to the right and wobble out of phase
                      with each other, so the gap between them keeps changing.
                      Amplitude is deliberately large in viewBox units — the box
                      is only ~14px tall on screen, and a gentler curve flattens
                      into what reads as a ruled double rule. */}
                  <path
                    d="M4 8.2C36 5.1 70 9.6 104 6.4C138 3.4 174 7.6 216 4.2"
                    vectorEffect="non-scaling-stroke"
                  />
                  <path
                    d="M9 13.6C44 16.2 78 11.4 114 14.1C150 16.6 184 12.2 213 9.8"
                    vectorEffect="non-scaling-stroke"
                  />
                </svg>
              </span>
            </span>
          </h1>
          {/* Leading rides on each size step rather than a bare leading-*, which
              text-lg silently overrode at lg (its own 28px line-height won, so
              leading-relaxed only ever applied below lg).
              1.6 measured, not guessed: Special Elite's ink height is slightly
              shorter than Inter's at the same size (17.2px vs 17.6px at 18px)
              but its descenders are longer, so matching Inter's optical gap
              needs a hair less leading, not more — this keeps the ~10px gap
              between the two lines that the sans version had. */}
          <p className="mt-5 font-display text-base/[1.6] text-text-dark/70 lg:text-lg/[1.6]">
            Verified mangrove restoration, powered by AI and blockchain.
          </p>
          <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:gap-8">
            {/* Same brush-accent-cutout.png technique as the eyebrow mark, just
                a thicker strip since this is still the primary of the two CTAs
                — both now sit flat on the paper rather than one floating as a
                filled pill. */}
            <Link
              href="/submit"
              className="relative inline-block pb-2 font-display text-xs uppercase tracking-wide text-text-dark transition-opacity hover:opacity-70"
            >
              Start Verifying
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-3.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
              />
            </Link>
            {/* Anchors to the section below rather than NAV_LINKS' /how-it-works,
                which has no route yet. */}
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 font-display text-xs uppercase tracking-wide text-text-dark underline decoration-text-dark/30 underline-offset-4 transition-colors hover:decoration-accent"
            >
              See it in Action
              <svg
                aria-hidden
                viewBox="0 0 10 12"
                className="h-2.5 w-2.5 stroke-current"
                fill="none"
                strokeWidth={1.75}
                strokeLinejoin="round"
              >
                <path d="M1 1l7.5 5L1 11z" />
              </svg>
            </Link>
          </div>

          {/* Single line now instead of wrapping: smaller type, tighter gaps,
              and a check icon per item so the pipes aren't the only separator
              at this reduced size. whitespace-nowrap means no line ever starts
              on a wrapped pipe, so the old clipping trick for that is gone too.
              Below md there's no blank paper to spill into (the illustration
              is full-bleed there), so the strip scrolls horizontally inside
              the column instead — overflow-x-auto with the scrollbar hidden.
              From md up it runs into that margin like the headline does, so
              overflow reverts to visible and nothing ever needs to scroll. */}
          <ul className="mt-8 flex items-center gap-x-4 overflow-x-auto whitespace-nowrap border-t border-text-dark/15 pt-4 pb-1 font-display text-[10px] uppercase tracking-wide text-text-dark/65 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:overflow-visible">
            {HERO_FEATURES.map((feature, i) => (
              <li key={feature} className="flex shrink-0 items-center gap-x-4">
                {i > 0 && (
                  <span aria-hidden className="text-text-dark/25">
                    |
                  </span>
                )}
                <span className="flex items-center gap-x-1.5">
                  <svg
                    aria-hidden
                    viewBox="0 0 10 8"
                    className="h-2 w-2 shrink-0 stroke-current"
                    fill="none"
                    strokeWidth={1.5}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 4l3 3 5-6" />
                  </svg>
                  {feature}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </SectionImage>

      {/* 2. HOW IT WORKS — interactive; owns the #how-it-works anchor and its
             scroll-mt, which the hero's "See it in Action" link targets. */}
      <HowItWorks />

      {/* 3. DEEP INSIGHTS — quote sits on the torn white card (upper left) at md+. */}
      <SectionImage
        src="/images/deep-insights-bg.png"
        alt=""
        overlayOpacity={0}
        className="min-h-[60vh] md:min-h-0 md:aspect-[1376/768]"
        contentClassName="flex min-h-[60vh] items-center px-6 py-16 md:absolute md:inset-0 md:block md:min-h-0 md:p-0"
      >
        {/* From md up the quote overlays a fixed region of the artwork, and the
            section is aspect-locked, so the card scales with viewport width —
            any fixed size is wrong at one end. 24px very nearly overflowed at
            the md floor (11px spare) while leaving 61px of ink in a 407px box
            at 1920, i.e. the same under-filled card this replaced. 2.5vw tracks
            the card instead: ~19px at 768, 36px at 1440 (2x the old 18px), 48px
            at 1920 — a proportional fill at every width. Base stays text-lg:
            below md this is a scrim card, not an overlay.
            Leading is 1.4, not the 1.2 this carried under Inter: Special Elite
            is wider (the quote went 4 lines -> 5 on the swap) and has longer
            descenders, and at 1.2 the ink gap was only 7px at 36px. 1.4 doubles
            that to 14px and still clears the card on every axis. Base keeps
            leading-relaxed — at 18px small text wants the looser ratio. */}
        <blockquote className="rounded-lg bg-background/70 p-6 font-display text-lg leading-relaxed text-text-light md:absolute md:left-[6%] md:top-[10%] md:flex md:h-[38%] md:w-[37%] md:items-center md:rounded-none md:bg-transparent md:p-0 md:text-[clamp(1.05rem,2.5vw,3rem)] md:leading-[1.4] md:text-text-dark">
          Every submission is verified against real satellite vegetation data
          and AI photo analysis — not self-reported claims.
        </blockquote>
      </SectionImage>

      {/* 3b. DEEP INSIGHTS GRID — its own client component so the IntersectionObserver
             stagger doesn't drag this whole page across the client boundary. */}
      <DeepInsightsGrid />

      {/* 3c. PROOF CARDS — paper cards on the dark ground, with margin notes. */}
      <ProofCards />

      {/* 4. BUILT ON REAL DATA — replaces the integrations-bg overlay. */}
      <BuiltOnRealData />

      {/* 5. LIVE STATUS — replaces the placeholder stat tiles. */}
      <LiveStatus />

      {/* 5b. WHO IT'S FOR — audience cards, same grain surface as the status
             row above, so both facing edges use the trimmed seam padding. */}
      <WhoItsFor />

      {/* 5c. WHAT'S NEXT — roadmap timeline, still the same grain surface. */}
      <WhatsNext />

      {/* 5d. PRICING — single static tier, same grain surface as above. */}
      <Pricing />

      {/* 6. FINAL CTA — the mascot's mass runs to x=600 of the 1376px board
          (~44%), so from md up the copy takes a right-hand column starting past
          that rather than centring across the whole section and colliding with
          it. Vertically it stays between the torn top edge (which dips to 34%)
          and the scribbles along the bottom. */}
      <SectionImage
        src="/images/landing-bg.png"
        alt=""
        overlayOpacity={0}
        className="min-h-[45vh] md:min-h-0 md:aspect-[1376/768]"
        contentClassName="flex min-h-[45vh] items-center justify-center px-6 py-12 md:absolute md:inset-0 md:min-h-0 md:justify-end md:py-0 md:pr-[5%]"
      >
        {/* Below md the artwork is full-bleed behind the copy, so the headline
            lands on the torn white top edge and the mascot runs under the trust
            row. A scrim restores contrast there; from md up the copy has its own
            clear column and the board shows through untouched. */}
        <div className="w-full max-w-md rounded-xl bg-background/80 p-6 text-center md:w-[48%] md:max-w-xl md:rounded-none md:bg-transparent md:p-0">
          {/* normal-case keeps the sentence casing; globals.css uppercases
              headings by default. */}
          <h2 className="text-2xl/[1.25] normal-case sm:text-3xl/[1.25] lg:text-4xl/[1.25]">
            <span className="block text-text-light">Stop trusting claims.</span>
            <span className="block text-text-light">
              Start{" "}
              <span className="relative inline-block pb-2.5 text-accent">
                verifying proof.
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-2.5 bg-[url('/images/brush-accent-cutout.png')] bg-[length:100%_100%] bg-no-repeat"
                />
              </span>
            </span>
          </h2>

          <p className="mx-auto mt-5 max-w-md font-display text-sm/[1.6] text-text-light/55 lg:text-base/[1.6]">
            Upload a site, get a satellite-backed verdict, and put it on-chain.
          </p>

          <Link
            href="/submit"
            className="mt-8 inline-block rounded-full bg-accent px-8 py-4 font-display text-sm uppercase tracking-wide text-text-dark transition-opacity hover:opacity-90"
          >
            Start Verifying &rarr;
          </Link>

          <ul className="mt-7 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {CTA_TRUST.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5 text-[11px] text-text-light/50"
              >
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
                {item}
              </li>
            ))}
          </ul>
        </div>
      </SectionImage>
    </>
  );
}
