import Image from "next/image";

type SectionImageProps = {
  /** Path to the background image, e.g. "/images/hero-bg.png". */
  src: string;
  /** Empty string keeps it decorative; describe it when it carries meaning. */
  alt?: string;
  /** Extra classes on the section wrapper — height, padding, text alignment. */
  className?: string;
  /** Classes for the inner content wrapper that sits above the image. */
  contentClassName?: string;
  /** Dark scrim strength over the image, 0 disables it. */
  overlayOpacity?: number;
  /** Set on above-the-fold sections so Next preloads the image. */
  priority?: boolean;
  /**
   * Optional full-bleed backdrop rendered behind everything else — for a
   * textured page background sitting underneath a separate foreground `src`
   * illustration, rather than a flat color. Always object-cover, 100vw.
   */
  bgSrc?: string;
  /** object-fit / object-position for the bgSrc layer. */
  bgClassName?: string;
  /**
   * Classes on the positioned box the image fills. Defaults to a full bleed;
   * override to inset or column-align artwork whose aspect ratio doesn't match
   * the section (a portrait asset in a wide section would otherwise have to
   * scale up enormously to cover, cropping most of it away).
   */
  frameClassName?: string;
  /** object-fit / object-position for the image itself. */
  imageClassName?: string;
  /** Rendered width of the image, for Next's srcset selection. */
  sizes?: string;
  children?: React.ReactNode;
};

export default function SectionImage({
  src,
  alt = "",
  className = "",
  contentClassName = "",
  overlayOpacity = 0.5,
  priority = false,
  bgSrc,
  bgClassName = "object-cover",
  frameClassName = "inset-0",
  imageClassName = "object-cover",
  sizes = "100vw",
  children,
}: SectionImageProps) {
  return (
    <section className={`relative w-full overflow-hidden ${className}`}>
      {/* Painted first so it sits behind the frame div below with no z-index
          needed — later siblings simply paint on top in DOM order. */}
      {bgSrc && (
        <Image
          src={bgSrc}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className={bgClassName}
        />
      )}

      <div className={`absolute ${frameClassName}`}>
        <Image
          src={src}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          className={imageClassName}
        />
      </div>

      {overlayOpacity > 0 && (
        <div
          aria-hidden
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayOpacity }}
        />
      )}

      <div className={`relative z-10 ${contentClassName}`}>{children}</div>
    </section>
  );
}
